// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        })
            .then((registration) => {
                console.log('[PWA] Service Worker registered successfully:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[PWA] New service worker available - reload to update');
                                // Optionally show update notification to user
                            } else if (newWorker.state === 'activated') {
                                console.log('[PWA] Service worker activated');
                            }
                        });
                    }
                });
                
                // Periodic update check (every hour)
                setInterval(() => {
                    registration.update();
                }, 3600000);
            })
            .catch((error) => {
                console.error('[PWA] Service Worker registration failed:', error);
            });
    });
}

// Handle install prompt
let deferredPrompt = null;
let installButton = null;
let installBanner = null;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('[PWA] Install prompt available');
    
    // Show custom install button
    installBanner = document.getElementById('install-banner');
    installButton = document.getElementById('install-button');
    
    if (installBanner) {
        installBanner.style.display = 'block';
    }
    
    if (installButton) {
        installButton.addEventListener('click', handleInstallClick);
    }
    
});

// Handle install button click
function handleInstallClick() {
    if (!deferredPrompt) {
        return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
        } else {
            console.log('[PWA] User dismissed the install prompt');
        }
        deferredPrompt = null;
        if (installButton) {
            installButton.style.display = 'none';
        }
    });
}

// Install completed handler
window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed successfully');
    deferredPrompt = null;
    if (installButton) {
        installButton.style.display = 'none';
    }
});

// Check if app is already installed (standalone mode)
if (window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true) {
    console.log('[PWA] App is running in standalone mode');
    if (installBanner) {
        installBanner.style.display = 'none';
    }
}


