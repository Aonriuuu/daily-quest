const C='dq-v2',F=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
// Only a plain, successful, same-origin 200 response is ever stored.
const good=r=>r.ok&&r.status===200&&r.type==='basic'&&!r.redirected;
self.addEventListener('fetch',e=>{const q=e.request;
 if(q.method!=='GET'||new URL(q.url).origin!==location.origin)return;
 e.respondWith((async()=>{const cache=await caches.open(C);
  const saved=async()=>(await cache.match(q,{ignoreSearch:true}))||(q.mode==='navigate'?await cache.match('./index.html'):undefined);
  try{const r=await fetch(q);
   if(good(r)){e.waitUntil(cache.put(q,r.clone()));return r}
   if(r.ok)return r;                 // e.g. redirects or partial content: pass through, never cache
   return (await saved())||r;        // HTTP error: prefer the last good copy
  }catch(err){return (await saved())||Response.error()}})())});
