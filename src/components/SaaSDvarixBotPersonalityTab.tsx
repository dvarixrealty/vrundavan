import React from 'react';
import { 
  Shield, ChevronRight, HelpCircle, AlertTriangle 
} from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface SaaSDvarixBotPersonalityTabProps {
  widgetConfig: any;
  setWidgetConfig: any;
  currentRole: string;
  setCurrentRole: (role: string) => void;
  isFieldReadOnly: (section: string) => boolean;
  promptList: any[];
  setPromptList: (list: any[]) => void;
  versionList: any[];
  setVersionList: (list: any[]) => void;
  selectedVersionForView: any;
  setSelectedVersionForView: (ver: any) => void;
  showPreviewModal: boolean;
  setShowPreviewModal: (show: boolean) => void;
  isPersonaEditing: boolean;
  setIsPersonaEditing: (edit: boolean) => void;
  restrictedTopicInput: string;
  setRestrictedTopicInput: (input: string) => void;
  selectedPromptId: string;
  setSelectedPromptId: (id: string) => void;
  simulationQuestion: string;
  setSimulationQuestion: (q: string) => void;
  simulationResponse: string;
  setSimulationResponse: (res: string) => void;
  publishedSimulationResponse?: string;
  setPublishedSimulationResponse?: (res: string) => void;
  triggeredRules?: string[];
  setTriggeredRules?: (rules: string[]) => void;
  appliedPrompt?: string;
  setAppliedPrompt?: (prompt: string) => void;
  isSimulatingTest: boolean;
  setIsSimulatingTest: (sim: boolean) => void;
  testApproved: boolean | null;
  setTestApproved: (app: boolean | null) => void;
  compareMode: boolean;
  setCompareMode: (comp: boolean) => void;
  promptHistory: any[];
  handleSaveDraftWidgetSettings: () => Promise<void>;
  handleUpdateWidgetSettings: () => Promise<void>;
  simulateChatbotResponse: () => void;
}

