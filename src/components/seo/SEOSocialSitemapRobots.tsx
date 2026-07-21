import React, { useState } from 'react';
import { 
  FileText, Download, Upload, RefreshCw, Eye, CheckCircle2, 
  ChevronRight, Smartphone, Compass, Share2, Twitter, MessageSquare, Facebook
} from 'lucide-react';
import { SEOPageConfig } from '../../types/seo';

interface SEOSocialSitemapRobotsProps {
  pages: SEOPageConfig[];
  robotsTxt: string;
  onSaveRobotsTxt: (txt: string) => void;
  onRestoreDefaultRobots: () => void;
  sitemaps: Array<{ name: string; urlCount: number; lastGen: string; status: string }>;
  onRegenerateSitemaps: () => void;
}

export default function SEOSocialSitemapRobots({
  pages,
  robotsTxt,
  onSaveRobotsTxt,
  onRestoreDefaultRobots,
  sitemaps,
  onRegenerateSitemaps
}: SEOSocialSitemapRobotsProps) {
  const [activeTab, setActiveTab] = useState<'sitemaps' | 'robots' | 'social'>('sitemaps');
  
  // Robots text state
  const [tempRobots, setTempRobots] = useState(robotsTxt);
  
  // Social mock page selected
  const [socialSelectedPage, setSocialSelectedPage] = useState<SEOPageConfig>(pages[0] || {} as SEOPageConfig);
  
  // XML Previewing state
  const [previewingXml, setPreviewingXml] = useState<string | null>(null);

  const handleSaveRobots = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRobotsTxt(tempRobots);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateMockSitemapXml = (type: string) => {
    const dateStr = new Date().toISOString().split('T')[0];
    let items = '';
    if (type === 'sitemap.xml') {
      items = pages.map(p => `  <url>
    <loc>https://dvarixrealty.com${p.urlSlug}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.urlSlug === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n');
    } else if (type === 'property-sitemap.xml') {
      items = `  <url>
    <loc>https://dvarixrealty.com/property/crestwood-modernist-villa</loc>
    <lastmod>${dateStr}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://dvarixrealty.com/property/elevation-small-apartments</loc>
    <lastmod>${dateStr}</lastmod>
    <priority>0.9</priority>
  </url>`;
    } else {
      items = `  <url>
    <loc>https://dvarixrealty.com/insights/bangalore-real-estate-surge-2026</loc>
    <lastmod>${dateStr}</lastmod>
    <priority>0.7</priority>
  </url>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;
  };

  return (
    <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl font-sans text-slate-100" id="seo-social-sitemap-robots">
      
      {/* LOCAL NAV CONTROLS */}
      <div className="flex border-b border-slate-800/80 pb-4 mb-5 justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Crawl, Indexing & Social Center</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Control crawler permissions, sitemaps, and link rendering graphics</p>
        </div>

        <div className="flex bg-[#15181F] p-1 rounded-xl border border-slate-800/60 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('sitemaps')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'sitemaps' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            XML Sitemaps
          </button>
          <button 
            onClick={() => setActiveTab('robots')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'robots' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Robots.txt Visualizer
          </button>
          <button 
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'social' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Social Link Previews
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: SITEMAPS */}
      {activeTab === 'sitemaps' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-[#C89B3C] uppercase tracking-wider">Automated Multi-Sitemap Indexing</h4>
              <p className="text-xs text-slate-400 mt-0.5">Automatic delta regeneration on new properties or blog pages.</p>
            </div>
            <button 
              onClick={onRegenerateSitemaps}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition text-xs font-bold flex items-center gap-1.5 border border-slate-700/65"
            >
              <RefreshCw className="w-3.5 h-3.5" /> REGENERATE SITEMAPS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sitemaps.map((sm, idx) => (
              <div key={idx} className="bg-[#15181F]/80 border border-slate-850 p-4 rounded-xl flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-200 block truncate">{sm.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded uppercase font-mono">
                      {sm.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex justify-between text-xs font-mono">
                    <span className="text-slate-500">URLs Included:</span>
                    <strong className="text-[#C89B3C]">{sm.urlCount} Pages</strong>
                  </div>
                  
                  <div className="mt-1 flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Last Synced:</span>
                    <span className="text-slate-400">{sm.lastGen}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex gap-2 text-[10px] font-bold">
                  <button 
                    onClick={() => setPreviewingXml(generateMockSitemapXml(sm.name))}
                    className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3 h-3" /> View XML
                  </button>
                  <button 
                    onClick={() => handleDownloadFile(sm.name, generateMockSitemapXml(sm.name))}
                    className="py-1 px-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {previewingXml && (
            <div className="bg-[#0A0B0D] border border-slate-800 rounded-2xl p-4 shadow-inner">
              <div className="flex justify-between items-center mb-2 text-xs border-b border-slate-900 pb-2">
                <span className="text-[#C89B3C] font-mono font-bold uppercase text-[10px]">Sitemap XML Output Stream</span>
                <button 
                  onClick={() => setPreviewingXml(null)}
                  className="text-slate-500 hover:text-slate-300 text-[10px]"
                >
                  Clear Preview [X]
                </button>
              </div>
              <pre className="text-[10px] text-slate-400 font-mono overflow-x-auto p-2 leading-relaxed bg-[#111317] rounded-lg">
                {previewingXml}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 2: ROBOTS.TXT */}
      {activeTab === 'robots' && (
        <form onSubmit={handleSaveRobots} className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-[#C89B3C] uppercase tracking-wider">Live Robots.txt Editor</h4>
              <p className="text-xs text-slate-400 mt-0.5">Control search engine bot access, directories, and crawl parameters.</p>
            </div>
            
            <div className="flex gap-2 text-xs font-bold">
              <button 
                type="button"
                onClick={() => {
                  onRestoreDefaultRobots();
                  setTempRobots(`# Default robots.txt for Dvarix Realty\nUser-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://dvarixrealty.com/sitemap.xml`);
                }}
                className="px-3 py-1.5 bg-slate-850 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              >
                Restore Default
              </button>
              <button 
                type="button"
                onClick={() => handleDownloadFile('robots.txt', tempRobots)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">Visual Code Field</label>
              <textarea 
                rows={10}
                value={tempRobots}
                onChange={(e) => setTempRobots(e.target.value)}
                className="w-full bg-[#111317] border border-slate-800 rounded-xl p-4 text-xs font-mono text-[#C89B3C] focus:outline-none focus:border-[#C89B3C] leading-relaxed shadow-inner"
              />
            </div>

            <div className="bg-[#15181F]/90 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Robots.txt Best Practices</h4>
                <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">✔</span> Keep disallows minimal to avoid accidental index blockages.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">✔</span> Always list the absolute canonical Sitemap XML address.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C89B3C]">✔</span> Explicitly disallow system-sensitive endpoints like CRM paths, APIs or administrative corridors.
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button 
                  type="submit"
                  className="w-full py-2 bg-[#C89B3C] hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> COMMIT & SAVE ROBOTS.TXT
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* RENDER TAB 3: SOCIAL PREVIEWS */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h4 className="text-xs font-bold text-[#C89B3C] uppercase tracking-wider">Social Share Cards Emulator</h4>
              <p className="text-xs text-slate-400 mt-0.5">Visualize link share renders on Twitter, WhatsApp, or Facebook.</p>
            </div>

            <select 
              value={socialSelectedPage.id}
              onChange={(e) => {
                const found = pages.find(p => p.id === e.target.value);
                if (found) setSocialSelectedPage(found);
              }}
              className="bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] text-slate-200"
            >
              {pages.map(p => (
                <option key={p.id} value={p.id}>{p.pageName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* WHATSAPP / TELEGRAM PREVIEW (BALANCED LINK CARD) */}
            <div className="bg-[#0C121C] border border-indigo-900/30 p-5 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp / Telegram Preview Mockup</span>
              </div>

              <div className="bg-[#1E2E44]/35 border border-[#304B6D]/40 p-3.5 rounded-2xl flex flex-col gap-2 max-w-sm">
                <p className="text-[11px] text-[#47a0ff] font-mono hover:underline cursor-pointer truncate">
                  https://dvarixrealty.com{socialSelectedPage.urlSlug}
                </p>
                <div className="bg-[#1A2635] rounded-xl overflow-hidden border border-slate-850 flex">
                  {socialSelectedPage.ogImage && (
                    <img 
                      src={socialSelectedPage.ogImage} 
                      alt="" 
                      className="w-24 h-24 object-cover shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="p-3 flex flex-col justify-center">
                    <h5 className="text-[11px] font-bold text-slate-200 line-clamp-1">
                      {socialSelectedPage.ogTitle || socialSelectedPage.metaTitle}
                    </h5>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {socialSelectedPage.ogDescription || socialSelectedPage.metaDescription}
                    </p>
                    <span className="text-[8px] text-slate-500 font-mono mt-2 block uppercase font-bold">DvarixRealty.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TWITTER / X CARD PREVIEW (EXPANDED LARGE BLOCK CARD) */}
            <div className="bg-[#090B0D] border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>Twitter / X Large Image Card Preview</span>
              </div>

              <div className="bg-[#121316] border border-slate-800 rounded-2xl overflow-hidden max-w-sm flex flex-col shadow-inner">
                {socialSelectedPage.twitterImage && (
                  <img 
                    src={socialSelectedPage.twitterImage} 
                    alt="" 
                    className="w-full h-44 object-cover" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="p-4 border-t border-slate-850 bg-[#16181C]">
                  <span className="text-[10px] text-slate-500 font-mono font-semibold block uppercase">DvarixRealty.com</span>
                  <h5 className="text-xs font-bold text-slate-200 mt-1">
                    {socialSelectedPage.twitterTitle || socialSelectedPage.metaTitle}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {socialSelectedPage.twitterDescription || socialSelectedPage.metaDescription}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
