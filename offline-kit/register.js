export function registerOfflineKit({ swPath = './sw.js' } = {}) {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.register(swPath).catch(() => null);
}

export function watchOnline(callback) {
  let stopped = false;
  const probe = async () => {
    try {
      await fetch('/ping?t=' + Date.now(), { cache: 'no-store' });
      return true;
    } catch (e) {
      return false;
    }
  };
  const update = async () => {
    const ok = await probe();
    if (!stopped) callback(ok);
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
  const timer = setInterval(update, 2000);
  return () => {
    stopped = true;
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
    clearInterval(timer);
  };
}