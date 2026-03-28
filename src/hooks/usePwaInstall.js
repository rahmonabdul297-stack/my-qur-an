import { useState, useEffect, useCallback } from "react";

function getIsStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function getIsIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Captures Chrome/Edge `beforeinstallprompt` for PWA install; exposes standalone detection for iOS.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(getIsStandalone);
  const [isIOS] = useState(getIsIOS);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const syncStandalone = () => setIsStandalone(getIsStandalone());
    mq.addEventListener("change", syncStandalone);

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      mq.removeEventListener("change", syncStandalone);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    isStandalone,
    isIOS,
    canInstall: Boolean(deferredPrompt),
    promptInstall,
  };
}
