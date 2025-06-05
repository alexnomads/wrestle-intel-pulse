
export class AutoUpdateService {
  private intervalId: NodeJS.Timeout | null = null;
  private updateCallbacks: (() => Promise<void>)[] = [];

  constructor() {
    this.startAutoUpdate();
  }

  addUpdateCallback(callback: () => Promise<void>) {
    this.updateCallbacks.push(callback);
  }

  removeUpdateCallback(callback: () => Promise<void>) {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  private async executeAllUpdates() {
    console.log('Auto-update: Starting scheduled data refresh...');
    
    try {
      // Execute all registered update callbacks
      await Promise.allSettled(
        this.updateCallbacks.map(async (callback) => {
          try {
            await callback();
          } catch (error) {
            console.error('Auto-update callback failed:', error);
          }
        })
      );
      
      console.log('Auto-update: All data refresh completed');
    } catch (error) {
      console.error('Auto-update: Error during scheduled update:', error);
    }
  }

  startAutoUpdate() {
    if (this.intervalId) {
      this.stopAutoUpdate();
    }

    // Update every 10 minutes (600,000 milliseconds)
    this.intervalId = setInterval(() => {
      this.executeAllUpdates();
    }, 10 * 60 * 1000);

    console.log('Auto-update service started - updates every 10 minutes');
  }

  stopAutoUpdate() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Auto-update service stopped');
    }
  }

  // Manual trigger for immediate update
  async triggerUpdate() {
    await this.executeAllUpdates();
  }
}

// Create a singleton instance
export const autoUpdateService = new AutoUpdateService();
