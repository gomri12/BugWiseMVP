
import { Integration, BugCluster, DashboardStats } from './types';

export const MOCK_INTEGRATIONS: Integration[] = [
  { 
    id: '1', 
    name: 'Jira', 
    type: 'issue_tracker', 
    icon: 'jira', 
    connected: true, 
    status: 'active',
    lastSync: '2 minutes ago'
  },
  { 
    id: '2', 
    name: 'GitHub', 
    type: 'version_control', 
    icon: 'github', 
    connected: false, 
    status: 'disconnected' 
  },
  { 
    id: '3', 
    name: 'Sentry', 
    type: 'monitoring', 
    icon: 'sentry', 
    connected: true, 
    status: 'active',
    lastSync: '30 seconds ago'
  },
  { 
    id: '4', 
    name: 'Datadog', 
    type: 'logging', 
    icon: 'datadog', 
    connected: true, 
    status: 'active',
    lastSync: '5 minutes ago'
  },
];

export const MOCK_CLUSTERS: BugCluster[] = [
  {
    id: 'BC-1024',
    title: 'NullPointer in PaymentService Gateway',
    severity: 'Critical',
    status: 'New',
    recurringCount: 5,
    firstSeen: '2025-10-15',
    lastSeen: '2025-11-27',
    affectedService: 'Payment-API',
    rootCauseProbability: 92,
    costImpact: 12500,
    aiAnalysis: "This bug has appeared 5 times in the last month. It correlates strongly with high-latency database calls in Datadog and a specific 'hotfix' commit in GitHub that bypassed standard testing.",
    signals: [
      { id: 's1', source: 'Sentry', type: 'Error', reference: 'Issue #4921', timestamp: '2025-11-27 10:42', metadata: { error: 'NPE', trace: 'Gateway.java:42', environment: 'production' } },
      { id: 's2', source: 'Datadog', type: 'Log', reference: 'Trace ID 99a8', timestamp: '2025-11-27 10:41', metadata: { latency: '4500ms', endpoint: '/checkout', status: '500' } },
      { id: 's3', source: 'Jira', type: 'Ticket', reference: 'BUG-332', timestamp: '2025-10-15', metadata: { assignee: 'J. Doe', status: 'Closed', resolution: 'Fixed' } },
      { id: 's4', source: 'GitHub', type: 'Commit', reference: 'fix/quick-patch', timestamp: '2025-11-26', metadata: { author: 'dev-ops', file: 'Gateway.java', diff_size: '+2/-15' } },
    ]
  },
  {
    id: 'BC-1045',
    title: 'Redis Connection Timeout on Auth',
    severity: 'High',
    status: 'Investigating',
    recurringCount: 12,
    firstSeen: '2025-11-01',
    lastSeen: '2025-11-26',
    affectedService: 'Auth-Service',
    rootCauseProbability: 85,
    costImpact: 8400,
    aiAnalysis: "Recurrent timeouts match deployment windows. Likely a configuration drift in the Kubernetes deployment manifest regarding connection pool limits.",
    signals: [
      { id: 's5', source: 'Datadog', type: 'Log', reference: 'Trace ID 77b2', timestamp: '2025-11-26 14:00', metadata: { error: 'ECONNRESET', pod: 'auth-service-7d' } },
      { id: 's6', source: 'GitHub', type: 'Commit', reference: 'chore/update-deps', timestamp: '2025-11-20', metadata: { file: 'helm/values.yaml', change: 'pool_size: 20' } },
      { id: 's9', source: 'Sentry', type: 'Error', reference: 'Issue #5112', timestamp: '2025-11-26 14:01', metadata: { exception: 'TimeoutException', stack: 'RedisClient.ts:150' } }
    ]
  },
  {
    id: 'BC-1102',
    title: 'Race Condition in Inventory Update',
    severity: 'Medium',
    status: 'New',
    recurringCount: 3,
    firstSeen: '2025-11-25',
    lastSeen: '2025-11-27',
    affectedService: 'Inventory-Worker',
    rootCauseProbability: 64,
    costImpact: 3200,
    aiAnalysis: "Detected overlapping transaction logs for the same SKU ID across multiple worker threads. Suggests missing optimistic locking.",
    signals: [
      { id: 's7', source: 'Sentry', type: 'Error', reference: 'Issue #5001', timestamp: '2025-11-27', metadata: { error: 'Deadlock', db_table: 'inventory_items' } },
      { id: 's8', source: 'Jira', type: 'Ticket', reference: 'BUG-401', timestamp: '2025-11-25', metadata: { priority: 'P2', labels: 'concurrency, backend' } }
    ]
  },
  {
    id: 'BC-1150',
    title: 'Mobile App Crash on Login',
    severity: 'High',
    status: 'Resolved',
    recurringCount: 8,
    firstSeen: '2025-10-01',
    lastSeen: '2025-11-20',
    affectedService: 'Mobile-iOS',
    rootCauseProbability: 95,
    costImpact: 15600,
    aiAnalysis: "Correlated to API schema change in Backend Service v2.4. Mobile client expects string for 'user_id' but receives integer.",
    signals: [
      { id: 's10', source: 'Sentry', type: 'Error', reference: 'Issue #4800', timestamp: '2025-11-20', metadata: { error: 'TypeMismatch', device: 'iPhone 14' } },
      { id: 's11', source: 'GitHub', type: 'Commit', reference: 'feat/user-schema', timestamp: '2025-10-01', metadata: { repo: 'backend-api', file: 'schema.graphql' } }
    ]
  },
  {
    id: 'BC-1201',
    title: 'Memory Leak in PDF Generator',
    severity: 'Medium',
    status: 'Investigating',
    recurringCount: 4,
    firstSeen: '2025-11-10',
    lastSeen: '2025-11-28',
    affectedService: 'Reporting-Service',
    rootCauseProbability: 72,
    costImpact: 2100,
    aiAnalysis: "Gradual memory increase observed in Datadog after 'feature/export-v2' deployment. Stream buffers are not being flushed in Node.js worker.",
    signals: [
      { id: 's12', source: 'Datadog', type: 'Log', reference: 'Metric: heap_used', timestamp: '2025-11-28', metadata: { trend: '+15%', pod: 'report-worker-2x' } },
      { id: 's13', source: 'Jira', type: 'Ticket', reference: 'BUG-445', timestamp: '2025-11-10', metadata: { assignee: 'M. Scott', labels: 'performance' } }
    ]
  }
];

export const INITIAL_STATS: DashboardStats = {
  totalRecurringBugs: 142,
  hoursSaved: 320,
  moneySaved: 45000,
  activeIntegrations: 3
};
