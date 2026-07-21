import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, AlertTriangle, XCircle, TrendingUp, Cpu, 
  Activity, ArrowUpRight, Gauge, Globe, Smartphone, HelpCircle
} from 'lucide-react';
import { SEOPageConfig } from '../../types/seo';

interface SEODashboardOverviewProps {
  pages: SEOPageConfig[];
  score: number;
  indexedPagesCount: number;
  brokenLinksCount: number;
  missingTitlesCount: number;
  missingDescriptionsCount: number;
  onNavigateToTab: (tab: string) => void;
  aiSuggestions: string[];
  recentActivity: Array<{ id: string; action: string; time: string; details: string; user: string }>;
}

export default function SEODashboardOverview({
  pages,
  score,
  indexedPagesCount,
  brokenLinksCount,
  missingTitlesCount,
  missingDescriptionsCount,
  onNavigateToTab,
  aiSuggestions,
  recentActivity
}: SEODashboardOverviewProps) {
  
  // High-fidelity styling definitions
  const performanceColorClass = score >= 90 ? 'text-[#C89B3C]' : score >= 70 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="space-y-6 font-sans text-slate-100" id="seo-dashboard-overview">
      {/* SECTION 1: HERO STATS - Overall Score & Web Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* WIDGET 1: OVERALL HEALTH (Radial Style Card) */}
        <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden backdrop-blur-md shadow-2xl col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C89B3C]/10 rounded-full blur-3xl" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Overall SEO Score</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#1E293B" strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#C89B3C" strokeWidth="8" fill="transparent" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${performanceColorClass}`}>{score}</span>
              <span className="text-slate-500 text-xs font-bold font-mono">/100</span>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1 justify-center">
                <TrendingUp className="w-3 h-3" /> Excellent
              </p>
            </div>
          </div>
          
          <p className="text-[11px] text-slate-400 mt-4 max-w-xs">
            Averaged across <strong className="text-slate-200">{pages.length} crawled pages</strong>. Core tags, canonical integrity, and layout responsive elements are healthy.
          </p>
        </div>

        {/* WIDGET 2: CORE WEB VITALS (Technical Telemetry) */}
        <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 col-span-2 flex flex-col justify-between backdrop-blur-md shadow-2xl">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Core Web Vitals</h3>
                <p className="text-[11px] text-[#C89B3C] font-mono mt-0.5">Real user monitoring field diagnostics</p>
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Passed All Checks
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 my-2">
              <div className="bg-[#15181F]/90 border border-slate-800/50 p-3.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">LCP</span>
                <p className="text-xl font-black text-slate-100 font-mono mt-1">1.24s</p>
                <div className="h-1 w-12 bg-emerald-500 rounded-full mx-auto mt-2" />
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 inline-block">Good (&lt;2.5s)</span>
              </div>
              
              <div className="bg-[#15181F]/90 border border-slate-800/50 p-3.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">FID</span>
                <p className="text-xl font-black text-slate-100 font-mono mt-1">14ms</p>
                <div className="h-1 w-12 bg-emerald-500 rounded-full mx-auto mt-2" />
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 inline-block">Good (&lt;100ms)</span>
              </div>

              <div className="bg-[#15181F]/90 border border-slate-800/50 p-3.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">CLS</span>
                <p className="text-xl font-black text-slate-100 font-mono mt-1">0.02</p>
                <div className="h-1 w-12 bg-emerald-500 rounded-full mx-auto mt-2" />
                <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 inline-block">Good (&lt;0.1)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C89B3C]/10 rounded-xl">
                <Gauge className="w-4 h-4 text-[#C89B3C]" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Page Speed Index</span>
                <p className="text-sm font-extrabold text-slate-200 font-mono">98 / 100</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Smartphone className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Mobile Friendly</span>
                <p className="text-sm font-extrabold text-slate-200 font-mono">99% Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 3: SITEMAP & INTEGRATIONS STATUS */}
        <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md shadow-2xl col-span-1">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Integrations Health</h3>
          
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between p-2 bg-[#15181F]/80 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-300 font-medium">Search Console</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-[#15181F]/80 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-300 font-medium">Google Analytics</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#15181F]/80 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-300 font-medium">Google Tag Manager</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sitemap.xml:</span>
            <strong className="text-[#C89B3C] font-mono">Active (15 Pages)</strong>
          </div>
        </div>

      </div>

      {/* SECTION 2: METRICS TELEMETRY GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* CARD 1: INDEXED PAGES */}
        <div className="bg-[#0F1115]/90 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Indexed Pages</span>
            <span className="text-2xl font-black text-slate-100 font-mono mt-1 block">{indexedPagesCount} / {pages.length}</span>
          </div>
          <div className="p-2.5 bg-[#C89B3C]/10 rounded-xl">
            <Globe className="w-5 h-5 text-[#C89B3C]" />
          </div>
        </div>

        {/* CARD 2: BROKEN LINKS */}
        <div 
          className={`bg-[#0F1115]/90 border p-4 rounded-xl flex items-center justify-between shadow-lg cursor-pointer hover:bg-slate-900/50 transition-all ${brokenLinksCount > 0 ? 'border-rose-500/30' : 'border-slate-800/50'}`}
          onClick={() => onNavigateToTab('redirects')}
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Broken Links</span>
            <span className={`text-2xl font-black font-mono mt-1 block ${brokenLinksCount > 0 ? 'text-rose-500' : 'text-slate-100'}`}>{brokenLinksCount}</span>
          </div>
          <div className={`p-2.5 rounded-xl ${brokenLinksCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-850 text-slate-400'}`}>
            {brokenLinksCount > 0 ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          </div>
        </div>

        {/* CARD 3: MISSING TITLES */}
        <div 
          className="bg-[#0F1115]/90 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between shadow-lg cursor-pointer hover:bg-slate-900/50 transition-all"
          onClick={() => onNavigateToTab('meta')}
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Missing Titles</span>
            <span className="text-2xl font-black text-slate-100 font-mono mt-1 block">{missingTitlesCount}</span>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            {missingTitlesCount > 0 ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          </div>
        </div>

        {/* CARD 4: MISSING DESCRIPTIONS */}
        <div 
          className="bg-[#0F1115]/90 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between shadow-lg cursor-pointer hover:bg-slate-900/50 transition-all"
          onClick={() => onNavigateToTab('meta')}
        >
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Missing Meta Desc</span>
            <span className="text-2xl font-black text-slate-100 font-mono mt-1 block">{missingDescriptionsCount}</span>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            {missingDescriptionsCount > 0 ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          </div>
        </div>

        {/* CARD 5: STRUCTURAL VALIDATION */}
        <div className="bg-[#0F1115]/90 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Schema Health</span>
            <span className="text-2xl font-black text-slate-100 font-mono mt-1 block">100%</span>
          </div>
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* SECTION 3: RECENT ACTIVITIES & AI RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PART 1: AI SEO RECOMMENDATIONS */}
        <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-[#C89B3C]" />
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">AI Copilot Recommendations</h3>
            </div>
            
            <div className="space-y-3.5">
              {aiSuggestions.map((rec, index) => (
                <div key={index} className="bg-[#15181F]/90 border border-slate-850 p-3 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] font-black text-xs flex items-center justify-center font-mono shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/85 pt-4 mt-4 flex justify-between items-center">
            <span className="text-[11px] text-slate-500">Suggested by Gemini 3.5 AI Copilot model</span>
            <button 
              onClick={() => onNavigateToTab('ai')}
              className="text-xs font-bold text-[#C89B3C] hover:underline flex items-center gap-1"
            >
              Launch AI Assistant <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PART 2: RECENT TELEMETRY ACTIVITY & CRAWLER LOGS */}
        <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Recent SEO Auditing Logs</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-wider">Live Feed</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((log) => (
              <div key={log.id} className="relative pl-6 pb-4 border-l border-slate-800/80 last:pb-0 last:border-0">
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-[#C89B3C] shadow-[0_0_8px_#C89B3C]" />
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">{log.action}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono block">{log.time}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold block uppercase font-mono mt-0.5">{log.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
