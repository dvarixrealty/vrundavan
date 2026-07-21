import React, { useState } from 'react';
import { 
  Play, Cpu, BarChart2, CheckCircle2, AlertTriangle, XCircle, TrendingUp,
  Download, FileText, Globe, RefreshCw, Layers, Check, Search, Info
} from 'lucide-react';
import { SEOPageConfig, SEOAuditItem } from '../../types/seo';

interface SEOAnalyzerAIReportsProps {
  pages: SEOPageConfig[];
  onTriggerAuditScan: () => void;
  auditItems: SEOAuditItem[];
  overallScore: number;
  onRunAIOptimize: (pageName: string) => Promise<{ title: string; desc: string; keywords: string; ogTitle: string; ogDesc: string }>;
  onExportReport: (type: 'CSV' | 'Excel' | 'PDF') => void;
}

export default function SEOAnalyzerAIReports({
  pages,
  onTriggerAuditScan,
  auditItems,
  overallScore,
  onRunAIOptimize,
  onExportReport
}: SEOAnalyzerAIReportsProps) {
  const [activeTab, setActiveTab] = useState<'scan' | 'google' | 'assistant' | 'reports'>('scan');
  
  // Auditing scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanPage, setScanPage] = useState<string>(pages[0]?.pageName || 'Home');

  // AI Assistant states
  const [aiSelectedPage, setAiSelectedPage] = useState<string>(pages[0]?.pageName || 'Home');
  const [aiIsOptimizing, setAiIsOptimizing] = useState(false);
  const [aiOptimizedData, setAiOptimizedData] = useState<any>(null);

  // Search Console Telemetry Mock Data
  const searchConsoleStats = {
    clicks: 14240,
    impressions: 210500,
    ctr: '6.76%',
    avgPosition: '14.2',
    indexed: 15,
  };

  const topKeywords = [
    { query: 'premium plots devanahalli', clicks: 1240, impressions: 8400, ctr: '14.7%', position: '2.4' },
    { query: 'luxury villas jp nagar', clicks: 840, impressions: 4800, ctr: '17.5%', position: '1.8' },
    { query: 'real estate investment bangalore', clicks: 650, impressions: 14200, ctr: '4.5%', position: '6.8' },
    { query: 'buy commercial plots karnataka', clicks: 420, impressions: 3100, ctr: '13.5%', position: '3.1' },
    { query: 'dvarix realty plots pricing', clicks: 390, impressions: 1100, ctr: '35.4%', position: '1.0' },
  ];

  const topPages = [
    { url: '/', clicks: 5400, impressions: 82000, ctr: '6.5%', position: '3.2' },
    { url: '/properties', clicks: 3900, impressions: 54000, ctr: '7.2%', position: '4.1' },
    { url: '/insights', clicks: 2100, impressions: 32000, ctr: '6.5%', position: '5.8' },
    { url: '/about', clicks: 1200, impressions: 19000, ctr: '6.3%', position: '4.5' },
    { url: '/contact', clicks: 940, impressions: 8500, ctr: '11.0%', position: '2.1' },
  ];

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      onTriggerAuditScan();
      setIsScanning(false);
    }, 1500);
  };

  const handleRunAIOptimize = async () => {
    setAiIsOptimizing(true);
    try {
      const data = await onRunAIOptimize(aiSelectedPage);
      setAiOptimizedData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiIsOptimizing(false);
    }
  };

  return (
    <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl font-sans text-slate-100" id="seo-analyzer-ai-reports">
      
      {/* LOCAL NAV TAB HEADINGS */}
      <div className="flex border-b border-slate-800/80 pb-4 mb-5 justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Audit Scanner, Analytics & Reports</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Perform real-time page checkups, run smart AI optimizations, and check GSC telemetry logs</p>
        </div>

        <div className="flex bg-[#15181F] p-1 rounded-xl border border-slate-800/60 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'scan' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Live Site Scan
          </button>
          <button 
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'assistant' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            AI Copilot Optimization
          </button>
          <button 
            onClick={() => setActiveTab('google')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'google' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Search Console Telemetry
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'reports' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Reports & Exports
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: SITE SEO VIRTUAL CHECK SCAN */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4 bg-[#13151A] p-4 rounded-xl border border-slate-850">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">Target Page:</span>
              <select 
                value={scanPage}
                onChange={(e) => setScanPage(e.target.value)}
                className="bg-[#15181F] border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[#C89B3C] font-semibold"
              >
                {pages.map(p => (
                  <option key={p.id} value={p.pageName}>{p.pageName}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleRunScan}
              disabled={isScanning}
              className="px-5 py-2 bg-gradient-to-r from-[#C89B3C] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} /> 
              {isScanning ? 'CHECKING CRITICAL META DOM NODES...' : 'TRIGGER REAL-TIME AUDIT SCAN'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AUDIT CHECKLIST METRICS LIST (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Page Structural Checklists ({auditItems.length})</h4>
              
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {auditItems.map(item => (
                  <div key={item.id} className="bg-[#13151A] border border-slate-850 p-3 rounded-xl flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {item.status === 'passed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : item.status === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-slate-200">{item.title}</span>
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{item.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RADIAL SCORE METRIC */}
            <div className="bg-[#13151A]/95 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between items-center text-center">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Page Audit Score</h4>
              
              <div className="my-6 relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1A1C21" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="#C89B3C" strokeWidth="8" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - overallScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tight">{overallScore}</span>
                  <span className="text-slate-500 text-xs font-mono">/100</span>
                </div>
              </div>

              <div className="w-full border-t border-slate-800/80 pt-4 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Passed Nodes:</span>
                  <strong className="text-emerald-400 font-mono">8 Checks</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Warnings Flags:</span>
                  <strong className="text-amber-500 font-mono">2 Warnings</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Critical Errors:</span>
                  <strong className="text-rose-500 font-mono">0 Failed</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW TAB 2: AI ASSISTANT MODEL GENERATOR */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4 bg-[#13151A] p-4 rounded-xl border border-slate-850">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-bold">Optimize Page Config:</span>
              <select 
                value={aiSelectedPage}
                onChange={(e) => {
                  setAiSelectedPage(e.target.value);
                  setAiOptimizedData(null);
                }}
                className="bg-[#15181F] border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none text-[#C89B3C] font-semibold"
              >
                {pages.map(p => (
                  <option key={p.id} value={p.pageName}>{p.pageName}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleRunAIOptimize}
              disabled={aiIsOptimizing}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              <Cpu className={`w-3.5 h-3.5 ${aiIsOptimizing ? 'animate-pulse' : ''}`} /> 
              {aiIsOptimizing ? 'AI MODEL GENERATING LABELS...' : 'ONE-CLICK AI OPTIMIZE'}
            </button>
          </div>

          {aiOptimizedData ? (
            <div className="bg-[#13151A] border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-[#C89B3C] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Suggestions Generated Successfully
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Powered by Gemini-3.5-Flash</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 bg-[#15181F] rounded-lg border border-slate-850">
                  <span className="text-slate-500 uppercase text-[9px] font-bold block mb-1">Generated Title</span>
                  <p className="text-slate-200">{aiOptimizedData.title}</p>
                </div>
                <div className="p-3 bg-[#15181F] rounded-lg border border-slate-850">
                  <span className="text-slate-500 uppercase text-[9px] font-bold block mb-1">Open Graph Title</span>
                  <p className="text-slate-200">{aiOptimizedData.ogTitle}</p>
                </div>
                <div className="col-span-2 p-3 bg-[#15181F] rounded-lg border border-slate-850">
                  <span className="text-slate-500 uppercase text-[9px] font-bold block mb-1">Generated Description</span>
                  <p className="text-slate-200 leading-relaxed">{aiOptimizedData.desc}</p>
                </div>
                <div className="col-span-2 p-3 bg-[#15181F] rounded-lg border border-slate-850">
                  <span className="text-slate-500 uppercase text-[9px] font-bold block mb-1">Generated Keywords</span>
                  <p className="text-[#C89B3C] font-mono">{aiOptimizedData.keywords}</p>
                </div>
              </div>
              
              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 text-slate-400 text-xs flex gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>These recommendations have been saved to your active edit slate. Click <strong>"Save & Deploy Configuration"</strong> inside the Meta Tag Manager tab to commit them to Firestore.</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#13151A]/60 border border-slate-850 p-12 rounded-xl text-center text-slate-500 text-xs flex flex-col justify-center items-center">
              <Cpu className="w-12 h-12 text-[#C89B3C]/10 mb-3" />
              <p className="font-bold text-slate-300">AI SEO Optimization Engine</p>
              <p className="mt-1">Click the "One-Click AI Optimize" button above to generate optimized, high-CTR meta tags automatically for this page.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 3: GOOGLE SEARCH CONSOLE TELEMETRY */}
      {activeTab === 'google' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* WIDGET 1 */}
            <div className="bg-[#13151A] border border-slate-850 p-4 rounded-xl shadow-lg text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Organic Clicks</span>
              <strong className="text-2xl font-black text-slate-100 font-mono block mt-1">{searchConsoleStats.clicks.toLocaleString()}</strong>
              <span className="text-[9px] text-emerald-500 font-bold uppercase mt-1 inline-block">▲ 12.4% MoM</span>
            </div>

            {/* WIDGET 2 */}
            <div className="bg-[#13151A] border border-slate-850 p-4 rounded-xl shadow-lg text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Impressions</span>
              <strong className="text-2xl font-black text-slate-100 font-mono block mt-1">{searchConsoleStats.impressions.toLocaleString()}</strong>
              <span className="text-[9px] text-emerald-500 font-bold uppercase mt-1 inline-block">▲ 8.1% MoM</span>
            </div>

            {/* WIDGET 3 */}
            <div className="bg-[#13151A] border border-slate-850 p-4 rounded-xl shadow-lg text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Avg CTR</span>
              <strong className="text-2xl font-black text-slate-100 font-mono block mt-1">{searchConsoleStats.ctr}</strong>
              <span className="text-[9px] text-emerald-500 font-bold uppercase mt-1 inline-block">▲ 0.4% MoM</span>
            </div>

            {/* WIDGET 4 */}
            <div className="bg-[#13151A] border border-slate-850 p-4 rounded-xl shadow-lg text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Avg Position</span>
              <strong className="text-2xl font-black text-slate-100 font-mono block mt-1">{searchConsoleStats.avgPosition}</strong>
              <span className="text-[9px] text-emerald-500 font-bold uppercase mt-1 inline-block">▼ 1.2 Pos MoM</span>
            </div>

            {/* WIDGET 5 */}
            <div className="bg-[#13151A] border border-slate-850 p-4 rounded-xl shadow-lg text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Indexed Routes</span>
              <strong className="text-2xl font-black text-slate-100 font-mono block mt-1">{searchConsoleStats.indexed} Pages</strong>
              <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 inline-block">100% Crawl rate</span>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TOP KEYWORDS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Top organic search queries</h4>
              <div className="bg-[#13151A] border border-slate-850 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#1A1D24] text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Search Query</th>
                      <th className="p-2.5">Clicks</th>
                      <th className="p-2.5">Impressions</th>
                      <th className="p-2.5">Avg Pos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {topKeywords.map((kw, i) => (
                      <tr key={i} className="hover:bg-slate-900/20">
                        <td className="p-2.5 font-mono text-slate-200">{kw.query}</td>
                        <td className="p-2.5 font-mono text-slate-400">{kw.clicks}</td>
                        <td className="p-2.5 font-mono text-slate-400">{kw.impressions}</td>
                        <td className="p-2.5 font-mono text-emerald-400 font-bold">{kw.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOP PAGES */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Top landed landing pages</h4>
              <div className="bg-[#13151A] border border-slate-850 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#1A1D24] text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Landing URL Route</th>
                      <th className="p-2.5">Clicks</th>
                      <th className="p-2.5">Impressions</th>
                      <th className="p-2.5">Avg Pos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {topPages.map((pg, i) => (
                      <tr key={i} className="hover:bg-slate-900/20">
                        <td className="p-2.5 font-mono text-indigo-400">{pg.url}</td>
                        <td className="p-2.5 font-mono text-slate-400">{pg.clicks}</td>
                        <td className="p-2.5 font-mono text-slate-400">{pg.impressions}</td>
                        <td className="p-2.5 font-mono text-[#C89B3C] font-bold">{pg.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW TAB 4: REPORTS & CSV EXPORTS */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* DAILY CARD */}
          <div className="bg-[#13151A] border border-slate-850 p-5 rounded-xl flex flex-col justify-between h-52">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-widest">Daily Executive Digests</span>
              <h4 className="text-xs font-bold text-slate-200 mt-2">Crawls & Index Checks</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Summarizes 404 crawler hits, redirects triggered, and basic sitemap synchronization reports.</p>
            </div>
            <button 
              onClick={() => onExportReport('CSV')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-[#C89B3C]" /> Export Daily CSV
            </button>
          </div>

          {/* WEEKLY CARD */}
          <div className="bg-[#13151A] border border-slate-850 p-5 rounded-xl flex flex-col justify-between h-52">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-widest">Weekly Growth Reports</span>
              <h4 className="text-xs font-bold text-slate-200 mt-2">Organic Telemetry Analysis</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Aggregates search console CTR performance, organic query jumps, and SEO health checklists.</p>
            </div>
            <button 
              onClick={() => onExportReport('Excel')}
              className="w-full py-2 bg-[#C89B3C] hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" /> Export Weekly Excel
            </button>
          </div>

          {/* MONTHLY CARD */}
          <div className="bg-[#13151A] border border-slate-850 p-5 rounded-xl flex flex-col justify-between h-52">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-widest">Monthly Core Vitals Dossier</span>
              <h4 className="text-xs font-bold text-slate-200 mt-2">SEO Score Overviews</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">High-level executive presentation illustrating search CTR curves and technical speed gains.</p>
            </div>
            <button 
              onClick={() => onExportReport('PDF')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" /> Export Monthly PDF
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