export const SaaSDvarixBotPersonalityTab: React.FC<SaaSDvarixBotPersonalityTabProps> = ({
  widgetConfig,
  setWidgetConfig,
  currentRole,
  setCurrentRole,
  isFieldReadOnly,
  promptList,
  setPromptList,
  versionList,
  setVersionList,
  selectedVersionForView,
  setSelectedVersionForView,
  showPreviewModal,
  setShowPreviewModal,
  isPersonaEditing,
  setIsPersonaEditing,
  restrictedTopicInput,
  setRestrictedTopicInput,
  selectedPromptId,
  setSelectedPromptId,
  simulationQuestion,
  setSimulationQuestion,
  simulationResponse,
  setSimulationResponse,
  publishedSimulationResponse = '',
  setPublishedSimulationResponse,
  triggeredRules = [],
  setTriggeredRules,
  appliedPrompt = '',
  setAppliedPrompt,
  isSimulatingTest,
  setIsSimulatingTest,
  testApproved,
  setTestApproved,
  compareMode,
  setCompareMode,
  promptHistory,
  handleSaveDraftWidgetSettings,
  handleUpdateWidgetSettings,
  simulateChatbotResponse
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ROLE ACCESS WARNING CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-indigo-300 uppercase tracking-wider">SECTION 12: Role Access Control</h3>
            <p className="text-[11px] text-slate-405 mt-0.5 font-sans">
              Logged Role: <span className="text-indigo-400 font-extrabold font-mono">{currentRole}</span> - {currentRole === 'Super Admin' ? 'Full Access' : isFieldReadOnly('identity') ? 'Read-Only Privilege' : 'Restricted Edit Access'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">Test Role:</span>
          <select
            value={currentRole}
            onChange={(e) => {
              const nextRole = e.target.value;
              setCurrentRole(nextRole);
              alert(`Switched to active testing role: ${nextRole}. Interface inputs, sliders, and saves are updated with strict permission locks.`);
            }}
            className="bg-slate-800 text-slate-200 border border-slate-705 rounded px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Super Admin">Super Admin (Full Access)</option>
            <option value="CRM Manager">CRM Manager (View Only)</option>
            <option value="Bot Manager">Bot Manager (Edit Personality)</option>
            <option value="Knowledge Manager">Knowledge Manager (Edit Knowledge)</option>
            <option value="Marketing Team">Marketing Team (Preview Only)</option>
          </select>
        </div>
      </div>

      {/* MAIN GRID SPLIT: LEFT SECTION NAVIGATOR / RIGHT CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT STICKY SECTION ANCHORS COL */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-left">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 block mb-3">Workspace Index</span>
            <nav className="space-y-1">
              {[
                { id: 'sec-1', label: '1. Overview' },
                { id: 'sec-2', label: '2. Core Bot Identity' },
                { id: 'sec-3', label: '3. Communication settings' },
                { id: 'sec-4', label: '4. System Prompt Manager' },
                { id: 'sec-5', label: '5. Realty Business Rules' },
                { id: 'sec-6', label: '6. CRM Integration Settings' },
                { id: 'sec-7', label: '7. Knowledge Settings' },
                { id: 'sec-8', label: '8. AI Behavior Settings' },
                { id: 'sec-9', label: '9. Restricted Topics' },
                { id: 'sec-10', label: '10. Personality Test Lab' },
                { id: 'sec-11', label: '11. Version Control History' },
                { id: 'sec-12', label: '12. Active permission matrix' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    const b = document.getElementById(sec.id);
                    if (b) {
                      b.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-slate-650 hover:bg-slate-50 hover:text-indigo-600 transition text-[11px] font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span>{sec.label}</span>
                  <ChevronRight className="h-3 w-3 opacity-30" />
                </button>
              ))}
            </nav>

            {/* QUICK PREVIEW STATUS CARD */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">Workspace status</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[11px] text-slate-600 font-bold font-mono">Agent Environment Connected</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC ACCESS NOTICE */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left space-y-2 font-sans">
            <span className="text-[9px] font-mono uppercase font-bold text-slate-450 block">Active Privileges Notice</span>
            <p className="text-[11px] text-slate-600 leading-normal">
              {currentRole === 'Super Admin' && "✓ You are logged in as Super Admin. You have unrestricted, multi-tenant read-write capabilities over prompt schemas, database rule overrides, and simulator environments."}
              {currentRole === 'CRM Manager' && "🔒 CRM Manager reads live chatbot leads, histories and integration rules but cannot modify prompt structures or AI temperature values."}
              {currentRole === 'Bot Manager' && "✓ Bot Manager is authorized to adjust brand tone profiles, prompts, identity descriptors, rules, and simulate environments."}
              {currentRole === 'Knowledge Manager' && "🔒 Knowledge Manager has limited write capability, restricted solely to active collection grounding sources in Section 7."}
              {currentRole === 'Marketing Team' && "🔒 Marketing Team operates in sandbox review mode. You can test live conversation prompts inside the Lab, but changes cannot be committed to production."}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: SCROLLABLE SECTIONS CONTENTS (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* SECTION 1: PERSONALITY OVERVIEW */}
          <div id="sec-1" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-3">
              <div>
                <span className="text-[9px] font-mono uppercase font-bold text-indigo-505 tracking-wider">SECTION 1</span>
                <h2 className="text-sm font-black text-slate-805 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  🌟 Personality Control Hub
                </h2>
                <p className="text-xs text-slate-500">Configure parameters governing the virtual assistant's conversational identity and brand.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  Live Version: v2.4
                </span>
              </div>
            </div>

            {/* Primary Overview Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Bot Identity Name</span>
                <strong className="text-slate-700">{widgetConfig.botName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Current Status</span>
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase mt-0.5 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Published Live
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Last Updated</span>
                <strong className="text-slate-700">{widgetConfig.publishedDate || '2026-06-15 11:30'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-0.5">Supervisor Operator</span>
                <strong className="text-slate-700">{widgetConfig.publishedBy || 'Super Admin'}</strong>
              </div>
            </div>

            {/* Dynamic Overview Action Operations Row */}
            <div className="pt-2 flex flex-wrap gap-2 justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <div className="flex gap-1.55">
                <button
                  type="button"
                  onClick={() => {
                    setIsPersonaEditing(!isPersonaEditing);
                    alert(isPersonaEditing ? "Switched workspace to LOCKED View-Only state." : "Workspace UNLOCKED for operational config edits.");
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer transition ${isPersonaEditing ? 'bg-indigo-600 border-indigo-700 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {isPersonaEditing ? '🔓 Editing Mode: Active' : '🔒 Read-Only Workspace'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="bg-white hover:bg-slate-50 border text-slate-700 text-xs px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1 cursor-pointer transition"
                  title="Preview live widget appearance"
                >
                  👁️ Preview Snapshot
                </button>
              </div>

              <div className="flex gap-2 text-right">
                <button
                  type="button"
                  onClick={async () => {
                    if (isFieldReadOnly('identity')) {
                      alert("🔒 Permission Denied: Your current role lacks write privileges to save drafts.");
                      return;
                    }
                    await handleSaveDraftWidgetSettings();
                  }}
                  className="border border-slate-205 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Save Draft Configuration
                </button>
                
                <button
                  type="button"
                  onClick={async () => {
                    if (isFieldReadOnly('identity')) {
                      alert("🔒 Permission Denied: Your current role lacks publication privileges.");
                      return;
                    }
                    const confirmAction = confirm("Are you sure you want to deploy this layout immediately? This will update the customer-facing widgets automatically.");
                    if (!confirmAction) return;

                    // Save version record
                    const nextVersion = `v2.${versionList.length + 1}`;
                    const newVer = {
                      version: nextVersion,
                      createdDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
                      createdBy: currentRole,
                      status: 'Published',
                      summary: `Updated general identity configuration for ${widgetConfig.botName}. Aligned communication tone to ${widgetConfig.communicationTone || 'Warm'}.`
                    };
                    setVersionList([newVer, ...versionList]);
                    
                    setWidgetConfig((prev: any) => ({
                      ...prev,
                      publishedDate: newVer.createdDate,
                      publishedBy: currentRole
                    }));
                    await handleUpdateWidgetSettings();
                  }}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-black px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  🚀 Publish Changes Live
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: CORE BOT IDENTITY */}
          <div id="sec-2" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm relative overflow-hidden">
            {isFieldReadOnly('identity') && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2 py-0.5 text-[10px] font-mono">
                <span>🔒 Read-Only</span>
              </div>
            )}
            
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">SECTION 2</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                💼 Core Bot Identity Settings
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Determine name descriptors, mission objectives, target business summaries, and fallback templates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-505 font-mono">Bot Assistant Name</label>
                <input
                  type="text"
                  value={widgetConfig.botName}
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, botName: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-55 disabled:text-slate-500"
                  placeholder="e.g. Dvarix Prime Assistant"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-505 font-mono">Avatar Preset Graphic</label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Smart Bot', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100' },
                    { label: 'Advisor Agent', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
                    { label: 'Villa Logo', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=100' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                      onClick={() => {
                        setWidgetConfig({ ...widgetConfig, avatarUrl: preset.url });
                      }}
                      className={`rounded-lg overflow-hidden border-2 w-10 h-10 cursor-pointer transition ${widgetConfig.avatarUrl === preset.url ? 'border-indigo-600 scale-105 shadow' : 'border-slate-150 hover:border-slate-300'}`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                  <input
                    type="text"
                    value={widgetConfig.avatarUrl || ''}
                    disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, avatarUrl: e.target.value })}
                    className="flex-1 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] h-10 leading-normal focus:outline-indigo-550 focus:ring-1 focus:ring-indigo-550"
                    placeholder="Or paste custom image URL..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-505 font-mono">Bot Mission Statement</label>
              <textarea
                value={widgetConfig.botMission}
                disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, botMission: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs h-16 resize-none disabled:bg-slate-55 disabled:text-slate-505"
                placeholder="Determine chatbot core goals during interactions..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550 font-mono">Bot Description Segment</label>
              <textarea
                value={widgetConfig.botDescription || ''}
                disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, botDescription: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs h-16 resize-none disabled:bg-slate-55 disabled:text-slate-505"
                placeholder="General descriptor shown to users for clarifying service guidelines..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono font-medium">Initial Greeting message</label>
                <textarea
                  value={widgetConfig.introMessage}
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, introMessage: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs h-20 resize-none disabled:bg-slate-55 disabled:text-slate-505"
                  placeholder="Initial text template displayed on load..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono font-medium">Auto Closing Message</label>
                <textarea
                  value={widgetConfig.closingMessage || ''}
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, closingMessage: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs h-20 resize-none disabled:bg-slate-55 disabled:text-slate-505"
                  placeholder="Final signoff message when requirement discovery wraps up..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono font-medium">Fallback Error Message text</label>
                <textarea
                  value={widgetConfig.fallbackText}
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, fallbackText: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs h-20 resize-none disabled:bg-slate-55 disabled:text-slate-505"
                  placeholder="Message when exact RAG information cannot be mapped..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Dvarix Realty Business Description</label>
              <textarea
                value={widgetConfig.businessDescription || ''}
                disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, businessDescription: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs h-16 resize-none disabled:bg-slate-55 disabled:text-slate-505"
                placeholder="e.g. Master-planned luxury plots and pre-cleared land developments in Devanahalli..."
              />
            </div>
          </div>

          {/* SECTION 3: COMMUNICATION SETTINGS */}
          <div id="sec-3" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm relative">
            {isFieldReadOnly('identity') && (
              <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2 py-0.5 text-[10px] font-mono">
                <span>🔒 Read-Only</span>
              </div>
            )}
            
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-indigo-500 block">SECTION 3</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                🗣️ Communication Style & Tone Settings
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Manage behavioral and linguistic parameters of assistant outputs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-505 font-mono block mb-1">Communication Tone</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Professional', 'Friendly', 'Warm', 'Luxury', 'Formal', 'Casual', 'Custom'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                      onClick={() => setWidgetConfig({ ...widgetConfig, communicationTone: t })}
                      className={`text-[11px] font-extrabold py-2 px-2.5 border rounded-xl cursor-pointer text-center select-none transition ${widgetConfig.communicationTone === t ? 'bg-indigo-650 border-indigo-755 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-505 font-mono block mb-1">Conversation Style Pattern</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Short Answers', 'Detailed Answers', 'Guided Consultation', 'Requirement Discovery'].map((styleOpt) => (
                    <button
                      key={styleOpt}
                      type="button"
                      disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                      onClick={() => setWidgetConfig({ ...widgetConfig, conversationStyle: styleOpt })}
                      className={`text-[11px] font-bold px-3 py-2 border rounded-xl cursor-pointer transition ${widgetConfig.conversationStyle === styleOpt ? 'bg-slate-805 hover:bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-705 hover:bg-slate-50'}`}
                    >
                      {styleOpt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Question Strategy</label>
                <select
                  value={widgetConfig.questionStrategy || 'One Question at a Time'}
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, questionStrategy: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs text-slate-700 font-bold focus:outline-indigo-505 focus:ring-1 focus:ring-indigo-550"
                >
                  <option value="One Question at a Time">One Question at a Time (Highest Lead Quality)</option>
                  <option value="Multiple Questions">Multiple Questions (Fast Discovery)</option>
                  <option value="Dynamic AI Flow">Dynamic AI Flow (Adaptive Conversation)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono font-medium">Max Response Length</label>
                <select
                  value={widgetConfig.responseLength || 'Medium'}
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, responseLength: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs text-slate-700 font-bold focus:outline-indigo-550 focus:ring-1 focus:ring-indigo-550"
                >
                  <option value="Short">Short (Max 50 Words)</option>
                  <option value="Medium">Medium (Max 120 Words)</option>
                  <option value="Detailed">Detailed (Bespoke layout details, Max 300 Words)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: SYSTEM PROMPT MANAGER */}
          <div id="sec-4" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm relative">
            {isFieldReadOnly('identity') && (
              <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2 py-0.5 text-[10px] font-mono">
                <span>🔒 Read-Only</span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">SECTION 4</span>
                <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                  🧠 System Prompt Manager
                </h3>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  onClick={async () => {
                    const newName = prompt("Enter a unique name for this prompt block:");
                    if (!newName) return;
                    const newId = `p-${Date.now()}`;
                    const newP = {
                      id: newId,
                      name: newName,
                      prompt: widgetConfig.systemPrompt,
                      active: false
                    };
                    try {
                      await setDoc(doc(db, 'chatbot_prompts', newId), newP);
                      setSelectedPromptId(newId);
                      alert(`Successfully saved custom prompt block as "${newName}" to database!`);
                    } catch (err: any) {
                      alert("Failed to save prompt: " + err.message);
                    }
                  }}
                  className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  ➕ Save as Custom Prompt Preset
                </button>
              </div>
            </div>

            {/* Prompt workspace selection list */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
              <span className="text-[9.5px] font-mono uppercase font-bold tracking-wider text-slate-400 block">Registered Prompt Blocks:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {promptList.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPromptId(p.id);
                      setWidgetConfig({ ...widgetConfig, systemPrompt: p.prompt });
                    }}
                    className={`p-3 border rounded-xl text-left cursor-pointer transition flex flex-col justify-between ${selectedPromptId === p.id ? 'bg-indigo-650 border-indigo-705 text-white' : 'bg-white hover:bg-slate-100/50 border-slate-200 text-slate-700'}`}
                  >
                    <div>
                      <strong className="text-xs block line-clamp-1">{p.name}</strong>
                      <span className={`text-[8.5px] font-mono uppercase font-bold tracking-wider block mt-0.5 ${selectedPromptId === p.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {selectedPromptId === p.id ? '🎯 Active Workspace' : 'Draft Option'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/10">
                      <button
                        type="button"
                        disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const newName = `Copy of ${p.name}`;
                          const newId = `p-${Date.now()}`;
                          const duplicated = {
                            id: newId,
                            name: newName,
                            prompt: p.prompt,
                            active: false
                          };
                          try {
                            await setDoc(doc(db, 'chatbot_prompts', newId), duplicated);
                            setSelectedPromptId(newId);
                            setWidgetConfig({ ...widgetConfig, systemPrompt: p.prompt });
                            alert(`Duplicated prompt preset as "${newName}" in Database!`);
                          } catch (err: any) {
                            alert("Failed to duplicate preset: " + err.message);
                          }
                        }}
                        className={`text-[9px] hover:underline font-bold ${selectedPromptId === p.id ? 'text-indigo-200 hover:text-indigo-100' : 'text-indigo-600'}`}
                      >
                        Duplicate
                      </button>
                      
                      {p.id !== 'p1' && (
                        <button
                          type="button"
                          disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Delete the prompt option "${p.name}"?`)) {
                              try {
                                await deleteDoc(doc(db, 'chatbot_prompts', p.id));
                                if (selectedPromptId === p.id) {
                                  setSelectedPromptId('p1');
                                  const fallbackPrompt = promptList.find(o => o.id === 'p1') || promptList[0];
                                  setWidgetConfig({ ...widgetConfig, systemPrompt: fallbackPrompt.prompt });
                                }
                                alert(`Deleted custom preset "${p.name}" successfully!`);
                              } catch (err: any) {
                                alert("Failed to delete: " + err.message);
                              }
                            }
                          }}
                          className={`text-[9px] hover:underline font-bold ${selectedPromptId === p.id ? 'text-red-200 hover:text-red-100' : 'text-red-600'}`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CODE TEXT EDITOR WORKSPACE */}
            <div className="space-y-1.55">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">System instruction Prompt Editor</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const currentP = promptList.find(p => p.id === selectedPromptId);
                      if (!currentP) {
                        alert("Select a registered prompt block first.");
                        return;
                      }
                      const updated = {
                        ...currentP,
                        prompt: widgetConfig.systemPrompt
                      };
                      try {
                        await setDoc(doc(db, 'chatbot_prompts', selectedPromptId), updated);
                        alert(`Successfully updated database registered template "${currentP.name}" with your text area contents!`);
                      } catch (err: any) {
                        alert("Failed to modify: " + err.message);
                      }
                    }}
                    className="text-[10px] font-bold text-emerald-600 hover:underline font-mono cursor-pointer"
                  >
                    [Save Changes to Active Preset]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWidgetConfig((prev: any) => ({
                        ...prev,
                        systemPrompt: `You are Dvarix Assistant, customer-facing virtual assistant of Dvarix Realty.`
                      }));
                      alert("Reset active instructions area back to basic default.");
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    [Clear to Minimal]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const restoredText = `You are Dvarix Assistant, the customer-facing virtual assistant of Dvarix Realty.

Your role is to understand customer property requirements and qualify leads for the Dvarix team.
Your objectives are:
1. Identify customer intent: Buy, Rent, Sell, Invest
2. Collect relevant details naturally.
3. Ask only one question at a time.
4. Avoid requesting contact information immediately.
5. Collect contact information only after understanding the customer's requirements.
6. Be friendly, professional, and conversational.
7. Never provide legal advice or financial guarantees.
8. Summarize customer requirements before ending the conversation.
9. Transfer qualified leads into CRM.`;
                      setWidgetConfig((prev: any) => ({ ...prev, systemPrompt: restoredText }));
                      alert("Restored default Dvarix system prompt constraints block!");
                    }}
                    className="text-[10px] font-bold text-indigo-700 hover:underline font-mono cursor-pointer"
                  >
                    [Restore Default Dvarix Prompt]
                  </button>
                </div>
              </div>

              <textarea
                value={widgetConfig.systemPrompt}
                disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, systemPrompt: e.target.value })}
                className="w-full border border-slate-200 p-3 rounded-xl bg-slate-900 text-indigo-200 text-xs h-60 font-mono leading-relaxed focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950 disabled:text-slate-500 focus:outline-none"
                placeholder="Initialize AI instructions prompt templates here..."
              />
            </div>
          </div>

          {/* SECTION 5: DVARIX REALTY BUSINESS RULES */}
          <div id="sec-5" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm relative">
            {isFieldReadOnly('identity') && (
              <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2 py-0.5 text-[10px] font-mono">
                <span>🔒 Read-Only</span>
              </div>
            )}
            
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-slate-450 block">SECTION 5</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                🛑 Dvarix Realty Business Compliance Rules
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">Configure guardrail constraints mapped directly into conversational triggers & reasoning pathways.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'askIntentFirst', label: 'Ask customer intent first (Buy/Rent/Sell)', desc: 'Bot starts by categorizing the lead tier.' },
                { key: 'avoidEarlyPhone', label: 'Avoid requesting phone numbers immediately', desc: 'Prioritizes interest discovery before locking contact parameters.' },
                { key: 'transferToCRM', label: 'Automatically sync qualified leads to CRM', desc: 'Triggers live background transfers.' },
                { key: 'neverLegalGuarantees', label: 'Never provide legal guarantees', desc: 'Intercepts potential compliance liabilities dynamically.' },
                { key: 'neverInvestmentReturns', label: 'Never promise specific investment returns', desc: 'Restricts AI predictions to general historical vectors.' },
                { key: 'recommendSiteVisits', label: 'Proactively recommend site physical visits', desc: 'Hooks Devanahalli villa layouts site schedule.' },
                { key: 'prioritizeUnderstanding', label: 'Prioritize structural understanding over simple forms', desc: 'Allows conversational requirement context processing.' },
                { key: 'offerServicesNaturally', label: 'Offer supplemental Dvarix services naturally', desc: 'Mentions legal pre-clearance and architectural customization in conversational flow.' }
              ].map((rule) => {
                const currentRulesObj = widgetConfig.businessRules || {};
                const isChecked = !!currentRulesObj[rule.key];
                
                return (
                  <div
                    key={rule.key}
                    className={`p-3.5 rounded-xl border flex gap-3 cursor-pointer select-none items-start transition ${isChecked ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50'}`}
                    onClick={() => {
                      if (isFieldReadOnly('identity') || !isPersonaEditing) return;
                      setWidgetConfig((prev: any) => ({
                        ...prev,
                        businessRules: {
                          ...currentRulesObj,
                          [rule.key]: !isChecked
                        }
                      }));
                    }}
                  >
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                        className="w-4 h-4 text-indigo-600 border-slate-350 focus:ring-indigo-500 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-805 tracking-tight block leading-tight">{rule.label}</span>
                      <span className="text-[10px] text-slate-400 leading-relaxed mt-0.5 block">{rule.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 6: CRM INTEGRATION SETTINGS */}
          <div id="sec-6" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm relative">
            {isFieldReadOnly('crm') && (
              <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2 py-0.5 text-[10px] font-mono">
                <span>🔒 Read-Only</span>
              </div>
            )}
            
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-indigo-500 block">SECTION 6</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                🔗 Lead CRM Integration Synchronization
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Control live operational integration pathways between conversations and lead processing engines.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'leadCreation', label: 'Dynamic Lead Record Creation', desc: 'Build lead cards instantly on metadata capture.' },
                { key: 'requirementSync', label: 'Live Property Requirement Synchronization', desc: 'Instantly map target budget, layouts, and size parameters.' },
                { key: 'customerSync', label: 'Automatic Customer Metadata Matching', desc: 'Sync names, device details, and browser contexts.' },
                { key: 'siteVisitSync', label: 'Site Visit Schedule Synchronization', desc: 'Connect calendar appointments directly.' },
                { key: 'autoLeadQualification', label: 'Automatic AI Lead Qualification Scoring', desc: 'Rank and tier inbound records using conversational quality metrics.' },
                { key: 'autoAssignment', label: 'Intelligent Assignment Distribution', desc: 'Automatically hand off leads to available field advisors.' }
              ].map((crmRule) => {
                const currentCrmObj = widgetConfig.crmSettings || {};
                const isChecked = !!currentCrmObj[crmRule.key];
                
                return (
                  <div
                    key={crmRule.key}
                    className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer select-none transition ${isChecked ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-150'}`}
                    onClick={() => {
                      if (isFieldReadOnly('crm') || !isPersonaEditing) return;
                      setWidgetConfig((prev: any) => ({
                        ...prev,
                        crmSettings: {
                          ...currentCrmObj,
                          [crmRule.key]: !isChecked
                        }
                      }));
                    }}
                  >
                    <div className="flex-1 text-left mr-4">
                      <span className="text-xs font-bold text-slate-800 block">{crmRule.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">{crmRule.desc}</span>
                    </div>
                    <div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${isChecked ? 'bg-green-100 text-green-700' : 'bg-slate-205 text-slate-600'}`}>
                        {isChecked ? 'Active ON' : 'Disabled OFF'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 7: KNOWLEDGE SOURCE SETTINGS */}
          <div id="sec-7" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm relative">
            {isFieldReadOnly('knowledge') && (
              <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2 py-0.5 text-[10px] font-mono">
                <span>🔒 Read-Only</span>
              </div>
            )}
            
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-slate-455 block">SECTION 7</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                📚 Active Knowledge Base Grounding Sources
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Control dynamic vector database connections feeding RAG context directly into Gemini.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'websiteListings', label: 'Website Listings', desc: 'Live public portal' },
                { key: 'knowledgeVault', label: 'Knowledge Vault', desc: 'RERA clearances etc' },
                { key: 'manualQA', label: 'Manual Q&A Bank', desc: 'Direct FAQ responses' },
                { key: 'documentLearning', label: 'Document Learning', desc: 'PDF uploads' },
                { key: 'aiNotes', label: 'Internal AI Guidelines', desc: 'Custom metadata notes' },
                { key: 'propertyDatabase', label: 'Villa Layout Db', desc: 'Devanahalli plots' },
                { key: 'faqDatabase', label: 'Dynamic FAQ Db', desc: 'Inbound queries mapping' },
                { key: 'websitePages', label: 'Website Pages', desc: 'General static details' }
              ].map((src) => {
                const currentKnowledgeObj = widgetConfig.knowledgeSources || {};
                const isChecked = !!currentKnowledgeObj[src.key];
                
                return (
                  <div
                    key={src.key}
                    onClick={() => {
                      if (isFieldReadOnly('knowledge') || !isPersonaEditing) return;
                      setWidgetConfig((prev: any) => ({
                        ...prev,
                        knowledgeSources: {
                          ...currentKnowledgeObj,
                          [src.key]: !isChecked
                        }
                      }));
                    }}
                    className={`p-3 border rounded-xl text-left cursor-pointer transition select-none flex flex-col justify-between ${isChecked ? 'bg-indigo-50 border-indigo-200 text-slate-800' : 'bg-slate-50 border-slate-205 text-slate-500'}`}
                  >
                    <div className="space-y-1">
                      <strong className="text-xs block tracking-tight line-clamp-1">{src.label}</strong>
                      <span className="text-[9px] text-slate-400 font-sans block leading-none">{src.desc}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">RAG Connector</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${isChecked ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 8: AI BEHAVIOR SETTINGS */}
          <div id="sec-8" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm relative">
            {isFieldReadOnly('identity') && (
              <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2 py-0.5 text-[10px] font-mono">
                <span>🔒 Read-Only</span>
              </div>
            )}
            
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-indigo-500 block">SECTION 8</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                🎛️ AI Engine Reasoning Parameters
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Adjust model prediction and strictness factors directly governing natural response dynamics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 bg-slate-50 p-3.5 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-mono text-[10px] text-slate-600 uppercase font-bold">
                  <span>Precision Temperature</span>
                  <span>{widgetConfig.temperature || 0.4}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  value={widgetConfig.temperature || 0.4}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, temperature: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2 focus:outline-none"
                />
                <p className="text-[9.5px] text-slate-400 leading-relaxed mt-1.5 font-sans">Lower temperatures force the model to yield highly structured compliance matching. Higher values allow warm conversations.</p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3.5 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-mono text-[10px] text-slate-600 uppercase font-bold">
                  <span>Creativity Index (Top P)</span>
                  <span>{widgetConfig.creativity || 0.7}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  value={widgetConfig.creativity || 0.7}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, creativity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2 focus:outline-none"
                />
                <p className="text-[9.5px] text-slate-400 leading-relaxed mt-1.5 font-sans">Increases structural elasticity of responses. Higher values enrich conversational language pairings.</p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3.5 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-mono text-[10px] text-slate-600 uppercase font-bold">
                  <span>Confidence Threshold</span>
                  <span>{(widgetConfig.confidenceThreshold || 0.75) * 100}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  value={widgetConfig.confidenceThreshold || 0.75}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, confidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2 focus:outline-none"
                />
                <p className="text-[9.5px] text-slate-400 leading-relaxed mt-1.5 font-sans">Minimum qualifying probability before responding with specific physical land values. Else fallback text activates.</p>
              </div>

              <div className="space-y-1 bg-slate-50 p-3.5 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-mono text-[10px] text-slate-600 uppercase font-bold">
                  <span>Context Memory Depth</span>
                  <span>{widgetConfig.memoryDepth || 10} prompts</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="2"
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  value={widgetConfig.memoryDepth || 10}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, memoryDepth: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-205 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2 focus:outline-none"
                />
                <p className="text-[9.5px] text-slate-400 leading-relaxed mt-1.5 font-sans">Number of preceding interactive message cycles processed inside Gemini query contexts for ongoing thread continuity.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1 bg-slate-50 p-3 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-mono text-[9px] text-slate-550 uppercase font-bold">
                  <span>Lead strictness</span>
                  <span>{widgetConfig.leadQualificationStrictness || 0.8}</span>
                </div>
                <input
                  type="range" min="0.1" max="1.0" step="0.1"
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  value={widgetConfig.leadQualificationStrictness || 0.8}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, leadQualificationStrictness: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer mt-1 focus:outline-none"
                />
              </div>

              <div className="space-y-1 bg-slate-50 p-3 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-mono text-[9px] text-slate-550 uppercase font-bold">
                  <span>Recommendation Aggressiveness</span>
                  <span>{widgetConfig.recommendationAggressiveness || 0.6}</span>
                </div>
                <input
                  type="range" min="0.1" max="1.0" step="0.1"
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  value={widgetConfig.recommendationAggressiveness || 0.6}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, recommendationAggressiveness: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer mt-1 focus:outline-none"
                />
              </div>

              <div className="space-y-1 bg-slate-50 p-3 border border-slate-150 rounded-xl">
                <div className="flex justify-between font-mono text-[9px] text-slate-550 uppercase font-bold">
                  <span>Follow-up Frequency</span>
                  <span>{widgetConfig.followUpSuggestionFrequency || 0.5}</span>
                </div>
                <input
                  type="range" min="0.1" max="1.0" step="0.1"
                  disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                  value={widgetConfig.followUpSuggestionFrequency || 0.5}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, followUpSuggestionFrequency: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer mt-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 9: RESTRICTED TOPICS */}
          <div id="sec-9" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm relative">
            {isFieldReadOnly('identity') && (
              <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2 py-0.5 text-[10px] font-mono">
                <span>🔒 Read-Only</span>
              </div>
            )}
            
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-slate-450 block">SECTION 9</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                🚫 Restricted Topics & Blacklist Parameters
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Define subject categories the chatbot is strictly barred from commenting on or analyzing.</p>
            </div>

            {/* Topic input workflow */}
            <div className="flex gap-2.5">
              <input
                type="text"
                value={restrictedTopicInput}
                disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                onChange={(e) => setRestrictedTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!restrictedTopicInput.trim()) return;
                    if (isFieldReadOnly('identity') || !isPersonaEditing) return;
                    const currentList = widgetConfig.restrictedTopicsList || [];
                    setWidgetConfig({
                      ...widgetConfig,
                      restrictedTopicsList: [...currentList, restrictedTopicInput.trim()],
                      restrictedTopics: [...currentList, restrictedTopicInput.trim()].join(', ')
                    });
                    setRestrictedTopicInput('');
                  }
                }}
                className="flex-1 border border-slate-200 px-3 py-2 text-xs rounded-xl bg-white focus:outline-indigo-500 disabled:bg-slate-50 focus:ring-1 focus:ring-indigo-500"
                placeholder="Type restricted topic (e.g. Rival prices, cryptocurrency, medical guarantees) and press Enter or Add..."
              />
              <button
                type="button"
                disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                onClick={() => {
                  if (!restrictedTopicInput.trim()) return;
                  if (isFieldReadOnly('identity') || !isPersonaEditing) return;
                  const currentList = widgetConfig.restrictedTopicsList || [];
                  setWidgetConfig({
                    ...widgetConfig,
                    restrictedTopicsList: [...currentList, restrictedTopicInput.trim()],
                    restrictedTopics: [...currentList, restrictedTopicInput.trim()].join(', ')
                  });
                  setRestrictedTopicInput('');
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Add Topic
              </button>
            </div>

            {/* Interactive pill list */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(widgetConfig.restrictedTopicsList || ['Legal Guarantees', 'Competitor Comparison', 'Cryptocurrency Payments', 'Medical Advice', 'Investment Promises']).map((topic: string, index: number) => (
                <div
                  key={index}
                  className="bg-rose-50 border border-rose-200 rounded-full px-3 py-1 text-xs flex items-center gap-1.5 text-rose-800 font-semibold"
                >
                  <span>🚫 {topic}</span>
                  <button
                    type="button"
                    disabled={isFieldReadOnly('identity') || !isPersonaEditing}
                    onClick={() => {
                      if (isFieldReadOnly('identity') || !isPersonaEditing) return;
                      const originalList = widgetConfig.restrictedTopicsList || ['Legal Guarantees', 'Competitor Comparison', 'Cryptocurrency Payments', 'Medical Advice', 'Investment Promises'];
                      const nextList = originalList.filter((item: string) => item !== topic);
                      setWidgetConfig({
                        ...widgetConfig,
                        restrictedTopicsList: nextList,
                        restrictedTopics: nextList.join(', ')
                      });
                    }}
                    className="text-rose-450 hover:text-rose-800 text-[10.5px] font-bold h-3 w-3 leading-none rounded-full flex items-center justify-center cursor-pointer ml-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 10: PERSONALITY TEST LAB (Simulator Arena) */}
          <div id="sec-10" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm">
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-indigo-500 block">SECTION 10</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                🔬 Personality Simulation Test Lab
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Simulate actual prompts and business guidelines live before deploying parameters publicly.</p>
            </div>

            {/* Shortcut triggers */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">Fast-test customer query shortcuts:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Can I pay with Bitcoin for a Devanahalli plot?",
                  "Do you provide a written legal guarantee of 25% annual appreciation returns?",
                  "I don't want to leave my phone, just send layouts.",
                  "What layouts do you recommend for investment?",
                ].map((shortcutText) => (
                  <button
                    key={shortcutText}
                    type="button"
                    onClick={() => setSimulationQuestion(shortcutText)}
                    className="text-[10px] text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/50 border border-indigo-100 px-2.5 py-1.5 rounded-lg text-left line-clamp-1 max-w-xs transition font-sans cursor-pointer"
                  >
                    "{shortcutText}"
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Simulated Query Question</label>
              <textarea
                value={simulationQuestion}
                onChange={(e) => setSimulationQuestion(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs h-16 resize-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed text-slate-705 focus:outline-none"
                placeholder="Type question to test active agent rules in real-time..."
              />
            </div>

            {/* Simulation Controls Row */}
            <div className="flex gap-2 flex-wrap items-center">
              <button
                type="button"
                onClick={simulateChatbotResponse}
                disabled={isSimulatingTest || !simulationQuestion.trim()}
                className="bg-indigo-600 hover:bg-indigo-705 text-white font-black text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSimulatingTest ? (
                  <>
                    <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    AI Thinking & Aligning Rules...
                  </>
                ) : (
                  '🧪 Execute Simulator Test'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCompareMode(!compareMode);
                  alert(compareMode ? "Deactivated draft vs published test comparison mode." : "Activated compare mode! The lab will display draft response side-by-side with compiled live configuration response.");
                }}
                className={`text-xs px-3.5 py-2 rounded-xl border font-bold transition cursor-pointer ${compareMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                {compareMode ? '⚡ Active: Draft vs Published Comparison' : 'Compare Draft vs Published'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSimulationQuestion('');
                  setSimulationResponse('');
                  setTestApproved(null);
                }}
                className="text-xs bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl cursor-pointer"
              >
                Reset Test workspace
              </button>
            </div>

            {/* SIMULATION ANSWERS RESULT CONTAINER */}
            {simulationResponse && (
              <div className="space-y-4 pt-1 animate-fadeIn">
                
                {/* Rule triggers */}
                {triggeredRules.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-left">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">⚠️ Triggered Compliance Guardrails:</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {triggeredRules.map((rule, ri) => (
                        <span key={ri} className="bg-amber-100 text-amber-900 border border-amber-300 text-[9.5px] font-semibold px-2 py-0.5 rounded font-mono">
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {appliedPrompt && (
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-left">
                    <details className="cursor-pointer">
                      <summary className="text-[10px] font-mono text-slate-600 block uppercase font-bold">Show Appended System Prompt Instructions</summary>
                      <pre className="text-[9px] text-slate-500 whitespace-pre-wrap leading-relaxed mt-2 p-2 bg-white border border-slate-100 rounded font-mono">
                        {appliedPrompt}
                      </pre>
                    </details>
                  </div>
                )}

                <div className={`grid gap-4 ${compareMode && publishedSimulationResponse ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  
                  {/* DRAFT RESPONSE COLUMN */}
                  <div className="bg-indigo-50/50 p-4 border border-indigo-150 rounded-xl space-y-2">
                    <span className="text-[9.5px] font-mono uppercase font-bold text-indigo-700 block flex items-center gap-1 font-extrabold pb-1 border-b border-indigo-100">
                      📝 ACTIVE DRAFT CONFIGURATION RESPONSE {compareMode && '(DRAFT)'}
                    </span>
                    <div className="bg-white p-3 border border-indigo-100 rounded-lg text-xs leading-relaxed text-slate-755 font-sans italic">
                      "{simulationResponse}"
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-400 leading-none">
                      * Generated incorporating tone "{widgetConfig.communicationTone || 'Warm'}" and {Object.values(widgetConfig.businessRules || {}).filter(Boolean).length} business policy guardrails.
                    </div>
                  </div>

                  {/* PUBLISHED LIVE RESPONSE COLUMN */}
                  {compareMode && publishedSimulationResponse && (
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2 text-left">
                      <span className="text-[9.5px] font-mono uppercase font-bold text-indigo-700 block font-extrabold pb-1 border-b border-slate-200">
                        🌐 PUBLISHED PRODUCTION RESPONSE (LIVE)
                      </span>
                      <div className="bg-white p-3 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-557 font-sans italic">
                        "{publishedSimulationResponse}"
                      </div>
                      <div className="text-[9.5px] font-mono text-slate-400 leading-none">
                        * Generated using baseline published specifications.
                      </div>
                    </div>
                  )}

                </div>

                {/* COMPLIANCE CERTIFICATION AND APP/REJ CONTROLS */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[8.5px] font-mono uppercase bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded font-bold tracking-wider">Verification Pipeline</span>
                    <p className="text-xs text-slate-300 mt-1 font-sans">
                      Certify simulator feedback compliance. Does the generated reasoning align with rules?
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTestApproved(true);
                        alert("Simulation test certified APPROVED! Workspace draft alignment validated.");
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition cursor-pointer ${testApproved === true ? 'bg-green-600 border-green-700 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                    >
                      ✓ Approve & Certify Draft
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setTestApproved(false);
                        alert("Draft output flagged REJECTED. Returning focus to Prompt Manager.");
                        const el = document.getElementById('sec-4');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition cursor-pointer ${testApproved === false ? 'bg-red-600 border-red-700 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-705'}`}
                    >
                      ✕ Reject & Flag Output
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 11: VERSION CONTROL */}
          <div id="sec-11" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono uppercase font-bold text-slate-450 block">SECTION 11</span>
                <h3 className="text-xs font-bold font-mono uppercase text-slate-850 tracking-wider flex items-center gap-1.5">
                  ⏳ Chatbot Personality Version History Control
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Maintain compliance logs of all historical setups. Published editions are immutable.</p>
              </div>
            </div>

            {/* Versions log table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[9px] uppercase font-bold tracking-wider">
                    <th className="p-3">Ver No.</th>
                    <th className="p-3">Created Date</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Summary of Changes</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {versionList.map((ver, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-slate-800 font-mono">{ver.version}</td>
                      <td className="p-3 text-slate-500 font-mono">{ver.createdDate}</td>
                      <td className="p-3 text-slate-600 font-semibold">{ver.createdBy}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-extrabold font-mono uppercase ${ver.status === 'Published' ? 'bg-green-100 text-green-700 font-extrabold' : 'bg-amber-100 text-amber-700 font-extrabold'}`}>
                          {ver.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 leading-normal max-w-sm font-sans truncate" title={ver.summary}>
                        {ver.summary}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVersionForView(ver)}
                          className="text-[10px] text-indigo-700 font-extrabold hover:underline cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          disabled={isFieldReadOnly('identity')}
                          onClick={() => {
                            if (isFieldReadOnly('identity')) {
                              alert("🔒 Permission Denied.");
                              return;
                            }
                            if (confirm(`Do you want to restore the historical parameters of version ${ver.version}? This will overwrite your draft workspace.`)) {
                              setWidgetConfig((prev: any) => ({
                                ...prev,
                                botName: ver.version === 'v2.1' ? 'Dvarix Assistant Baseline' : 'Dvarix Assistant',
                                publishedDate: ver.createdDate,
                                publishedBy: ver.createdBy
                              }));
                              alert(`Successfully restored configuration parameters from version ${ver.version}!`);
                            }
                          }}
                          className="text-[10px] font-extrabold hover:underline disabled:opacity-30 cursor-pointer text-emerald-700"
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          disabled={isFieldReadOnly('identity')}
                          onClick={() => {
                            if (isFieldReadOnly('identity')) {
                              alert("🔒 Permission Denied.");
                              return;
                            }
                            const confirmAction = confirm(`Duplicate ${ver.version} parameters into a new draft configuration?`);
                            if (confirmAction) {
                              alert("Version duplicated successfully in prompt parameters pool!");
                            }
                          }}
                          className="text-[10px] text-indigo-500 font-extrabold hover:underline cursor-pointer"
                        >
                          Duplicate
                        </button>
                        {ver.status === 'Draft' ? (
                          <button
                            type="button"
                            disabled={isFieldReadOnly('identity')}
                            onClick={() => {
                              if (isFieldReadOnly('identity')) {
                                alert("🔒 Permission Denied.");
                                return;
                              }
                              if (confirm(`Are you sure you want to permanently delete draft version ${ver.version}?`)) {
                                setVersionList(versionList.filter(v => v.version !== ver.version));
                              }
                            }}
                            className="text-[10px] text-rose-600 font-extrabold hover:underline cursor-pointer"
                          >
                            Delete Draft
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-350 cursor-not-allowed font-semibold uppercase" title="Published immutable versions cannot be deleted.">
                            🔒 Published Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 12: ROLE ACCESS (PERMISSIONS MATRIX SYSTEM) */}
          <div id="sec-12" className="bg-white p-5 border border-slate-200 rounded-xl space-y-4 text-left shadow-sm">
            <div>
              <span className="text-[9px] font-mono uppercase font-bold text-indigo-500 block">SECTION 12</span>
              <h3 className="text-xs font-bold font-mono uppercase text-slate-805 tracking-wider flex items-center gap-1.5">
                🛡️ Multi-role Permission Governance Matrix
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Summary of user access roles mapped natively against AI configuration submodules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { role: 'Super Admin', desc: 'Unrestricted, complete reading and deployment rules writing access.', perms: ['✓ Brand & Prompt Config', '✓ AI Sliders & Temperature', '✓ Knowledge Toggles', '✓ CRM Overrides', '✓ Simulator Deployment'] },
                { role: 'CRM Manager', desc: 'Authorized to review leads maps but locked completely from AI and prompt writes.', perms: ['✓ Simulator Preview', '🔒 Prompt Config Locked', '🔒 AI Parameters Read-Only'] },
                { role: 'Bot Manager', desc: 'Authorized for copywriting, prompts adjustments and layout settings editing.', perms: ['✓ Brand & Prompt Config', '✓ AI Sliders Editing', '🔒 Knowledge Toggles Locked', '🔒 CRM Settings Locked'] },
                { role: 'Knowledge Manager', desc: 'Limited write scope focused purely on vectors grounding listings updates.', perms: ['✓ Knowledge Toggles Editing', '🔒 Prompt Config Locked', '🔒 AI Sliders Read-Only'] },
                { role: 'Marketing Team', desc: 'General preview access, with dynamic query testing rights inside the test lab.', perms: ['✓ Simulator Preview', '🔒 Read-Only Workspace'] }
              ].map((m) => (
                <div
                  key={m.role}
                  className={`p-4 border rounded-xl space-y-2 text-left transition ${currentRole === m.role ? 'bg-indigo-50/50 border-indigo-200 scale-102 ring-1 ring-indigo-500/20' : 'bg-slate-50 border-slate-150'}`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-mono uppercase tracking-wider text-slate-800">{m.role}</strong>
                    {currentRole === m.role && (
                      <span className="bg-indigo-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                        Your Active Role
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-sans">{m.desc}</p>
                  
                  <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-150">
                    {m.perms.map((p, idx) => (
                      <span
                        key={idx}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase tracking-tight ${p.startsWith('✓') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL / BOTTOM SLIDEPREVIEW DRAWER FOR CHATBOT SNAPSHOT PREVIEW */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-slideUp text-left">
            <div className="bg-indigo-650 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={widgetConfig.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-white/20 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-tight">{widgetConfig.botName}</h4>
                  <span className="text-[9px] text-indigo-200 block font-mono">● Online</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-white/80 hover:text-white font-mono text-xs p-1 cursor-pointer"
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="p-4 bg-slate-50 space-y-3 min-h-[220px] max-h-96 overflow-y-auto">
              <div className="flex items-start gap-2 max-w-[85%] text-[11px] leading-relaxed text-slate-705 bg-white p-3 rounded-2xl border border-slate-150">
                {widgetConfig.introMessage || 'Hello! Welcome to Dvarix Realty.'}
              </div>

              <div className="text-[9px] text-slate-400 font-mono text-center pt-2 select-none uppercase font-bold tracking-wider">
                * Simulated Mobile widget layout preview *
              </div>
            </div>

            <div className="p-3 border-t bg-white flex gap-1.5 items-center">
              <input
                type="text"
                readOnly
                className="flex-1 border text-[11px] rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-400 outline-none"
                placeholder="Type inquiry (Read-only preview matrix)..."
              />
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WINDOW FOR DETAILED VERSION VIEWER */}
      {selectedVersionForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 text-left shadow-2xl relative">
            <button
              onClick={() => setSelectedVersionForView(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 font-mono text-sm cursor-pointer"
            >
              ✕ Close
            </button>
            
            <div className="space-y-4">
              <div className="border-b border-slate-150 pb-3">
                <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-wider">Historical Audit Record</span>
                <h4 className="text-sm font-black text-slate-800 uppercase font-mono mt-0.5">
                  Version Specifications {selectedVersionForView.version}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Operator author</span>
                  <strong>{selectedVersionForView.createdBy}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Commit date</span>
                  <strong>{selectedVersionForView.createdDate}</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Changes Summary:</span>
                <p className="bg-slate-50 border p-3 rounded-lg text-slate-600 leading-relaxed italic border-slate-200 animate-fadeIn">
                  "{selectedVersionForView.summary}"
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Backup Prompt Parameters:</span>
                <pre className="bg-slate-900 text-indigo-200 p-3 rounded-lg text-[10px] overflow-auto max-h-40 leading-normal font-mono">
                  {`You are Dvarix Assistant, expert real estate assistant of Dvarix Realty.\nTone communication alignment: Warm.\nCompliance Rules: Under no circumstances offer cryptocurrency or investment return promises.\nSite visit redirection triggered.`}
                </pre>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVersionForView(null)}
                  className="bg-slate-55 hover:bg-slate-100 border text-slate-700 text-xs px-4 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  Dismiss
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Do you want to restore specifications of version ${selectedVersionForView.version}? This will overwrite active workspaces.`)) {
                      setWidgetConfig((prev: any) => ({
                        ...prev,
                        publishedDate: selectedVersionForView.createdDate,
                        publishedBy: selectedVersionForView.createdBy
                      }));
                      setSelectedVersionForView(null);
                      alert("Parameters restored active!");
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  Restore Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
