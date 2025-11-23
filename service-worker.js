// Service Worker for VESIRON Tech Library PWA
// Cache version - increment this when updating assets
const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `vesiron-tech-library-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

// Patent detail pages
const PATENT_PAGES = [
    '/patents/G1.html',
    '/patents/G2.html',
    '/patents/G3.html',
    '/patents/G4.html',
    '/patents/G5.html',
    '/patents/G6.html',
    '/patents/G7.html',
    '/patents/G8.html',
    '/patents/G9.html',
    '/patents/G10.html',
    '/patents/G11.html',
    '/patents/G12.html',
    '/patents/G13.html',
    '/patents/G14.html',
    '/patents/G18.html',
    '/patents/G19.html'
];

// Assets to precache - HTML/CSS/JS
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/brand-overview.html',
    '/patent-index.html',
    '/document-viewer.html',
    '/offline.html',
    '/manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/assets/docs/placeholder.pdf',
    ...PATENT_PAGES
];

// Install event - precache assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker v' + CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching', PRECACHE_ASSETS.length, 'assets');
                // Use addAll for better performance, with fallback for individual failures
                return cache.addAll(PRECACHE_ASSETS).catch((error) => {
                    console.warn('[SW] Some assets failed to precache, caching individually:', error);
                    // Fallback: cache assets individually
                    return Promise.allSettled(
                        PRECACHE_ASSETS.map(url => 
                            cache.add(url).catch(err => {
                                console.warn('[SW] Failed to cache', url, err);
                                return null;
                            })
                        )
                    );
                });
            })
            .then(() => {
                console.log('[SW] Precaching complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[SW] Precaching failed', error);
                // Don't fail installation if precaching has issues
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim(); // Take control of all pages
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Cache-first strategy for PDFs
    if (url.pathname.endsWith('.pdf') || request.headers.get('accept')?.includes('application/pdf')) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[SW] PDF cache hit:', url.pathname);
                        return cachedResponse;
                    }
                    console.log('[SW] PDF cache miss, fetching:', url.pathname);
                    return fetch(request)
                        .then((response) => {
                            // Only cache successful responses
                            if (response && response.status === 200) {
                                const responseToCache = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseToCache);
                                        console.log('[SW] PDF cached:', url.pathname);
                                    })
                                    .catch(err => console.warn('[SW] Failed to cache PDF', err));
                            }
                            return response;
                        })
                        .catch((error) => {
                            console.warn('[SW] PDF fetch failed:', url.pathname, error);
                            // If fetch fails and no cache, return offline page for navigation
                            if (request.mode === 'navigate') {
                                return caches.match(OFFLINE_PAGE);
                            }
                            return new Response('PDF unavailable offline', {
                                status: 503,
                                headers: { 'Content-Type': 'text/plain' }
                            });
                        });
                })
        );
        return;
    }

    // Stale-While-Revalidate for dynamic fetches (API calls, etc.)
    if (url.pathname.startsWith('/api/') || request.destination === 'fetch') {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    // Start fetch in background
                    const fetchPromise = fetch(request)
                        .then((response) => {
                            // Update cache with fresh response
                            if (response && response.status === 200) {
                                const responseToCache = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseToCache);
                                        console.log('[SW] Stale-while-revalidate: updated cache');
                                    })
                                    .catch(err => console.warn('[SW] Failed to update cache', err));
                            }
                            return response;
                        })
                        .catch((error) => {
                            console.warn('[SW] Stale-while-revalidate fetch failed:', error);
                            // If fetch fails, return cached version if available
                            return cachedResponse || new Response('Network error', {
                                status: 503,
                                headers: { 'Content-Type': 'text/plain' }
                            });
                        });

                    // Return cached version immediately, or wait for fetch if no cache
                    if (cachedResponse) {
                        console.log('[SW] Stale-while-revalidate: serving from cache');
                        // Return cached immediately, update in background
                        fetchPromise.catch(() => {}); // Ignore background update errors
                        return cachedResponse;
                    }
                    return fetchPromise;
                })
        );
        return;
    }

    // Cache-first strategy for HTML, CSS, JS, and other static assets
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.warn('[SW] Fetch failed:', url.pathname, error);
                        // If it's a navigation request and fetch fails, return offline page
                        if (request.mode === 'navigate') {
                            return caches.match(OFFLINE_PAGE) || new Response('Offline', {
                                status: 503,
                                headers: { 'Content-Type': 'text/html' }
                            });
                        }
                        // For other requests, return a basic error response
                        return new Response('Resource unavailable offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

