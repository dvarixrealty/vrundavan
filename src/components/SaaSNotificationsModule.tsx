import React, { useState } from 'react';
import { 
  Bell, Settings, Plus, Trash2, Archive, Shield, Filter, Search, 
  ToggleLeft, ToggleRight, Check, AlertTriangle, Eye, Mail, MessageSquare, 
  Smartphone, User, CheckCircle2, AlertCircle, Edit, Calendar, MapPin
} from 'lucide-react';
import { Agent } from '../types';

interface NotificationConfig {
  id: string;
  category: 'Leads' | 'Requirements' | 'Properties' | 'Site Visits' | 'Documents' | 'Finance' | 'Agents' | 'Tasks';
  types: { name: string; label: string; enabled: boolean }[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  department: string;
  agent?: string;
  customer?: string;
  sendToAll: boolean;
  delivery: ('Dashboard Only' | 'Email' | 'WhatsApp' | 'Browser Notification')[];
  status: 'Active' | 'Archived';
  createdAt: string;
  type: string;
  category: string;
}

interface SaaSNotificationsModuleProps {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  notificationToggles: Record<string, boolean>;
  setNotificationToggles: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  agents: Agent[];
  loggedInUser?: any;
}

export default function SaaSNotificationsModule({
  notifications,
  setNotifications,
  notificationToggles,
  setNotificationToggles,
  agents = [],
  loggedInUser
}: SaaSNotificationsModuleProps) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'configuration' | 'create'>('alerts');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Manual Notification Form State
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [formDepartment, setFormDepartment] = useState('Sales');
  const [formAgent, setFormAgent] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [formSendToAll, setFormSendToAll] = useState(false);
  const [formDelivery, setFormDelivery] = useState<string[]>(['Dashboard Only']);

