/**
 * Real Browser Notification Service for SOLVA
 * Sends user-friendly notifications when the window is in background / blurred.
 */

class NotificationService {
  private isSupported: boolean = false;
  private isUserOptedIn: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.isSupported = true;
      const saved = localStorage.getItem('solva_notifications_enabled');
      this.isUserOptedIn = saved === 'true';
    }
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission;
  }

  public getOptedIn(): boolean {
    return this.isUserOptedIn && this.getPermissionStatus() === 'granted';
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.isUserOptedIn = true;
        localStorage.setItem('solva_notifications_enabled', 'true');
        return true;
      } else {
        this.isUserOptedIn = false;
        localStorage.setItem('solva_notifications_enabled', 'false');
        return false;
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
      return false;
    }
  }

  public setOptedIn(enabled: boolean): void {
    this.isUserOptedIn = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('solva_notifications_enabled', String(enabled));
    }
  }

  /**
   * Send notification only when tab is in background and user opted in
   */
  public notifyReplyCompleted(summary: string, language?: string): void {
    if (!this.isSupported || !this.isUserOptedIn) return;
    if (Notification.permission !== 'granted') return;

    // Only notify if tab is hidden to avoid spamming the user while actively looking at the screen
    if (typeof document !== 'undefined' && !document.hidden) return;

    try {
      const title = `SOLVA ${language ? `(${language})` : ''}`;
      const body = summary.slice(0, 120) + (summary.length > 120 ? '...' : '');

      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'solva-reply',
      });
    } catch (e) {
      console.debug('Notification could not be dispatched:', e);
    }
  }
}

export const notificationService = new NotificationService();
