import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Link2, Smartphone, Mail, PhoneCall } from 'lucide-react';

interface ButtonBuilderProps {
  buttons: any[];
  onChange: (newButtons: any[]) => void;
}

export default function ButtonBuilder({ buttons = [], onChange }: ButtonBuilderProps) {
  const handleAddButton = () => {
    const newBtn = {
      id: 'btn-' + Date.now(),
      text: 'New Action Button',
      destinationType: 'internal',
      destinationValue: 'Properties',
      openInNewTab: false,
      style: 'primary',
      show: true
    };
    onChange([...buttons, newBtn]);
  };

  const handleUpdateBtn = (id: string, key: string, value: any) => {
    const updated = buttons.map(b => b.id === id ? { ...b, [key]: value } : b);
    onChange(updated);
  };

  const handleDeleteBtn = (id: string) => {
    onChange(buttons.filter(b => b.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === buttons.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const list = [...buttons];
    const temp = list[index];
    list[index] = list[swapIndex];
    list[swapIndex] = temp;
    onChange(list);
  };

  return (
    <div className="space-y-6" id="hero-button-builder">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#10B981]" />
          <h3 className="font-serif text-lg font-bold text-slate-800">CTA Action Button Builder</h3>
        </div>
        <button 
          type="button"
          onClick={handleAddButton}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#0da471] text-white rounded-lg text-xs font-bold transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Button
        </button>
      </div>

      {buttons.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-450 text-xs">
          No buttons created yet. Click the "Add Button" button to add dynamic buttons.
        </div>
      ) : (
        <div className="space-y-4">
          {buttons.map((btn, index) => (
            <div key={btn.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3.5 relative group">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-[#10B981] uppercase tracking-wider font-mono">Button #{index + 1}</p>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === buttons.length - 1}
                    className="p-1 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeleteBtn(btn.id)}
                    className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded cursor-pointer ml-1"
                    title="Delete Button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Button text */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Button Text Label</label>
                  <input 
                    type="text" 
                    value={btn.text} 
                    onChange={(e) => handleUpdateBtn(btn.id, 'text', e.target.value)}
                    placeholder="Explore Properties"
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                {/* Destination type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Link Destination Type</label>
                  <select
                    value={btn.destinationType}
                    onChange={(e) => handleUpdateBtn(btn.id, 'destinationType', e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-[#10B981] bg-white text-slate-700"
                  >
                    <option value="internal">Internal App Page</option>
                    <option value="external">External Website URL</option>
                    <option value="whatsapp">WhatsApp Message Chat</option>
                    <option value="phone">Direct Phone Call Link</option>
                    <option value="email">Direct Email Link</option>
                    <option value="custom-request">Dvarix Custom Request</option>
                  </select>
                </div>

                {/* Destination value */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Link Value / Address</label>
                  <input 
                    type="text" 
                    value={btn.destinationValue} 
                    onChange={(e) => handleUpdateBtn(btn.id, 'destinationValue', e.target.value)}
                    placeholder="e.g. #listings-layout-view or +919999..."
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-[#10B981] font-mono"
                  />
                </div>

                {/* Button styles */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Visual Style Theme</label>
                  <select
                    value={btn.style || 'primary'}
                    onChange={(e) => handleUpdateBtn(btn.id, 'style', e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-[#10B981] bg-white"
                  >
                    <option value="primary">Primary Accent Theme</option>
                    <option value="secondary">Dark Luxury Theme</option>
                    <option value="outline">Clean Outline Theme</option>
                  </select>
                </div>

                {/* Open in new tab */}
                <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    id={`open-tab-${btn.id}`}
                    checked={!!btn.openInNewTab}
                    onChange={(e) => handleUpdateBtn(btn.id, 'openInNewTab', e.target.checked)}
                    className="rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] h-4 w-4"
                  />
                  <label htmlFor={`open-tab-${btn.id}`} className="text-xs text-slate-600 font-medium">Open in New Tab</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
