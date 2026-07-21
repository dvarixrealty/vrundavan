import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, HelpCircle, AlertTriangle, CheckCircle2, ChevronRight, 
  BarChart2, Cpu, Globe, ArrowUpRight, Image, Info, FileText, Check
} from 'lucide-react';
import { SEOKeyword, SEOImage } from '../../types/seo';

interface SEOKeywordsInternalLinkingProps {
  keywords: SEOKeyword[];
  onAddKeyword: (kw: SEOKeyword) => void;
  images: SEOImage[];
  onSaveImage: (img: SEOImage) => void;
  orphanPages: string[];
  suggestedInternalLinks: Array<{ from: string; to: string; anchor: string }>;
}

export default function SEOKeywordsInternalLinking({
  keywords,
  onAddKeyword,
  images,
  onSaveImage,
  orphanPages,
  suggestedInternalLinks
}: SEOKeywordsInternalLinkingProps) {
  const [activeTab, setActiveTab] = useState<'keywords' | 'linking' | 'images'>('keywords');

  // Keyword Density Analyzer state
  const [analysisText, setAnalysisText] = useState('');
  const [analyzerKeyword, setAnalyzerKeyword] = useState(keywords[0]?.keyword || '');
  
  // Custom keyword states
  const [newKeyword, setNewKeyword] = useState('');
  const [newVolume, setNewVolume] = useState('2400');
  const [newDifficulty, setNewDifficulty] = useState('42');
  const [newIntent, setNewIntent] = useState<'Informational' | 'Navigational' | 'Commercial' | 'Transactional'>('Transactional');

  // Density analyzer logic
  const densityResult = useMemo(() => {
    if (!analysisText || !analyzerKeyword) return null;
    const cleanKw = analyzerKeyword.toLowerCase().trim();
    const cleanText = analysisText.toLowerCase();
    
    // Simple regex match
    const escapedKw = cleanKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedKw, 'g');
    const matches = cleanText.match(regex);
    const count = matches ? matches.length : 0;
    
    // Word count
    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    const density = wordCount > 0 ? (count / wordCount) * 100 : 0;
    
    let status: 'good' | 'low' | 'stuffing' = 'good';
    let suggestion = '';
    
    if (density === 0) {
      status = 'low';
      suggestion = 'Keyword not found in content! We highly recommend introducing it in the H1 title and introduction paragraph.';
    } else if (density < 1.0) {
      status = 'low';
      suggestion = 'Low density. Try to weave your target keyword into at least one of the subheading (H2) tags and the final summary.';
    } else if (density > 2.8) {
      status = 'stuffing';
      suggestion = 'Keyword stuffing detected! Density exceeds 2.5%. Search crawlers might penalize this copy. Restructure sentences to use natural synonyms.';
    } else {
      status = 'good';
      suggestion = 'Perfect keyword density ratio! Excellent semantic keyword integration. Your page is highly optimized for this term.';
    }

    return {
      count,
      wordCount,
      density: Number(density.toFixed(2)),
      status,
      suggestion
    };
  }, [analysisText, analyzerKeyword]);

  const handleAddKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword) return;
    onAddKeyword({
      id: 'kw-' + Date.now(),
      keyword: newKeyword,
      secondaryKeywords: ['plots price bangalore', 'buying land gated layout'],
      intent: newIntent,
      volume: parseInt(newVolume) || 1200,
      difficulty: parseInt(newDifficulty) || 30,
      density: 1.2,
      suggestions: ['Integrate this keyword into the URL slug', 'Ensure the ALT tags of top images mention this keyword']
    });
    setNewKeyword('');
  };

  const handleApplyAltText = (img: SEOImage) => {
    onSaveImage({
      ...img,
      alt: img.suggestedAlt
    });
  };

  return (
    <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl font-sans text-slate-100" id="seo-keywords-internal-linking">
      
      {/* LOCAL CONTROLS HEADER */}
      <div className="flex border-b border-slate-800/80 pb-4 mb-5 justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Semantic Keywords, Linking & Media</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Audit search intent, check content keyword stuffing, and generate ALT image tags</p>
        </div>

        <div className="flex bg-[#15181F] p-1 rounded-xl border border-slate-800/60 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('keywords')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'keywords' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Keyword Planner & Analyzer
          </button>
          <button 
            onClick={() => setActiveTab('linking')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'linking' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Internal Link Suggestion Matrix
          </button>
          <button 
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'images' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Image ALT Tags & SEO
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: KEYWORD PLANNER & DENSITY ANALYZER */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Planner Left Panel (5 columns) */}
            <div className="lg:col-span-5 space-y-4">
              <form onSubmit={handleAddKeywordSubmit} className="bg-[#13151A] border border-slate-850 p-4 rounded-xl space-y-3.5">
                <h4 className="text-xs font-bold text-[#C89B3C] uppercase tracking-wider">Add Target Focus Keyword</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-1">Target Keyword Term</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. villa plots devanahalli"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Search Volume</label>
                    <input 
                      type="number" 
                      required
                      value={newVolume}
                      onChange={(e) => setNewVolume(e.target.value)}
                      className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Difficulty Score</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max="100"
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value)}
                      className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] text-slate-200 font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-400 mb-1">Search Intent Class</label>
                    <select 
                      value={newIntent}
                      onChange={(e) => setNewIntent(e.target.value as any)}
                      className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#C89B3C] text-slate-200"
                    >
                      <option value="Transactional">Transactional (Buyer Ready)</option>
                      <option value="Commercial">Commercial (Investigating)</option>
                      <option value="Informational">Informational (Educational)</option>
                      <option value="Navigational">Navigational (Brand Search)</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-750"
                >
                  <Plus className="w-4 h-4 text-[#C89B3C]" /> Commit Target Keyword
                </button>
              </form>

              {/* CURRENT KEYWORD MATRIX */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Keyword Registry</h5>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {keywords.map(kw => (
                    <div key={kw.id} className="bg-[#13151A] border border-slate-850 p-3 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-200 font-mono block">{kw.keyword}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block ${kw.intent === 'Transactional' ? 'bg-rose-500/10 text-rose-400' : kw.intent === 'Commercial' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                          {kw.intent}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-400 font-bold block">{kw.volume.toLocaleString()} vol</span>
                        <span className={`text-[10px] font-black block mt-0.5 ${kw.difficulty > 55 ? 'text-rose-500' : 'text-emerald-400'}`}>
                          KD {kw.difficulty}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Density Analyzer Right Panel (7 columns) */}
            <div className="lg:col-span-7 bg-[#13151A] border border-slate-850 p-5 rounded-xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-[#C89B3C]" /> Content Density Scanner
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Paste draft article copy below to audit keyword frequency ratio</p>
                  </div>

                  <select 
                    value={analyzerKeyword}
                    onChange={(e) => setAnalyzerKeyword(e.target.value)}
                    className="bg-[#15181F] border border-slate-800 rounded-xl py-1 px-2.5 text-[11px] focus:outline-none text-[#C89B3C] font-mono"
                  >
                    {keywords.map(kw => (
                      <option key={kw.id} value={kw.keyword}>{kw.keyword}</option>
                    ))}
                  </select>
                </div>

                <textarea 
                  rows={6}
                  placeholder="Paste your blog article, property description or homepage copy here to analyze density ratios..."
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  className="w-full bg-[#111317] border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C89B3C] text-slate-300 leading-relaxed shadow-inner"
                />
              </div>

              {densityResult ? (
                <div className="bg-[#1A1C21]/60 border border-slate-850 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                    <div className="bg-[#111317] p-2 rounded-lg">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Keyword Hits</span>
                      <strong className="text-[#C89B3C] text-base block mt-0.5">{densityResult.count}</strong>
                    </div>
                    <div className="bg-[#111317] p-2 rounded-lg">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Word Count</span>
                      <strong className="text-slate-300 text-base block mt-0.5">{densityResult.wordCount}</strong>
                    </div>
                    <div className="bg-[#111317] p-2 rounded-lg">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Density Ratio</span>
                      <strong className={`text-base block mt-0.5 ${densityResult.status === 'good' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {densityResult.density}%
                      </strong>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start bg-slate-900/40 p-3 rounded-lg text-xs leading-relaxed">
                    {densityResult.status === 'good' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-slate-300 font-medium">{densityResult.suggestion}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1A1C21]/40 border border-slate-850 p-6 text-center text-slate-500 rounded-xl text-xs flex flex-col justify-center items-center">
                  <Info className="w-8 h-8 text-slate-750 mb-2" />
                  <p>Type or paste draft copy in the editor above to load real-time SEO keyword density diagnostics.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* RENDER VIEW 2: INTERNAL LINKING */}
      {activeTab === 'linking' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ORPHAN PAGES (No incoming links) */}
          <div className="bg-[#13151A] border border-slate-850 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500 w-4.5 h-4.5" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Orphan Pages Detected</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Orphan pages have zero inbound links, making them hard for search engine crawlers to discover and index. Fix this by hyperlinking them.
            </p>

            <div className="space-y-2 mt-4">
              {orphanPages.map((route, i) => (
                <div key={i} className="bg-[#15181F]/80 border border-slate-800 p-2.5 rounded-xl flex justify-between items-center text-xs font-mono text-amber-400">
                  <span>{route}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">0 Inbound Links</span>
                </div>
              ))}
            </div>
          </div>

          {/* INTERNAL LINKING SUGGESTIONS */}
          <div className="bg-[#13151A] border border-slate-850 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="text-[#C89B3C] w-4.5 h-4.5" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Smart Linking Recommendations</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Boost your SEO juice distribution! Our AI engine parsed your routes and suggested these internal linking configurations:
            </p>

            <div className="space-y-3 mt-4">
              {suggestedInternalLinks.map((sug, i) => (
                <div key={i} className="bg-[#15181F]/80 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <span>Source Page: <strong className="text-slate-200 font-mono">{sug.from}</strong></span>
                    <span>Target: <strong className="text-slate-200 font-mono">{sug.to}</strong></span>
                  </div>
                  <div className="p-2 bg-[#1A1C22]/80 rounded-lg border border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-300">Anchor: "<strong className="text-[#C89B3C] font-mono">{sug.anchor}</strong>"</span>
                    <span className="text-[9px] text-indigo-400 font-extrabold uppercase font-mono bg-indigo-500/10 px-2 py-0.5 rounded">AI SUGGESTED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW 3: IMAGE SEO */}
      {activeTab === 'images' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase">Image ALT Texts & Compression Settings</h4>
              <p className="text-xs text-slate-400 mt-0.5">Ensure images are accessible to visually impaired users and crawler engines.</p>
            </div>
            <span className="text-xs text-slate-500">Image sitemap XML status: <strong className="text-emerald-400 font-mono uppercase font-bold">Active</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map(img => (
              <div key={img.id} className="bg-[#13151A] border border-slate-850 p-4 rounded-xl flex gap-4">
                <img 
                  src={img.src} 
                  alt="" 
                  className="w-20 h-20 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0" 
                  referrerPolicy="no-referrer"
                />
                
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
                    <span>Title: {img.title}</span>
                    <span>Size: {img.size}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Active ALT Text</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={img.alt}
                        onChange={(e) => onSaveImage({ ...img, alt: e.target.value })}
                        placeholder="Missing ALT attribute! Crawlers will ignore."
                        className={`w-full bg-[#15181F] border py-1.5 px-2.5 rounded-lg text-xs focus:outline-none ${img.alt ? 'border-slate-800 text-slate-200' : 'border-rose-500/50 text-rose-400 placeholder-rose-500/40 animate-pulse'}`}
                      />
                    </div>
                  </div>

                  {!img.alt && (
                    <div className="bg-[#1A1C22] border border-slate-800 p-2 rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 italic">Gemini Suggested: "{img.suggestedAlt}"</span>
                      <button 
                        onClick={() => handleApplyAltText(img)}
                        className="px-2 py-0.5 bg-[#C89B3C]/10 hover:bg-[#C89B3C]/20 text-[#C89B3C] font-bold text-[9px] rounded flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> APPLY
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={img.lazyLoad}
                        onChange={(e) => onSaveImage({ ...img, lazyLoad: e.target.checked })}
                        className="rounded border-slate-800 text-[#C89B3C] focus:ring-0 bg-[#15181F] w-3 h-3"
                      />
                      <span>Lazy Loading (loading="lazy")</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
