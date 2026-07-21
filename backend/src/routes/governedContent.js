'use strict';
const express=require('express');
const pool=require('../db');
const workflow=require('../domain/contentWorkflow');
const {readiness,requireProviders}=require('../services/providerBoundary');

module.exports=function governedContent(authenticate){
  const router=express.Router();
  router.use(authenticate);
  const tenant=req=>String(req.user.tenantId);
  const roles=(...allowed)=>(req,res,next)=>allowed.includes(req.user.role)?next():res.status(403).json({error:'Insufficient social-media role'});
  const digest=value=>workflow.digest(value);
  async function transaction(work){const client=await pool.connect();try{await client.query('BEGIN');const value=await work(client);await client.query('COMMIT');return value;}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}}
  async function event(client,req,projectId,type,payload,evidenceDigest=null){await client.query('INSERT INTO social_events(tenant_id,project_id,actor_id,event_type,payload,evidence_digest) VALUES($1,$2,$3,$4,$5,$6)',[tenant(req),projectId||null,req.user.id,type,payload,evidenceDigest]);}
  function fail(res,error,message){if(error.code==='23505')return res.status(409).json({error:'Version or idempotency conflict'});if(error.code==='PROVIDER_NOT_READY')return res.status(503).json({error:error.message});const status=error.status||(/required|invalid|must|cannot|expired|unavailable|transition|reconcile/.test(error.message)?422:500);res.status(status).json({error:status===500?message:error.message});}

  router.get('/providers/readiness',roles('creator','editor','reviewer','publisher','auditor','admin'),(_req,res)=>{const result=readiness();res.status(result.ready?200:503).json(result);});

  router.post('/sources',roles('creator','editor','admin'),async(req,res)=>{
    try{
      requireProviders(['rights_library','storage_cdn']);
      const validation=workflow.validateSource(req.body,new Date().toISOString());
      if(!validation.ok)return res.status(422).json({error:'Source rejected',details:validation.errors});
      const source=req.body;
      const result=await pool.query('INSERT INTO social_source_ingestions(tenant_id,source_ref,source_type,storage_uri,source,source_digest,ingested_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[tenant(req),source.sourceId,source.sourceType,source.storageUri,source,validation.sourceDigest,req.user.id]);
      res.status(201).json(result.rows[0]);
    }catch(error){fail(res,error,'Source ingestion failed');}
  });

  router.post('/projects',roles('creator','editor','admin'),async(req,res)=>{
    try{if(!String(req.body?.title||'').trim())return res.status(422).json({error:'title is required'});const result=await pool.query("INSERT INTO social_projects(tenant_id,title,state,created_by) VALUES($1,$2,'draft',$3) RETURNING *",[tenant(req),req.body.title,req.user.id]);res.status(201).json(result.rows[0]);}catch(error){fail(res,error,'Project creation failed');}
  });

  router.post('/projects/:id/versions',roles('creator','editor','admin'),async(req,res)=>{
    try{
      const input={...req.body,projectId:String(req.params.id)};
      const validation=workflow.createVersion(input);
      if(!validation.ok)return res.status(422).json({error:'Version rejected',details:validation.errors});
      const result=await transaction(async client=>{
        const project=(await client.query('SELECT * FROM social_projects WHERE id=$1 AND tenant_id=$2 FOR UPDATE',[req.params.id,tenant(req)])).rows[0];
        if(!project)throw Object.assign(new Error('Project not found'),{status:404});
        if(!['draft','editing','rejected','review_pending'].includes(project.state))throw new Error('Project is not editable');
        const version=(await client.query('INSERT INTO social_content_versions(tenant_id,project_id,parent_version_id,version_ref,locale,content,version_digest,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[tenant(req),project.id,input.parentVersionId||null,input.version,input.locale,validation.version,validation.version.versionDigest,req.user.id])).rows[0];
        for(const asset of input.assets){
          const source=(await client.query('SELECT * FROM social_source_ingestions WHERE tenant_id=$1 AND source_digest=$2',[tenant(req),asset.sourceDigest])).rows[0];
          if(!source)throw new Error(`authoritative source unavailable for asset ${asset.assetId}`);
          const assetDigest=digest(asset);
          const created=(await client.query('INSERT INTO social_assets(tenant_id,content_version_id,asset_ref,source_ingestion_id,asset,asset_digest) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[tenant(req),version.id,asset.assetId,source.id,asset,assetDigest])).rows[0];
          const rights={...source.source.rights,containsPerson:source.source.containsPerson===true,consentRef:source.source.consentRef||null};
          await client.query('INSERT INTO social_rights_evidence(tenant_id,asset_id,license_ref,rights,evidence_digest,consent_ref,expires_at,recorded_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[tenant(req),created.id,rights.licenseId,rights,rights.evidenceDigest,rights.consentRef,rights.expiresAt||null,req.user.id]);
        }
        await client.query("UPDATE social_projects SET state='editing',revision=revision+1,updated_at=NOW() WHERE id=$1",[project.id]);
        await event(client,req,project.id,'content_version_created',{contentVersionId:version.id},version.version_digest);
        return version;
      });
      res.status(201).json(result);
    }catch(error){fail(res,error,'Version creation failed');}
  });

  router.post('/projects/:id/transition',async(req,res)=>{
    try{
      const revision=Number(req.get('If-Match'));
      if(!Number.isInteger(revision))return res.status(400).json({error:'If-Match revision is required'});
      const result=await transaction(async client=>{
        const project=(await client.query('SELECT * FROM social_projects WHERE id=$1 AND tenant_id=$2 FOR UPDATE',[req.params.id,tenant(req)])).rows[0];
        if(!project)throw Object.assign(new Error('Project not found'),{status:404});
        if(project.revision!==revision)throw Object.assign(new Error('Project revision conflict'),{status:409});
        const decision=workflow.transition(project.state,req.body?.nextState,req.user);
        if(!decision.ok)throw new Error(decision.errors.join('; '));
        const updated=(await client.query('UPDATE social_projects SET state=$1,revision=revision+1,updated_at=NOW() WHERE id=$2 AND revision=$3 RETURNING *',[req.body.nextState,project.id,revision])).rows[0];
        await event(client,req,project.id,'state_transition',{from:project.state,to:req.body.nextState});
        return updated;
      });
      res.json(result);
    }catch(error){fail(res,error,'Project transition failed');}
  });

  router.post('/versions/:id/render-jobs',roles('creator','editor','admin'),async(req,res)=>{
    try{
      requireProviders(['media_model','storage_cdn']);
      const key=String(req.get('Idempotency-Key')||'');
      if(!key)return res.status(422).json({error:'Idempotency-Key is required'});
      const result=await transaction(async client=>{
        const found=await client.query('SELECT v.*,p.state,p.id AS project_id FROM social_content_versions v JOIN social_projects p ON p.id=v.project_id WHERE v.id=$1 AND v.tenant_id=$2 FOR UPDATE OF p',[req.params.id,tenant(req)]);
        const version=found.rows[0];if(!version)throw Object.assign(new Error('Content version not found'),{status:404});if(version.state!=='editing')throw new Error('Project must be editing before render queueing');
        const request=workflow.queueRender(version.content,req.body?.exportSpec);
        const job=(await client.query("INSERT INTO social_render_jobs(tenant_id,content_version_id,idempotency_key,status,request,request_digest,created_by) VALUES($1,$2,$3,'queued',$4,$5,$6) RETURNING *",[tenant(req),version.id,key,request,request.requestDigest,req.user.id])).rows[0];
        await client.query("UPDATE social_projects SET state='render_queued',revision=revision+1,updated_at=NOW() WHERE id=$1",[version.project_id]);
        await event(client,req,version.project_id,'render_queued',{renderJobId:job.id},request.requestDigest);return job;
      });
      res.status(202).json(result);
    }catch(error){fail(res,error,'Render queue failed');}
  });

  router.post('/render-jobs/:id/outcomes',roles('render_operator','admin'),async(req,res)=>{
    try{
      const body=req.body||{};if(!['succeeded','failed'].includes(body.status))return res.status(422).json({error:'succeeded or failed status is required'});
      requireProviders(['media_model','storage_cdn']);
      const result=await transaction(async client=>{
        const found=await client.query('SELECT j.*,v.project_id FROM social_render_jobs j JOIN social_content_versions v ON v.id=j.content_version_id WHERE j.id=$1 AND j.tenant_id=$2 FOR UPDATE',[req.params.id,tenant(req)]);const job=found.rows[0];if(!job)throw Object.assign(new Error('Render job not found'),{status:404});
        if(body.status==='succeeded'&&(!/^https:\/\//.test(String(body.artifactUri||''))||!/^[a-f0-9]{64}$/.test(String(body.artifactDigest||''))||!body.providerJobRef))throw new Error('durable artifact, digest, and provider job reference are required');
        let status='succeeded',retryResult=null;if(body.status==='failed'){retryResult=workflow.retry(job.attempts+1);status=retryResult.status;}
        await client.query("UPDATE social_render_jobs SET status=$1,attempts=attempts+1,next_attempt_at=CASE WHEN $2::integer IS NULL THEN next_attempt_at ELSE NOW()+make_interval(secs=>$2) END,artifact_uri=$3,artifact_digest=$4,provider_job_ref=$5,last_error_code=$6,updated_at=NOW() WHERE id=$7",[status,retryResult?.nextDelaySeconds??null,body.artifactUri||null,body.artifactDigest||null,body.providerJobRef||null,body.errorCode||null,job.id]);
        if(body.status==='failed')await client.query('INSERT INTO social_provider_failures(tenant_id,provider,operation,error_code,retryable) VALUES($1,$2,$3,$4,$5)',[tenant(req),'media_model','render',body.errorCode||'RENDER_FAILED',retryResult.retryable]);
        await client.query('UPDATE social_projects SET state=$1,revision=revision+1,updated_at=NOW() WHERE id=$2',[body.status==='succeeded'?'review_pending':'render_failed',job.project_id]);
        await event(client,req,job.project_id,body.status==='succeeded'?'render_succeeded':'render_failed',{renderJobId:job.id,status},body.artifactDigest||null);return{status,...retryResult};
      });
      res.status(body.status==='succeeded'?200:502).json(result);
    }catch(error){fail(res,error,'Render outcome failed');}
  });

  router.post('/versions/:id/quality-evaluations',roles('reviewer','auditor','admin'),async(req,res)=>{
    try{
      const found=await pool.query("SELECT v.*,j.id AS render_job_id,j.artifact_digest FROM social_content_versions v JOIN social_render_jobs j ON j.content_version_id=v.id AND j.status='succeeded' WHERE v.id=$1 AND v.tenant_id=$2 ORDER BY j.id DESC LIMIT 1",[req.params.id,tenant(req)]);const version=found.rows[0];if(!version)return res.status(409).json({error:'A successful render is required'});
      const evaluation=workflow.assessQuality(version.content,{...req.body,artifactDigest:version.artifact_digest});if(!evaluation.ok)return res.status(422).json({error:'Quality evidence rejected',details:evaluation.errors});
      const result=await pool.query('INSERT INTO social_quality_evaluations(tenant_id,content_version_id,render_job_id,evaluation,evaluation_digest,passed,evaluated_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[tenant(req),version.id,version.render_job_id,evaluation.evaluation,evaluation.evaluation.evaluationDigest,evaluation.evaluation.publishable,req.user.id]);res.status(evaluation.evaluation.publishable?201:422).json(result.rows[0]);
    }catch(error){fail(res,error,'Quality evaluation failed');}
  });

  router.post('/versions/:id/moderation-decisions',roles('reviewer','auditor','admin'),async(req,res)=>{
    try{const body=req.body||{};if(!['approved','rejected','escalated'].includes(body.decision)||!body.policyVersion||!/^[a-f0-9]{64}$/.test(String(body.evidenceDigest||'')))return res.status(422).json({error:'typed moderation decision evidence is required'});const version=await pool.query('SELECT 1 FROM social_content_versions WHERE id=$1 AND tenant_id=$2',[req.params.id,tenant(req)]);if(!version.rows[0])return res.status(404).json({error:'Version not found'});const result=await pool.query('INSERT INTO social_moderation_decisions(tenant_id,content_version_id,decision,policy_version,evidence_digest,decided_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[tenant(req),req.params.id,body.decision,body.policyVersion,body.evidenceDigest,req.user.id]);res.status(201).json(result.rows[0]);}catch(error){fail(res,error,'Moderation decision failed');}
  });

  router.post('/projects/:id/approvals',roles('reviewer','publisher','admin'),async(req,res)=>{
    try{
      const result=await transaction(async client=>{
        const project=(await client.query('SELECT * FROM social_projects WHERE id=$1 AND tenant_id=$2 FOR UPDATE',[req.params.id,tenant(req)])).rows[0];if(!project)throw Object.assign(new Error('Project not found'),{status:404});
        const version=(await client.query('SELECT * FROM social_content_versions WHERE project_id=$1 AND tenant_id=$2 ORDER BY id DESC LIMIT 1',[project.id,tenant(req)])).rows[0];
        const quality=(await client.query('SELECT * FROM social_quality_evaluations WHERE content_version_id=$1 AND tenant_id=$2 ORDER BY id DESC LIMIT 1',[version?.id,tenant(req)])).rows[0];
        const moderation=(await client.query('SELECT * FROM social_moderation_decisions WHERE content_version_id=$1 AND tenant_id=$2 ORDER BY id DESC LIMIT 1',[version?.id,tenant(req)])).rows[0];
        const rights=(await client.query('SELECT r.rights,r.evidence_digest,r.expires_at,r.consent_ref,a.asset_ref FROM social_rights_evidence r JOIN social_assets a ON a.id=r.asset_id WHERE a.content_version_id=$1 AND r.tenant_id=$2',[version?.id,tenant(req)])).rows.map(row=>({...row.rights,assetId:row.asset_ref,evidenceDigest:row.evidence_digest,expiresAt:row.expires_at,consentRef:row.consent_ref}));
        const providers=requireProviders(['storage_cdn','publishing']);
        const decision=workflow.approvePublication({project:{id:project.id,state:project.state,createdBy:project.created_by},version:version?.content,quality:quality?.evaluation,rights,moderation:{decision:moderation?.decision,evidenceDigest:moderation?.evidence_digest},approval:{approvedBy:req.user.id,attestationDigest:req.body?.attestationDigest},providers,now:new Date().toISOString()});
        if(!decision.ok)throw new Error(decision.errors.join('; '));
        const approval=(await client.query('INSERT INTO social_publication_approvals(tenant_id,project_id,content_version_id,quality_evaluation_id,moderation_decision_id,approval,approval_digest,approved_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[tenant(req),project.id,version.id,quality.id,moderation.id,decision.approval,decision.approval.approvalDigest,req.user.id])).rows[0];
        await client.query("UPDATE social_projects SET state='approved',revision=revision+1,updated_at=NOW() WHERE id=$1",[project.id]);await event(client,req,project.id,'publication_approved',{approvalId:approval.id},decision.approval.approvalDigest);return approval;
      });res.status(201).json(result);
    }catch(error){fail(res,error,'Publication approval failed');}
  });

  router.post('/projects/:id/publication-jobs',roles('publisher','admin'),async(req,res)=>{
    try{
      requireProviders(['storage_cdn','publishing']);const key=String(req.get('Idempotency-Key')||'');if(!key||!req.body?.channel)return res.status(422).json({error:'Idempotency-Key and channel are required'});
      const result=await transaction(async client=>{const project=(await client.query("SELECT * FROM social_projects WHERE id=$1 AND tenant_id=$2 AND state='approved' FOR UPDATE",[req.params.id,tenant(req)])).rows[0];if(!project)throw new Error('Approved project is required');const approval=(await client.query('SELECT * FROM social_publication_approvals WHERE project_id=$1 AND tenant_id=$2 ORDER BY id DESC LIMIT 1',[project.id,tenant(req)])).rows[0];const payload={projectId:project.id,approvalDigest:approval.approval_digest,channel:req.body.channel,targetRef:req.body.targetRef,scheduledAt:req.body.scheduledAt||null},payloadDigest=digest(payload);const job=(await client.query("INSERT INTO social_publication_jobs(tenant_id,approval_id,channel,idempotency_key,status,payload,payload_digest,created_by) VALUES($1,$2,$3,$4,'queued',$5,$6,$7) RETURNING *",[tenant(req),approval.id,req.body.channel,key,payload,payloadDigest,req.user.id])).rows[0];await client.query("UPDATE social_projects SET state='publish_queued',revision=revision+1,updated_at=NOW() WHERE id=$1",[project.id]);await event(client,req,project.id,'publication_queued',{publicationJobId:job.id},payloadDigest);return job;});res.status(202).json(result);
    }catch(error){fail(res,error,'Publication queue failed');}
  });

  router.post('/publication-jobs/:id/outcomes',roles('publisher','admin'),async(req,res)=>{
    try{
      requireProviders(['publishing']);const body=req.body||{};if(!['succeeded','failed'].includes(body.status))return res.status(422).json({error:'succeeded or failed status is required'});
      const result=await transaction(async client=>{const found=await client.query('SELECT j.*,a.project_id FROM social_publication_jobs j JOIN social_publication_approvals a ON a.id=j.approval_id WHERE j.id=$1 AND j.tenant_id=$2 FOR UPDATE',[req.params.id,tenant(req)]);const job=found.rows[0];if(!job)throw Object.assign(new Error('Publication job not found'),{status:404});if(body.status==='succeeded'&&(!body.externalPostRef||!/^[a-f0-9]{64}$/.test(String(body.evidenceDigest||''))))throw new Error('external post reference and evidence digest are required');let status='succeeded',retryResult=null;if(body.status==='failed'){retryResult=workflow.retry(job.attempts+1);status=retryResult.status;}await client.query("UPDATE social_publication_jobs SET status=$1,attempts=attempts+1,next_attempt_at=CASE WHEN $2::integer IS NULL THEN next_attempt_at ELSE NOW()+make_interval(secs=>$2) END,external_post_ref=$3,evidence_digest=$4,last_error_code=$5,updated_at=NOW() WHERE id=$6",[status,retryResult?.nextDelaySeconds??null,body.externalPostRef||null,body.evidenceDigest||null,body.errorCode||null,job.id]);if(body.status==='failed')await client.query('INSERT INTO social_provider_failures(tenant_id,provider,operation,error_code,retryable) VALUES($1,$2,$3,$4,$5)',[tenant(req),'publishing','publish',body.errorCode||'PUBLISH_FAILED',retryResult.retryable]);await client.query('UPDATE social_projects SET state=$1,revision=revision+1,updated_at=NOW() WHERE id=$2',[body.status==='succeeded'?'published':'publish_failed',job.project_id]);await event(client,req,job.project_id,body.status==='succeeded'?'published':'publication_failed',{publicationJobId:job.id,status},body.evidenceDigest||null);return{status,...retryResult};});res.status(body.status==='succeeded'?200:502).json(result);
    }catch(error){fail(res,error,'Publication outcome failed');}
  });

  router.post('/sentiment-aggregates',roles('creator','editor','reviewer','auditor','admin'),async(req,res)=>{
    try{
      requireProviders(['publishing']);const body=req.body||{};if(!Array.isArray(body.observations)||!body.windowStart||!body.windowEnd||Date.parse(body.windowStart)>=Date.parse(body.windowEnd))return res.status(422).json({error:'observations and a valid aggregation window are required'});const aggregate=workflow.aggregateSentiment(body.observations,body.failures||[]);
      const result=await transaction(async client=>{for(const observation of body.observations)await client.query('INSERT INTO social_sentiment_observations(tenant_id,platform,observation_ref,observation,source_digest,observed_at,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)',[tenant(req),observation.platform,observation.observationId,observation,observation.sourceDigest,observation.observedAt,req.user.id]);for(const failure of body.failures||[])await client.query('INSERT INTO social_provider_failures(tenant_id,provider,operation,error_code,retryable) VALUES($1,$2,$3,$4,$5)',[tenant(req),failure.provider,'sentiment_ingestion',failure.errorCode,failure.retryable]);return(await client.query('INSERT INTO social_sentiment_aggregates(tenant_id,window_start,window_end,aggregate,aggregate_digest,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[tenant(req),body.windowStart,body.windowEnd,aggregate,aggregate.aggregateDigest,req.user.id])).rows[0];});res.status(201).json(result);
    }catch(error){fail(res,error,'Sentiment aggregation failed');}
  });

  router.post('/provider-usage',roles('render_operator','publisher','auditor','admin'),async(req,res)=>{
    try{const usage=workflow.recordUsage(req.body);const result=await pool.query('INSERT INTO social_provider_usage(tenant_id,provider,operation,usage,usage_digest,evidence_digest,recorded_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[tenant(req),usage.provider,usage.operation,usage,usage.usageDigest,usage.evidenceDigest,req.user.id]);res.status(201).json(result.rows[0]);}catch(error){fail(res,error,'Provider usage failed');}
  });

  return router;
};
