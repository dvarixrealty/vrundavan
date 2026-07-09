import React from 'react';
import { ShieldCheck, Image, Search, Crop, RefreshCw, Compass } from 'lucide-react';

interface SEOAndMediaProps {
  seoSettings: any;
  onChangeSeo: (newSeo: any) => void;
  mediaMeta: any;
  onChangeMediaMeta: (newMeta: any) => void;
}

export default function SEOAndMedia({ seoSettings = {}, onChangeSeo, mediaMeta = {}, onChangeMediaMeta }: SEOAndMediaProps) {
  const updateSeo = (key: string, value: any) => {
    onChangeSeo({ ...seoSettings, [key]: value });
  };

  const updateMediaMeta = (key: string, value: any) => {
    onChangeMediaMeta({ ...mediaMeta, [key]: value });
  };

  // Simulate cropping, flipping, compression
  const triggerMediaOperation = (op: string) => {
    window.dispatchEvent(new CustomEvent('cms-alert-notification', {
      detail: {
        title: 'Image Processor',
        message: `Image ${op} successfully. Original quality fully compressed & optimized for standard SEO.`,
        category: 'CMS'
      }
    }));
  };

  return (
    <div className="space-y-6" id="hero-seo-media">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <ShieldCheck className="w-5 h-5 text-[#10B981]" />
        <h3 className="font-serif text-lg font-bold text-slate-800">Advanced Image Optimization & SEO Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Media Compression & Operations */}
        <div className="space-y-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider font-mono">Image Editing & Optimization</p>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3.5 text-xs text-slate-600">
            <p>Optimize large banners for instant core-vitals loading speeds:</p>
            
            <div className="flex flex-wrap gap-2">
              <button 
                type="button"
                onClick={() => triggerMediaOperation('Cropped')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer font-semibold"
              >
                <Crop className="w-3.5 h-3.5" /> Crop Image
              </button>
              <button 
                type="button"
                onClick={() => triggerMediaOperation('Compressed')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer font-semibold"
              >
                <Compass className="w-3.5 h-3.5" /> Compress WebP
              </button>
              <button 
                type="button"
                onClick={() => triggerMediaOperation('Flipped')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Mirror Flip
              </button>
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Image Alt Text (A11y & SEO)</label>
              <input 
                type="text" 
                value={mediaMeta.altText || ''} 
                onChange={(e) => updateMediaMeta('altText', e.target.value)}
                placeholder="e.g. Modern duplex villa in Bangalore"
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">HTML Image Title Tag</label>
              <input 
                type="text" 
                value={mediaMeta.titleText || ''} 
                onChange={(e) => updateMediaMeta('titleText', e.target.value)}
                placeholder="e.g. Dvarix Realty Premium Villa Banner"
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white"
              />
            </div>
          </div>
        </div>

        {/* SEO Metadata Settings */}
        <div className="space-y-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider font-mono">SEO Schema & Metadata</p>
          
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Meta Title Override</label>
              <input 
                type="text" 
                value={seoSettings.metaTitle || ''} 
                onChange={(e) => updateSeo('metaTitle', e.target.value)}
                placeholder="e.g. Best Plots & Villas in Bengaluru | Dvarix Realty"
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Meta Description Override</label>
              <textarea 
                value={seoSettings.metaDesc || ''} 
                onChange={(e) => updateSeo('metaDesc', e.target.value)}
                placeholder="e.g. Browse verified real estate solutions, premium residential layouts, villas and plots with complete legal transparency..."
                rows={2}
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white resize-none"
              />
            </div>

            {/* Lazy load toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">SEO Lazy Loading</p>
                <p className="text-[10px] text-slate-500">Postpone loading offscreen images to speed up first contentful paint</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={seoSettings.lazyLoading !== false}
                  onChange={(e) => updateSeo('lazyLoading', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
