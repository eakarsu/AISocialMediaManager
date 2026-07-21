'use strict';
const {PROVIDERS}=require('../domain/contentWorkflow');
function readiness(env=process.env){const providers=PROVIDERS.map(name=>{const key=name.toUpperCase();const enabled=env[`${key}_PROVIDER_ENABLED`]==='true';return{name,enabled,ready:enabled&&/^https:\/\//.test(String(env[`${key}_PROVIDER_URL`]||''))&&Boolean(env[`${key}_PROVIDER_TOKEN`])};});return{ready:providers.every(x=>x.ready),providers};}
function requireProviders(names,env=process.env){const known=readiness(env).providers;const unavailable=names.filter(name=>!known.find(x=>x.name===name&&x.ready));if(unavailable.length)throw Object.assign(new Error(`providers not ready: ${unavailable.join(', ')}`),{code:'PROVIDER_NOT_READY'});return names;}
module.exports={readiness,requireProviders};
