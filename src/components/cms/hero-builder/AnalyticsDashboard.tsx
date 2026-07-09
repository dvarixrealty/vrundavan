import React from 'react';
import { Eye, MousePointerClick, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { HeroBanner } from '../../../types';

interface AnalyticsDashboardProps {
  banners: HeroBanner[];
}

export default function AnalyticsDashboard({ banners = [] }: AnalyticsDashboardProps) {
  const totalViews = banners.reduce((acc, b) => acc + (Number(b.views) || 0), 0);
  const totalClicks = banners.reduce((acc, b) => acc + (Number(b.clicks) || 0), 0);
  const averageCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  // Find top banner
  const mostViewed = [...banners].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))[0];
  const mostClicked = [...banners].sort((a, b) => (Number(b.clicks) || 0) - (Number(a.clicks) || 0))[0];

  return (
    <div className="space-y-6" id="hero-analytics-dashboard">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <BarChart3 className="w-5 h-5 text-[#10B981]" />
        <h3 className="font-serif text-lg font-bold text-slate-800">Banner Performance & Analytics</h3>
      </div>

      {/* Grid Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-lg">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Views</p>
            <p className="text-2xl font-black text-slate-800">{totalViews.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500 text-white rounded-lg">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Clicks</p>
            <p className="text-2xl font-black text-slate-800">{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500 text-white rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average CTR</p>
            <p className="text-2xl font-black text-slate-800">{averageCTR}%</p>
          </div>
        </div>

        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Best CTR</p>
            <p className="text-sm font-black text-slate-800 truncate max-w-[140px]" title={mostClicked?.bannerName || mostClicked?.headline || 'N/A'}>
              {mostClicked?.bannerName || mostClicked?.headline || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats list of individual banners */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-widest font-mono font-bold">
              <th className="p-4">Banner Identifier</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Views</th>
              <th className="p-4 text-center">Clicks</th>
              <th className="p-4 text-center">CTR</th>
              <th className="p-4 text-right">Performance Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {banners.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">No banner analytics logs recorded yet.</td>
              </tr>
            ) : (
              banners.map((b) => {
                const bViews = Number(b.views) || 0;
                const bClicks = Number(b.clicks) || 0;
                const bCTR = bViews > 0 ? ((bClicks / bViews) * 100).toFixed(1) : '0.0';
                const ctrPercent = Math.min(100, bViews > 0 ? (bClicks / bViews) * 100 : 0);

                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-800">
                      <div className="leading-tight">
                        <p className="font-serif text-sm text-slate-900">{b.bannerName || 'Untitled Banner'}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-normal">{b.id} | Mode: {b.displayMode || 'Mode2'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        b.status === 'active' || b.status === 'Published' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {b.status || 'draft'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-800">{bViews.toLocaleString()}</td>
                    <td className="p-4 text-center font-bold text-slate-850">{bClicks.toLocaleString()}</td>
                    <td className="p-4 text-center font-black text-[#10B981]">{bCTR}%</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${ctrPercent}%` }} className="bg-[#10B981] h-1.5 rounded-full" />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">CTR</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
