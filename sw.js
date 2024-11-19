self.addEventListener("activate", async (event) => {
    await self.clients.claim();
})

self.addEventListener("fetch", (event) => {
    async function cacheFirst(url) {
        const cacheStorage = await caches.open("cache-v1");
        // キャシュからのリスポンスの取得
        const cachedResponse = await cacheStorage.match(url);

        if (cachedResponse) {
            // キャシュに存在すれば、そのまま返却する
            return cachedResponse;
        } else {
            // キャシュになければ、まずフェッチする
            const response = await fetch(url);
            // 3秒待ち
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 取得済みのリスポンスをキャシュに保存する
            await cacheStorage.put(url, response.clone());
            // そしてクライアント側へ返す
            return response
        }
    }

    const {url} = event.request;
    event.respondWith(cacheFirst(url))
})

self.addEventListener("message", async (event) => {
    const payload = event.data;
    const cacheStorage = await caches.open("cache-v1");
    await cacheStorage.put(payload.url, new Response(JSON.stringify({data: payload.content})));

    const clients = await self.clients.matchAll();
    clients.forEach((client) => client.postMessage("Cached Successfully | キャシュ化が成功されました"))
})