'use strict';
const crypto=require('node:crypto');
const STATES=Object.freeze({draft:new Set(['editing']),editing:new Set(['render_queued']),render_queued:new Set(['rendering','render_failed']),rendering:new Set(['review_pending','render_failed']),render_failed:new Set(['render_queued']),review_pending:new Set(['editing','approved','rejected']),rejected:new Set(['editing']),approved:new Set(['publish_queued','exported']),publish_queued:new Set(['publishing','publish_failed']),publishing:new Set(['published','publish_failed']),publish_failed:new Set(['publish_queued']),published:new Set(),exported:new Set()});
const PROVIDERS=Object.freeze(['media_model','rights_library','storage_cdn','transcription','translation','publishing']);
function stable(v){if(Array.isArray(v))return v.map(stable);if(!v||typeof v!=='object')return v;return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));}
function digest(v){return crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');}
function sha(v){return /^[a-f0-9]{64}$/.test(String(v||''));}
function date(v){return Number.isFinite(Date.parse(v));}
function nonempty(v){return typeof v==='string'&&Boolean(v.trim());}
function validateSource(source,now='2026-07-18T00:00:00Z'){
  const errors=[];
  if(!nonempty(source?.sourceId))errors.push('sourceId is required');
  if(!['upload','capture','licensed_library','authoritative_feed'].includes(source?.sourceType))errors.push('sourceType is invalid');
  if(!nonempty(source?.storageUri)||!/^s3:\/\/|^gs:\/\/|^https:\/\//.test(source?.storageUri||''))errors.push('durable storageUri is required');
  if(!sha(source?.contentDigest))errors.push('contentDigest is required');
  if(!date(source?.receivedAt))errors.push('receivedAt is required');
  const rights=source?.rights||{};
  for(const field of ['licenseId','owner','allowedUse','territory','evidenceDigest'])if(!nonempty(rights[field]))errors.push(`rights.${field} is required`);
  if(rights.evidenceDigest&&!sha(rights.evidenceDigest))errors.push('rights.evidenceDigest must be SHA-256');
  if(rights.expiresAt&&(!date(rights.expiresAt)||Date.parse(rights.expiresAt)<=Date.parse(now)))errors.push('rights license is expired');
  if(source?.containsPerson===true&&!nonempty(source?.consentRef))errors.push('consentRef is required for identifiable people');
  return{ok:errors.length===0,errors,sourceDigest:digest(source)};
}
function createVersion(input){
  const errors=[];
  for(const field of ['projectId','version','locale','ruleVersion'])if(!nonempty(input?.[field]))errors.push(`${field} is required`);
  if(!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(input?.locale||''))errors.push('locale must be a supported BCP 47 language tag');
  if(!Array.isArray(input?.assets)||!input.assets.length)errors.push('assets are required');
  if(!Array.isArray(input?.timeline)||!input.timeline.length)errors.push('editable timeline clips are required');
  const assetIds=new Set((input?.assets||[]).map(x=>x.assetId));
  let lastByTrack=new Map();
  for(const [index,clip] of (input?.timeline||[]).entries()){
    if(!assetIds.has(clip.assetId))errors.push(`timeline ${index} references an unknown asset`);
    if(!Number.isSafeInteger(clip.startMs)||!Number.isSafeInteger(clip.endMs)||clip.startMs<0||clip.endMs<=clip.startMs)errors.push(`timeline ${index} has invalid timing`);
    if(!nonempty(clip.track))errors.push(`timeline ${index} requires a track`);
    if(lastByTrack.has(clip.track)&&clip.startMs<lastByTrack.get(clip.track))errors.push(`timeline ${index} overlaps on track ${clip.track}`);
    lastByTrack.set(clip.track,clip.endMs);
  }
  for(const [index,asset] of (input?.assets||[]).entries()){
    if(!nonempty(asset.assetId)||!sha(asset.sourceDigest))errors.push(`asset ${index} requires id and sourceDigest`);
    if(asset.kind==='image'&&!nonempty(asset.altText))errors.push(`image asset ${index} requires alt text`);
    if(['video','audio'].includes(asset.kind)&&!nonempty(asset.transcriptRef))errors.push(`${asset.kind} asset ${index} requires transcript/caption evidence`);
  }
  const policy=input?.brandPolicy||{};
  if(!nonempty(policy.version)||!Array.isArray(policy.allowedColors)||!policy.allowedColors.length||!Array.isArray(policy.forbiddenTerms))errors.push('versioned brand policy is required');
  const result={projectId:input?.projectId,parentVersionId:input?.parentVersionId||null,version:input?.version,locale:input?.locale,ruleVersion:input?.ruleVersion,assets:input?.assets||[],timeline:input?.timeline||[],brandPolicy:policy,aiGenerated:input?.aiGenerated===true,disclosurePolicy:input?.disclosurePolicy||null};
  return{ok:errors.length===0,errors,version:{...result,versionDigest:digest(result)}};
}
function queueRender(version,spec){
  if(!sha(version?.versionDigest))throw new Error('immutable version digest is required');
  if(!['mp4','webm','png','jpeg'].includes(spec?.format)||!nonempty(spec?.preset)||!Number.isInteger(spec?.width)||!Number.isInteger(spec?.height)||spec.width<1||spec.height<1||!Number.isInteger(spec?.frameRate)||spec.frameRate<1||!nonempty(spec?.codecVersion))throw new Error('deterministic export format, preset, dimensions, frameRate, and codecVersion are required');
  const request={versionDigest:version.versionDigest,format:spec.format,preset:spec.preset,width:spec.width,height:spec.height,frameRate:spec.frameRate,codecVersion:spec.codecVersion,locale:version.locale};
  return{...request,idempotencyKey:digest(request),requestDigest:digest(request)};
}
function assessQuality(version,measurement){
  const names=['timing','layout','accessibility','brand','multilingual','exportCompatibility'];
  const errors=[];for(const name of names)if(!Number.isFinite(measurement?.scores?.[name])||measurement.scores[name]<0||measurement.scores[name]>100)errors.push(`${name} score must be 0..100`);
  if(!nonempty(measurement?.evaluatorVersion)||!sha(measurement?.artifactDigest))errors.push('versioned evaluator and artifact digest are required');
  const threshold=Number.isFinite(measurement?.threshold)?measurement.threshold:90;
  const failed=names.filter(name=>(measurement?.scores?.[name]??-1)<threshold);
  const result={versionDigest:version?.versionDigest,evaluatorVersion:measurement?.evaluatorVersion,artifactDigest:measurement?.artifactDigest,scores:measurement?.scores||{},threshold,failed,publishable:errors.length===0&&failed.length===0,compatibility:measurement?.compatibility||{}};
  return{ok:errors.length===0,errors,evaluation:{...result,evaluationDigest:digest(result)}};
}
function approvePublication({project,version,quality,rights,moderation,approval,providers,now='2026-07-18T00:00:00Z'}){
  const errors=[];
  if(project?.state!=='review_pending')errors.push('project must be review_pending');
  if(!quality?.publishable)errors.push('quality evaluation must pass');
  if(moderation?.decision!=='approved'||!sha(moderation?.evidenceDigest))errors.push('moderation approval evidence is required');
  if(!approval?.approvedBy||String(approval.approvedBy)===String(project?.createdBy)||!sha(approval?.attestationDigest))errors.push('independent publication approval is required');
  if(!Array.isArray(rights)||!rights.length)errors.push('rights evidence is required');
  for(const right of rights||[]){if(!sha(right.evidenceDigest)||right.expiresAt&&Date.parse(right.expiresAt)<=Date.parse(now))errors.push(`rights unavailable for ${right.assetId||'asset'}`);if(right.containsPerson&&!right.consentRef)errors.push(`consent unavailable for ${right.assetId||'asset'}`);}
  if(version?.aiGenerated===true&&(!version?.disclosurePolicy?.watermark||!version?.disclosurePolicy?.label))errors.push('AI disclosure label and watermark are required');
  for(const name of ['storage_cdn','publishing'])if(!providers?.includes(name))errors.push(`${name} provider is required`);
  const decision={projectId:project?.id,versionDigest:version?.versionDigest,qualityDigest:quality?.evaluationDigest,moderationDigest:moderation?.evidenceDigest,approvedBy:approval?.approvedBy,attestationDigest:approval?.attestationDigest,rightsDigests:(rights||[]).map(x=>x.evidenceDigest).sort(),disclosurePolicy:version?.disclosurePolicy||null};
  return{ok:errors.length===0,errors,approval:{...decision,approvalDigest:digest(decision)}};
}
function aggregateSentiment(observations,failures=[]){
  if(!Array.isArray(observations)||!observations.length)throw new Error('authoritative sentiment observations are required');
  const totals={positive:0,neutral:0,negative:0,sampleCount:0};
  for(const [i,o]of observations.entries()){
    if(!o.observationId||!o.platform||!date(o.observedAt)||!sha(o.sourceDigest)||!Number.isInteger(o.sampleCount)||o.sampleCount<1)throw new Error(`observation ${i} lacks typed authoritative evidence`);
    for(const name of ['positive','neutral','negative']){if(!Number.isInteger(o[name])||o[name]<0)throw new Error(`observation ${i} has invalid ${name}`);totals[name]+=o[name];}
    if(o.positive+o.neutral+o.negative!==o.sampleCount)throw new Error(`observation ${i} sampleCount does not reconcile`);
    totals.sampleCount+=o.sampleCount;
  }
  for(const failure of failures)if(!failure.provider||!failure.errorCode||typeof failure.retryable!=='boolean')throw new Error('typed sentiment provider failure is required');
  const percentages={positiveBps:Math.round(totals.positive*10000/totals.sampleCount),neutralBps:Math.round(totals.neutral*10000/totals.sampleCount),negativeBps:Math.round(totals.negative*10000/totals.sampleCount)};
  const result={totals,percentages,observationDigests:observations.map(x=>x.sourceDigest).sort(),partial:failures.length>0,failures:failures.map(x=>({provider:x.provider,errorCode:x.errorCode,retryable:x.retryable}))};
  return{...result,aggregateDigest:digest(result)};
}
function transition(current,next,actor){const errors=[];if(!STATES[current]?.has(next))errors.push(`transition ${current} -> ${next} is not allowed`);const roles={editing:['creator','editor','admin'],render_queued:['creator','editor','admin'],approved:['reviewer','publisher','admin'],publish_queued:['publisher','admin'],published:['publisher','admin'],exported:['publisher','admin']};if(roles[next]&&!roles[next].includes(actor?.role))errors.push(`${next} requires ${roles[next].join(' or ')}`);return{ok:errors.length===0,errors};}
function retry(attempt,maxAttempts=5){if(!Number.isInteger(attempt)||attempt<1)throw new Error('attempt must be a positive integer');return attempt>=maxAttempts?{status:'dead_letter',retryable:false,nextDelaySeconds:null}:{status:'retry',retryable:true,nextDelaySeconds:Math.min(3600,30*(2**(attempt-1)))};}
function recordUsage(input){if(!PROVIDERS.includes(input?.provider)||!nonempty(input?.operation)||!Number.isInteger(input?.units)||input.units<0||!nonempty(input?.unitType)||!sha(input?.evidenceDigest))throw new Error('typed provider usage evidence is required');const result={provider:input.provider,operation:input.operation,units:input.units,unitType:input.unitType,costMinor:input.costMinor??null,currency:input.currency??null,evidenceDigest:input.evidenceDigest};return{...result,usageDigest:digest(result)};}
module.exports={PROVIDERS,STATES,aggregateSentiment,approvePublication,assessQuality,createVersion,digest,queueRender,recordUsage,retry,transition,validateSource};
