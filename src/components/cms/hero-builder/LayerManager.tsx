import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Layers, Lock, Unlock, Copy, Tag } from 'lucide-react';

interface LayerManagerProps {
  layers: any[];
  onChange: (newLayers: any[]) => void;
}

export default function LayerManager({ layers = [], onChange }: LayerManagerProps) {
  const handleAddLayer = (type: 'text' | 'image' | 'button') => {
    const newLayer = {
      id: 'layer-' + Date.now(),
      name: `New ${type.toUpperCase()} Layer`,
      type,
      x: 15,
      y: 20,
      zIndex: layers.length + 10,
      show: true,
      locked: false,
      // Default type values
      content: type === 'text' ? 'Discover Your Place' : type === 'button' ? 'Get Started' : '',
      color: '#FFFFFF',
      fontSize: type === 'text' ? 24 : 14,
      fontWeight: 'bold',
      src: type === 'image' ? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80' : '',
      url: ''
    };
    onChange([...layers, newLayer]);
  };

  const handleUpdateLayer = (id: string, key: string, value: any) => {
    onChange(layers.map(l => l.id === id ? { ...l, [key]: value } : l));
  };

  const handleDeleteLayer = (id: string) => {
    onChange(layers.filter(l => l.id !== id));
  };

  const handleDuplicateLayer = (layer: any) => {
    const copy = {
      ...layer,
      id: 'layer-' + Date.now(),
      name: `${layer.name} (Copy)`,
      x: Math.min(90, layer.x + 5),
      y: Math.min(90, layer.y + 5)
    };
    onChange([...layers, copy]);
  };

  const handleZIndex = (index: number, action: 'front' | 'back' | 'forward' | 'backward') => {
    const list = [...layers];
    if (action === 'front') {
      const maxZ = Math.max(...list.map(l => l.zIndex || 10), 10);
      list[index].zIndex = maxZ + 1;
    } else if (action === 'back') {
      const minZ = Math.min(...list.map(l => l.zIndex || 10), 10);
      list[index].zIndex = Math.max(1, minZ - 1);
    } else if (action === 'forward') {
      list[index].zIndex = (list[index].zIndex || 10) + 1;
    } else if (action === 'backward') {
      list[index].zIndex = Math.max(1, (list[index].zIndex || 10) - 1);
    }
    onChange(list);
  };

  return (
    <div className="space-y-6" id="hero-layer-manager">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#10B981]" />
          <h3 className="font-serif text-lg font-bold text-slate-800">Visual Layout Layer Management</h3>
        </div>
        <div className="flex gap-1.5">
          <button 
            type="button" 
            onClick={() => handleAddLayer('text')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            + Text
          </button>
          <button 
            type="button" 
            onClick={() => handleAddLayer('image')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            + Image
          </button>
          <button 
            type="button" 
            onClick={() => handleAddLayer('button')}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            + Button
          </button>
        </div>
      </div>

      {layers.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
          No custom visual layers defined. Create your canvas above.
        </div>
      ) : (
        <div className="space-y-3.5">
          {layers.map((layer, index) => (
            <div key={layer.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">L{index + 1}</span>
                  <input 
                    type="text" 
                    value={layer.name}
                    onChange={(e) => handleUpdateLayer(layer.id, 'name', e.target.value)}
                    className="text-xs font-bold text-slate-800 border-none focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 p-1 rounded"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={() => handleUpdateLayer(layer.id, 'show', !layer.show)}
                    className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-600"
                    title={layer.show ? "Hide Layer" : "Show Layer"}
                  >
                    {layer.show ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleUpdateLayer(layer.id, 'locked', !layer.locked)}
                    className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-600"
                    title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5 text-red-500" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDuplicateLayer(layer)}
                    className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-600"
                    title="Duplicate Layer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteLayer(layer.id)}
                    className="p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Position Coordinates Control */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>X Coordinate (Left %)</span>
                    <span className="font-mono">{layer.x}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={layer.x} 
                    disabled={layer.locked}
                    onChange={(e) => handleUpdateLayer(layer.id, 'x', Number(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981] disabled:opacity-40"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Y Coordinate (Top %)</span>
                    <span className="font-mono">{layer.y}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={layer.y} 
                    disabled={layer.locked}
                    onChange={(e) => handleUpdateLayer(layer.id, 'y', Number(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981] disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Layer properties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-2.5">
                {layer.type === 'text' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Text Content</label>
                      <input 
                        type="text" 
                        value={layer.content} 
                        disabled={layer.locked}
                        onChange={(e) => handleUpdateLayer(layer.id, 'content', e.target.value)}
                        className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Text Color</label>
                      <input 
                        type="color" 
                        value={layer.color} 
                        disabled={layer.locked}
                        onChange={(e) => handleUpdateLayer(layer.id, 'color', e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {layer.type === 'image' && (
                  <>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Image Source URL</label>
                      <input 
                        type="text" 
                        value={layer.src} 
                        disabled={layer.locked}
                        onChange={(e) => handleUpdateLayer(layer.id, 'src', e.target.value)}
                        className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-[#10B981] font-mono"
                      />
                    </div>
                  </>
                )}

                {layer.type === 'button' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Button Text</label>
                      <input 
                        type="text" 
                        value={layer.content} 
                        disabled={layer.locked}
                        onChange={(e) => handleUpdateLayer(layer.id, 'content', e.target.value)}
                        className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Action Link</label>
                      <input 
                        type="text" 
                        value={layer.url} 
                        disabled={layer.locked}
                        onChange={(e) => handleUpdateLayer(layer.id, 'url', e.target.value)}
                        placeholder="#listings-layout-view"
                        className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-[#10B981] font-mono"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Z-index layering order controls */}
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500">
                <span>Layering Order:</span>
                <button type="button" onClick={() => handleZIndex(index, 'front')} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 rounded border cursor-pointer">Bring to Front</button>
                <button type="button" onClick={() => handleZIndex(index, 'forward')} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 rounded border cursor-pointer">Bring Forward</button>
                <button type="button" onClick={() => handleZIndex(index, 'backward')} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 rounded border cursor-pointer">Send Backward</button>
                <button type="button" onClick={() => handleZIndex(index, 'back')} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 rounded border cursor-pointer">Send to Back</button>
                <span className="ml-auto font-mono text-[10px] text-slate-400 font-bold">Z-Index: {layer.zIndex}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
