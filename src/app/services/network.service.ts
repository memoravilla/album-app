export class NetworkService {
  static isOnline(): boolean {
    return navigator.onLine;
  }

  static waitForOnline(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isOnline()) {
        resolve();
      } else {
        const handleOnline = () => {
          window.removeEventListener('online', handleOnline);
          resolve();
        };
        window.addEventListener('online', handleOnline);
      }
    });
  }

  static onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}
