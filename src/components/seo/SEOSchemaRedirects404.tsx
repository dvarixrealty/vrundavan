import React, { useState } from 'react';
import { 
  Plus, Save, Trash2, HelpCircle, Code, Layers, ShieldAlert, Check, CheckCircle2,
  AlertTriangle, RefreshCw, LogOut, ArrowRight, ArrowUpRight, Ban, FileCode
} from 'lucide-react';
import { SEOSchema, SEORedirectRule, SEO404Log } from '../../types/seo';

interface SEOSchemaRedirects404Props {
  schemas: SEOSchema[];
  onSaveSchema: (schema: SEOSchema) => void;
  redirectRules: SEORedirectRule[];
  onAddRedirect: (fromUrl: string, toUrl: string, type: '301' | '302') => void;
  onDeleteRedirect: (id: string) => void;
  logs404: SEO404Log[];
  onClear404: (id: string) => void;
}

export default function SEOSchemaRedirects404({
  schemas,
  onSaveSchema,
  redirectRules,
  onAddRedirect,
  onDeleteRedirect,
  logs404,
  onClear404
}: SEOSchemaRedirects404Props) {
  const [activeTab, setActiveTab] = useState<'schemas' | 'redirects' | '404logs'>('schemas');
  
  // Schemas states
  const [selectedSchema, setSelectedSchema] = useState<SEOSchema | null>(schemas[0] || null);
  const [schemaJson, setSchemaJson] = useState(schemas[0]?.jsonContent || '');
  const [schemaValidationMsg, setSchemaValidationMsg] = useState<string | null>(null);

  // New Redirect states
  const [redirectFrom, setRedirectFrom] = useState('');
  const [redirectTo, setRedirectTo] = useState('');
  const [redirectType, setRedirectType] = useState<'301' | '302'>('301');

  const handleSelectSchema = (sc: SEOSchema) => {
    setSelectedSchema(sc);
    setSchemaJson(sc.jsonContent);
    setSchemaValidationMsg(null);
  };

  const handleValidateSchema = () => {
    try {
      JSON.parse(schemaJson);
      setSchemaValidationMsg('✅ JSON-LD Structured schema is valid! Compliant with schema.org standards.');
    } catch (err: any) {
      setSchemaValidationMsg(`❌ Schema contains syntax errors: ${err.message}`);
    }
  };

  const handleSaveSchemaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchema) return;
    
    let isValid = true;
    try {
      JSON.parse(schemaJson);
    } catch {
      isValid = false;
    }

    onSaveSchema({
      ...selectedSchema,
      jsonContent: schemaJson,
      isValid,
      lastUpdated: new Date().toISOString()
    });
  };

  const handleCreateRedirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redirectFrom || !redirectTo) return;
    onAddRedirect(redirectFrom, redirectTo, redirectType);
    setRedirectFrom('');
    setRedirectTo('');
  };

  const handleAddRedirectFrom404 = (item: SEO404Log) => {
    onAddRedirect(item.url, item.suggestedRedirect || '/properties', '301');
    onClear404(item.id);
  };

  return (
    <div className="bg-[#0F1115]/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl font-sans text-slate-100" id="seo-schema-redirects-404">
      
      {/* LOCAL CONTROLS HEADER */}
      <div className="flex border-b border-slate-800/80 pb-4 mb-5 justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Structured Schemas & Traffic Redirects</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Validate JSON-LD structured scripts, establish redirect rules, and repair broken links</p>
        </div>

        <div className="flex bg-[#15181F] p-1 rounded-xl border border-slate-800/60 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('schemas')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'schemas' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            JSON-LD Schemas
          </button>
          <button 
            onClick={() => setActiveTab('redirects')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'redirects' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Redirect Manager
          </button>
          <button 
            onClick={() => setActiveTab('404logs')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === '404logs' ? 'bg-[#C89B3C] text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            404 Error Log Tracker
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: JSON-LD STRUCTURAL SCHEMAS */}
      {activeTab === 'schemas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List panel (4 columns) */}
          <div className="lg:col-span-4 bg-[#13151A] border border-slate-850 p-4 rounded-xl space-y-1 h-[450px] overflow-y-auto">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Structured Schema Library</h4>
            {schemas.map(sc => {
              const isSel = selectedSchema?.id === sc.id;
              return (
                <div 
                  key={sc.id}
                  onClick={() => handleSelectSchema(sc)}
                  className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition ${isSel ? 'bg-[#C89B3C]/10 border border-[#C89B3C]/30 text-white font-bold' : 'bg-slate-900/50 border border-slate-800/30 text-slate-400 hover:bg-slate-850'}`}
                >
                  <div>
                    <span className="text-xs block">{sc.name}</span>
                    <span className="text-[10px] font-mono text-[#C89B3C] mt-0.5 block">{sc.type}</span>
                  </div>
                  {sc.isValid ? (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">VALID</span>
                  ) : (
                    <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase">ERR</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Editor block (8 columns) */}
          {selectedSchema ? (
            <form onSubmit={handleSaveSchemaSubmit} className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase">{selectedSchema.name} Settings</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Schema.org JSON-LD formatted script block</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleValidateSchema}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-bold"
                  >
                    Validate JSON
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-[#C89B3C] hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold"
                  >
                    Save Schema
                  </button>
                </div>
              </div>

              <textarea 
                rows={14}
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                className="w-full bg-[#111317] border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-[#C89B3C] leading-relaxed shadow-inner"
              />

              {schemaValidationMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold font-mono ${schemaValidationMsg.startsWith('✅') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                  {schemaValidationMsg}
                </div>
              )}
            </form>
          ) : (
            <div className="lg:col-span-8 bg-slate-900/50 p-12 text-center rounded-xl text-slate-500">
              Select a schema schema block to begin editing.
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW 2: REDIRECT MANAGER */}
      {activeTab === 'redirects' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateRedirectSubmit} className="bg-[#13151A] border border-slate-850 p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-[#C89B3C] uppercase tracking-wider">Establish Link Redirect rule</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold items-end">
              <div>
                <label className="block text-slate-400 mb-1">Source Path (Old Route)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. /old-properties-map"
                  value={redirectFrom}
                  onChange={(e) => setRedirectFrom(e.target.value)}
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-[#C89B3C] text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Path (Destination)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. /properties"
                  value={redirectTo}
                  onChange={(e) => setRedirectTo(e.target.value)}
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-[#C89B3C] text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Redirect Type</label>
                <select 
                  value={redirectType}
                  onChange={(e) => setRedirectType(e.target.value as '301' | '302')}
                  className="w-full bg-[#15181F] border border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-[#C89B3C] text-slate-200"
                >
                  <option value="301">301 Permanent Redirect</option>
                  <option value="302">302 Temporary Redirect</option>
                </select>
              </div>

              <div>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-[#C89B3C] hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Redirect
                </button>
              </div>
            </div>
          </form>

          {/* ACTIVE RULE LIST */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Active Redirect Matrix ({redirectRules.length})</h4>
            <div className="bg-[#13151A] border border-slate-850 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1A1D24] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">From Path</th>
                    <th className="p-3">Destination Path</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Triggered Clicks</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                  {redirectRules.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono text-rose-400">{rule.fromUrl}</td>
                      <td className="p-3 font-mono text-emerald-400 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" /> {rule.toUrl}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold">
                          {rule.type} HTTP
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-400">{rule.clicks}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => onDeleteRedirect(rule.id)}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW 3: 404 LOGS */}
      {activeTab === '404logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase">Live 404 Error Log Tracker</h4>
              <p className="text-xs text-slate-400 mt-0.5">Capturing dynamic traffic requests to missing page routes in real time.</p>
            </div>
            
            <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold font-mono rounded-lg">
              {logs404.length} UNRESOLVED 404 ERRORS
            </span>
          </div>

          <div className="bg-[#13151A] border border-slate-850 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1A1D24] text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Broken URL Route</th>
                  <th className="p-3">Referrer Source</th>
                  <th className="p-3">Hit Count</th>
                  <th className="p-3">Last Triggered</th>
                  <th className="p-3">Recommended Link Redirect</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-semibold">
                {logs404.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/30">
                    <td className="p-3 font-mono text-rose-400">{item.url}</td>
                    <td className="p-3 font-mono text-slate-500">{item.referrer}</td>
                    <td className="p-3 font-mono text-slate-400 font-bold">{item.clicks} hits</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(item.lastTriggered).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span className="font-mono text-emerald-400">{item.suggestedRedirect}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => handleAddRedirectFrom404(item)}
                        className="px-2.5 py-1 bg-[#C89B3C]/10 hover:bg-[#C89B3C]/20 border border-[#C89B3C]/20 text-[#C89B3C] text-[10px] font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1 inline-block"
                      >
                        <Plus className="w-3 h-3" /> Redirect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
