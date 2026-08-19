export function registerOfflineKit({ swPath = './sw.js' } = {}) {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.register(swPath).catch(() => null);
}

export function watchOnline(callback) {
  const update = () => callback(Boolean(navigator.onLine));
  const onEvent = () => update();
  window.addEventListener('online', onEvent);
  window.addEventListener('offline', onEvent);
  update();
  const timer = setInterval(update, 2000);
  return () => {
    window.removeEventListener('online', onEvent);
    window.removeEventListener('offline', onEvent);
    clearInterval(timer);
  };
}