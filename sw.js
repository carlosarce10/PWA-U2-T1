const CACHE_NAME = "cache-v1";
const CACHE_STATIC_NAME = "static-v1";
const CACHE_DYNAMIC_NAME = "dynamic-v1";
const CACHE_INMUTABLE_NAME = "inmutable-v1";

function cleanCache(cacheName, sizeItems){
    caches.open(cacheName)
    .then(cache =>{
        cache.keys()
        .then(keys => {
            console.log(keys);
            if(keys.length >= sizeItems){
                cache.delete(keys[0]).then(() => {
                    cleanCache(CACHE_DYNAMIC_NAME,sizeItems);
                })
            }
        });
    });
}

self.addEventListener("install",(event) =>{
    const promesaCache = caches.open(CACHE_STATIC_NAME)
    .then(cache =>{
        return cache.addAll([
            "/",
            "index.html",
            "images/noticia1.png",
            "images/noticia2.png",
            "images/noticia3.png",
            "images/noticia4.png",
            "js/app.js"
        ]);
    });

    const promInmutable = caches.open(CACHE_INMUTABLE_NAME)
    .then(cacheInmutable =>{
        return cacheInmutable.addAll([
            "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
        ]);
    });
    event.waitUntil(Promise.all([promesaCache,promInmutable]));

    event.waitUntil(promesaCache);
});

self.addEventListener("fetch", (event)=>{
    const respuestaCache = caches.match(event.request)
    .then(resp => {
        if(resp){
            return resp;
        }
        console.log("No está en caché",event.request.url);
        return fetch(event.request)
        .then(respNet => {
            caches.open(CACHE_DYNAMIC_NAME)
            .then(cache => {
                console.log(event.request);
                cache.put(event.request,respNet);
                cleanCache(CACHE_DYNAMIC_NAME,10)
            });
            return respNet.clone();
        });
    })
    event.respondWith(respuestaCache);
});