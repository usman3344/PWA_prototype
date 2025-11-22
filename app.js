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
    // Don't show install prompt if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        console.log('[PWA] App already installed - ignoring install prompt');
        return;
    }
    
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
    
    // Hide all install banners
    if (installBanner) {
        installBanner.style.display = 'none';
    }
    if (installButton) {
        installButton.style.display = 'none';
    }
    
    // Hide iOS banner if present
    const iosBanner = document.getElementById('ios-install-banner');
    if (iosBanner) {
        iosBanner.style.display = 'none';
    }
});

// Check if app is already installed (standalone mode)
function hideInstallBannersIfInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    
    if (isStandalone) {
        console.log('[PWA] App is running in standalone mode - hiding install banners');
        // Hide Chrome/Android install banner
        if (installBanner) {
            installBanner.style.display = 'none';
        }
        // Hide iOS install banner
        const iosBanner = document.getElementById('ios-install-banner');
        if (iosBanner) {
            iosBanner.style.display = 'none';
        }
        return true;
    }
    return false;
}

// Check on page load
if (hideInstallBannersIfInstalled()) {
    // Already installed, no need to show install prompts
} else {
    // Not installed, install prompts will show when available
}

// iOS Safari detection and instructions
function detectIOS() {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        const iosBanner = document.getElementById('ios-install-banner');
        if (iosBanner) {
            iosBanner.style.display = 'none';
        }
        return false;
    }
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const iosBanner = document.getElementById('ios-install-banner');
    
    if (isIOS && iosBanner) {
        // Show iOS install instructions only if not installed
        iosBanner.style.display = 'block';
    } else if (iosBanner) {
        // Hide if not iOS
        iosBanner.style.display = 'none';
    }
    
    return isIOS;
}

// Run iOS detection after page load
window.addEventListener('load', () => {
    // First check if installed
    hideInstallBannersIfInstalled();
    
    // Then check for iOS if not installed
    setTimeout(() => {
        if (!hideInstallBannersIfInstalled()) {
            detectIOS();
        }
    }, 1000);
});


