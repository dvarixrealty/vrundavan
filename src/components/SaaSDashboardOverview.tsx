import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, Calendar, Coins, ArrowUpRight, ArrowDownRight, 
  Search, MessageSquare, Plus, CheckCircle2, Award, ChevronRight, 
  Clock, MapPin, SearchCheck, Compass, CheckSquare, Sparkles, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, CustomRequirement, Inquiry, Agent, AdminUser } from '../types';

interface SaaSDashboardOverviewProps {
  properties: Property[];
  customRequirements: CustomRequirement[];
  inquiries: Inquiry[];
  agents: Agent[];
  loggedInUser: AdminUser | null;
  onUpdateRequirementStatus?: (id: string, nextStatus: any) => void;
  onUpdateInquiryStatus?: (id: string, nextStatus: any) => void;
  onOpenQuickAction: (action: string) => void;
  siteVisits: any[];
  financeEntries: any[];
  onNavigate?: (key: string, option?: string) => void;
}

export default function SaaSDashboardOverview({
  properties,
  customRequirements,
  inquiries,
  agents,
  loggedInUser,
  onUpdateRequirementStatus,
  onUpdateInquiryStatus,
  onOpenQuickAction,
  siteVisits = [],
  financeEntries = [],
  onNavigate
}: SaaSDashboardOverviewProps) {
  const [analyticsFilter, setAnalyticsFilter] = useState<'This Month' | 'Last Year' | 'Weekly' | 'Quarterly'>('This Month');
  const [pipelineFilter, setPipelineFilter] = useState<string>('All');
  
  // Interactive Revenue Chart Filters
  const [chartPropType, setChartPropType] = useState<string>('All');
  const [chartAgent, setChartAgent] = useState<string>('All');
  const [chartLocation, setChartLocation] = useState<string>('All');
  const [selectedPointDetails, setSelectedPointDetails] = useState<any | null>(null);
  
  // Total Valuation Pool of Listed Units
  const totalWorth = properties.reduce((acc, p) => acc + p.price, 0);
  const totalWorthCr = (totalWorth / 10000000).toFixed(1);

  // Dynamic Ledger-Based Revenue Calculations (from real cleared revenue entries)
  const totalRevenueAmount = useMemo(() => {
    return financeEntries
      ? financeEntries
          .filter((f) => f.type === 'Revenue' && f.status === 'Cleared')
          .reduce((sum, f) => sum + f.amount, 0)
      : 0;
  }, [financeEntries]);

  const totalRevenueText = useMemo(() => {
    if (totalRevenueAmount >= 10000000) {
      return `₹ ${(totalRevenueAmount / 10000000).toFixed(2)} Cr`;
    } else if (totalRevenueAmount >= 100000) {
      return `₹ ${(totalRevenueAmount / 100000).toFixed(1)} L`;
    } else {
      return `₹ ${totalRevenueAmount.toLocaleString()}`;
    }
  }, [totalRevenueAmount]);

  // Active leads count (Requirements + Inquiries)
  const totalLeadsCount = customRequirements.length + inquiries.length;

  // Active site visits
  const activeVisitsCount = siteVisits ? siteVisits.length : 0;

  // Completed closures count
  const bookingsCount = useMemo(() => {
    return siteVisits ? siteVisits.filter(v => v.status === 'Completed').length : 0;
  }, [siteVisits]);

  // Conversion rate: (Won Leads / Total Leads). Won Leads are those set to 'Contacted' or archived completed contracts.
  const conversionRate = useMemo(() => {
    const wonLeadsCount = customRequirements.filter(r => r.status === 'Contacted').length + 
                           inquiries.filter(i => r => r.status === 'Contacted').length;
    return totalLeadsCount > 0 ? ((wonLeadsCount / totalLeadsCount) * 100).toFixed(1) : "0.0";
  }, [customRequirements, inquiries, totalLeadsCount]);

  // KPI metadata with exact graphic specifications
  const kpis = [
    {
      id: "rev",
      title: "Ledger Cash Revenue",
      value: totalRevenueText,
      change: totalRevenueAmount > 0 ? "+12.4%" : "0.0%",
      isPositive: totalRevenueAmount > 0,
      color: "text-blue-600 bg-blue-50 border-blue-105",
      icon: Coins,
      chartColor: "#2563EB",
      points: [10, 45, 30, 60, 40, 85, 75, totalRevenueAmount > 0 ? 120 : 0]
    },
    {
      id: "leads",
      title: "Registered CRM Leads",
      value: totalLeadsCount.toLocaleString(),
      change: totalLeadsCount > 0 ? "+15.2%" : "0.0%",
      isPositive: totalLeadsCount > 0,
      color: "text-purple-600 bg-purple-50 border-purple-105",
      icon: Users,
      chartColor: "#8B5CF6",
      points: [20, 30, 45, 25, 60, 55, 70, totalLeadsCount * 10]
    },
    {
      id: "visits",
      title: "Completed Site Walks",
      value: activeVisitsCount.toString(),
      change: activeVisitsCount > 0 ? "+8.3%" : "0.0%",
      isPositive: activeVisitsCount > 0,
      color: "text-orange-600 bg-orange-50 border-orange-105",
      icon: Calendar,
      chartColor: "#F97316",
      points: [15, 25, 10, 40, 30, 55, 45, activeVisitsCount * 5]
    },
    {
      id: "bookings",
      title: "Realized Closures",
      value: bookingsCount.toString(),
      change: bookingsCount > 0 ? "+5.1%" : "0.0%",
      isPositive: bookingsCount > 0,
      color: "text-emerald-600 bg-emerald-50 border-emerald-105",
      icon: Building2,
      chartColor: "#10B981",
      points: [10, 20, 15, 35, 45, 30, 55, bookingsCount * 15]
    },
    {
      id: "conversion",
      title: "Sales Direct Ratio",
      value: `${conversionRate}%`,
      change: Number(conversionRate) > 0 ? "+4.2%" : "0.0%",
      isPositive: Number(conversionRate) > 0,
      color: "text-pink-600 bg-pink-50 border-pink-105",
      icon: Award,
      chartColor: "#EC4899",
      points: [5, 15, 8, 22, 18, 30, 24, Number(conversionRate) || 0]
    }
  ];

  // Pipeline Stages definition (SaaS Graphic matches exactly)
  const PipelineStages = useMemo(() => {
    return [
      { key: "New", title: "New Enquiries", count: customRequirements.filter(r => r.status === 'New').length + inquiries.filter(i => i.status === 'New').length, color: "border-blue-200 bg-blue-50/50 text-blue-700" },
      { key: "Researching", title: "Site Walks Assigned", count: siteVisits ? siteVisits.filter(v => v.status === 'Confirmed' || v.status === 'Scheduled').length : 0, color: "border-indigo-205 bg-indigo-50/50 text-indigo-700" },
      { key: "Property Sourcing", title: "In Negotiations", count: customRequirements.filter(r => r.status === 'In Progress').length + inquiries.filter(i => i.status === 'In Progress').length, color: "border-amber-205 bg-amber-50/40 text-amber-800" },
      { key: "Matching", title: "Brochures Shared", count: customRequirements.filter(r => r.status === 'Contacted').length, color: "border-orange-205 bg-orange-50/40 text-orange-850" },
      { key: "Shared", title: "Closed Deals", count: bookingsCount, color: "border-emerald-250 bg-emerald-50/50 text-emerald-800" }
    ];
  }, [customRequirements, inquiries, siteVisits, bookingsCount]);

  // Map simulated custom data for chart visualization
  const getChartPoints = () => {
    let scale = 1.0;
    if (chartPropType !== 'All') scale *= 0.45;
    if (chartAgent !== 'All') scale *= 0.35;
    if (chartLocation !== 'All') scale *= 0.55;

    const scaleArr = (arr: number[]) => arr.map(v => Math.round(v * scale));

    switch(analyticsFilter) {
      case 'Last Year':
        return {
          revenue: scaleArr([15, 24, 38, 45, 52, 60, 58, 68, 72, 80, 85, Math.max(96, totalRevenueAmount / 10000000)]),
          leads: scaleArr([40, 50, 45, 65, 70, 75, 80, 85, 90, 88, 95, Math.max(110, totalLeadsCount)]),
          visits: scaleArr([10, 18, 22, 35, 30, 42, 50, 48, 55, 62, 70, Math.max(78, activeVisitsCount)]),
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };
      case 'Quarterly':
        return {
          revenue: scaleArr([45, 68, 85, Math.round(Math.max(96, totalRevenueAmount / 10000000))]),
          leads: scaleArr([120, 145, 168, Math.round(Math.max(184, totalLeadsCount))]),
          visits: scaleArr([35, 50, 65, Math.round(Math.max(78, activeVisitsCount))]),
          months: ['Q1', 'Q2', 'Q3', 'Q4']
        };
      case 'Weekly':
        return {
          revenue: scaleArr([20, 22, 28, 30, 32, 36, Math.max(40, totalRevenueAmount / 1000000)]),
          leads: scaleArr([15, 35, 25, 45, 35, 50, Math.max(42, totalLeadsCount)]),
          visits: scaleArr([5, 12, 10, 22, 18, 25, Math.max(20, activeVisitsCount)]),
          months: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        };
      case 'This Month':
      default:
        return {
          revenue: scaleArr([10, 22, 35, 48, 42, 65, 78, Math.max(85, totalRevenueAmount / 1000000)]),
          leads: scaleArr([30, 45, 35, 58, 62, 55, 72, Math.max(84, totalLeadsCount)]),
          visits: scaleArr([15, 20, 28, 38, 32, 45, 50, Math.max(56, activeVisitsCount)]),
          months: ['01 May', '06 May', '11 May', '16 May', '21 May', '26 May', '31 May', 'Today']
        };
    }
  };

  const chartData = getChartPoints();

  // Site visits list driven strictly from real siteVisits prop
  const upcomingVisits = useMemo(() => {
    return siteVisits
      ? siteVisits.filter(v => v.status === 'Confirmed' || v.status === 'Scheduled').slice(0, 4)
      : [];
  }, [siteVisits]);

  // Lead Pipeline cards mapped directly from requirements and inquiries!
  const pipelineCards = useMemo(() => {
    const list: any[] = [];
    
    customRequirements.forEach((req, idx) => {
      list.push({
        id: req.id,
        name: req.fullName,
        budget: req.maxBudget ? `₹ ${req.maxBudget}` : 'N/A',
        location: req.preferredCity || 'Bengaluru',
        stage: req.status === 'New' ? 'New' : req.status === 'In Progress' ? 'Researching' : req.status === 'Contacted' ? 'Matching' : 'Shared',
        avatar: idx % 2 === 0 ? "👩" : "👨"
      });
    });

    inquiries.forEach((inq, idx) => {
      // Don't duplicate name if already present in requirements
      if (!list.some(item => item.name === inq.name)) {
        list.push({
          id: inq.id,
          name: inq.name,
          budget: 'Contacted',
          location: 'Bangalore',
          stage: inq.status === 'New' ? 'New' : inq.status === 'In Progress' ? 'Researching' : inq.status === 'Contacted' ? 'Matching' : 'Shared',
          avatar: idx % 2 === 0 ? "👨" : "👩"
        });
      }
    });

    return list.slice(0, 8);
  }, [customRequirements, inquiries]);

  // Activity Feed logs generated directly from database entries
  const recentActivities = useMemo(() => {
    const acts: any[] = [];
    
    properties.slice(0, 3).forEach((p, idx) => {
      acts.push({
        id: `act-p-${idx}`,
        text: `Listed property coordinate: "${p.title}" in ${p.location}`,
        time: idx === 0 ? "5 min ago" : "3 hours ago",
        type: "property",
        icon: Building2,
        color: "text-pink-600 bg-pink-50"
      });
    });

    customRequirements.slice(0, 3).forEach((r, idx) => {
      acts.push({
        id: `act-r-${idx}`,
        text: `Custom CRM requirement mandate cleared for client ${r.fullName}`,
        time: idx === 0 ? "10 min ago" : "1 hour ago",
        type: "lead",
        icon: Users,
        color: "text-blue-600 bg-blue-50"
      });
    });

    if (siteVisits) {
      siteVisits.slice(0, 3).forEach((v, idx) => {
        acts.push({
          id: `act-v-${idx}`,
          text: `Site walk scheduled for ${v.customerName} @ ${v.propertyTitle}`,
          time: idx === 0 ? "Yesterday" : "2 days ago",
          type: "visit",
          icon: Calendar,
          color: "text-orange-600 bg-orange-50"
        });
      });
    }

    return acts.slice(0, 5); // Slice latest 5 events
  }, [properties, customRequirements, siteVisits]);

  // Top performing advisors computed based on real siteVisits & properties metrics
  const topAgents = useMemo(() => {
    return agents.map((agent) => {
      const agentVisits = siteVisits ? siteVisits.filter(v => v.agent === agent.name).length : 0;
      const agentClosures = siteVisits ? siteVisits.filter(v => v.agent === agent.name && v.status === 'Completed').length : 0;
      const managedProperties = properties.filter(p => p.agent?.name === agent.name);
      const agentRevenue = managedProperties.reduce((sum, p) => sum + p.price, 0);
      const formattedRevenue = agentRevenue >= 10000000
        ? `₹ ${(agentRevenue / 10000000).toFixed(1)} Cr`
        : `₹ ${(agentRevenue / 100000).toFixed(0)} L`;

      return {
        name: agent.name,
        revenue: formattedRevenue,
        visits: agentVisits,
        closures: agentClosures,
        avatar: agent.avatar
      };
    }).sort((a,b) => b.closures - a.closures || b.visits - a.visits).slice(0, 5);
  }, [agents, siteVisits, properties]);

  return (
    <div className="space-y-6 text-left" id="saas-dashboard-overview">
      
      {/* Greetings Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Good Morning, Admin! 👋</h1>
          <p className="text-xs text-slate-500 mt-1">Here's what's happening with your real estate business today.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Calendar selector */}
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-2 shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>May 21, 2026</span>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          // Draw path for SVG mini chart
          const width = 100;
          const height = 30;
          const maxVal = Math.max(...kpi.points);
          const minVal = Math.min(...kpi.points);
          const range = maxVal - minVal || 1;
          const pointsStr = kpi.points.map((p, i) => {
            const x = (i / (kpi.points.length - 1)) * width;
            const y = height - ((p - minVal) / range) * (height - 4) - 2;
            return `${x},${y}`;
          }).join(' ');

          const handleKpiClick = () => {
            if (!onNavigate) return;
            if (kpi.id === 'rev') onNavigate('Finance', 'Ledger');
            if (kpi.id === 'leads') onNavigate('Lead Management');
            if (kpi.id === 'visits') onNavigate('Site Visits', 'Completed');
            if (kpi.id === 'bookings') onNavigate('Site Visits', 'Completed'); // Realized closures are shown as completed site tours & sales
            if (kpi.id === 'conversion') onNavigate('Reports & Analytics');
          };

          return (
            <div 
              key={kpi.id} 
              onClick={handleKpiClick}
              title={`Click to view ${kpi.title} records`}
              className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-xs hover:shadow-md cursor-pointer hover:border-slate-350 hover:bg-slate-50/20 active:scale-98 transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">{kpi.title}</span>
                  <div className={`p-1.5 rounded-lg border ${kpi.color}`}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-bold text-slate-900 tracking-tight">{kpi.value}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">{kpi.change}</span>
                  <span className="text-[10px] text-slate-450 ml-0.5">vs LMonth</span>
                </div>
                
                {/* Micro SVG line tracer */}
                <div className="w-16 h-8 opacity-80">
                  <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                    <polyline
                      fill="none"
                      stroke={kpi.chartColor}
                      strokeWidth="1.5"
                      points={pointsStr}
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* REVENUE OVERVIEW & LEAD PIPELINE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Large Business Performance Chart */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Revenue Overview & Trend Index
              </h3>
              <p className="text-[11px] text-slate-400">Track dynamic revenues and matching operations (Click points for details)</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
                {(['This Month', 'Quarterly', 'Last Year', 'Weekly'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAnalyticsFilter(mode)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                      analyticsFilter === mode ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 bg-slate-50/70 border border-slate-150 rounded-xl text-[10px] font-sans">
            <div className="flex flex-col">
              <span className="font-bold text-slate-500 uppercase tracking-wide">Development Type</span>
              <select 
                value={chartPropType} 
                onChange={(e) => { setChartPropType(e.target.value); setSelectedPointDetails(null); }}
                className="bg-white border border-slate-250 rounded-lg px-2 py-1 mt-1 text-slate-700 cursor-pointer font-medium"
              >
                <option value="All">All Classifications</option>
                <option value="PG">Shared PG Demand</option>
                <option value="Apartment">Modern Apartment</option>
                <option value="Villa">Luxury Villa</option>
                <option value="Plot">Plot Layout</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <span className="font-bold text-slate-500 uppercase tracking-wide">Target Zone</span>
              <select 
                value={chartLocation} 
                onChange={(e) => { setChartLocation(e.target.value); setSelectedPointDetails(null); }}
                className="bg-white border border-slate-250 rounded-lg px-2 py-1 mt-1 text-slate-700 cursor-pointer font-medium"
              >
                <option value="All">All Locations</option>
                <option value="JP Nagar">JP Nagar Hub</option>
                <option value="Hebbal">Hebbal belt</option>
                <option value="Indiranagar">Indiranagar Complex</option>
                <option value="Whitefield">Whitefield IT Corridor</option>
              </select>
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-slate-500 uppercase tracking-wide">Assigned Advisor</span>
              <select 
                value={chartAgent} 
                onChange={(e) => { setChartAgent(e.target.value); setSelectedPointDetails(null); }}
                className="bg-white border border-slate-250 rounded-lg px-2 py-1 mt-1 text-slate-700 cursor-pointer font-medium"
              >
                <option value="All">All Agents</option>
                {agents.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button 
                onClick={() => {
                  const headers = 'Period,Revenue Index,Registered Leads,Site Walks\n';
                  const rows = chartData.months.map((m, i) => {
                    return `${m},₹ ${chartData.revenue[i]} L,${chartData.leads[i]},${chartData.visits[i]}`;
                  }).join('\n');
                  
                  const blob = new Blob([headers + rows], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Brokerage_Revenue_Overview_Report_${analyticsFilter}.csv`;
                  a.click();
                }}
                className="w-full flex items-center justify-center gap-1 bg-white hover:bg-slate-100 border border-slate-250 py-1 rounded-lg font-bold text-slate-700 transition mt-auto cursor-pointer leading-relaxed text-[11px]"
              >
                Export Index (Excel)
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-sans">
              ₹ {(chartData.revenue.reduce((a, b) => a + b, 0) / 10).toFixed(1)} L 
              <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 font-semibold px-2 py-0.5 rounded-full ml-2">
                ▲ 18.4% Average Growth
              </span>
            </div>

            {/* Click node details card overlay */}
            <AnimatePresence>
              {selectedPointDetails && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="bg-blue-50 border border-blue-200 text-slate-800 p-3 rounded-xl flex items-center justify-between gap-4 max-w-sm shadow-sm"
                >
                  <div className="space-y-0.5 text-left text-xs font-sans">
                    <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wide">
                      Analytics Node: {selectedPointDetails.period}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-[10px] mt-1 font-mono">
                      <div>
                        <span className="text-slate-500 block">Est Rev</span>
                        <span className="font-extrabold text-blue-900 text-xs">₹ {selectedPointDetails.revenue} L</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Leads In</span>
                        <span className="font-extrabold text-blue-900 text-xs">{selectedPointDetails.leads}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Visits Done</span>
                        <span className="font-extrabold text-blue-900 text-xs">{selectedPointDetails.visits}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedPointDetails(null)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer self-start"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="h-56 mt-4 relative">
            <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="curve-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purple-curve-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#E2E8F0" strokeDasharray="1 1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#CBD5E1" strokeWidth="1" />

              {/* Draw Custom Multi Lines */}
              {(() => {
                const totalPoints = chartData.revenue.length;
                const pathRevArr: string[] = [];
                const pathLeadArr: string[] = [];
                
                chartData.revenue.forEach((rv, i) => {
                  const x = (i / (totalPoints - 1)) * 500;
                  const y = 150 - (rv / 120) * 120; // Bound safely bounds
                  pathRevArr.push(`${x},${y}`);
                });

                chartData.leads.forEach((ld, i) => {
                  const x = (i / (totalPoints - 1)) * 500;
                  const y = 150 - (ld / 200) * 110;
                  pathLeadArr.push(`${x},${y}`);
                });

                const pathRevStr = pathRevArr.join(' ');
                const pathLeadStr = pathLeadArr.join(' ');

                return (
                  <>
                    <path
                      d={`M0,150 L${pathRevStr} L500,150 Z`}
                      fill="url(#curve-grad)"
                    />
                    <polyline
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      points={pathRevStr}
                    />

                    <path
                      d={`M0,150 L${pathLeadStr} L500,150 Z`}
                      fill="url(#purple-curve-grad)"
                    />
                    <polyline
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      points={pathLeadStr}
                    />

                    {/* Nodes detailing points - All dots are clickable! */}
                    {chartData.revenue.map((rv, idx) => {
                      const x = (idx / (totalPoints - 1)) * 500;
                      const y = 150 - (rv / 120) * 120;
                      const isHighlighted = idx === 4 || idx === totalPoints - 1 || idx === 1;
                      return (
                        <g key={idx} className="group/dot cursor-pointer" onClick={() => {
                          setSelectedPointDetails({
                            period: chartData.months[idx],
                            revenue: rv,
                            leads: chartData.leads[idx],
                            visits: chartData.visits[idx],
                          });
                        }}>
                          <circle 
                            cx={x} 
                            cy={y} 
                            r={isHighlighted ? "4" : "3"} 
                            fill={isHighlighted ? "#FFFFFF" : "#2563EB"} 
                            stroke="#2563EB" 
                            strokeWidth="2" 
                            className="group-hover/dot:r-7 group-hover/dot:fill-orange-500 transition-all duration-100" 
                          />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
            
            {/* Legend guide indicators */}
            <div className="absolute right-2 bottom-0 flex items-center gap-4 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-blue-600 block rounded" />
                Revenue Index Value
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-purple-500 block rounded dashed" />
                Registrations Index volume
              </span>
            </div>
          </div>

          <div className={`grid mt-3 text-center border-t border-slate-100 pt-2.5`} style={{ gridTemplateColumns: `repeat(${chartData.months.length}, minmax(0, 1fr))` }}>
            {chartData.months.map((m, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400 font-mono text-center">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Lead Pipeline Kanban Widget */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Lead Pipeline</h3>
                <p className="text-[11px] text-slate-400">Workflow transitions across CRM funnels</p>
              </div>
              <button 
                onClick={() => onOpenQuickAction('add_lead')}
                className="p-1 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                title="Add lead to pipeline"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Stages Columns Horizontal mini-list */}
            <div className="space-y-3.5 max-h-76 overflow-y-auto pr-1">
              {PipelineStages.map((stg) => {
                const stageCards = pipelineCards.filter(c => c.stage === stg.key);
                return (
                  <div key={stg.key} className="p-3 border border-slate-250 bg-slate-50/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stg.color}`}>
                        {stg.title} ({stageCards.length || stg.count})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {stageCards.map((c) => (
                        <div key={c.id} className="bg-white border border-slate-150 p-2.5 rounded-lg flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2">
                            <div className="text-slate-600 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                              {c.avatar}
                            </div>
                            <div>
                              <span className="font-semibold text-xs text-slate-900 block leading-tight">{c.name}</span>
                              <span className="text-[10px] text-slate-450">{c.location} • <strong className="text-blue-600">{c.budget}</strong></span>
                            </div>
                          </div>
                          
                          <div className="text-xs">
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded">
                              Level {stg.key === 'New' ? 1 : stg.key === 'Researching' ? 2 : 3}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button 
              onClick={() => onOpenQuickAction('view_requirements')}
              className="text-xs text-blue-600 font-semibold flex items-center justify-center gap-1 mx-auto hover:underline cursor-pointer"
            >
              Configure Board Levels <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>

      {/* ACTIVITY FEED & AGENT LEADERBOARD ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Activity Feed Section */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Activities</h3>
              <p className="text-[11px] text-slate-400">Live timelines from agents and campaigns</p>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Real-time
            </span>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 items-start">
                <div className={`p-2 rounded-xl border ${act.color} shrink-0`}>
                  <act.icon className="h-4 w-4" />
                </div>
                <div className="space-y-1 py-0.5">
                  <p className="text-xs font-semibold text-slate-800">{act.text}</p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{act.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Card Section */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Top Performing Advisors</h3>
              <p className="text-[11px] text-slate-400">Ranks based on aggregate brokerage closures</p>
            </div>
            <Award className="h-5 w-5 text-amber-500 fill-amber-50" />
          </div>

          <div className="space-y-3.5">
            {topAgents.map((ag, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 border border-slate-100 hover:border-slate-250 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black font-mono">
                    {i+1}
                  </div>
                  <img
                    src={ag.avatar}
                    alt={ag.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block leading-tight">{ag.name}</span>
                    <span className="text-[10px] text-slate-450">{ag.visits} Site Visits Completed</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-600 font-mono block leading-tight">{ag.revenue}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">{ag.closures} Closed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* UPCOMING SITE VISITS & DEDICATED ANALYTICAL WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Target Site Visits Calendar Widget */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upcoming Site Visits Calendar</h3>
              <p className="text-[11px] text-slate-400">Scheduled client coordinates and properties verification</p>
            </div>
            <Filter className="h-4 w-4 text-slate-400 cursor-pointer" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {upcomingVisits.map((v) => (
              <div key={v.id} className="p-3 bg-slate-50/50 border border-slate-150 rounded-xl flex gap-2.5 items-start">
                <img
                  src={v.image}
                  alt={v.project}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-0.5 overflow-hidden">
                  <span className="font-semibold text-xs text-slate-900 block truncate leading-tight">{v.project}</span>
                  <span className="text-[10px] font-mono text-emerald-600 block leading-none font-bold">{v.time}</span>
                  <span className="text-[9px] text-slate-500 block leading-tight">Expert: {v.agent}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-medium text-slate-500">
              * Automated SMS updates dispatched to dynamic agents
            </span>
            <button 
              onClick={() => onOpenQuickAction('schedule_visit')}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Book Site Walkthrough
            </button>
          </div>
        </div>

        {/* Circular Analytical Widgets */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Lead Source & Inventory Share</h3>
              <p className="text-[11px] text-slate-400">Campaign acquisitions and property classification statuses</p>
            </div>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Donut Chart: Lead Sources */}
            <div className="p-3 border border-slate-100 rounded-xl flex flex-col items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider self-start mb-2">Lead Sources %</span>
              <div className="relative w-24 h-24 my-2 flex items-center justify-center">
                
                {/* SVG circular progress */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
                  
                  {/* Website (42%) */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563EB" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset="100.2" className="transition-all duration-500" />
                  
                  {/* Facebook (24%) */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset="157.5" className="transition-all duration-500" />

                  {/* Google Ads (18%) */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset="200.5" className="transition-all duration-500" />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono pointer-events-none">
                  <span className="text-sm font-bold text-slate-800">1.2k</span>
                  <span className="text-[7px] text-slate-450 uppercase font-black">Entries</span>
                </div>
              </div>

              <div className="w-full text-[9px] font-mono grid grid-cols-2 gap-x-1.5 gap-y-1 pt-1.5 border-t border-slate-100 mt-1">
                <span className="text-blue-600 truncate">● Web: 42%</span>
                <span className="text-purple-600 truncate">● Meta: 24%</span>
                <span className="text-amber-600 truncate">● GAds: 18%</span>
                <span className="text-slate-400 truncate">● Ref: 10%</span>
              </div>
            </div>

            {/* Inventory Classification Doughnut */}
            <div className="p-3 border border-slate-100 rounded-xl flex flex-col items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider self-start mb-2">Inventory Statuses</span>
              
              <div className="relative w-24 h-24 my-2 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
                  
                  {/* Available (45%) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="251.3" strokeDashoffset="113.1" className="transition-all duration-500" />
                  
                  {/* Booked (35%) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563EB" strokeWidth="6" strokeDasharray="251.3" strokeDashoffset="201.0" className="transition-all duration-500" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono pointer-events-none">
                  <span className="text-sm font-bold text-slate-800">1248</span>
                  <span className="text-[7px] text-slate-450 uppercase font-black">Units</span>
                </div>
              </div>

              <div className="w-full text-[9px] font-mono grid grid-cols-2 gap-x-1.5 gap-y-1 pt-1.5 border-t border-slate-100 mt-1">
                <span className="text-emerald-600 truncate">● Avail: 45%</span>
                <span className="text-blue-600 truncate">● Booked: 35%</span>
                <span className="text-amber-600 truncate">● Hold: 10%</span>
                <span className="text-rose-500 truncate">● Sold: 10%</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
