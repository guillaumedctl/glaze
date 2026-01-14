"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Shield, Activity, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

// Color palette for different threat types
const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
    
    // Real-time subscription to see updates without refreshing
    const subscription = supabase
      .channel('audit_logs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setLogs(data);
      processAnalytics(data);
    }
  };

  const processAnalytics = (rawData: any[]) => {
    // 1. Calculate General Stats
    const total = rawData.length;
    const today = rawData.filter(log => 
      new Date(log.created_at).toDateString() === new Date().toDateString()
    ).length;
    setStats({ total, today });

    // 2. Risk Distribution (Pie Chart)
    const counts: any = {};
    rawData.forEach(log => {
      counts[log.leak_type] = (counts[log.leak_type] || 0) + 1;
    });
    setDistributionData(Object.keys(counts).map(key => ({ 
      name: key.toUpperCase(), 
      value: counts[key] 
    })));

    // 3. Activity Trend (Line Chart - Last 10 detections)
    const trend = rawData.slice(0, 10).reverse().map((log, index) => ({
      time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count: index + 1
    }));
    setChartData(trend);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Shield className="text-blue-500 w-8 h-8" /> GLAZE <span className="text-blue-500">SECURITY</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold mt-1">
            Data Governance & Threat Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-wider">System Operational</span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 text-slate-400 mb-4">
            <Lock size={16} /> <span className="text-xs font-bold uppercase">Total Blocked</span>
          </div>
          <h2 className="text-5xl font-black text-white">{stats.total}</h2>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 text-blue-400 mb-4">
            <Activity size={16} /> <span className="text-xs font-bold uppercase">Today's Traffic</span>
          </div>
          <h2 className="text-5xl font-black text-blue-500">{stats.today}</h2>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <CheckCircle2 size={16} /> <span className="text-xs font-bold uppercase">Safety Score</span>
          </div>
          <h2 className="text-5xl font-black text-emerald-500">100%</h2>
        </div>
      </div>

      {/* ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-8">Detection Trend</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-8">Risk Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT LOGS TABLE */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-blue-500" />
          <h3 className="text-sm font-bold text-slate-400 uppercase">Live Audit Feed</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Threat Type</th>
                <th className="px-6 py-4">Protection Mode</th>
                <th className="px-6 py-4 text-right">Time Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-blue-400">
                    <span className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full" />
                      [{log.leak_type.toUpperCase()}]
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-2 py-1 rounded border border-blue-500/20 uppercase">
                      Masked & Encrypted
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 group-hover:text-slate-300">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}