  // Editing State
  const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);

  // Grouped Configuration Structure
  const notificationGroups: { title: string; category: NotificationConfig['category']; items: string[] }[] = [
    {
      title: 'Leads Notifications',
      category: 'Leads',
      items: ['New Lead Created', 'Lead Assigned', 'Lead Reassigned', 'Lead Status Changed', 'Lead Closed']
    },
    {
      title: 'Requirements CRM Notifications',
      category: 'Requirements',
      items: ['New Requirement Submitted', 'Requirement Updated', 'Requirement Matched', 'Requirement Closed']
    },
    {
      title: 'Properties Inventory Notifications',
      category: 'Properties',
      items: ['Property Added', 'Property Updated', 'Property Deleted']
    },
    {
      title: 'Site Walkthrough Notifications',
      category: 'Site Visits',
      items: ['Site Visit Scheduled', 'Site Visit Completed', 'Site Visit Cancelled']
    },
    {
      title: 'Documents & Deeds Notifications',
      category: 'Documents',
      items: ['Document Uploaded', 'Document Approved', 'Document Expired']
    },
    {
      title: 'Finance Ledger Notifications',
      category: 'Finance',
      items: ['Payment Received', 'Expense Added', 'Invoice Generated']
    },
    {
      title: 'Agents Team Notifications',
      category: 'Agents',
      items: ['Agent Added', 'Agent Updated', 'Agent Assigned Lead']
    },
    {
      title: 'Tasks & Operations Notifications',
      category: 'Tasks',
      items: ['New Task', 'Task Completed', 'Task Overdue']
    }
  ];

  const toggleNotificationType = (typeKey: string) => {
    setNotificationToggles(prev => ({
      ...prev,
      [typeKey]: !prev[typeKey]
    }));
  };

  const masterToggleAll = (val: boolean) => {
    const updated = { ...notificationToggles };
    Object.keys(updated).forEach(k => {
      updated[k] = val;
    });
    setNotificationToggles(updated);
  };

  const handleDeliveryCheckbox = (option: string) => {
    if (formDelivery.includes(option)) {
      setFormDelivery(formDelivery.filter(d => d !== option));
    } else {
      setFormDelivery([...formDelivery, option]);
    }
  };

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formMessage) return;

    if (editingNotification) {
      // Edit mode
      setNotifications(prev => prev.map(n => n.id === editingNotification.id ? {
        ...n,
        title: formTitle,
        message: formMessage,
        priority: formPriority,
        department: formDepartment,
        agent: formAgent || undefined,
        customer: formCustomer || undefined,
        sendToAll: formSendToAll,
        delivery: formDelivery as any,
        lastModified: new Date().toISOString()
      } : n));
      
      setEditingNotification(null);
      setActiveTab('alerts');
    } else {
      // Create mode
      const newItem: NotificationItem = {
        id: 'manual-' + Date.now(),
        title: formTitle,
        message: formMessage,
        priority: formPriority,
        department: formDepartment,
        agent: formAgent || undefined,
        customer: formCustomer || undefined,
        sendToAll: formSendToAll,
        delivery: formDelivery as any,
        status: 'Active',
        createdAt: new Date().toISOString(),
        type: 'Manual System Update',
        category: 'Manual'
      };

      setNotifications([newItem, ...notifications]);
      setActiveTab('alerts');
    }

    // Reset Form
    setFormTitle('');
    setFormMessage('');
    setFormPriority('Medium');
    setFormDepartment('Sales');
    setFormAgent('');
    setFormCustomer('');
    setFormSendToAll(false);
    setFormDelivery(['Dashboard Only']);
  };

  const handleEditClick = (noti: NotificationItem) => {
    setEditingNotification(noti);
    setFormTitle(noti.title);
    setFormMessage(noti.message);
    setFormPriority(noti.priority);
    setFormDepartment(noti.department);
    setFormAgent(noti.agent || '');
    setFormCustomer(noti.customer || '');
    setFormSendToAll(noti.sendToAll);
    setFormDelivery(noti.delivery);
    setActiveTab('create');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {
      ...n,
      status: n.status === 'Active' ? 'Archived' : 'Active'
    } : n));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to permanently delete all notifications?")) {
      setNotifications([]);
    }
  };

  const handleArchiveAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, status: 'Archived' })));
  };

  // Filter Notification Items
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (n.department && n.department.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPriority = priorityFilter === 'All' || n.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;

    return matchesSearch && matchesPriority && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left" id="notification-settings-control-center">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600 animate-pulse" /> Notification Center & Controls
          </h2>
          <p className="text-xs text-slate-500">
            Dvarix Realty system-wide notification dispatch node. Manage custom triggers and delivery endpoints.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200 self-start sm:self-center">
          <button
            onClick={() => { setActiveTab('alerts'); setEditingNotification(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'alerts' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Notifications Feed ({filteredNotifications.length})
          </button>
          <button
            onClick={() => { setActiveTab('configuration'); setEditingNotification(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'configuration' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Control Toggles
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'create' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {editingNotification ? 'Edit Node Notification' : '+ Create Notification'}
          </button>
        </div>
      </div>

      {/* VIEW PANEL 1: NOTIFICATION FEED */}
      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* SEARCH & FILTER BAR */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notification feed logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full border border-slate-200 p-2 text-xs rounded bg-white text-slate-900 outline-none"
              />
            </div>

            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-slate-200 p-2 text-xs rounded bg-white text-[#111827] font-semibold"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-slate-200 p-2 text-xs rounded bg-white text-[#111827] font-semibold"
              >
                <option value="All">All Categories</option>
                <option value="Leads">Leads CRM</option>
                <option value="Requirements">Requirements</option>
                <option value="Properties">Properties</option>
                <option value="Site Visits">Site Visits</option>
                <option value="Documents">Documents</option>
                <option value="Finance">Finance</option>
                <option value="Agents">Agents & Team</option>
                <option value="Tasks">Tasks & Operations</option>
                <option value="Manual">Manual Announcements</option>
              </select>
            </div>
          </div>

          {/* ACTIVE DISPATCH LIST */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-700 text-xs">DISPATCH CHRONOLOGY LIST</span>
              <div className="flex gap-2">
                <button
                  onClick={handleArchiveAll}
                  className="px-2.5 py-1 text-[10px] text-slate-650 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 font-bold"
                >
                  Archive Active Feed
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 text-[10px] text-red-650 bg-red-50 border border-red-200 rounded hover:bg-red-100 font-bold"
                >
                  Clear Feed Entirely
                </button>
              </div>
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-mono">
                ◄ No matching dispatch logs recorded in this node. Modify filter parameters or toggle ON automated rules.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredNotifications.map((noti) => (
                  <div 
                    key={noti.id} 
                    className={`p-3.5 border rounded-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      noti.status === 'Archived' 
                        ? 'bg-slate-50/70 border-slate-150 opacity-70' 
                        : noti.priority === 'Critical' 
                          ? 'bg-red-50/50 border-red-200' 
                          : noti.priority === 'High' 
                            ? 'bg-amber-50/30 border-amber-200' 
                            : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 md:max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        {noti.priority === 'Critical' && (
                          <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-extrabold bg-red-100 text-red-800 rounded">
                            Critical Alert
                          </span>
                        )}
                        {noti.priority === 'High' && (
                          <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-extrabold bg-amber-100 text-amber-800 rounded">
                            High Priority
                          </span>
                        )}
                        <span className="font-bold text-slate-800 text-xs">{noti.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold font-mono">
                          {noti.category}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 text-xs">{noti.message}</p>
                      
                      <div className="flex gap-4 text-[10px] text-slate-400 font-semibold items-center">
                        <span className="font-mono">{new Date(noti.createdAt).toLocaleDateString()} {new Date(noti.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {noti.department && <span>Dept: {noti.department}</span>}
                        {noti.agent && <span>Agent node: {noti.agent}</span>}
                        {noti.customer && <span>Client target: {noti.customer}</span>}
                        {noti.sendToAll && <span className="text-blue-600 font-bold">ALL STAKEHOLDERS TARGET</span>}
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {noti.delivery.map((d, id) => (
                          <span key={id} className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                            {d === 'Email' && <Mail className="h-2.5 w-2.5 text-blue-505" />}
                            {d === 'WhatsApp' && <MessageSquare className="h-2.5 w-2.5 text-emerald-505" />}
                            {d === 'Browser Notification' && <Smartphone className="h-2.5 w-2.5 text-violet-505" />}
                            {d === 'Dashboard Only' && <Eye className="h-2.5 w-2.5 text-sky-505" />}
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleToggleStatus(noti.id)}
                        className="p-1.5 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded"
                        title={noti.status === 'Active' ? "Archive" : "Activate"}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      
                      <button
                        onClick={() => handleEditClick(noti)}
                        className="p-1.5 border border-slate-200 text-blue-600 bg-white hover:bg-slate-100 rounded"
                        title="Edit entry"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteNotification(noti.id)}
                        className="p-1.5 border border-slate-200 text-red-650 bg-white hover:bg-red-50 rounded"
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW PANEL 2: NOTIFICATION TOGGLES (CONFIGURATION) */}
      {activeTab === 'configuration' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <span className="font-bold text-slate-800 text-sm block">AUTOMATIC CRM TRIGGERS CONTROL PANEL</span>
                <span className="text-[11px] text-slate-500 block">All system notifications are kept OFF by default. Opt-in strictly to configure automatic dispatches based on business flows.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => masterToggleAll(true)}
                  className="px-3 py-1.5 text-xs text-blue-750 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded font-bold"
                >
                  All ON
                </button>
                <button
                  onClick={() => masterToggleAll(false)}
                  className="px-3 py-1.5 text-xs text-slate-750 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded font-bold"
                >
                  All OFF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {notificationGroups.map((group, gIdx) => (
                <div key={gIdx} className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3 shadow-2xs">
                  <span className="font-bold text-slate-800 text-xs tracking-wide uppercase border-b border-slate-200 pb-1.5 block">
                    {group.title}
                  </span>

                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const isEnabled = !!notificationToggles[item];
                      return (
                        <div key={item} className="flex justify-between items-center text-xs">
                          <span className={`${isEnabled ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>{item}</span>
                          <button
                            onClick={() => toggleNotificationType(item)}
                            className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                          >
                            {isEnabled ? (
                              <ToggleRight className="h-6 w-6 text-emerald-500 stroke-[2.5]" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-slate-300 stroke-[2]" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW PANEL 3: MANUAL NOTIFICATION SYSTEM */}
      {activeTab === 'create' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs max-w-3xl animate-in fade-in duration-200">
          <span className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 block mb-4">
            {editingNotification ? 'EDIT MANUAL SIGNAL ANNOUNCEMENT' : 'CREATE MANUAL BROADCAST COORDINATE'}
          </span>

          <form onSubmit={handleCreateNotification} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-slate-605 uppercase font-bold text-[10px]">Notification Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Portfolio site visit assigned"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded text-slate-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-605 uppercase font-bold text-[10px]">Priority Clearance</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full border border-slate-200 p-2.5 rounded bg-white text-[#111827] font-semibold"
                >
                  <option value="Low">Low Clearance</option>
                  <option value="Medium">Medium Standard</option>
                  <option value="High">High Escalation</option>
                  <option value="Critical">Critical Red Alert</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-slate-605 uppercase font-bold text-[10px]">Notification Message / Detailed logs</label>
              <textarea
                required
                rows={3}
                placeholder="Indicate instructions, specific blueprints status files, or custom action parameters details..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded text-slate-900 bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-slate-605 uppercase font-bold text-[10px]">Target Department</label>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded bg-white text-[#111827]"
                >
                  <option value="Sales">Sales & Acquisitions</option>
                  <option value="Legal">Legal & Compliance</option>
                  <option value="Operations">Operations & Sourcing</option>
                  <option value="Marketing">Marketing Agency</option>
                  <option value="Finance">Finance Ledger</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-605 uppercase font-bold text-[10px]">Target Agent Node</label>
                <select
                  value={formAgent}
                  onChange={(e) => setFormAgent(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded bg-white text-[#111827]"
                >
                  <option value="">Unassigned</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.name}>{a.name} ({a.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-605 uppercase font-bold text-[10px]">Target Customer Node</label>
                <input
                  type="text"
                  placeholder="e.g. Krish or Sophia Lin"
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-left">
              <input
                type="checkbox"
                id="sendToAll"
                checked={formSendToAll}
                onChange={(e) => setFormSendToAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="sendToAll" className="text-xs font-bold text-slate-700 cursor-pointer">
                Broadcasting: Dispatch to ALL partner agencies and registered team channels
              </label>
            </div>

            {/* NOTIFICATION DELIVERY OPTIONS */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3 text-left">
              <label className="text-slate-650 uppercase font-bold text-[10px] block mb-1">
                NOTIFICATION DELIVERY CHANNELS (OPT-IN)
              </label>
              
              <div className="flex flex-wrap gap-4 text-slate-700 font-semibold font-sans">
                {[
                  { name: 'Dashboard Only', label: 'Monitor Dashboard' },
                  { name: 'Email', label: 'Agency Email Notification' },
                  { name: 'WhatsApp', label: 'WhatsApp Instant API' },
                  { name: 'Browser Notification', label: 'Local Browser Push Notification' }
                ].map(opt => (
                  <label key={opt.name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDelivery.includes(opt.name)}
                      onChange={() => handleDeliveryCheckbox(opt.name)}
                      className="h-3.5 w-3.5 rounded text-blue-600 border-slate-300"
                    />
                    <span className="text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg hover:shadow-md transition cursor-pointer"
              >
                {editingNotification ? 'Update and Dispatch Signal' : 'Dispatch Notification Now'}
              </button>
              
              {editingNotification && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNotification(null);
                    setFormTitle('');
                    setFormMessage('');
                    setActiveTab('alerts');
                  }}
                  className="px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
