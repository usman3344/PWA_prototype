Here is a shorter, cleaner, human-written version:

---

# **VESIRON Tech Library – PWA Prototype**

A lightweight prototype built to demonstrate installable, offline-ready PWA capabilities.

---

## **Features**

* Fully functional PWA (manifest + service worker)
* Installable on Chrome Desktop/Android and Safari iOS
* Offline-first browsing with caching strategies
* Pages included: Home, Brand Overview, Patent Index, Document Viewer, Offline fallback

---

## **Project Structure**

```
VESIRON/
├── index.html
├── brand-overview.html
├── patent-index.html
├── document-viewer.html
├── offline.html
├── manifest.webmanifest
├── service-worker.js
├── styles.css
├── app.js
├── icons/
└── README.md
```

---

## **How to Run**

**Option 1 (Recommended):**

```bash
npm run serve
```

**Option 2 (Python):**

```bash
python -m http.server 8080
```

**Option 3 (Node http-server):**

```bash
npx http-server . -p 8080 -c-1
```

*Note: PWAs need HTTPS or localhost for service workers.*

---

## **Testing**

* **Installability:** Test on Chrome or Safari using “Add to Home Screen.”
* **Offline Mode:** Enable *Offline* in DevTools and check navigation.
* **Caching:** Verify caches under Application → Cache Storage.
* **Manifest:** Check icons, name, theme color in DevTools → Manifest.


## **Technical Highlights**

* Precaching of core files
* Cache-first for documents
* Stale-while-revalidate for dynamic requests
* Versioned cache for easy updates

**Status:** Prototype for evaluation only.
**License:** Confidential – For assessment purposes.

