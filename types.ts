
export interface Integration {
  id: string;
  name: string;
  type: 'issue_tracker' | 'version_control' | 'monitoring' | 'logging';
  icon: string;
  connected: boolean;
  status: 'active' | 'disconnected' | 'syncing';
  lastSync?: string;
}

export interface BugSignal {
  id: string;
  source: 'Jira' | 'GitHub' | 'Sentry' | 'Datadog';
  type: 'Ticket' | 'Commit' | 'Error' | 'Log';
  reference: string;
  timestamp: string;
  metadata: Record<string, string>;
}

export interface BugCluster {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'New' | 'Investigating' | 'Resolved';
  recurringCount: number;
  firstSeen: string;
  lastSeen: string;
  affectedService: string;
  signals: BugSignal[];
  aiAnalysis: string;
  rootCauseProbability: number;
  costImpact: number; // Estimated cost in $
}

export interface DashboardStats {
  totalRecurringBugs: number;
  hoursSaved: number;
  moneySaved: number;
  activeIntegrations: number;
}
