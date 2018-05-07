const networkThenCache = async (req) => {
	const cache = await caches.open('berlin-subway-guide')
	try {
		const res = await fetch(req)
		cache.put(req, res.clone())
		return res
	} catch (err) {
		return cache.match(req)
	}
}

self.addEventListener('fetch', (ev) => {
	const p = networkThenCache(ev.request)
	p.catch(console.error)
	ev.respondWith(p)
})
