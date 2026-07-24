const CACHE_NAME = "kompix-v2";
const RUNTIME_CACHE = "runtime-v1";

const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./logo.png",
    "./111.jpg",
    "./222.jpg",
    "./333.jpg",
    "./otz.html",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


// Установка Service Worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});


// Активация и удаление старых кэшей
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => 
                        key !== CACHE_NAME &&
                        key !== RUNTIME_CACHE
                    )
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Cache First
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
}

// Network First
async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        return caches.match(request);
    }
}

// Обработка запросов
self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.mode === "navigate") {
        event.respondWith(
            networkFirst(request)
        );
    } 
    else {
        event.respondWith(
            cacheFirst(request)
        );
    }
});