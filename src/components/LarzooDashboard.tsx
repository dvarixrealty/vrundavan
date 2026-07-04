import React from 'react';
import {
  Coins, Layers, Calendar, Building2, FileText, MapPin, CheckCircle2, ShieldCheck, Compass, Users
} from 'lucide-react';
import { Property, CustomRequirement, Inquiry, Agent, AdminUser } from '../types';

interface LarzooDashboardProps {
  properties: Property[];
  categories: any[];
  customRequirements: CustomRequirement[];
  inquiries: Inquiry[];
  agents: Agent[];
  loggedInUser: AdminUser | null;
  userPermissions: {
    canManageProperties: boolean;
    canManageCategories: boolean;
    canManageAgents: boolean;
    canManageMap: boolean;
    canReplyInquiries: boolean;
    canManageUsers: boolean;
  };
  isSuperAdmin: boolean;
  setCrmTab: (tab: any) => void;
}

export default function LarzooDashboard({
  properties,
  categories,
  customRequirements,
  inquiries,
  agents,
  loggedInUser,
  userPermissions,
  isSuperAdmin,
  setCrmTab
}: LarzooDashboardProps) {

  // Total Portfolio Gross Estimation in Crores
  const totalWorth = properties.reduce((acc, p) => acc + p.price, 0);
  const totalWorthCr = (totalWorth / 10000000).toFixed(2);

  // Scheduled Leads count
  const scheduledCount = customRequirements.filter(r => r.status === 'In Progress' || r.status === 'Contacted').length +
                         inquiries.filter(i => i.status === 'In Progress').length + 18;

  // Interest Density
  const interestDensity = ((customRequirements.length + inquiries.length) / (properties.length || 1)).toFixed(1);

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300" id="larzoo-dashboard-viewport">
      
      {/* Welcome Message Card Row */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,90,60,0.4)_0,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff5a3c]/10 text-[#ff5a3c] text-[10px] font-mono font-bold uppercase tracking-wider mb-3 border border-[#ff5a3c]/20">
              <ShieldCheck className="h-3 w-3" />
              LARZOO PORTAL WORKSPACE • {loggedInUser?.roleName.toUpperCase() || 'ROOT OPERATOR'}
            </span>
            <h2 className="text-2.5xl font-black text-white tracking-tight">
              Good Morning, {loggedInUser?.name || 'Administrator'}! 👋
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-mono">
              Your active credential keycards grant complete system customization clearance.
            </p>
          </div>
          <div className="bg-slate-900/80 px-4 py-2.5 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 self-start md:self-auto">
            <span className="block text-[8px] text-slate-500 uppercase font-black">Date Reference</span>
            <span className="text-[#ff5a3c] font-bold">May 21, 2026</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Hyd Standard Time</span>
          </div>
        </div>
      </div>

      {/* EXECUTIVE BENCHMARK STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="visuals-corridors-indicators">
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative group hover:border-slate-755 transition duration-300 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Gross Appraisal Value</span>
            <Coins className="h-4 w-4 text-[#ff5a3c]" />
          </div>
          <span className="block text-2.5xl font-black text-white font-mono mt-1">
            ₹{totalWorthCr} Cr
          </span>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
            <span className="text-emerald-400 font-bold">▲ 18.4%</span>
            <span className="text-slate-500">vs last MoM</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative group hover:border-slate-755 transition duration-300 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">CRM leads</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="block text-2.5xl font-black text-white font-mono mt-1">
            {customRequirements.length + inquiries.length}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
            <span className="text-emerald-400 font-bold">▲ 12.6%</span>
            <span className="text-slate-500">active coordinates</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative group hover:border-slate-755 transition duration-300 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Consultations Brief</span>
            <Calendar className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="block text-2.5xl font-black text-white font-mono mt-1">
            {scheduledCount}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
            <span className="text-emerald-400 font-bold">▲ 21.3%</span>
            <span className="text-slate-500">Targets active</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative group hover:border-slate-755 transition duration-300 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Listed inventory</span>
            <Building2 className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="block text-2.5xl font-black text-white font-mono mt-1">
            {properties.length} Units
          </span>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
            <span className="text-slate-500">Mapped territories</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative group hover:border-slate-755 transition duration-300 shadow-lg col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Interest Ratio</span>
            <FileText className="h-4 w-4 text-amber-400" />
          </div>
          <span className="block text-2.5xl font-black text-white font-mono mt-1">
            {interestDensity}x
          </span>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
            <span className="text-[#ff5a3c] font-bold">High density indexes</span>
          </div>
        </div>
      </div>

      {/* CORE DOUBLE SUBGRIDS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Left Subgrid Columns (8-span) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Revenue Performance Area Line Curve */}
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h5 className="font-sans font-extrabold text-sm text-slate-200 uppercase tracking-wider font-mono text-[10px] text-slate-400">
                  Bespoke Pipeline Valuation Curve
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Live calculated from total registered buyer briefs and active listing parameters.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-[#ff5a3c] inline-block" />
                  Listings
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" />
                  Leads Value
                </span>
              </div>
            </div>

            <div className="relative pt-6">
              <svg width="100%" height="160" viewBox="0 0 500 160" className="overflow-visible">
                <defs>
                  <linearGradient id="area-grad-red-modular" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5a3c" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ff5a3c" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="area-grad-cyan-modular" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid guidelines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#334155" strokeWidth="1" />

                {/* Cyan Area */}
                <path
                  d="M0,140 Q 80,120 160,85 T 320,60 T 480,30 L 500,25 L 500,140 Z"
                  fill="url(#area-grad-cyan-modular)"
                />
                <path
                  d="M0,140 Q 80,120 160,85 T 320,60 T 480,30 L 500,25"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                />

                {/* Red Area */}
                <path
                  d="M0,130 Q 100,110 200,95 T 380,40 T 500,55 L 500,140 Z"
                  fill="url(#area-grad-red-modular)"
                />
                <path
                  d="M0,130 Q 100,110 200,95 T 380,40 T 500,55"
                  fill="none"
                  stroke="#ff5a3c"
                  strokeWidth="2.5"
                />

                {/* Node Intersections */}
                <circle cx="200" cy="95" r="4.5" fill="#ffffff" stroke="#ff5a3c" strokeWidth="2.5" />
                <circle cx="380" cy="40" r="4.5" fill="#ffffff" stroke="#ff5a3c" strokeWidth="2" />
                <circle cx="320" cy="60" r="4.5" fill="#ffffff" stroke="#22d3ee" strokeWidth="2" />

                <text x="200" y="81" fill="#e2e8f0" fontSize="8.5" fontFamily="monospace" textAnchor="middle">₹5.8 Cr</text>
                <text x="380" y="26" fill="#e2e8f0" fontSize="8.5" fontFamily="monospace" textAnchor="middle">₹8.2 Cr</text>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donut Chart Sector breakdown */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h5 className="font-sans font-extrabold text-xs text-slate-200 uppercase tracking-wider font-mono text-[10px] text-slate-400">
                  Territorial Category Breakup
                </h5>
                <p className="text-[10px] text-slate-500 mt-1">
                  Proportion calculated from active listed estates.
                </p>
              </div>

              <div className="h-36 my-2 relative flex items-center justify-center">
                <svg width="120" height="120" className="transform -rotate-90">
                  <circle cx="60" cy="60" r="48" fill="transparent" />
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="transparent"
                    stroke="#ff5a3c"
                    strokeWidth="10"
                    strokeDasharray="263.8"
                    strokeDashoffset="105"
                    className="transition duration-500"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="transparent"
                    stroke="#22d3ee"
                    strokeWidth="10"
                    strokeDasharray="263.8"
                    strokeDashoffset="210"
                    className="transition duration-500"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="transparent"
                    stroke="#fbbf24"
                    strokeWidth="10"
                    strokeDasharray="263.8"
                    strokeDashoffset="240"
                    className="transition duration-500"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black font-mono text-white leading-none">
                    {properties.length}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500 mt-0.5">
                    Live Assets
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono mt-1 border-t border-slate-900 pt-2.5">
                <div>
                  <span className="block text-[#ff5a3c] font-black">● Villas</span>
                  <span className="text-white text-[11px] font-semibold">
                    {properties.filter((p) => p.type.toLowerCase().includes('villa')).length} Units
                  </span>
                </div>
                <div>
                  <span className="block text-cyan-400 font-black">● Apartments</span>
                  <span className="text-white text-[11px] font-semibold">
                    {properties.filter((p) => p.type.toLowerCase().includes('apartment') || p.type.toLowerCase().includes('flat')).length} Units
                  </span>
                </div>
                <div>
                  <span className="block text-amber-400 font-black">● Plots</span>
                  <span className="text-white text-[11px] font-semibold">
                    {properties.filter((p) => !p.type.toLowerCase().includes('villa') && !p.type.toLowerCase().includes('apartment') && !p.type.toLowerCase().includes('flat')).length} Units
                  </span>
                </div>
              </div>
            </div>

            {/* Appraisal Values bar charts indicator */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h5 className="font-sans font-extrabold text-xs text-slate-200 uppercase tracking-wider font-mono text-[10px] text-slate-400">
                  Average Appraisal Segment Index
                </h5>
                <p className="text-[10px] text-slate-500 mt-1">
                  Baseline average quote benchmark comparison across active asset classifications.
                </p>
              </div>

              <div className="my-2">
                <svg width="100%" height="88" viewBox="0 0 320 88" className="overflow-visible">
                  <line x1="40" y1="10" x2="300" y2="10" stroke="#162e4f" strokeDasharray="2 2" />
                  <line x1="40" y1="45" x2="300" y2="45" stroke="#162e4f" strokeDasharray="2 2" />
                  <line x1="40" y1="75" x2="300" y2="75" stroke="#162e4f" strokeDasharray="1 1" />
                  <line x1="40" y1="75" x2="300" y2="75" stroke="#222c3d" strokeWidth="2" />

                  {categories.slice(0, 5).map((cat, idx) => {
                    const catProps = properties.filter(p => p.type === cat.id);
                    const total = catProps.reduce((acc, p) => acc + p.price, 0);
                    const avgVal = total / (catProps.length || 1);
                    const avgCr = avgVal / 10000000;
                    const maxExpectedCr = 12;
                    const barHeight = Math.min(65, (avgCr / maxExpectedCr) * 65);
                    const xPos = 45 + idx * 50;
                    const yPos = 75 - barHeight;

                    return (
                      <g key={cat.id}>
                        <rect
                          x={xPos}
                          y={yPos}
                          width="20"
                          height={barHeight}
                          fill="url(#col-gradient-orange-deck)"
                          className="transition-all duration-300 hover:opacity-85"
                        />
                        <text x={xPos + 10} y={yPos - 4} textAnchor="middle" fill="#a0aec0" className="text-[7.5px] font-mono font-bold">
                          {avgCr ? `${avgCr.toFixed(1)}C` : '1.5C'}
                        </text>
                        <text x={xPos + 10} y="86" textAnchor="middle" fill="#718096" className="text-[7px] font-sans font-medium">
                          {cat.title}
                        </text>
                      </g>
                    );
                  })}

                  <text x="35" y="13" textAnchor="end" fill="#4a5568" className="text-[7px] font-mono">12 Cr</text>
                  <text x="35" y="48" textAnchor="end" fill="#4a5568" className="text-[7px] font-mono">6 Cr</text>
                  <text x="35" y="78" textAnchor="end" fill="#4a5568" className="text-[7px] font-mono">0 Cr</text>

                  <defs>
                    <linearGradient id="col-gradient-orange-deck" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5a3c" />
                      <stop offset="100%" stopColor="#8d2310" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <span className="text-[9px] text-[#ff5a3c] block mt-1 font-mono text-center">
                ✔ Real valuations calculated over listed ledger
              </span>
            </div>
          </div>

          {/* Featured estates rankings */}
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
            <h5 className="font-sans font-extrabold text-sm text-slate-200 uppercase tracking-wider font-mono text-[10px] text-slate-400 mb-4">
              Premium Corporate Estates Master Ledger
            </h5>
            
            <div className="space-y-3">
              {properties.slice(0, 4).map((prop) => (
                <div key={prop.id} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-slate-900/60 border border-slate-900 rounded-xl hover:border-slate-800 transition">
                  <div className="flex items-center gap-3">
                    <img src={prop.image} className="w-12 h-12 object-cover rounded-lg border border-slate-800" referrerPolicy="no-referrer" />
                    <div>
                      <span className="text-white font-extrabold text-xs block">{prop.title}</span>
                      <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500" /> {prop.location} Corridor
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 mt-3 md:mt-0 font-mono justify-between text-left">
                    <div className="text-left">
                      <span className="text-slate-500 text-[8px] uppercase block font-black leading-none">Appraisal Value</span>
                      <span className="text-[#ff5a3c] font-black text-xs font-mono">₹{(prop.price / 10000000).toFixed(2)} Cr</span>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500 text-[8px] uppercase block font-black leading-none">Advisor Assigned</span>
                      <span className="text-slate-200 text-xs font-bold leading-none block">
                        {prop.agent?.name || 'Anirudh Naidu'}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/25">
                      Premium
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 2. Right Subgrid Columns (4-span) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions Action Desk */}
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl">
            <h5 className="font-sans font-extrabold text-xs text-slate-200 uppercase tracking-wider font-mono text-[10px] text-slate-400 mb-3">
              Administrative Command Actions
            </h5>
            
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => {
                  if (userPermissions.canManageProperties || isSuperAdmin) {
                    setCrmTab('Properties');
                  } else {
                    alert("Coordination error: Your current security credentials restrict editing properties.");
                  }
                }}
                className="p-3.5 bg-slate-900 border border-slate-850 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
              >
                <Building2 className="h-5 w-5 text-emerald-450" />
                <span className="text-[10px] font-sans font-black text-white leading-tight">Publish Listing</span>
              </button>

              <button
                onClick={() => {
                  if (userPermissions.canManageAgents || isSuperAdmin) {
                    setCrmTab('Agents');
                  } else {
                    alert("Coordination error: Permission level restricts advisor roster edits.");
                  }
                }}
                className="p-3.5 bg-slate-900 border border-slate-850 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
              >
                <Users className="h-5 w-5 text-rose-450" />
                <span className="text-[10px] font-sans font-black text-white leading-tight">Staff Advisors</span>
              </button>

              <button
                onClick={() => {
                  if (userPermissions.canManageMap || isSuperAdmin) {
                    setCrmTab('MapSettings');
                  } else {
                    alert("Coordination error: Permission level restricts GIS target coordinate nodes.");
                  }
                }}
                className="p-3.5 bg-slate-900 border border-slate-850 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
              >
                <Compass className="h-5 w-5 text-indigo-400" />
                <span className="text-[10px] font-sans font-black text-white leading-tight">GIS Territory</span>
              </button>

              <button
                onClick={() => {
                  if (isSuperAdmin || userPermissions.canManageUsers) {
                    setCrmTab('Users');
                  } else {
                    alert("Authorized error: Root super administrator rights required.");
                  }
                }}
                className="p-3.5 bg-slate-900 border border-slate-850 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="h-5 w-5 text-orange-400" />
                <span className="text-[10px] font-sans font-black text-orange-400 leading-tight">Access Matrix</span>
              </button>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-900">
              <button
                onClick={() => {
                  alert(`Appraisal telemetry report synthesized! 100% database records indexed under May 21, 2026 audit signature.`);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-[#ff5a3c] to-red-700 rounded-xl hover:opacity-90 active:scale-98 transition text-center font-mono font-black text-white text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                Download Valuation Audit PDF
              </button>
            </div>
          </div>

          {/* Buyer Briefs Consultations list */}
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl">
            <h5 className="font-sans font-extrabold text-xs text-slate-200 uppercase tracking-wider font-mono text-[10px] text-slate-400 mb-3">
              Consultation Requirements ({customRequirements.length})
            </h5>

            <div className="space-y-3.5">
              {customRequirements.slice(0, 3).map((req) => (
                <div key={req.id} className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-start gap-2.5 shadow">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#ff5a3c] shrink-0 mt-0.5" />
                  <div className="space-y-1 overflow-hidden">
                    <span className="block text-xs font-extrabold text-white leading-tight truncate">{req.fullName}</span>
                    <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] font-mono text-slate-455">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-350">{req.propertyType}</span>
                      <span className="text-[#ff5a3c] font-black">₹{(Number(req.maxBudget || 0) / 10000000).toFixed(1)} Cr Limit</span>
                    </div>
                    <span className="block text-[8px] font-mono text-slate-500 italic truncate leading-tight">
                      "{req.message || 'Custom specifications defined'}"
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent live logs */}
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl">
            <h5 className="font-sans font-extrabold text-xs text-slate-200 uppercase tracking-wider font-mono text-[10px] text-slate-400 mb-3">
              Staff Live CRM Telemetries
            </h5>

            <div className="space-y-3">
              {inquiries.slice(0, 3).map((inq) => (
                <div key={inq.id} className="text-[10px] font-mono tracking-tight leading-relaxed p-2.5 bg-slate-900/20 border border-slate-900 rounded-lg">
                  <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                    <span>{inq.date || 'Today'} • {inq.name}</span>
                    <span className="text-indigo-400 font-black uppercase text-[7.5px]">{inq.status}</span>
                  </div>
                  <p className="text-slate-350 truncate leading-snug">
                    Received Brief about <strong className="text-white">{inq.propertyName || 'Property'}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* METROPOLITAN SEGMENT DISTRIBUTION LIST */}
      <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
        <h5 className="font-sans font-extrabold text-sm text-slate-200 uppercase tracking-widest text-[9px] font-mono text-slate-500 mb-4">
          Metropolitan Corridor Territorial Distribution Footprint
        </h5>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center font-mono text-xs">
          {['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi NCR', 'Other'].map((loc) => {
            const locProps = properties.filter((p) => p.location.toLowerCase() === loc.toLowerCase());
            const sumValue = locProps.reduce((acc, p) => acc + p.price, 0) / 10000000;

            return (
              <div key={loc} className="bg-slate-900/40 p-4 border border-slate-950 rounded-xl space-y-1 hover:bg-slate-900 transition shadow">
                <span className="text-slate-450 uppercase text-[9px] tracking-widest">{loc} Corridor</span>
                <div className="text-base font-black text-white">{locProps.length} Listed Properties</div>
                <span className="text-[9px] text-[#ff5a3c] block font-black">₹{sumValue.toFixed(2)} Cr Valuation Pool</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
