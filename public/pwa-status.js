// Check if app is installed or in standalone mode
function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
}

// Check if browser supports PWA installation
function canInstallPWA() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    return true;
  }
  return false;
}

// Log PWA status on page load
window.addEventListener('load', () => {
  if (isPWAInstalled()) {
    console.log('PWA is installed and running in standalone mode');
  } else if (canInstallPWA()) {
    console.log('PWA can be installed on this device');
  } else {
    console.log('PWA is not supported on this browser');
  }
}); 