/**
 * PWA Hook
 * 
 * Lightweight hook to detect PWA install state and expose the beforeinstallprompt event.
 * Used for detecting installability and showing install prompts.
 */

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Handle beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Prompt the user to install the PWA
   * Returns a promise that resolves with the user's choice
   */
  const promptInstall = async (): Promise<'accepted' | 'dismissed' | null> => {
    if (!deferredPrompt) {
      console.warn('PWA install prompt not available');
      return null;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      return outcome;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return null;
    }
  };

  return {
    promptInstall,
    isInstalled,
    isInstallable,
  };
}

