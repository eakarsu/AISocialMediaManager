# Quarantined Generated Surfaces

The original backend contains broad generated routes, mock/sample behavior, direct chat-completion calls, and `gap-*` modules. The original frontend still references some of those prototype surfaces. They are retained for design comparison only and are not supported product behavior.

`backend/src/server.js` mounts only health, tenant authentication, and `routes/governedContent.js`. The prior `gap-no-audiencesentimentanalysis-aggregate-perce.js` route is specifically superseded by the durable `/api/governed-content/sentiment-aggregates` workflow. Reintroducing any quarantined surface requires typed authoritative providers, tenant state, rights and safety gates, durable failure semantics, and acceptance tests equivalent to the governed API.
