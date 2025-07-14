export interface DashboardEvent {
  action: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

class MockLogger {
  private logs: DashboardEvent[] = [];
  
  logDashboardEvent(action: string, metadata?: Record<string, unknown>): void {
    const event: DashboardEvent = {
      action,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      metadata
    };
    
    this.logs.push(event);
    
    // In a real implementation, this would send to analytics service
    console.log('Dashboard Event:', event);
  }
  
  private getCurrentUserId(): string | undefined {
    try {
      const sessionData = localStorage.getItem("atlantis_session") || 
                         sessionStorage.getItem("atlantis_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session.user || 'anonymous';
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return 'anonymous';
  }
  
  getLogs(): DashboardEvent[] {
    return [...this.logs];
  }
  
  clearLogs(): void {
    this.logs = [];
  }
}

export const dashboardLogger = new MockLogger();