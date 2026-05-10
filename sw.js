// 간단한 Service Worker — 정적 자산 캐시 + API/HTML는 네트워크 우선
const CACHE='md-dash-v2';
const APP_SHELL=['/','/index.html','/manifest.webmanifest','/icon-192.svg','/icon-512.svg'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // 동일 출처 GET만 처리
  if(e.request.method!=='GET'||url.origin!==location.origin) return;
  // API와 HTML은 네트워크 우선(데이터 신선도 우선), 실패 시 캐시
  if(url.pathname.startsWith('/api/')||e.request.mode==='navigate'||url.pathname.endsWith('.html')){
    e.respondWith(
      fetch(e.request).then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return r;
      }).catch(()=>caches.match(e.request).then(c=>c||caches.match('/index.html')))
    );
    return;
  }
  // 정적 자산은 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
      if(r.ok&&r.type==='basic'){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
      return r;
    }))
  );
});
