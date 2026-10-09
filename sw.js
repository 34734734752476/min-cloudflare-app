const CACHE='sundsteigen-glass-20261009-v5';
const ASSETS=['./','./index.html','./styles.css','./styles.css?v=sundsteigen-glass-20261009-v5','./supabase-config.js','./supabase-bridge.js','./v3.js?v=supabase-20261009','./smart.js','./manifest.webmanifest','./farm-illustration.svg','./farm-logo.png','./farm-banner.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request).then(r=>{
    const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;
  }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match(e.request,{ignoreSearch:true}))));
});
