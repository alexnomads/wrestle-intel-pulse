
import { getAccountsByPriority, getActiveAccounts } from '@/constants/wrestlingAccounts';
import { TwitterServiceConfig } from './TwitterServiceConfig';

export class TwitterAccountSelector {
  private cycleOffset = 0;
  private priorityCycle = 0;

  constructor(private config: TwitterServiceConfig) {}

  getSmartAccountSelection(): string[] {
    const priorities = ['high', 'medium', 'low'] as const;
    const currentPriority = priorities[this.priorityCycle % priorities.length];
    
    // Get accounts for current priority
    const priorityAccounts = getAccountsByPriority(currentPriority);
    
    if (priorityAccounts.length === 0) {
      // Fallback to all active accounts if no accounts in current priority
      const allAccounts = getActiveAccounts();
      const startIndex = this.cycleOffset % allAccounts.length;
      const endIndex = Math.min(startIndex + this.config.MAX_ACCOUNTS_PER_CYCLE, allAccounts.length);
      
      return allAccounts.slice(startIndex, endIndex).map(acc => acc.username);
    }

    // For high priority, process more frequently
    const accountsToProcess = currentPriority === 'high' ? 
      Math.min(10, priorityAccounts.length) : 
      Math.min(this.config.MAX_ACCOUNTS_PER_CYCLE, priorityAccounts.length);

    const startIndex = this.cycleOffset % priorityAccounts.length;
    const selectedAccounts = [];
    
    for (let i = 0; i < accountsToProcess; i++) {
      const accountIndex = (startIndex + i) % priorityAccounts.length;
      selectedAccounts.push(priorityAccounts[accountIndex].username);
    }

    return selectedAccounts;
  }

  updateCycleOffsets(): void {
    const totalAccounts = getActiveAccounts().length;
    this.cycleOffset = (this.cycleOffset + this.config.MAX_ACCOUNTS_PER_CYCLE) % totalAccounts;
    this.priorityCycle++;
  }

  getCurrentCycleInfo() {
    return {
      cycleOffset: this.cycleOffset,
      priorityCycle: this.priorityCycle
    };
  }
}
