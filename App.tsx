
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Database,
  GitBranch,
  Activity,
  Server,
  AlertTriangle,
  BrainCircuit,
  TrendingUp,
  DollarSign,
  Clock,
  Network,
  PieChart as PieIcon,
  BarChart2,
  Link2,
  Zap,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from 'recharts';
import { MOCK_INTEGRATIONS, MOCK_CLUSTERS, INITIAL_STATS } from './constants';
import { generateRootCauseAnalysis } from './services/geminiService';
import { Integration, BugCluster } from './types';

// --- Integration Card Component ---
const IntegrationCard: React.FC<{ 
  integration: Integration; 
  onToggle: (id: string) => void;
}> = ({ 
  integration, 
  onToggle 
}) => {
  const getIcon = () => {
    switch(integration.icon) {
      case 'jira': return <Database className="w-6 h-6" />;
      case 'github': return <GitBranch className="w-6 h-6" />;
      case 'sentry': return <AlertTriangle className="w-6 h-6" />;
      case 'datadog': return <Server className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${
      integration.connected 
        ? 'bg-slate-900 border-primary-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
        : 'bg-slate-900 border-slate-800 opacity-80 hover:opacity-100'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${integration.connected ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-400'}`}>
          {getIcon()}
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex h-2 w-2 rounded-full ${integration.connected ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {integration.status}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{integration.name}</h3>
      <p className="text-sm text-slate-400 mb-6">
        {integration.type === 'issue_tracker' && 'Syncs tickets & metadata'}
        {integration.type === 'version_control' && 'Analyzes commits & PRs'}
        {integration.type === 'monitoring' && 'Ingests stack traces'}
        {integration.type === 'logging' && 'Correlates system logs'}
      </p>
      <button
        onClick={() => onToggle(integration.id)}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          integration.connected
            ? 'bg-slate-800 text-slate-300 hover:bg-rose-900/20 hover:text-rose-400'
            : 'bg-primary-600 text-white hover:bg-primary-500'
        }`}
      >
        {integration.connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
};

// --- Correlation Heatmap Component ---
const CorrelationHeatmap = ({ clusters }: { clusters: BugCluster[] }) => {
  const sources = ['Jira', 'GitHub', 'Sentry', 'Datadog'];
  
  // Calculate matrix
  const matrix = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    sources.forEach(s => {
      data[s] = {};
      sources.forEach(s2 => data[s][s2] = 0);
    });

    clusters.forEach(cluster => {
      // Get unique sources in this cluster
      const clusterSources = [...new Set(cluster.signals.map(s => s.source))];
      
      // Increment pairs
      for (let i = 0; i < clusterSources.length; i++) {
        for (let j = 0; j < clusterSources.length; j++) {
          const s1 = clusterSources[i];
          const s2 = clusterSources[j];
          if (data[s1] && data[s1][s2] !== undefined) {
            data[s1][s2]++;
          }
        }
      }
    });
    return data;
  }, [clusters]);

  const maxVal = Math.max(...Object.values(matrix).flatMap(row => Object.values(row)));

  const getColor = (val: number, isDiagonal: boolean) => {
    if (val === 0) return 'bg-slate-800/50 text-slate-600';
    const intensity = val / maxVal;
    
    if (isDiagonal) return 'bg-slate-700 text-white border border-slate-600'; // Self-correlation
    
    if (intensity < 0.3) return 'bg-primary-900/20 text-primary-300';
    if (intensity < 0.6) return 'bg-primary-600/40 text-primary-200';
    return 'bg-primary-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-500" />
            Signal Correlation Heatmap
          </h3>
          <p className="text-sm text-slate-500 mt-1">Co-occurrence of signals in bug clusters</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-5 gap-2">
          {/* Header Row */}
          <div className="col-span-1"></div>
          {sources.map(s => (
            <div key={s} className="flex items-center justify-center font-mono text-xs text-slate-400 uppercase tracking-wider pb-2">
              {s}
            </div>
          ))}

          {/* Data Rows */}
          {sources.map(rowSource => (
            <React.Fragment key={rowSource}>
              {/* Row Label */}
              <div className="flex items-center justify-end pr-4 font-mono text-xs text-slate-400 uppercase tracking-wider font-medium">
                {rowSource}
              </div>
              {/* Cells */}
              {sources.map(colSource => {
                const value = matrix[rowSource][colSource];
                const isDiagonal = rowSource === colSource;
                return (
                  <div 
                    key={`${rowSource}-${colSource}`}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-default hover:scale-105
                      ${getColor(value, isDiagonal)}
                    `}
                    title={`${rowSource} + ${colSource}: ${value} correlations`}
                  >
                    {value}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Live Activity Feed ---
const ActivityFeed = () => {
  const activities = [
    { type: 'ingest', source: 'Sentry', msg: 'Ingested 14 new error events', time: 'Just now' },
    { type: 'match', source: 'System', msg: 'Correlated 2 signals to BC-1045', time: '2m ago' },
    { type: 'ingest', source: 'GitHub', msg: 'Processed push to main branch', time: '5m ago' },
    { type: 'alert', source: 'Datadog', msg: 'High latency detected on API Gateway', time: '12m ago' },
    { type: 'ingest', source: 'Jira', msg: 'Syncing ticket status updates...', time: '15m ago' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-full">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        Live Ingestion Pipeline
      </h3>
      <div className="relative border-l border-slate-800 ml-2 space-y-6">
        {activities.map((act, i) => (
          <div key={i} className="pl-6 relative">
             <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
               act.type === 'match' ? 'bg-primary-500' : 
               act.type === 'alert' ? 'bg-rose-500' : 'bg-emerald-500'
             }`} />
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm text-slate-300 font-medium">{act.msg}</p>
                 <span className="text-xs text-slate-500">{act.source}</span>
               </div>
               <span className="text-[10px] text-slate-600 font-mono">{act.time}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Dashboard View ---
const DashboardView = ({ 
  integrations, 
  clusters 
}: { 
  integrations: Integration[]; 
  clusters: BugCluster[] 
}) => {
  const connectedCount = integrations.filter(i => i.connected).length;
  
  // Chart Data
  const impactData = clusters.map(c => ({
    name: c.affectedService,
    impact: c.costImpact,
    count: c.recurringCount
  }));

  if (connectedCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-700">
          <Network className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Data Sources Connected</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Connect your existing tools to start identifying recurring bugs and their root causes through metadata correlation.
        </p>
        <button 
          onClick={() => document.getElementById('nav-integrations')?.click()} 
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20"
        >
          Go to Integrations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Recurring Bugs Detected</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-3xl font-bold text-white">{clusters.length > 0 ? INITIAL_STATS.totalRecurringBugs : 0}</span>
            <span className="text-sm text-emerald-500 mb-1">+12% this week</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Dev Hours Saved</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-3xl font-bold text-white">{clusters.length > 0 ? INITIAL_STATS.hoursSaved : 0}</span>
            <span className="text-sm text-blue-500 mb-1">est. this month</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Cost Impact Avoided</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="text-3xl font-bold text-white">${clusters.length > 0 ? (INITIAL_STATS.moneySaved / 1000).toFixed(1) : 0}k</span>
            <span className="text-sm text-slate-500 mb-1">based on avg. dev salary</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart: Financial Impact */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Financial Impact by Service</h3>
            <div className="flex gap-2">
              <button className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Week</button>
              <button className="text-xs bg-slate-800/50 text-slate-500 px-2 py-1 rounded">Month</button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
                  {impactData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed (New) */}
        <div className="lg:col-span-4">
           <ActivityFeed />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Integration Heatmap (New) */}
        <div className="lg:col-span-5">
           <CorrelationHeatmap clusters={clusters} />
        </div>

        {/* Top Priority List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Top Recurring Issues</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar h-[250px]">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
                      cluster.severity === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                      cluster.severity === 'High' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {cluster.severity}
                    </span>
                    <span className="text-xs text-slate-500">{cluster.recurringCount}x</span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-200 group-hover:text-primary-400 line-clamp-2 mt-1">
                    {cluster.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                     {cluster.signals.slice(0,3).map((s, i) => (
                        <div key={i} className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700">
                           {s.source}
                        </div>
                     ))}
                     {cluster.signals.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{cluster.signals.length - 3}</span>
                     )}
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Bug Analysis View ---
const BugAnalysisView = ({ clusters }: { clusters: BugCluster[] }) => {
  const [selectedCluster, setSelectedCluster] = useState<BugCluster | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");

  const handleAnalyze = async (cluster: BugCluster) => {
    setSelectedCluster(cluster);
    setAnalysis("");
    setAiLoading(true);
    // Call Gemini Service
    const result = await generateRootCauseAnalysis(cluster.title, cluster.signals);
    setAnalysis(result);
    setAiLoading(false);
  };

  if (clusters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-slate-400">Please connect integrations in the dashboard to see recurring bugs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* List */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
        <div className="p-4 border-b border-slate-800 bg-slate-900">
          <h2 className="text-lg font-semibold text-white">Detected Clusters</h2>
          <p className="text-sm text-slate-500">Correlated across connected tools</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {clusters.map((cluster) => (
            <div 
              key={cluster.id}
              onClick={() => handleAnalyze(cluster)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCluster?.id === cluster.id 
                  ? 'bg-primary-900/10 border-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-slate-500">{cluster.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  cluster.severity === 'Critical' ? 'text-rose-400 bg-rose-950/30' : 
                  cluster.severity === 'High' ? 'text-orange-400 bg-orange-950/30' : 'text-blue-400 bg-blue-950/30'
                }`}>{cluster.severity}</span>
              </div>
              <h3 className="text-sm font-medium text-slate-200 mb-2 leading-snug">{cluster.title}</h3>
              <div className="flex items-center justify-between mt-3">
                 <div className="flex -space-x-2">
                   {cluster.signals.some(s => s.source === 'Datadog') && (
                     <div className="w-6 h-6 rounded-full bg-purple-900 border border-slate-800 flex items-center justify-center text-[10px] text-white z-10 relative group">
                        <Server size={12} />
                     </div>
                   )}
                   {cluster.signals.some(s => s.source === 'Sentry') && (
                     <div className="w-6 h-6 rounded-full bg-rose-900 border border-slate-800 flex items-center justify-center text-[10px] text-white z-20 relative group">
                        <AlertTriangle size={12} />
                     </div>
                   )}
                   {cluster.signals.some(s => s.source === 'Jira') && (
                     <div className="w-6 h-6 rounded-full bg-blue-900 border border-slate-800 flex items-center justify-center text-[10px] text-white z-30 relative group">
                        <Database size={12} />
                     </div>
                   )}
                   {cluster.signals.some(s => s.source === 'GitHub') && (
                     <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[10px] text-white z-40 relative group">
                        <GitBranch size={12} />
                     </div>
                   )}
                 </div>
                 <span className="text-xs text-slate-500">{cluster.signals.length} Signals</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail / Analysis */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
        {selectedCluster ? (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{selectedCluster.title}</h2>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">
                  {selectedCluster.affectedService}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                  First Seen: {selectedCluster.firstSeen}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                  Last Seen: {selectedCluster.lastSeen}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  <span className="text-rose-400 font-medium">Est. Cost: ${selectedCluster.costImpact.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* AI Insight Section */}
              <div className="bg-gradient-to-br from-indigo-950/30 to-purple-950/30 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">Root Cause Analysis</h3>
                  {aiLoading && <span className="text-xs text-indigo-400 animate-pulse ml-2">Gemini is thinking...</span>}
                </div>
                {aiLoading ? (
                  <div className="space-y-3">
                    <div className="h-2 bg-indigo-500/20 rounded w-full animate-pulse"></div>
                    <div className="h-2 bg-indigo-500/20 rounded w-5/6 animate-pulse"></div>
                    <div className="h-2 bg-indigo-500/20 rounded w-4/6 animate-pulse"></div>
                  </div>
                ) : (
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                    {analysis}
                  </p>
                )}
                <div className="mt-6 flex gap-3">
                   <button className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 transition-colors">
                     Create Remediation Ticket (Jira)
                   </button>
                   <button className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 transition-colors">
                     View Regression Test
                   </button>
                </div>
              </div>

              {/* Signals / Evidence */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-slate-400" />
                  Metadata Evidence Chain
                </h3>
                <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pb-4">
                  {selectedCluster.signals.map((signal, idx) => (
                    <div key={signal.id} className="relative pl-8">
                      {/* Timeline Node */}
                      <div className={`absolute -left-[9px] top-6 h-4 w-4 rounded-full border-2 z-10 bg-slate-900 ${
                         signal.source === 'Sentry' ? 'border-rose-500' :
                         signal.source === 'Datadog' ? 'border-purple-500' :
                         signal.source === 'Jira' ? 'border-blue-500' : 'border-slate-500'
                      }`} />
                      
                      <div className="bg-slate-800/30 hover:bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-1.5
                               ${signal.source === 'Jira' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                 signal.source === 'Sentry' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                 signal.source === 'GitHub' ? 'bg-slate-700/50 text-slate-300 border border-slate-600' : 
                                 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}
                             `}>
                               {signal.source === 'Jira' && <Database size={10} />}
                               {signal.source === 'Sentry' && <AlertTriangle size={10} />}
                               {signal.source === 'GitHub' && <GitBranch size={10} />}
                               {signal.source === 'Datadog' && <Server size={10} />}
                               {signal.source}
                             </span>
                             <span className="text-sm font-medium text-slate-200">{signal.type}: {signal.reference}</span>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">{signal.timestamp}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-slate-900/50 rounded border border-slate-800">
                          {Object.entries(signal.metadata).map(([key, value]) => (
                            <div key={key} className="flex flex-col">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{key.replace('_', ' ')}</span>
                              <span className="text-slate-300 font-mono text-xs truncate" title={value}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
               <CheckCircle2 className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-medium text-slate-300">Select a Bug Cluster</h3>
            <p className="text-slate-500 mt-2">View detailed metadata correlation and AI analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Analytics View ---
const AnalyticsView = () => {
  const data = [
    { name: 'Payment API', recurring: 12, resolved: 8 },
    { name: 'Auth Service', recurring: 18, resolved: 12 },
    { name: 'Inventory', recurring: 5, resolved: 5 },
    { name: 'User Profile', recurring: 8, resolved: 4 },
  ];

  const pieData = [
    { name: 'Config Drift', value: 35 },
    { name: 'Race Conditions', value: 25 },
    { name: 'Regressions', value: 20 },
    { name: '3rd Party API', value: 20 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary-500" />
          Recurring vs Resolved by Service
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Bar dataKey="recurring" name="Recurring Bugs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
         <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-purple-500" />
          Root Cause Distribution
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Historical Trend (MTTR)</h3>
        <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', mttr: 48 },
                { month: 'Feb', mttr: 45 },
                { month: 'Mar', mttr: 42 },
                { month: 'Apr', mttr: 35 },
                { month: 'May', mttr: 28 },
                { month: 'Jun', mttr: 24 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="mttr" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} />
              </LineChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [clusters, setClusters] = useState<BugCluster[]>([]); // Start empty until connected

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id === id) {
        return { 
          ...i, 
          connected: !i.connected, 
          status: !i.connected ? 'active' : 'disconnected' 
        };
      }
      return i;
    }));
  };

  // Simulate data fetching when integrations change
  useEffect(() => {
    const hasConnected = integrations.some(i => i.connected);
    if (hasConnected) {
      // Simulate loading delay for "Metadata Ingestion"
      setTimeout(() => {
        setClusters(MOCK_CLUSTERS);
      }, 800);
    } else {
      setClusters([]);
    }
  }, [integrations]);

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard':
        return <DashboardView integrations={integrations} clusters={clusters} />;
      case 'integrations':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {integrations.map(integration => (
              <IntegrationCard 
                key={integration.id} 
                integration={integration} 
                onToggle={handleToggleIntegration} 
              />
            ))}
          </div>
        );
      case 'bugs':
        return <BugAnalysisView clusters={clusters} />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            Feature coming soon in full release.
          </div>
        );
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

export default App;
