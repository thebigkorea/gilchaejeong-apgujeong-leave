const CACHE_NAME="gilchaejeong-apgujeong-leave-v1";

self.addEventListener("install",e=>{

self.skipWaiting();

e.waitUntil(

caches.open(CACHE_NAME).then(cache=>{

return cache.addAll([
"./index.html?v=1",
"./admin.html?v=1",
"./style.css",
"./script.js?v=1",
"./manifest.json"
]);

})

);

});

self.addEventListener("activate",e=>{

e.waitUntil(

caches.keys().then(keys=>{

return Promise.all(

keys.map(k=>{

if(k!==CACHE_NAME) return caches.delete(k);

})

);

})

);

});

self.addEventListener("fetch",e=>{

e.respondWith(

fetch(e.request).catch(()=>caches.match(e.request))

);

});