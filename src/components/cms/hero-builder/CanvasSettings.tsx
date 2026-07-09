import React from 'react';
import { Sliders, Maximize2, Monitor, Tablet, Phone, Sparkles } from 'lucide-react';

interface CanvasSettingsProps {
  canvasSettings: any;
  onChange: (newSettings: any) => void;
  bgSettings: any;
  onChangeBg: (newBgSettings: any) => void;
}

export default function CanvasSettings({ canvasSettings = {}, onChange, bgSettings = {}, onChangeBg }: CanvasSettingsProps) {
  const updateSetting = (key: string, value: any) => {
    onChange({ ...canvasSettings, [key]: value });
  };

  const updateBg = (key: string, value: any) => {
    onChangeBg({ ...bgSettings, [key]: value });
  };

  return (
    <div className="space-y-6" id="hero-canvas-settings">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Maximize2 className="w-5 h-5 text-[#10B981]" />
        <h3 className="font-serif text-lg font-bold text-slate-800">Visual Canvas Dimensions & Layout</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Heights */}
        <div className="space-y-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider font-mono">Device Heights</p>
          
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <Monitor className="w-3.5 h-3.5 text-slate-500" /> Desktop Height (px, vh, auto)
              </label>
              <input 
                type="text" 
                value={canvasSettings.desktopHeight || '600px'} 
                onChange={(e) => updateSetting('desktopHeight', e.target.value)}
                placeholder="e.g. 600px, 100vh, auto"
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <Tablet className="w-3.5 h-3.5 text-slate-500" /> Tablet Height (px, vh, auto)
              </label>
              <input 
                type="text" 
                value={canvasSettings.tabletHeight || '500px'} 
                onChange={(e) => updateSetting('tabletHeight', e.target.value)}
                placeholder="e.g. 500px, 80vh, auto"
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Mobile Height (px, vh, auto)
              </label>
              <input 
                type="text" 
                value={canvasSettings.mobileHeight || '400px'} 
                onChange={(e) => updateSetting('mobileHeight', e.target.value)}
                placeholder="e.g. 400px, 60vh, auto"
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Filters and Glass Effects */}
        <div className="space-y-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider font-mono">Filters & Aesthetics</p>
          
          <div className="space-y-3.5">
            {/* Opacity slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Canvas Opacity</span>
                <span className="font-mono text-[10px] text-slate-500">{canvasSettings.opacity !== undefined ? canvasSettings.opacity : 100}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={canvasSettings.opacity !== undefined ? canvasSettings.opacity : 100} 
                onChange={(e) => updateSetting('opacity', Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
            </div>

            {/* Brightness slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Media Brightness</span>
                <span className="font-mono text-[10px] text-slate-500">{canvasSettings.brightness !== undefined ? canvasSettings.brightness : 100}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={canvasSettings.brightness !== undefined ? canvasSettings.brightness : 100} 
                onChange={(e) => updateSetting('brightness', Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
            </div>

            {/* Contrast slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Contrast Ratio</span>
                <span className="font-mono text-[10px] text-slate-500">{canvasSettings.contrast !== undefined ? canvasSettings.contrast : 100}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={canvasSettings.contrast !== undefined ? canvasSettings.contrast : 100} 
                onChange={(e) => updateSetting('contrast', Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
            </div>

            {/* Saturation slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Saturation</span>
                <span className="font-mono text-[10px] text-slate-500">{canvasSettings.saturation !== undefined ? canvasSettings.saturation : 100}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={canvasSettings.saturation !== undefined ? canvasSettings.saturation : 100} 
                onChange={(e) => updateSetting('saturation', Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
            </div>

            {/* Blur filter */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Blur Filter Effect</span>
                <span className="font-mono text-[10px] text-slate-500">{canvasSettings.blur !== undefined ? canvasSettings.blur : 0}px</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="24" 
                value={canvasSettings.blur !== undefined ? canvasSettings.blur : 0} 
                onChange={(e) => updateSetting('blur', Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
            </div>

            {/* Glass Effect Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Glassmorphism Canvas Effect</p>
                <p className="text-[10px] text-slate-500">Enable frosted glass background styling for the hero banner frame</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={!!canvasSettings.glassEffect}
                  onChange={(e) => updateSetting('glassEffect', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay & Alignment Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1 block">Background Media Overlay Opacity</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={bgSettings.overlayOpacity !== undefined ? bgSettings.overlayOpacity : 40}
              onChange={(e) => updateBg('overlayOpacity', Number(e.target.value))}
              className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
            />
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              {bgSettings.overlayOpacity !== undefined ? bgSettings.overlayOpacity : 40}%
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <input 
              type="checkbox" 
              id="bgOverlayEnabled"
              checked={bgSettings.overlayEnabled !== false}
              onChange={(e) => updateBg('overlayEnabled', e.target.checked)}
              className="rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] h-3.5 w-3.5"
            />
            <label htmlFor="bgOverlayEnabled" className="text-xs text-slate-600">Enable Dark Overlay</label>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 mb-1 block">Background Position / Fitting</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={bgSettings.backgroundPosition || 'center'}
              onChange={(e) => updateBg('backgroundPosition', e.target.value)}
              className="text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white text-slate-700"
            >
              <option value="center">Center Center</option>
              <option value="top">Top Center</option>
              <option value="bottom">Bottom Center</option>
              <option value="left">Center Left</option>
              <option value="right">Center Right</option>
            </select>

            <select
              value={bgSettings.backgroundSize || 'cover'}
              onChange={(e) => updateBg('backgroundSize', e.target.value)}
              className="text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#10B981] bg-white text-slate-700"
            >
              <option value="cover">Cover (Fill Screen)</option>
              <option value="contain">Contain (No Crop)</option>
              <option value="auto">Auto Dimensions</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
