import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, ShieldAlert, Award, Phone, Mail, KeyRound, Ban, 
  Trash2, UserCheck, MessageCircle, Settings, Edit, BadgePercent, MapPin, 
  ChevronRight, Calendar, Clock, BarChart3, Database, Save, Activity
} from 'lucide-react';
import { Agent, Property, CRMLead } from '../types';

interface SaaSForceModuleProps {
  agents: Agent[];
  setAgents?: (newAgents: Agent[]) => void;
  properties: Property[];
  leads: CRMLead[];
  isSuperAdmin: boolean;
}

export interface CustomRole {
  name: string;
  description: string;
  permissions: {
    Leads: boolean;
    Properties: boolean;
    Customers: boolean;
    SiteVisits: boolean;
    Documents: boolean;
    Finance: boolean;
    Marketing: boolean;
    Reports: boolean;
    AICenter: boolean;
    Settings: boolean;
  };
}

export interface CRMWorkforceLog {
  id: string;
  agentId?: string;
  agentName: string;
  action: string;
  timestamp: string;
}

export default function SaaSForceModule({
  agents,
  setAgents,
  properties,
  leads,
  isSuperAdmin
}: SaaSForceModuleProps) {
  
  // Tabs Inner Navigate
  type ActiveTabEl = 'Roster' | 'Roles & Permissions' | 'Performance & Commissions' | 'Workforce Logs' | 'Register Agent';
  const [activeTab, setActiveTab] = useState<ActiveTabEl>('Roster');
  
  // Local active agents roster with logins status and commission factors
  const [localAgents, setLocalAgents] = useState<any[]>(() => agents.map((a, idx) => ({
    ...a,
    status: idx === 2 ? 'Suspended' : 'Active', // Mock seed some suspended
    commissionRate: idx === 0 ? 5.5 : idx === 1 ? 4.0 : 3.5, // %
    totalLeads: idx === 0 ? 14 : idx === 1 ? 8 : 4,
    closedDeals: idx === 0 ? 5 : idx === 1 ? 2 : 0,
    attendance: idx === 0 ? 'Present' : idx === 1 ? 'On Field' : 'Absent',
    password: 'securepass123',
    listingsAssigned: idx === 0 ? ['Prestige Heights', 'Silicon Valley Office'] : idx === 1 ? ['Crestwood Modernist Villa'] : []
  })));

  // Custom roles checklist state
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([
    {
      name: 'Super Admin',
      description: 'System root supervisor holding final compliance keys.',
      permissions: { Leads: true, Properties: true, Customers: true, SiteVisits: true, Documents: true, Finance: true, Marketing: true, Reports: true, AICenter: true, Settings: true }
    },
    {
      name: 'Senior Advisor',
      description: 'Executive consultant matching luxury villa deals.',
      permissions: { Leads: true, Properties: true, Customers: true, SiteVisits: true, Documents: true, Finance: false, Marketing: true, Reports: true, AICenter: true, Settings: false }
    },
    {
      name: 'Verification Officer',
      description: 'Liaison validating Khata and Sale Deeds clearances.',
      permissions: { Leads: false, Properties: true, Customers: true, SiteVisits: false, Documents: true, Finance: false, Marketing: false, Reports: true, AICenter: false, Settings: false }
    },
    {
      name: 'Field Scout',
      description: 'On-duty agent showing property plots and sites.',
      permissions: { Leads: true, Properties: false, Customers: false, SiteVisits: true, Documents: false, Finance: false, Marketing: false, Reports: false, AICenter: false, Settings: false }
    }
  ]);

  // Workforce chronological audit trails
  const [forceLogs, setForceLogs] = useState<CRMWorkforceLog[]>([
    { id: 'FL-1', agentName: 'Dvarix Super Admin', action: 'Created Custom Role: Verification Officer', timestamp: '05-Jun-2026 09:30 AM' },
    { id: 'FL-2', agentName: 'Dvarix Super Admin', action: 'Assigned Property "Silicon Smart Office" to Priya Sharma', timestamp: '05-Jun-2026 10:20 AM' },
    { id: 'FL-3', agentName: 'Dvarix Super Admin', action: 'Suspended login access for Anirudh Naidu', timestamp: '05-Jun-2026 11:15 AM' }
  ]);

  // New Agent Form States
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('Senior Advisor');
  const [newAgentAvatar, setNewAgentAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  const [newAgentRate, setNewAgentRate] = useState<number>(3.5);

  // New Role Form States
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [roleLeads, setRoleLeads] = useState(false);
  const [roleProps, setRoleProps] = useState(false);
  const [roleCusts, setRoleCusts] = useState(false);
  const [roleVisits, setRoleVisits] = useState(false);
  const [roleDocs, setRoleDocs] = useState(false);
  const [roleFinance, setRoleFinance] = useState(false);
  
  // Reassignments target state
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState<any | null>(null);
  const [leadToAssign, setLeadToAssign] = useState('');
  const [propToAssign, setPropToAssign] = useState('');

  // Password reset popup
  const [resettingPassAgentId, setResettingPassAgentId] = useState<string | null>(null);
  const [newPassStr, setNewPassStr] = useState('');

  // Actions
  const handleUpdateAgentsParent = (list: any[]) => {
    setLocalAgents(list);
    if (setAgents) {
      setAgents(list.map(a => ({
        id: a.id,
        name: a.name,
        role: a.role,
        avatar: a.avatar,
        phone: a.phone,
        email: a.email
      })));
    }
  };

  const handleRegisterAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName) return;

    const newId = 'agent-' + Date.now();
    const newAg = {
      id: newId,
      name: newAgentName,
      role: newAgentRole,
      avatar: newAgentAvatar,
      phone: newAgentPhone || '+91 6300984846',
      email: newAgentEmail || 'advisor@dvarix.com',
      status: 'Active',
      commissionRate: Number(newAgentRate),
      totalLeads: 0,
      closedDeals: 0,
      attendance: 'Present',
      password: 'initialpass321',
      listingsAssigned: []
    };

    const updatedList = [...localAgents, newAg];
    handleUpdateAgentsParent(updatedList);
    addLog(`Registered & Activated Advisor: ${newAgentName} as ${newAgentRole}`);

    // Reset Form
    setNewAgentName('');
    setNewAgentEmail('');
    setNewAgentPhone('');
    setNewAgentRate(3.5);
    setActiveTab('Roster');
  };

  const addLog = (actionStr: string) => {
    const time = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString();
    const newRecord = {
      id: 'FL-' + Date.now(),
      agentName: 'Super Admin',
      action: actionStr,
      timestamp: time
    };
    setForceLogs(prev => [newRecord, ...prev]);
  };

  const toggleAgentStatus = (id: string) => {
    const updated = localAgents.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Active' ? 'Suspended' : 'Active';
        addLog(`${nextStatus === 'Suspended' ? 'Suspended' : 'Actived'} logon credentials for ${a.name}`);
        return { ...a, status: nextStatus };
      }
      return a;
    });
    handleUpdateAgentsParent(updated);
  };

  const deleteAgent = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from key team registries? CRM matches assigned to them must be reallocated.`)) {
      const updated = localAgents.filter(a => a.id !== id);
      handleUpdateAgentsParent(updated);
      addLog(`Permanently removed agent card for ${name}`);
    }
  };

  const triggerCall = (name: string, phone: string) => {
    alert(`Connecting Dvarix VOIP Line to: ${name}\nDialing numbers: ${phone}`);
    addLog(`Initiated VOIP Dial Out call to ${name}`);
  };

  const triggerWhatsApp = (name: string, phone: string) => {
    const text = `Hello ${name}, this is Dvarix Admin. Please log into the CRM, we have high-importance verification tasks on pending plots.`;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank');
    addLog(`Dispatched Whatsapp template prompt to ${name}`);
  };

  const triggerEmail = (name: string, email: string) => {
    alert(`Composition Box opened for ${name} (${email}). Copying system secure portal credentials.`);
    addLog(`Composed email invitation to ${name}`);
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    const newRole: CustomRole = {
      name: newRoleName,
      description: newRoleDesc || 'Custom workspace workspace authorization permissions module.',
      permissions: {
        Leads: roleLeads,
        Properties: roleProps,
        Customers: roleCusts,
        SiteVisits: roleVisits,
        Documents: roleDocs,
        Finance: roleFinance,
        Marketing: false,
        Reports: true,
        AICenter: false,
        Settings: false
      }
    };

    setCustomRoles(prev => [...prev, newRole]);
    addLog(`Authorized Custom Authorization Role: ${newRoleName}`);
    
    // Reset
    setNewRoleName('');
    setNewRoleDesc('');
    setRoleLeads(false);
    setRoleProps(false);
    setRoleCusts(false);
    setRoleVisits(false);
    setRoleDocs(false);
    setRoleFinance(false);
  };

  const handleRoleToggle = (roleName: string, permKey: keyof CustomRole['permissions']) => {
    setCustomRoles(prev => prev.map(item => {
      if (item.name === roleName) {
        return {
          ...item,
          permissions: {
            ...item.permissions,
            [permKey]: !item.permissions[permKey]
          }
        };
      }
      return item;
    }));
    addLog(`Mutated permissions toggle configuration for Role Group: ${roleName}`);
  };

  const handleAssignmentConfirm = () => {
    if (!selectedAgentForAssign) return;
    
    setLocalAgents(prev => prev.map(a => {
      if (a.id === selectedAgentForAssign.id) {
        const matchesArr = [...a.listingsAssigned];
        if (propToAssign && !matchesArr.includes(propToAssign)) {
          matchesArr.push(propToAssign);
        }
        addLog(`Assigned Client/Property allocation to ${a.name} (${propToAssign || leadToAssign})`);
        return {
          ...a,
          listingsAssigned: matchesArr,
          totalLeads: leadToAssign ? a.totalLeads + 1 : a.totalLeads
        };
      }
      return a;
    }));

    setSelectedAgentForAssign(null);
    setPropToAssign('');
    setLeadToAssign('');
  };

  return (
    <div className="space-y-6 text-left" id="saa-workforce-module">
      
      {/* FORCE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" /> Executive CRM Workforce Roster
          </h2>
          <p className="text-xs text-slate-500">
            Configure dynamic credentials authorization, commission milestones, attendance logging, and lead allocations.
          </p>
        </div>

        {/* INNER TABS */}
        <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          {(['Roster', 'Register Agent', 'Roles & Permissions', 'Performance & Commissions', 'Workforce Logs'] as const).map((tab) => (
            <button
              key={tab}
              id={`force-tab-${tab.toLowerCase().replace(/\s+&+/g, '-').replace(/\s+/g, '-')}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === tab ? 'bg-white shadow-xs text-blue-600 font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE TAB: WORKFORCE ROSTER */}
      {activeTab === 'Roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {localAgents.map((ag) => (
            <div 
              key={ag.id} 
              className={`bg-white border p-5 rounded-2xl shadow-xs space-y-4 relative overflow-hidden transition duration-150 flex flex-col justify-between ${
                ag.status === 'Suspended' ? 'border-rose-150 bg-rose-50/5' : 'border-slate-200'
              }`}
            >
              {/* Suspended overlay badge */}
              {ag.status === 'Suspended' && (
                <div className="absolute top-2 right-2 bg-rose-100 text-rose-700 font-black font-mono text-[9px] px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                  SUSPENDED PORTAL LOGON
                </div>
              )}

              <div className="space-y-3">
                
                {/* ID Avatar and general info */}
                <div className="flex items-start gap-3">
                  <img src={ag.avatar} alt={ag.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{ag.name}</h4>
                    <span className="text-[10px] font-bold text-blue-600 block bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded-full w-max mt-0.5">
                      {ag.role}
                    </span>
                  </div>
                </div>

                {/* Specific stats */}
                <div className="grid grid-cols-3 gap-2 border-t border-b border-dashed border-slate-150 py-3 text-center text-[10px] font-semibold text-slate-500 font-mono">
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="block text-[8px] text-slate-400">Rate Share</span>
                    <span className="text-slate-900 font-bold text-xs">{ag.commissionRate}%</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="block text-[8px] text-slate-400">Total Leads</span>
                    <span className="text-blue-600 font-bold text-xs">{ag.totalLeads}</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded">
                    <span className="block text-[8px] text-slate-400">Attendance</span>
                    <span className={`font-bold block text-[10px] ${
                      ag.attendance === 'Present' ? 'text-emerald-600' :
                      ag.attendance === 'On Field' ? 'text-blue-600' : 'text-rose-500'
                    }`}>
                      {ag.attendance}
                    </span>
                  </div>
                </div>

                {/* Sub contacts */}
                <div className="space-y-1 font-mono text-[10px] text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" /> {ag.phone}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-slate-400" /> {ag.email}
                  </p>
                </div>

                {/* Linked portfolio items */}
                {ag.listingsAssigned.length > 0 && (
                  <div className="space-y-1 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-105">
                    <span className="font-bold text-slate-400 font-mono block uppercase">Assigned Listings Fleet:</span>
                    <div className="flex flex-wrap gap-1">
                      {ag.listingsAssigned.map((item: any, idx: number) => (
                        <span key={idx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] text-slate-600 block">
                          🏡 {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTON GRID PANEL */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-[10px]">
                
                {/* Unified VOIP messaging controls */}
                <div className="grid grid-cols-3 gap-1">
                  <button 
                    onClick={() => triggerCall(ag.name, ag.phone)}
                    className="py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-blue-600 text-slate-600 font-bold rounded-lg border border-slate-150 transition cursor-pointer"
                  >
                    Call
                  </button>
                  <button 
                    onClick={() => triggerWhatsApp(ag.name, ag.phone)}
                    className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-150 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="h-3 w-3 text-emerald-600" /> WhatsApp
                  </button>
                  <button 
                    onClick={() => triggerEmail(ag.name, ag.email)}
                    className="py-1.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-600 font-bold rounded-lg border border-slate-150 transition cursor-pointer"
                  >
                    Email
                  </button>
                </div>

                {/* Administration specific authorization actions */}
                <div className="flex flex-wrap gap-1.5 justify-between items-center pt-1.5">
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleAgentStatus(ag.id)}
                      className={`p-1 px-2 rounded font-bold border ${
                        ag.status === 'Active' 
                          ? 'bg-rose-50 text-rose-700 border-rose-150 hover:bg-rose-100' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100'
                      }`}
                      title="Deactivate or Reactivate secure portal access"
                    >
                      {ag.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>

                    <button 
                      onClick={() => {
                        setResettingPassAgentId(ag.id);
                        setNewPassStr('');
                      }}
                      className="p-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-semibold flex items-center gap-0.5"
                    >
                      <KeyRound className="h-3 w-3" /> Reset Pass
                    </button>

                    <button 
                      onClick={() => setSelectedAgentForAssign(ag)}
                      className="p-1 text-blue-600 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 rounded font-bold"
                    >
                      Assign Assets
                    </button>
                  </div>

                  <button 
                    onClick={() => deleteAgent(ag.id, ag.name)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                    title="Permanently remove card"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER ACTIVE TAB: REGISTER NEW AGENT FORM */}
      {activeTab === 'Register Agent' && (
        <form onSubmit={handleRegisterAgentSubmit} className="bg-white border border-slate-200 p-6 rounded-2xl max-w-xl mx-auto space-y-4 shadow-xs animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">Register Team Portfolio Advisor</h3>
            <p className="text-xs text-slate-400">Initialize official email address, phone, and standard split commission targets</p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-450 uppercase block">Advisor Full Name *</label>
                <input
                  type="text" required value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Vikram Hegde"
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-450 uppercase block">Assigned Custom Role *</label>
                <select
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs bg-white"
                >
                  {customRoles.map((role) => (
                    <option key={role.name} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-450 uppercase block">Official Email Address *</label>
                <input
                  type="email" required value={newAgentEmail}
                  onChange={(e) => setNewAgentEmail(e.target.value)}
                  placeholder="name@dvarix.com"
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-450 uppercase block">Primary Phone Coordinate *</label>
                <input
                  type="text" required value={newAgentPhone}
                  onChange={(e) => setNewAgentPhone(e.target.value)}
                  placeholder="+91 6300984846"
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-450 uppercase block">Commission Rate Split (%)</label>
                <input
                  type="number" step="0.1" min="0" max="10" value={newAgentRate}
                  onChange={(e) => setNewAgentRate(Number(e.target.value))}
                  placeholder="3.5"
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-450 uppercase block">Avatar Photo URL</label>
                <input
                  type="text" value={newAgentAvatar}
                  onChange={(e) => setNewAgentAvatar(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('Roster')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
            >
              Authorize Credentials & Create Card
            </button>
          </div>
        </form>
      )}

      {/* RENDER ACTIVE TAB: ROLE & PERMISSION MANAGEMENT */}
      {activeTab === 'Roles & Permissions' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in duration-200">
          
          {/* CRUISE LIST ROLES */}
          <div className="xl:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Fine-Grained Role Permissions Matrix</h3>
              <p className="text-slate-500 text-[11px]">Control access to core CRM modules for unlimited security clearance groups.</p>
            </div>

            <div className="space-y-4">
              {customRoles.map((role) => (
                <div key={role.name} className="p-4 border border-slate-150 rounded-xl bg-slate-55/10 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{role.name} Role</h4>
                      <p className="text-[11px] text-slate-500">{role.description}</p>
                    </div>
                  </div>

                  {/* Modules checklist toggle triggers */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-dashed border-slate-150">
                    {(Object.keys(role.permissions) as Array<keyof CustomRole['permissions']>).map((modKey) => {
                      const hasAccess = role.permissions[modKey];
                      return (
                        <div 
                          key={modKey}
                          onClick={() => handleRoleToggle(role.name, modKey)}
                          className={`p-2 border rounded-lg cursor-pointer transition text-center select-none ${
                            hasAccess 
                              ? 'border-emerald-500 bg-emerald-50/10 text-emerald-800 font-bold' 
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                          }`}
                        >
                          <span className="block text-[10px] tracking-tight truncate">{modKey}</span>
                          <span className="text-[9px] font-mono block mt-0.5">
                            {hasAccess ? '✓ Allow' : '✕ Denied'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CREATE CUSTOM ROLE BAR */}
          <div className="xl:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 text-xs text-slate-700">
            <h3 className="font-bold text-slate-800 text-sm">Add Custom Role Group</h3>
            <p className="text-slate-400 text-[11px]">Declare custom roles to suit localized compliance structures.</p>

            <form onSubmit={handleCreateCustomRole} className="space-y-3">
              <div className="space-y-0.5">
                <label className="font-black text-slate-400 uppercase text-[9px] block">Role Name *</label>
                <input
                  type="text" required value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Intern Surveyor"
                  className="w-full border border-slate-202 p-2 rounded text-xs text-slate-800"
                />
              </div>

              <div className="space-y-0.5">
                <label className="font-black text-slate-400 uppercase text-[9px] block">Description</label>
                <input
                  type="text" value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Scope parameters..."
                  className="w-full border border-slate-202 p-2 rounded text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-[9px] text-slate-450 uppercase block font-mono">Module Access Checklist</span>
                <div className="grid grid-cols-2 gap-2 mt-1.5 font-semibold text-[10px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roleLeads} onChange={(e) => setRoleLeads(e.target.checked)} className="rounded" />
                    Leads Access
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roleProps} onChange={(e) => setRoleProps(e.target.checked)} className="rounded" />
                    Properties List
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roleCusts} onChange={(e) => setRoleCusts(e.target.checked)} className="rounded" />
                    Customers
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roleVisits} onChange={(e) => setRoleVisits(e.target.checked)} className="rounded" />
                    Site Visits
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roleDocs} onChange={(e) => setRoleDocs(e.target.checked)} className="rounded" />
                    Docs Vault
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={roleFinance} onChange={(e) => setRoleFinance(e.target.checked)} className="rounded" />
                    Finance Ledgers
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold rounded cursor-pointer transition"
              >
                Create Security Role Group
              </button>
            </form>
          </div>

        </div>
      )}

      {/* RENDER ACTIVE TAB: PERFORMANCE & COMMISSION TRACKS */}
      {activeTab === 'Performance & Commissions' && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs animate-in fade-in duration-200 space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">Force Commission Ledger & Analytics</h3>
            <p className="text-slate-500 text-[11px]">Compare individual deal conversion points and performance rankings in real-time.</p>
          </div>

          {/* Leaderboard stats summary */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  <th className="p-3">Adviser</th>
                  <th className="p-3">Status Log</th>
                  <th className="p-3">Matched Pipeline</th>
                  <th className="p-3">Closed Contracts</th>
                  <th className="p-3 text-right">Commission Rate</th>
                  <th className="p-3 text-right">Simulated Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localAgents.map((ag) => {
                  const simulatedEarned = ag.closedDeals * 280000; // Mock calculation
                  return (
                    <tr key={ag.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 flex items-center gap-2">
                        <img src={ag.avatar} alt={ag.name} className="w-8 h-8 rounded-full object-cover border border-slate-250" referrerPolicy="no-referrer" />
                        <div>
                          <span className="font-extrabold text-slate-800 block">{ag.name}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">{ag.role}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold">
                        <span className={`text-[10px] uppercase font-bold py-0.5 px-2 rounded border ${
                          ag.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-110' : 'bg-rose-50 text-rose-700 border-rose-110'
                        }`}>
                          {ag.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{ag.totalLeads} Targets</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">🏆 {ag.closedDeals} Deals</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-650">{ag.commissionRate}%</td>
                      <td className="p-3 text-right font-mono font-black text-blue-700">₹ {simulatedEarned.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Attendance punching section */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-800 text-xs">Roster Attendance Control (Daily Duty Card)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {localAgents.map((ag) => (
                <div key={ag.id} className="bg-white border border-slate-150 p-3 rounded-xl flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block text-left truncate max-w-[100px]">{ag.name}</span>
                    <span className="text-[9px] text-slate-400 block text-left">Today: {ag.attendance}</span>
                  </div>
                  
                  {/* Punch status selector */}
                  <select
                    value={ag.attendance}
                    onChange={(e) => {
                      const updated = localAgents.map(x => x.id === ag.id ? { ...x, attendance: e.target.value } : x);
                      handleUpdateAgentsParent(updated);
                      addLog(`Updated attendance check in for ${ag.name} to "${e.target.value}"`);
                    }}
                    className="border border-slate-205 py-0.5 px-1.5 rounded text-[10px] text-slate-700 focus:outline-none"
                  >
                    <option value="Present">Present</option>
                    <option value="On Field">On Field</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">On Leave</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TAB: TEAM METRICS ACTION TIMELINE LOGS */}
      {activeTab === 'Workforce Logs' && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs animate-in fade-in duration-200 space-y-4 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">Team Roster Security Audit Log</h3>
            <p className="text-slate-500 text-[11px]">Real-time trail tracking administrator reallocations, password updates, or suspensions.</p>
          </div>

          <div className="space-y-2.5">
            {forceLogs.map((log) => (
              <div key={log.id} className="p-3 border border-slate-150 bg-slate-50/50 rounded-xl flex justify-between items-center text-[11px]">
                <div className="flex gap-2">
                  <Activity className="h-4.5 w-4.5 text-blue-500 shrink-0 self-center" />
                  <div>
                    <span className="font-bold text-slate-800 block">{log.action}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Triggered by: {log.agentName}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-450 font-mono text-right shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGNMENT MODAL POPUP */}
      {selectedAgentForAssign && (
        <div className="fixed inset-0 bg-slate-950/40 opacity-100 backdrop-blur-2xs flex items-center justify-center z-50 animate-in fade-in duration-150 text-xs">
          <div className="bg-white border border-slate-205 p-6 rounded-2xl max-w-sm w-full mx-4 space-y-4 text-left shadow-2xl">
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm">Assign Leads & Plots to Advisor</h4>
              <p className="text-[11px] text-slate-500">Provide direct property lists allocation for <strong>{selectedAgentForAssign.name}</strong>.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase block text-[9px]">Assign Active Property</label>
                <select
                  value={propToAssign}
                  onChange={(e) => setPropToAssign(e.target.value)}
                  className="w-full border border-slate-205 p-2 rounded bg-slate-50"
                >
                  <option value="">-- Choose Property --</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.title}>{p.title}</option>
                  ))}
                  <option value="Whitefield Green Meadows">Whitefield Green Meadows</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase block text-[9px]">Associate Client Lead Link</label>
                <select
                  value={leadToAssign}
                  onChange={(e) => setLeadToAssign(e.target.value)}
                  className="w-full border border-slate-205 p-2 rounded bg-slate-50"
                >
                  <option value="">-- Choose Customer --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.name}>{l.name} ({l.status})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button"
                onClick={() => setSelectedAgentForAssign(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleAssignmentConfirm}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
              >
                Confirm Allocation Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET POPUP */}
      {resettingPassAgentId && (
        <div className="fixed inset-0 bg-slate-950/40 opacity-100 backdrop-blur-2xs flex items-center justify-center z-50 animate-in fade-in duration-150 text-xs">
          <div className="bg-white border border-slate-255 p-6 rounded-2xl max-w-sm w-full mx-4 space-y-4 text-left shadow-2xl">
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-905 text-sm flex items-center gap-1.5">
                <KeyRound className="h-5 w-5 text-blue-600 shrink-0" /> Reset Password Credentials
              </h4>
              <p className="text-[11px] text-slate-500">Formulate fresh portal logon keys. Enter new security string below.</p>
            </div>

            <input
              type="text"
              value={newPassStr}
              onChange={(e) => setNewPassStr(e.target.value)}
              placeholder="e.g. freshsecurekey2026!"
              className="w-full border border-slate-200 p-2 text-xs rounded bg-slate-50"
            />

            <div className="flex gap-2 justify-end">
              <button 
                type="button"
                onClick={() => setResettingPassAgentId(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setLocalAgents(prev => prev.map(a => a.id === resettingPassAgentId ? { ...a, password: newPassStr || 'default123' } : a));
                  const name = localAgents.find(a => a.id === resettingPassAgentId)?.name || 'Agent';
                  addLog(`Reset portal security log password for ${name}`);
                  setResettingPassAgentId(null);
                  alert(`Portal security password has been changed for ${name}.`);
                }}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded"
              >
                Change Keys
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
