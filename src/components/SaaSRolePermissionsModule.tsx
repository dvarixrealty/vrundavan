import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Users, ShieldAlert, KeyRound, Edit, Trash2, Plus, Play,
  Copy, Eye, ToggleLeft, ToggleRight, CheckSquare, Square, Check, X,
  FileText, Calendar, DollarSign, ListFilter, RotateCcw, HelpCircle,
  Database, Info, AlertTriangle, Settings, RefreshCw, Terminal, Activity,
  Lock, ArrowLeftRight, HelpCircle as HelpIcon, MoreVertical, Sparkles
} from 'lucide-react';
import { AdminUser, Agent, Property } from '../types';
import { firebaseService } from '../lib/firebaseService';

interface SaaSRolePermissionsModuleProps {
  adminUsers: AdminUser[];
  setAdminUsers: (users: AdminUser[]) => void;
  agents: Agent[];
  properties: Property[];
  setProperties?: (props: Property[]) => void;
  loggedInUser: AdminUser | null;
}

interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  status: 'Enabled' | 'Disabled';
  dataAccessScope: 'Own Records' | 'Team Records' | 'Department Records' | 'All Records';
  modules: Record<string, {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
    import: boolean;
    assign: boolean;
    archive: boolean;
    restore: boolean;
    close: boolean;
  }>;
  menuVisibility: Record<string, boolean>;
  widgetVisibility: Record<string, boolean>;
  isSystemRole?: boolean;
  aiPermissions?: {
    canUploadKnowledge: boolean;
    canCreateFactArticles: boolean;
    canEditFactArticles: boolean;
    canDeleteFactArticles: boolean;
    canUploadStaticDocs: boolean;
    canDeleteStaticDocs: boolean;
    canManageFAQ: boolean;
    canReindex: boolean;
    canModifyPrompt: boolean;
    canChangeBehaviorRules: boolean;
    canUpdateWorkflows: boolean;
    canEnableAIFeatures: boolean;
    canViewAnalytics: boolean;
    canViewPerformanceReports: boolean;
    canExportReports: boolean;
  };
}

interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
  status: 'Success' | 'Locked' | 'Blocked' | 'Failed';
}

export default function SaaSRolePermissionsModule({
  adminUsers,
  setAdminUsers,
  agents,
  properties,
  setProperties,
  loggedInUser
}: SaaSRolePermissionsModuleProps) {
  
  // Tab states
  type TabType = 'Users' | 'Roles' | 'Security Logs';
  const [activeTab, setActiveTab] = useState<TabType>('Users');

  // Multi-module declarations for permission grid
  const MODULES_LIST = [
    { key: 'Leads', label: 'Leads Management' },
    { key: 'Requirements', label: 'Requirements CRM' },
    { key: 'Customers', label: 'Customers Portfolio' },
    { key: 'Properties', label: 'Properties Catalog' },
    { key: 'Site Visits', label: 'Site Walkthroughs' },
    { key: 'Documents', label: 'Vault Documents' },
    { key: 'Finance', label: 'Bookkeeping/Finance' },
    { key: 'Marketing', label: 'Campaigns/Marketing' },
    { key: 'AiCenter', label: 'AI Matchmaking Center' }
  ];

  const PERMISSION_KEYS = [
    { key: 'view', label: 'View File' },
    { key: 'create', label: 'Create New' },
    { key: 'edit', label: 'Detail Edit' },
    { key: 'delete', label: 'Delete Records' },
    { key: 'approve', label: 'Approve' },
    { key: 'export', label: 'Export Data' },
    { key: 'import', label: 'Import JSON/CSV' },
    { key: 'assign', label: 'Change Advisory' },
    { key: 'archive', label: 'Archive/Cold' },
    { key: 'restore', label: 'Dumpster Restore' },
    { key: 'close', label: 'Mark Settled' }
  ];

  const MENU_TABS = [
    { key: 'Dashboard', label: 'Dashboard Overview' },
    { key: 'Lead Management', label: 'Lead Management' },
    { key: 'Requirements CRM', label: 'Requirements' },
    { key: 'Customers', label: 'Customers' },
    { key: 'Properties', label: 'Properties Hub' },
    { key: 'Site Visits', label: 'Site Visits' },
    { key: 'Agents & Team', label: 'Agents Board' },
    { key: 'Tasks & Operations', label: 'Tasks Desk' },
    { key: 'Documents', label: 'Vault Documents' },
    { key: 'Finance', label: 'Finance Ledgers' },
    { key: 'FAQ Management', label: 'Knowledge Base' },
    { key: 'Location Management', label: 'GIS Location Pins' },
    { key: 'Marketing', label: 'Marketing' },
    { key: 'Reports & Analytics', label: 'Statistics Reports' },
    { key: 'AI Center', label: 'AI Smart Match' },
    { key: 'Notifications Center', label: 'System Alerter' },
    { key: 'Role & Permissions', label: 'Access Controls' },
    { key: 'System Configuration', label: 'Settings Panel' }
  ];

  const WIDGETS_LIST = [
    { key: 'statsTop', label: 'Top Metrics Counters' },
    { key: 'revenueChart', label: 'Revenue/Expense Ledgers Chart' },
    { key: 'leadSourceDistribution', label: 'Lead Sourcing Distribution Grid' },
    { key: 'agentRosterActive', label: 'Active Agent Standings' },
    { key: 'aiOpportunityReport', label: 'AI Co-pilot Demand Matrix' }
  ];

  // 1. Role Definitions state (Persistent with LocalStorage)
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem('dvarix_rbac_roles');
    if (saved) return JSON.parse(saved);

    // Initial Default Roles
    const superAdminModules: Record<string, any> = {};
    const agentModules: Record<string, any> = {};
    const assistantModules: Record<string, any> = {};

    MODULES_LIST.forEach(({ key }) => {
      // Super Admin has total clearance
      superAdminModules[key] = {
        view: true, create: true, edit: true, delete: true, approve: true,
        export: true, import: true, assign: true, archive: true, restore: true, close: true
      };

      // Agent has partial clearance (cannot delete, import or restore)
      agentModules[key] = {
        view: true, create: true, edit: true, delete: false, approve: false,
        export: true, import: false, assign: true, archive: true, restore: false, close: true
      };

      // Assistant has view-edit only clearance
      assistantModules[key] = {
        view: true, create: true, edit: true, delete: false, approve: false,
        export: false, import: false, assign: false, archive: false, restore: false, close: false
      };
    });

    const initialMenus: Record<string, boolean> = {};
    MENU_TABS.forEach(({ key }) => {
      initialMenus[key] = true;
    });

    const agentMenus: Record<string, boolean> = { ...initialMenus };
    agentMenus['Role & Permissions'] = false; // Hide security matrices
    agentMenus['System Configuration'] = false;

    const assistantMenus: Record<string, boolean> = { ...agentMenus };
    assistantMenus['Finance'] = false; // Hide financials too

    const initialWidgets: Record<string, boolean> = {};
    WIDGETS_LIST.forEach(({ key }) => {
      initialWidgets[key] = true;
    });

    const superAdminAIPerms = {
      canUploadKnowledge: true,
      canCreateFactArticles: true,
      canEditFactArticles: true,
      canDeleteFactArticles: true,
      canUploadStaticDocs: true,
      canDeleteStaticDocs: true,
      canManageFAQ: true,
      canReindex: true,
      canModifyPrompt: true,
      canChangeBehaviorRules: true,
      canUpdateWorkflows: true,
      canEnableAIFeatures: true,
      canViewAnalytics: true,
      canViewPerformanceReports: true,
      canExportReports: true,
    };

    const contentManagerAIPerms = {
      canUploadKnowledge: true,
      canCreateFactArticles: true,
      canEditFactArticles: true,
      canDeleteFactArticles: false,
      canUploadStaticDocs: true,
      canDeleteStaticDocs: false,
      canManageFAQ: true,
      canReindex: false,
      canModifyPrompt: false,
      canChangeBehaviorRules: false,
      canUpdateWorkflows: false,
      canEnableAIFeatures: false,
      canViewAnalytics: false,
      canViewPerformanceReports: false,
      canExportReports: false,
    };

    const legalAdvisorAIPerms = {
      canUploadKnowledge: true,
      canCreateFactArticles: true,
      canEditFactArticles: true,
      canDeleteFactArticles: false,
      canUploadStaticDocs: true,
      canDeleteStaticDocs: false,
      canManageFAQ: false,
      canReindex: false,
      canModifyPrompt: false,
      canChangeBehaviorRules: false,
      canUpdateWorkflows: false,
      canEnableAIFeatures: false,
      canViewAnalytics: false,
      canViewPerformanceReports: false,
      canExportReports: false,
    };

    const researchAIPerms = {
      canUploadKnowledge: true,
      canCreateFactArticles: true,
      canEditFactArticles: true,
      canDeleteFactArticles: false,
      canUploadStaticDocs: true,
      canDeleteStaticDocs: false,
      canManageFAQ: false,
      canReindex: false,
      canModifyPrompt: false,
      canChangeBehaviorRules: false,
      canUpdateWorkflows: false,
      canEnableAIFeatures: false,
      canViewAnalytics: false,
      canViewPerformanceReports: false,
      canExportReports: false,
    };

    const salesAgentAIPerms = {
      canUploadKnowledge: false,
      canCreateFactArticles: false,
      canEditFactArticles: false,
      canDeleteFactArticles: false,
      canUploadStaticDocs: false,
      canDeleteStaticDocs: false,
      canManageFAQ: false,
      canReindex: false,
      canModifyPrompt: false,
      canChangeBehaviorRules: false,
      canUpdateWorkflows: false,
      canEnableAIFeatures: false,
      canViewAnalytics: false,
      canViewPerformanceReports: false,
      canExportReports: false,
    };

    return [
      {
        id: 'role-superadmin',
        name: 'Super Administrator',
        description: 'Highest coordinator tier. Complete visibility override and dynamic system clearance control with full AI system edit access.',
        status: 'Enabled',
        dataAccessScope: 'All Records',
        modules: superAdminModules,
        menuVisibility: initialMenus,
        widgetVisibility: initialWidgets,
        isSystemRole: true,
        aiPermissions: superAdminAIPerms
      },
      {
        id: 'role-contentmanager',
        name: 'Content Manager',
        description: 'Publish and maintain FAQ entries, create rich fact articles and index static layout documentation.',
        status: 'Enabled',
        dataAccessScope: 'Team Records',
        modules: agentModules,
        menuVisibility: agentMenus,
        widgetVisibility: initialWidgets,
        isSystemRole: false,
        aiPermissions: contentManagerAIPerms
      },
      {
        id: 'role-legaladvisor',
        name: 'Legal Advisor',
        description: 'Authoritative analysis on banking, financial, and zoning frameworks. Uploads guidelines index directly to vector vault.',
        status: 'Enabled',
        dataAccessScope: 'Team Records',
        modules: agentModules,
        menuVisibility: agentMenus,
        widgetVisibility: initialWidgets,
        isSystemRole: false,
        aiPermissions: legalAdvisorAIPerms
      },
      {
        id: 'role-propertyresearch',
        name: 'Property Research Team',
        description: 'Updates area insights, indices property listings and updates real estate knowledge base vectors.',
        status: 'Enabled',
        dataAccessScope: 'Team Records',
        modules: agentModules,
        menuVisibility: agentMenus,
        widgetVisibility: initialWidgets,
        isSystemRole: false,
        aiPermissions: researchAIPerms
      },
      {
        id: 'role-salesagents',
        name: 'Sales Agents',
        description: 'Client servicing team with real-time AI copilot query mapping and FAQ matching.',
        status: 'Enabled',
        dataAccessScope: 'Own Records',
        modules: assistantModules,
        menuVisibility: assistantMenus,
        widgetVisibility: { ...initialWidgets, revenueChart: false },
        isSystemRole: false,
        aiPermissions: salesAgentAIPerms
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dvarix_rbac_roles', JSON.stringify(roles));

    // Async sync to Firestore ai_permissions table
    (async () => {
      try {
        for (const role of roles) {
          const perms = role.aiPermissions || {
            canUploadKnowledge: false,
            canCreateFactArticles: false,
            canEditFactArticles: false,
            canDeleteFactArticles: false,
            canUploadStaticDocs: false,
            canDeleteStaticDocs: false,
            canManageFAQ: false,
            canReindex: false,
            canModifyPrompt: false,
            canChangeBehaviorRules: false,
            canUpdateWorkflows: false,
            canEnableAIFeatures: false,
            canViewAnalytics: false,
            canViewPerformanceReports: false,
            canExportReports: false,
          };
          const aiPermObj = {
            id: role.id,
            role_id: role.id,
            can_upload_documents: !!perms.canUploadKnowledge || !!perms.canUploadStaticDocs,
            can_create_articles: !!perms.canCreateFactArticles,
            can_edit_articles: !!perms.canEditFactArticles,
            can_delete_documents: !!perms.canDeleteFactArticles || !!perms.canDeleteStaticDocs,
            can_manage_faqs: !!perms.canManageFAQ,
            can_reindex_ai: !!perms.canReindex,
            can_manage_prompts: !!perms.canModifyPrompt || !!perms.canChangeBehaviorRules,
            can_manage_workflows: !!perms.canUpdateWorkflows || !!perms.canEnableAIFeatures,
            can_view_analytics: !!perms.canViewAnalytics || !!perms.canViewPerformanceReports || !!perms.canExportReports,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          await firebaseService.saveAIPermission(aiPermObj);
        }
      } catch (err) {
        console.warn("Failed to synchronize AI permissions to Firebase:", err);
      }
    })();
  }, [roles]);

  // 2. Mock Login History logs state
  const [loginHistories, setLoginHistories] = useState<Record<string, LoginHistoryEntry[]>>(() => {
    const saved = localStorage.getItem('dvarix_rbac_login_histories');
    if (saved) return JSON.parse(saved);

    // Default seed logs per user id
    return {
      'user-super': [
        { id: 'lh-1', timestamp: new Date(Date.now() - 600000).toLocaleString(), ip: '157.44.201.89', device: 'Apple MacBook Pro M3', browser: 'Chrome Premium Engine', location: 'JP Nagar, Bengaluru', status: 'Success' },
        { id: 'lh-2', timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(), ip: '49.37.12.103', device: 'iOS iPhone 15 Pro Max', browser: 'Safari Mobile Core', location: 'Indiranagar, Bengaluru', status: 'Success' }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('dvarix_rbac_login_histories', JSON.stringify(loginHistories));
  }, [loginHistories]);

  // Redirection states for Forms & Selection views
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState<Partial<RoleDefinition>>({});
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // Users operational dialog state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPhone, setUserFormPhone] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormRole, setUserFormRole] = useState('role-coordinator-assistant');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Credentials sharing packet
  const [activeSharePkg, setActiveSharePkg] = useState<{
    user: AdminUser;
    tempPassword?: string;
    isNewUser?: boolean;
  } | null>(null);

  // Dynamic Audit logs
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('dvarix_rbac_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { ts: new Date().toLocaleString(), name: 'Dvarix Super Admin', act: 'Redesigned Roles & Clearances schemas', ip: '157.44.201.89', dev: 'macOS Safari Enterprise Engine', state: 'SUCCESS' },
      { ts: new Date(Date.now() - 10 * 60000).toLocaleString(), name: 'System Automated Node', act: 'Saved Dynamic taxonomies into localState fallback', ip: '127.0.0.1 (Local)', dev: 'Node Cron Daemon', state: 'HEALTH_OK' },
      { ts: new Date(Date.now() - 60 * 60000).toLocaleString(), name: 'Raghav Reddy', act: 'Updated JP Nagar PG listings occupancy budget', ip: '64.233.172.9', dev: 'Linux/Chrome Core', state: 'SUCCESS' },
      { ts: new Date(Date.now() - 3600000 * 3).toLocaleString(), name: 'Priya Sharma', act: 'Repleted leads direct query responses', ip: '198.143.2.55', dev: 'Windows 11 Edge', state: 'SUCCESS' },
      { ts: new Date(Date.now() - 3600000 * 12).toLocaleString(), name: 'Dvarix Super Admin', act: 'Reset coordinate password verification key indices', ip: '157.44.201.89', dev: 'iOS Safari Mobile Core', state: 'SUCCESS' },
      { ts: new Date(Date.now() - 3600000 * 24).toLocaleString(), name: 'System Core Registry', act: 'Back up catalog snapshots to Firestore storage', ip: '34.120.33.155', dev: 'GCP Serverless Run', state: 'SNAPSHOT_OK' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dvarix_rbac_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const logAudit = (act: string, targetName: string, stateStatus = 'SUCCESS') => {
    // Audit Logging
    const newLog = {
      ts: new Date().toLocaleString(),
      name: loggedInUser?.name || 'Dvarix Super Admin',
      act: act,
      ip: '157.44.201.89',
      dev: 'macOS Safari Enterprise Engine',
      state: stateStatus
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const generateTemporaryPassword = (): string => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    let password = "";
    password += lowercase[crypto.getRandomValues(new Uint32Array(1))[0] % lowercase.length];
    password += lowercase[crypto.getRandomValues(new Uint32Array(1))[0] % lowercase.length];
    password += lowercase[crypto.getRandomValues(new Uint32Array(1))[0] % lowercase.length];
    
    password += uppercase[crypto.getRandomValues(new Uint32Array(1))[0] % uppercase.length];
    password += uppercase[crypto.getRandomValues(new Uint32Array(1))[0] % uppercase.length];
    password += uppercase[crypto.getRandomValues(new Uint32Array(1))[0] % uppercase.length];
    
    password += numbers[crypto.getRandomValues(new Uint32Array(1))[0] % numbers.length];
    password += numbers[crypto.getRandomValues(new Uint32Array(1))[0] % numbers.length];
    password += numbers[crypto.getRandomValues(new Uint32Array(1))[0] % numbers.length];
    
    password += special[crypto.getRandomValues(new Uint32Array(1))[0] % special.length];
    password += special[crypto.getRandomValues(new Uint32Array(1))[0] % special.length];
    password += special[crypto.getRandomValues(new Uint32Array(1))[0] % special.length];
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const handleResetPassword = (usr: AdminUser) => {
    const tempPass = generateTemporaryPassword();
    const nextUsers = adminUsers.map((u) => {
      if (u.id === usr.id) {
        return {
          ...u,
          password: tempPass,
          requirePasswordChange: true
        };
      }
      return u;
    });
    setAdminUsers(nextUsers);
    
    // Log Password Reset
    logAudit(`Password Reset (To: ${usr.name}, Email: ${usr.email})`, usr.name);
    showToast(`Temporary access passcode secured for ${usr.name}`);

    // Immediately launch sharing modal!
    setActiveSharePkg({
      user: { ...usr, password: tempPass },
      tempPassword: tempPass,
      isNewUser: false
    });
  };

  const handleShareCredentialsClicked = (usr: AdminUser) => {
    const currentPass = usr.password || 'credentialCoord1';
    
    // Determine action log name based on historic audit logs
    const hasBeenSharedBefore = auditLogs.some(log => log.act.includes(`To: ${usr.name}`) && (log.act.includes("Credentials Shared") || log.act.includes("Credentials Re-shared")));
    const logAction = hasBeenSharedBefore ? "Credentials Re-shared" : "Credentials Shared";
    
    setActiveSharePkg({
      user: usr,
      tempPassword: currentPass,
      isNewUser: false
    });
  };

  const handleSendViaWhatsApp = (usr: AdminUser, tempPass: string) => {
    const loginUrl = `${window.location.origin}/admin/login`;
    const message = `Welcome to Dvarix Realty.

Your staff account has been activated successfully.

Role:
${usr.roleName}

Login URL:
${loginUrl}

Email:
${usr.email}

Password:
${tempPass}

Please change your password immediately after your first login.

Regards,
Dvarix Realty`;

    const cleanPhone = (usr.phone || '').replace(/\D/g, '');
    const phoneParam = cleanPhone ? `&phone=${cleanPhone}` : '';
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}${phoneParam}`;
    window.open(whatsappUrl, '_blank');
    
    const hasBeenSharedBefore = auditLogs.some(log => log.act.includes(`To: ${usr.name}`) && (log.act.includes("Credentials Shared") || log.act.includes("Credentials Re-shared")));
    const logAction = hasBeenSharedBefore ? "Credentials Re-shared" : "Credentials Shared";
    
    logAudit(`${logAction} (By: ${loggedInUser?.name || 'Dvarix Super Admin'}, To: ${usr.name}, Method: WhatsApp)`, usr.name);
  };

  const handleSendViaEmail = (usr: AdminUser, tempPass: string) => {
    const loginUrl = `${window.location.origin}/admin/login`;
    const subject = "Dvarix Realty Staff Login Credentials";
    const body = `Welcome to Dvarix Realty.

Your staff account has been activated successfully.

Role:
${usr.roleName}

Login URL:
${loginUrl}

Email:
${usr.email}

Password:
${tempPass}

Please change your password immediately after your first login.

Regards,
Dvarix Realty`;

    const mailtoUrl = `mailto:${usr.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    
    const hasBeenSharedBefore = auditLogs.some(log => log.act.includes(`To: ${usr.name}`) && (log.act.includes("Credentials Shared") || log.act.includes("Credentials Re-shared")));
    const logAction = hasBeenSharedBefore ? "Credentials Re-shared" : "Credentials Shared";

    logAudit(`${logAction} (By: ${loggedInUser?.name || 'Dvarix Super Admin'}, To: ${usr.name}, Method: Email)`, usr.name);
  };

  const handleCopyCleanLoginCredentials = (usr: AdminUser, tempPass?: string) => {
    const passwordToUse = tempPass || usr.password || 'credentialCoord1';
    const loginUrl = `${window.location.origin}/admin/login`;
    const textToCopy = `Login URL:
${loginUrl}

Email:
${usr.email}

Password:
${passwordToUse}

Role:
${usr.roleName}`;

    navigator.clipboard.writeText(textToCopy);
    showToast("Credentials copied successfully.");
    
    const hasBeenSharedBefore = auditLogs.some(log => log.act.includes(`To: ${usr.name}`) && (log.act.includes("Credentials Shared") || log.act.includes("Credentials Re-shared")));
    const logAction = hasBeenSharedBefore ? "Credentials Re-shared" : "Credentials Shared";

    logAudit(`${logAction} (By: ${loggedInUser?.name || 'Dvarix Super Admin'}, To: ${usr.name}, Method: Copy)`, usr.name);
  };

  // Reset password state
  const [resetPassUserId, setResetPassUserId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Transfer data state
  const [transferDataState, setTransferDataState] = useState<{
    sourceUserEmail: string;
    targetUserEmail: string;
    transferProperties: boolean;
    transferLeads: boolean;
  } | null>(null);

  // View historical logs coordinate trigger
  const [viewHistoryUserId, setViewHistoryUserId] = useState<string | null>(null);

  // Success messaging toasts banner
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // 3. User operations handlers
  const handleToggleUserStatus = (id: string) => {
    const nextUsers = adminUsers.map((usr) => {
      if (usr.id === id) {
        // Enforce Super Admin cannot be suspended
        if (usr.email.trim().toLowerCase() === 'dvarixrealty@gmail.com') {
          showToast('Wipe Security Warning: Ultimate Super Admin node cannot be suspended!');
          return usr;
        }
        const currentStatus = usr.status || 'Active';
        const nextStatus: 'Active' | 'Suspended' = currentStatus === 'Active' ? 'Suspended' : 'Active';
        
        // Log the change
        const historyItem: LoginHistoryEntry = {
          id: `lh-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          ip: '202.43.1.25',
          device: 'System Gate Keep Console',
          browser: 'Admin Override Shield',
          location: 'HQ Node Cloud Run',
          status: 'Success'
        };
        const currentHistList = loginHistories[usr.id] || [];
        setLoginHistories(prev => ({
          ...prev,
          [usr.id]: [historyItem, ...currentHistList]
        }));

        showToast(`${usr.name} account is now set to ${nextStatus}`);
        return {
          ...usr,
          status: nextStatus
        };
      }
      return usr;
    });
    setAdminUsers(nextUsers);
  };

  const handleResetPasswordCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUserId || !newPasswordValue) return;

    const nextUsers = adminUsers.map((usr) => {
      if (usr.id === resetPassUserId) {
        showToast(`Secure Access keys reset for ${usr.name}!`);
        return {
          ...usr,
          password: newPasswordValue
        };
      }
      return usr;
    });

    setAdminUsers(nextUsers);
    setResetPassUserId(null);
    setNewPasswordValue('');
  };

  const handleCreateOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormName || !userFormEmail) return;

    const selectedRoleObj = roles.find(r => r.id === userFormRole || r.name === userFormRole);
    const standardPermissionSet = {
      canManageProperties: selectedRoleObj?.modules['Properties']?.view !== false,
      canManageCategories: selectedRoleObj?.modules['Customers']?.view !== false,
      canManageAgents: selectedRoleObj?.modules['Finance']?.view !== false,
      canManageMap: selectedRoleObj?.modules['Properties']?.view !== false,
      canReplyInquiries: selectedRoleObj?.modules['Leads']?.view !== false,
      canManageUsers: selectedRoleObj?.modules['AiCenter']?.view !== false,
    };

    if (editingUser) {
      // Modify exist User Details
      const nextUsers = adminUsers.map((usr) => {
        if (usr.id === editingUser.id) {
          showToast(`Account settings updated for ${userFormName}`);
          return {
            ...usr,
            name: userFormName,
            email: userFormEmail,
            phone: userFormPhone,
            roleName: selectedRoleObj?.name || userFormRole,
            permissions: standardPermissionSet
          };
        }
        return usr;
      });
      setAdminUsers(nextUsers);
      setEditingUser(null);
    } else {
      // Register New User
      const tempPass = userFormPassword || generateTemporaryPassword();
      const newUsr: AdminUser = {
        id: `user-${Date.now()}`,
        name: userFormName,
        email: userFormEmail.trim(),
        phone: userFormPhone || '',
        password: tempPass,
        roleName: selectedRoleObj?.name || 'Office Assistant',
        permissions: standardPermissionSet,
        status: 'Active' as any,
        requirePasswordChange: true
      };
      setAdminUsers([...adminUsers, newUsr]);
      showToast(`User Account registered successfully!`);

      // Log creation
      logAudit(`Staff Account Created (To: ${newUsr.name}, Email: ${newUsr.email}, Role: ${newUsr.roleName})`, newUsr.name);

      // Immediately launch credentials sharing modal
      setActiveSharePkg({
        user: newUsr,
        tempPassword: tempPass,
        isNewUser: true
      });
    }

    // Reset Form fields
    setUserFormName('');
    setUserFormEmail('');
    setUserFormPhone('');
    setUserFormPassword('');
    setUserFormRole('role-coordinator-assistant');
    setIsAddingUser(false);
  };

  const handleTriggerEditUser = (usr: AdminUser) => {
    setEditingUser(usr);
    setUserFormName(usr.name);
    setUserFormEmail(usr.email);
    setUserFormPhone(usr.phone || '');
    setUserFormPassword(usr.password || '••••••••');
    
    const matchedRole = roles.find(r => r.name === usr.roleName) || roles[2];
    setUserFormRole(matchedRole ? matchedRole.id : 'role-coordinator-assistant');
    setIsAddingUser(true);
  };

  const handleDeleteUserCommit = (id: string, name: string) => {
    // Check if system admin limits
    const match = adminUsers.find(u => u.id === id);
    if (match?.email.trim().toLowerCase() === 'dvarixrealty@gmail.com') {
      showToast('Revocation Error: Unable to drop the absolute Super Admin root account!');
      return;
    }

    // Set up transfer dialogue before deleting if any records exist
    const affectedProps = properties.filter(p => p.agent?.email === match?.email);
    if (affectedProps.length > 0) {
      // Prompt dataset transfer
      setTransferDataState({
        sourceUserEmail: match?.email || '',
        targetUserEmail: 'raghav.r@dvarix.com',
        transferProperties: true,
        transferLeads: true
      });
      showToast(`Conflict Warning: ${name} governs active properties. Map data transit first!`);
      return;
    }

    setAdminUsers(adminUsers.filter(u => u.id !== id));
    showToast(`Access clearance coordinates revoked for ${name}`);
  };

  // Complete data transfer of properties between advisors
  const handleCommitDataTransfer = () => {
    if (!transferDataState || !setProperties) return;

    const sourceMail = transferDataState.sourceUserEmail;
    const targetMail = transferDataState.targetUserEmail;
    
    const matchedAgent = agents.find(a => a.email === targetMail) || agents[0];

    // Map properties from old advisor to new advisor
    const nextProps = properties.map((p) => {
      if (p.agent?.email === sourceMail) {
        return {
          ...p,
          agent: {
            ...p.agent,
            name: matchedAgent.name,
            email: matchedAgent.email,
            phone: matchedAgent.phone,
            role: matchedAgent.role,
            avatar: matchedAgent.avatar
          }
        };
      }
      return p;
    });

    setProperties(nextProps);
    
    // Now delete the old advisor
    const matchedUser = adminUsers.find(u => u.email === sourceMail);
    if (matchedUser) {
      setAdminUsers(adminUsers.filter(u => u.id !== matchedUser.id));
    }

    showToast(`Portfolio assets moved from ${sourceMail} to ${matchedAgent.name}. Advisor purged.`);
    setTransferDataState(null);
  };

  // 4. Role operations handlers
  const handleInitCreateRole = () => {
    const blankModules: Record<string, any> = {};
    MODULES_LIST.forEach(({ key }) => {
      blankModules[key] = {
        view: true, create: false, edit: false, delete: false, approve: false,
        export: false, import: false, assign: false, archive: false, restore: false, close: false
      };
    });

    const blankMenus: Record<string, boolean> = {};
    MENU_TABS.forEach(({ key }) => {
      blankMenus[key] = true;
    });

    const blankWidgets: Record<string, boolean> = {};
    WIDGETS_LIST.forEach(({ key }) => {
      blankWidgets[key] = true;
    });

    setRoleForm({
      id: `role-custom-${Date.now()}`,
      name: '',
      description: '',
      status: 'Enabled',
      dataAccessScope: 'Own Records',
      modules: blankModules,
      menuVisibility: blankMenus,
      widgetVisibility: blankWidgets,
      isSystemRole: false,
      aiPermissions: {
        canUploadKnowledge: false,
        canCreateFactArticles: false,
        canEditFactArticles: false,
        canDeleteFactArticles: false,
        canUploadStaticDocs: false,
        canDeleteStaticDocs: false,
        canManageFAQ: false,
        canReindex: false,
        canModifyPrompt: false,
        canChangeBehaviorRules: false,
        canUpdateWorkflows: false,
        canEnableAIFeatures: false,
        canViewAnalytics: false,
        canViewPerformanceReports: false,
        canExportReports: false,
      }
    });
    setEditingRoleId(null);
    setIsCreatingRole(true);
  };

  const handleTriggerEditRole = (role: RoleDefinition) => {
    setRoleForm(JSON.parse(JSON.stringify(role))); // deep copy
    setEditingRoleId(role.id);
    setIsCreatingRole(true);
  };

  const handleCloneRole = (role: RoleDefinition) => {
    const deepClone = JSON.parse(JSON.stringify(role));
    deepClone.id = `role-clone-${Date.now()}`;
    deepClone.name = `${role.name} - Duplicate`;
    deepClone.isSystemRole = false;
    
    setRoles([...roles, deepClone]);
    showToast(`Permission profile cloned: ${role.name}`);
  };

  const handleToggleRoleStatus = (id: string) => {
    const matched = roles.find(r => r.id === id);
    if (matched?.isSystemRole) {
      showToast('Action Blocked: System framework roles cannot be disabled.');
      return;
    }

    const nextRoles = roles.map((r) => {
      if (r.id === id) {
        const nextStat = r.status === 'Enabled' ? 'Disabled' : 'Enabled';
        showToast(`${r.name} is now set to ${nextStat}`);
        return { ...r, status: nextStat as any };
      }
      return r;
    });
    setRoles(nextRoles);
  };

  const handleDeleteRole = (id: string) => {
    const matched = roles.find(r => r.id === id);
    if (matched?.isSystemRole) {
      showToast('Action Blocked: Framework roles cannot be dropped.');
      return;
    }

    // Check if any users map this role
    const usersCount = adminUsers.filter(u => u.roleName === matched?.name).length;
    if (usersCount > 0) {
      showToast(`Conflict Error: ${usersCount} users currently hold ${matched?.name}. Re-assign users first.`);
      return;
    }

    setRoles(roles.filter(r => r.id !== id));
    showToast(`Role profile "${matched?.name}" dropped successfully.`);
  };

  const handleSaveRoleForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name) return;

    if (editingRoleId) {
      const nextRoles = roles.map((r) => {
        if (r.id === editingRoleId) {
          showToast(`Role schema changes saved: ${roleForm.name}`);
          return roleForm as RoleDefinition;
        }
        return r;
      });
      setRoles(nextRoles);
    } else {
      setRoles([...roles, roleForm as RoleDefinition]);
      showToast(`Custom Role profile deployed: ${roleForm.name}`);
    }

    setIsCreatingRole(false);
    setRoleForm({});
  };

  // Toggle dynamic checkboxes within Role Form Grid
  const togglePermissionCheckbox = (moduleKey: string, permKey: string) => {
    if (!roleForm.modules) return;
    const nextModules = { ...roleForm.modules };
    nextModules[moduleKey] = {
      ...nextModules[moduleKey],
      [permKey]: !nextModules[moduleKey][permKey]
    };
    setRoleForm({ ...roleForm, modules: nextModules });
  };

  const toggleMenuVisibilityCheckbox = (menuKey: string) => {
    if (!roleForm.menuVisibility) return;
    const nextMenus = { ...roleForm.menuVisibility };
    nextMenus[menuKey] = !nextMenus[menuKey];
    setRoleForm({ ...roleForm, menuVisibility: nextMenus });
  };

  const toggleWidgetVisibilityCheckbox = (widgetKey: string) => {
    if (!roleForm.widgetVisibility) return;
    const nextWidgets = { ...roleForm.widgetVisibility };
    nextWidgets[widgetKey] = !nextWidgets[widgetKey];
    setRoleForm({ ...roleForm, widgetVisibility: nextWidgets });
  };

  return (
    <div className="space-y-6 text-left" id="saas-rbac-central-matrix">
      
      {/* 1. TOP HEADER OVERRIDES */}
      <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-orange-600 tracking-widest block font-mono">Dvarix Multi-Tier Identity Guard</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-orange-500 shrink-0" /> Enterprise Access Administration
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Register team coordinates, change login permissions, provision granular visibility scopes, and audits activity telemetry indices for client records security.
          </p>
        </div>

        {/* SUBNAPS */}
        <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-205">
          {(['Users', 'Roles', 'Security Logs'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsCreatingRole(false);
                setIsAddingUser(false);
              }}
              className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === tab ? 'bg-white shadow text-slate-850 font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'Users' ? 'User Administration' : tab === 'Roles' ? 'Define Roles' : 'Audits Log'}
            </button>
          ))}
        </div>
      </div>

      {/* TOAST NOTIFIER */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-orange-400 px-4 py-3 rounded-xl shadow-2xl z-50 text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
          <Terminal className="h-4 w-4 animate-pulse" /> {successToast}
        </div>
      )}

      {/* 2. CHOOSE TAB CONTENT */}

      {/* TAB 1: USER ACCOUNT DIRECTORIES */}
      {activeTab === 'Users' && (
        <div className="space-y-6">
          {isAddingUser ? (
            /* SUB-VIEW 1A: REGISTER / MODIFY STAFF USER */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs max-w-lg mx-auto animate-in fade-in duration-150">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{editingUser ? 'Modify User Profile' : 'Register New Coordinator Node'}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Assign custom corporate role and initial connection credentials</p>
                </div>
                <button 
                  onClick={() => setIsAddingUser(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400">Full Corporate Name *</label>
                  <input
                    type="text"
                    required
                    value={userFormName}
                    onChange={(e) => setUserFormName(e.target.value)}
                    placeholder="e.g. Priyanjali Sen"
                    className="w-full text-slate-800 bg-slate-5/50 border border-slate-200 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400">Email Login Coordinates *</label>
                  <input
                    type="email"
                    required
                    value={userFormEmail}
                    onChange={(e) => setUserFormEmail(e.target.value)}
                    placeholder="advisor@dvarixrealty.com"
                    className="w-full text-slate-800 bg-slate-5/50 border border-slate-200 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400">Phone Number (for WhatsApp sharing) *</label>
                  <input
                    type="tel"
                    required
                    value={userFormPhone}
                    onChange={(e) => setUserFormPhone(e.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full text-slate-800 bg-slate-5/50 border border-slate-200 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                {!editingUser && (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400">Initial Secure Passcode *</label>
                    <input
                      type="text"
                      required
                      value={userFormPassword}
                      onChange={(e) => setUserFormPassword(e.target.value)}
                      placeholder="Map passcode key..."
                      className="w-full text-slate-800 bg-slate-5/50 border border-slate-200 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400">Corporate System Role</label>
                  <select
                    value={userFormRole}
                    onChange={(e) => setUserFormRole(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 cursor-pointer outline-none focus:border-orange-500"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id} disabled={r.status === 'Disabled'}>
                        {r.name} {r.status === 'Disabled' ? '(Disabled)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="flex-1 py-2 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold font-sans hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel Return
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
                  >
                    {editingUser ? 'Save Coordinates' : 'Register Advisor'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* SUB-VIEW 1B: STAFF DIRECTORY GRID */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-extrabold text-xs text-slate-700 font-mono flex items-center gap-1.5 uppercase">
                  <Users className="h-4 w-4 text-orange-550" /> System Personnel Roster ({adminUsers.length})
                </span>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setUserFormName('');
                    setUserFormEmail('');
                    setUserFormPhone('');
                    setUserFormPassword('');
                    setUserFormRole('role-coordinator-assistant');
                    setIsAddingUser(true);
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[11px] font-bold tracking-tight cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Register Staff account
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-slate-705">
                  <thead>
                    <tr className="bg-slate-100/60 border-b border-slate-200/80 font-mono text-[9px] uppercase tracking-widest text-[#64748b] h-10 select-none">
                      <th className="pl-6 font-black py-3">Account User</th>
                      <th className="font-black py-3">Corporate Assigned Role</th>
                      <th className="font-black py-3">Credential Visibility Shield</th>
                      <th className="font-black py-3">Status</th>
                      <th className="text-right pr-6 font-black py-3">Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {adminUsers.map((usr) => {
                      const userStatus = (usr as any).status || 'Active';
                      const isSuspended = userStatus === 'Suspended';
                      const associatedRole = roles.find(r => r.name === usr.roleName) || roles[2];
                      
                      return (
                        <tr key={usr.id} className={`hover:bg-slate-5/5 transition-all ${isSuspended ? 'bg-rose-50/10' : ''}`}>
                          <td className="pl-6 py-4">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 block text-xs">{usr.name}</span>
                              <span className="block font-mono text-[10px] text-slate-450">{usr.email}</span>
                              {usr.phone && (
                                <span className="block font-mono text-[9px] text-emerald-600 font-bold">📲 {usr.phone}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] uppercase font-mono">
                              {usr.roleName}
                            </span>
                          </td>

                          <td className="py-4 font-mono text-[10px] text-slate-500">
                            {associatedRole?.dataAccessScope || 'Own RecordsOnly'}
                          </td>

                          <td className="py-4">
                            <button
                              onClick={() => handleToggleUserStatus(usr.id)}
                              className="cursor-pointer text-left block"
                            >
                              {!isSuspended ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-[10px]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Node
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 font-extrabold text-[10px]">
                                  Suspended
                                </span>
                              )}
                            </button>
                          </td>

                          <td className="py-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* [Modify] */}
                              <button
                                onClick={() => handleTriggerEditUser(usr)}
                                className="p-1 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-705 rounded-lg text-[10px] font-bold cursor-pointer"
                                title="Edit user profile information"
                              >
                                Modify
                              </button>

                              {/* [Reset Password] */}
                              <button
                                onClick={() => handleResetPassword(usr)}
                                className="p-1 px-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-lg text-[10px] font-bold cursor-pointer font-mono"
                                title="Generate secure temporary passcode"
                              >
                                Reset Password
                              </button>

                              {/* [Share Credentials] */}
                              <button
                                onClick={() => handleShareCredentialsClicked(usr)}
                                className="p-1 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold cursor-pointer"
                                title="Reshare credentials package"
                              >
                                Share Credentials
                              </button>

                              {/* [Copy Login Information] */}
                              <button
                                onClick={() => handleCopyCleanLoginCredentials(usr)}
                                className="p-1 px-2 bg-blue-50 hover:bg-blue-105 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold cursor-pointer"
                                title="Copy quick login summary"
                              >
                                Copy Login Information
                              </button>

                              {/* [Deactivate Account] */}
                              <button
                                onClick={() => handleToggleUserStatus(usr.id)}
                                className={`p-1 px-2 border rounded-lg text-[10px] font-bold cursor-pointer ${
                                  usr.status === 'Suspended' 
                                    ? 'bg-emerald-105 hover:bg-emerald-200 border-emerald-300 text-slate-900' 
                                    : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-703'
                                }`}
                                title={usr.status === 'Suspended' ? "Activate node account" : "Suspend node account"}
                              >
                                {usr.status === 'Suspended' ? 'Activate Account' : 'Deactivate Account'}
                              </button>

                              {/* [Delete Account] */}
                              <button
                                onClick={() => handleDeleteUserCommit(usr.id, usr.name)}
                                className={`p-1 px-2 bg-white border border-slate-200 hover:bg-rose-100 hover:border-rose-300 text-slate-500 hover:text-rose-600 rounded-lg transition shrink-0 cursor-pointer ${
                                  usr.email.trim().toLowerCase() === 'dvarixrealty@gmail.com' ? 'opacity-30 cursor-not-allowed' : ''
                                }`}
                                disabled={usr.email.trim().toLowerCase() === 'dvarixrealty@gmail.com'}
                                title="Permanently delete staff node account"
                              >
                                Delete Account
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RBAC DEFINE GENERAL ROLES SECTION */}
      {activeTab === 'Roles' && (
        <div className="space-y-6">
          
          {isCreatingRole ? (
            /* SUB-VIEW 2A: COMPLETE GRAPHIC SCHEMA PERMISSION CHECK EDITOR */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm">
                    {editingRoleId ? `Edit Authorization Rules: ${roleForm.name}` : 'Provision Custom Access Level'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Customize complete modular endpoints triggers, visibility matrices, and record scopes</p>
                </div>
                <button 
                  onClick={() => setIsCreatingRole(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRoleForm} className="space-y-6 text-xs text-slate-705">
                
                {/* Title & Desc */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-450">Permission Identity Designation *</label>
                    <input
                      type="text" required
                      value={roleForm.name || ''}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                      placeholder="e.g. Marketing Manager"
                      className="w-full text-slate-800 bg-slate-5/50 border border-slate-205 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-450">Data Access Scope restriction</label>
                    <select
                      value={roleForm.dataAccessScope || 'Own Records'}
                      onChange={(e) => setRoleForm({ ...roleForm, dataAccessScope: e.target.value as any })}
                      className="w-full bg-white border border-slate-205 text-slate-700 text-xs rounded-xl px-3 py-2.5 cursor-pointer outline-none focus:border-orange-550"
                    >
                      <option value="Own Records">Own Records (Only can see data matching login credentials)</option>
                      <option value="Team Records">Team Records (Can review delegated team group entries)</option>
                      <option value="Department Records">Department Records (Under jurisdiction channel scope)</option>
                      <option value="All Records">All Records (Ultimate global workspace override view)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-450">Technical description Prompt</label>
                  <input
                    type="text"
                    value={roleForm.description || ''}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="Brief description of the clearance privileges of this assigned node..."
                    className="w-full bg-slate-5/50 border border-slate-202 text-xs rounded-xl px-4 py-2.5 outline-none focus:border-orange-500"
                  />
                </div>

                {/* 1. COMPREHENSIVE MODULES CRUD CHECKBOX MATRIX SCROLL */}
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4.5">
                  <h4 className="font-mono text-[10.5px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1 text-[#ff5a3c]">
                    <Database className="h-4 w-4" /> Operational Module Gate Keep Checkboxes
                  </h4>
                  <p className="text-[10px] text-slate-400">Checkbox activation toggles REST api read, write, update, and deletion rules on individual endpoints databases.</p>

                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-center border-collapse text-[11px] font-mono whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-200 text-[9px] uppercase tracking-wider text-slate-450">
                          <th className="text-left font-black pb-3">Module Engine Label</th>
                          {PERMISSION_KEYS.map(pk => (
                            <th key={pk.key} className="pb-3 px-2 font-bold">{pk.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES_LIST.map(({ key, label }) => {
                          const modPerms = roleForm.modules?.[key] || {
                            view: false, create: false, edit: false, delete: false, approve: false,
                            export: false, import: false, assign: false, archive: false, restore: false, close: false
                          };

                          return (
                            <tr key={key} className="border-b border-slate-100 hover:bg-white transition-all">
                              <td className="text-left font-sans font-extrabold text-slate-800 py-3">{label}</td>
                              
                              {PERMISSION_KEYS.map(pk => {
                                const isChecked = (modPerms as any)[pk.key];
                                return (
                                  <td key={pk.key} className="py-3 px-2">
                                    <button
                                      type="button"
                                      onClick={() => togglePermissionCheckbox(key, pk.key)}
                                      className="cursor-pointer transition hover:scale-105"
                                    >
                                      {isChecked ? (
                                        <CheckSquare className="h-4.5 w-4.5 text-orange-600 fill-orange-50" />
                                      ) : (
                                        <Square className="h-4.5 w-4.5 text-slate-300" />
                                      )}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. DYNAMIC WORKSPACE VISIBILITY PRESETTINGS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Left Column: Sidebar Menus switches */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                    <h4 className="font-mono text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 text-blue-600">
                      <ListFilter className="h-4 w-4" /> Navigator Tabs Gating Controls
                    </h4>
                    <p className="text-[10px] text-slate-400">Hide/Unhide sidebar options entirely based on matching access token clearance metrics.</p>
                    
                    <div className="grid grid-cols-2 gap-3.5 pt-2">
                      {MENU_TABS.map(tab => {
                        const isVisible = roleForm.menuVisibility?.[tab.key] !== false;
                        return (
                          <label key={tab.key} className="flex items-center gap-2 cursor-pointer text-[10.5px] font-semibold text-slate-655 hover:text-slate-900 select-none">
                            <button
                              type="button"
                              onClick={() => toggleMenuVisibilityCheckbox(tab.key)}
                              className="cursor-pointer transition"
                            >
                              {isVisible ? (
                                <ToggleRight className="h-5 w-5 text-emerald-500 fill-emerald-100" />
                              ) : (
                                <ToggleLeft className="h-5 w-5 text-slate-350" />
                              )}
                            </button>
                            <span className={isVisible ? "font-bold text-slate-800" : "text-slate-400"}>{tab.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Dashboard widgets switches */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                    <h4 className="font-mono text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 text-indigo-600">
                      <Activity className="h-4 w-4" /> Stats widgets clearance limits
                    </h4>
                    <p className="text-[10px] text-slate-400">Controls which operational telemetry cards and analytic graph systems are loaded on the home panel.</p>

                    <div className="space-y-3.5 pt-2">
                      {WIDGETS_LIST.map(wg => {
                        const isVisible = roleForm.widgetVisibility?.[wg.key] !== false;
                        return (
                          <label key={wg.key} className="flex items-center gap-3 cursor-pointer text-[11px] font-semibold text-slate-655 hover:text-slate-900 select-none">
                            <button
                              type="button"
                              onClick={() => toggleWidgetVisibilityCheckbox(wg.key)}
                              className="cursor-pointer transition"
                            >
                              {isVisible ? (
                                <ToggleRight className="h-5.5 w-5.5 text-indigo-600 fill-indigo-50" />
                              ) : (
                                <ToggleLeft className="h-5.5 w-5.5 text-slate-350" />
                              )}
                            </button>
                            <span className={isVisible ? "font-bold text-slate-850" : "text-slate-400"}>{wg.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* AI CENTER PERMISSIONS SYSTEM SECTION */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6.5 space-y-4 my-6">
                  <h3 className="font-sans text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" /> AI Center Security & Access Clearance Controls
                  </h3>
                  <p className="text-[11px] text-slate-505 leading-relaxed">
                    Configure granular permission parameters for the Dvarix AI knowledge base, system prompt vaults, and real-time usage telemetry.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {/* Group 1: Knowledge Management */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                      <span className="font-mono text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        Knowledge Management
                      </span>
                      
                      <div className="space-y-3 pt-2 select-none">
                        {[
                          { key: 'canUploadKnowledge', label: 'Can Upload Knowledge Files' },
                          { key: 'canCreateFactArticles', label: 'Can Create Fact Articles' },
                          { key: 'canEditFactArticles', label: 'Can Edit Fact Articles' },
                          { key: 'canDeleteFactArticles', label: 'Can Delete Fact Articles' },
                          { key: 'canUploadStaticDocs', label: 'Can Upload Static Documents' },
                          { key: 'canDeleteStaticDocs', label: 'Can Delete Static Documents' },
                          { key: 'canManageFAQ', label: 'Can Manage FAQ Knowledge' },
                          { key: 'canReindex', label: 'Can Re-index AI Knowledge Base' },
                        ].map(item => {
                          const isVal = !!roleForm.aiPermissions?.[item.key as keyof typeof roleForm.aiPermissions];
                          return (
                            <label key={item.key} className="flex items-center gap-2.5 cursor-pointer text-[11px] font-semibold text-slate-700 hover:text-slate-900">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextAI = {
                                    canUploadKnowledge: false,
                                    canCreateFactArticles: false,
                                    canEditFactArticles: false,
                                    canDeleteFactArticles: false,
                                    canUploadStaticDocs: false,
                                    canDeleteStaticDocs: false,
                                    canManageFAQ: false,
                                    canReindex: false,
                                    canModifyPrompt: false,
                                    canChangeBehaviorRules: false,
                                    canUpdateWorkflows: false,
                                    canEnableAIFeatures: false,
                                    canViewAnalytics: false,
                                    canViewPerformanceReports: false,
                                    canExportReports: false,
                                    ...roleForm.aiPermissions,
                                  };
                                  nextAI[item.key as keyof typeof nextAI] = !nextAI[item.key as keyof typeof nextAI];
                                  setRoleForm({ ...roleForm, aiPermissions: nextAI });
                                }}
                                className="cursor-pointer transition"
                              >
                                {isVal ? (
                                  <ToggleRight className="h-5.5 w-5.5 text-emerald-500 fill-emerald-50" />
                                ) : (
                                  <ToggleLeft className="h-5.5 w-5.5 text-slate-350" />
                                )}
                              </button>
                              <span className={isVal ? "font-bold text-slate-950 text-xs" : "text-slate-400 text-xs"}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Group 2: AI Configuration */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                      <span className="font-mono text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        AI Configuration (Super Admin)
                      </span>

                      <div className="space-y-3 pt-2 select-none">
                        {[
                          { key: 'canModifyPrompt', label: 'Can Modify AI System Prompt' },
                          { key: 'canChangeBehaviorRules', label: 'Can Change AI Behaviour Rules' },
                          { key: 'canUpdateWorkflows', label: 'Can Update Conversation Workflows' },
                          { key: 'canEnableAIFeatures', label: 'Can Enable/Disable AI Features' },
                        ].map(item => {
                          const isVal = !!roleForm.aiPermissions?.[item.key as keyof typeof roleForm.aiPermissions];
                          return (
                            <label key={item.key} className="flex items-center gap-2.5 cursor-pointer text-[11px] font-semibold text-slate-700 hover:text-slate-900">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextAI = {
                                    canUploadKnowledge: false,
                                    canCreateFactArticles: false,
                                    canEditFactArticles: false,
                                    canDeleteFactArticles: false,
                                    canUploadStaticDocs: false,
                                    canDeleteStaticDocs: false,
                                    canManageFAQ: false,
                                    canReindex: false,
                                    canModifyPrompt: false,
                                    canChangeBehaviorRules: false,
                                    canUpdateWorkflows: false,
                                    canEnableAIFeatures: false,
                                    canViewAnalytics: false,
                                    canViewPerformanceReports: false,
                                    canExportReports: false,
                                    ...roleForm.aiPermissions,
                                  };
                                  nextAI[item.key as keyof typeof nextAI] = !nextAI[item.key as keyof typeof nextAI];
                                  setRoleForm({ ...roleForm, aiPermissions: nextAI });
                                }}
                                className="cursor-pointer transition"
                              >
                                {isVal ? (
                                  <ToggleRight className="h-5.5 w-5.5 text-rose-500 fill-rose-50" />
                                ) : (
                                  <ToggleLeft className="h-5.5 w-5.5 text-slate-350" />
                                )}
                              </button>
                              <span className={isVal ? "font-bold text-slate-950 text-xs" : "text-slate-400 text-xs"}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Group 3: Analytics */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3.5">
                      <span className="font-mono text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        Usage Analytics & Reports
                      </span>

                      <div className="space-y-3 pt-2 select-none">
                        {[
                          { key: 'canViewAnalytics', label: 'Can View AI Usage Analytics' },
                          { key: 'canViewPerformanceReports', label: 'Can View Knowledge Performance' },
                          { key: 'canExportReports', label: 'Can Export AI Reports' },
                        ].map(item => {
                          const isVal = !!roleForm.aiPermissions?.[item.key as keyof typeof roleForm.aiPermissions];
                          return (
                            <label key={item.key} className="flex items-center gap-2.5 cursor-pointer text-[11px] font-semibold text-slate-700 hover:text-slate-900">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextAI = {
                                    canUploadKnowledge: false,
                                    canCreateFactArticles: false,
                                    canEditFactArticles: false,
                                    canDeleteFactArticles: false,
                                    canUploadStaticDocs: false,
                                    canDeleteStaticDocs: false,
                                    canManageFAQ: false,
                                    canReindex: false,
                                    canModifyPrompt: false,
                                    canChangeBehaviorRules: false,
                                    canUpdateWorkflows: false,
                                    canEnableAIFeatures: false,
                                    canViewAnalytics: false,
                                    canViewPerformanceReports: false,
                                    canExportReports: false,
                                    ...roleForm.aiPermissions,
                                  };
                                  nextAI[item.key as keyof typeof nextAI] = !nextAI[item.key as keyof typeof nextAI];
                                  setRoleForm({ ...roleForm, aiPermissions: nextAI });
                                }}
                                className="cursor-pointer transition"
                              >
                                {isVal ? (
                                  <ToggleRight className="h-5.5 w-5.5 text-amber-500 fill-amber-50" />
                                ) : (
                                  <ToggleLeft className="h-5.5 w-5.5 text-slate-350" />
                                )}
                              </button>
                              <span className={isVal ? "font-bold text-slate-950 text-xs" : "text-slate-400 text-xs"}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Submits and quits */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRole(false)}
                    className="px-4 py-2 text-slate-705 border border-slate-202 font-bold font-sans rounded-xl hover:bg-slate-50 cursor-pointer text-[11x]"
                  >
                    Quit Setup
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition font-mono uppercase tracking-wider text-[11px] cursor-pointer shadow-md"
                  >
                    Commit Privileges Profile
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* SUB-VIEW 2B: ROLES MASTER INDEX LIST */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
              {roles.map((role) => {
                const isEnabled = role.status === 'Enabled';
                const roleUserCount = adminUsers.filter(u => u.roleName === role.name).length;
                
                return (
                  <div 
                    key={role.id} 
                    className={`bg-white border rounded-2xl p-5 shadow-3xs flex flex-col justify-between space-y-4 relative overflow-hidden transition-all ${
                      isEnabled ? 'border-slate-200' : 'border-slate-150 bg-slate-5/50 opacity-70'
                    }`}
                  >
                    
                    {/* Corner accent lines */}
                    <div className={`absolute top-0 inset-x-0 h-1 ${role.isSystemRole ? 'bg-orange-500' : 'bg-slate-400'}`} />

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-[#111827] text-sm flex items-center gap-1 leading-none">
                            {role.name}
                            {role.isSystemRole && (
                              <span className="text-[8px] bg-orange-100 text-orange-700 font-bold border border-orange-200 px-1.5 rounded uppercase font-mono">
                                System Primary
                              </span>
                            )}
                          </h4>
                          <span className="block font-mono text-[9px] uppercase font-bold text-slate-400">
                            Data scope: {role.dataAccessScope} • {roleUserCount} User mappings
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleRoleStatus(role.id)}
                          className="cursor-pointer transition block"
                          title="Click to Disable or Enable Role Privilege profiles"
                          disabled={role.isSystemRole}
                        >
                          {isEnabled ? (
                            <span className="text-[9px] font-mono uppercase bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 border border-emerald-100 rounded-full">
                              Active Gate
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                              Disabled
                            </span>
                          )}
                        </button>
                      </div>

                      <p className="text-xs font-light text-slate-500 leading-relaxed pt-1.5 border-t border-slate-100">
                        {role.description}
                      </p>
                    </div>

                    {/* Operational controls */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 font-mono text-[10px]">
                      
                      <button
                        onClick={() => handleCloneRole(role)}
                        className="inline-flex items-center gap-1 text-slate-500 font-bold hover:text-slate-900 cursor-pointer"
                        title="Clone role specs"
                      >
                        <Copy className="h-3 w-3" /> Duplicate Spec
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleTriggerEditRole(role)}
                          className="text-slate-650 hover:text-slate-900 font-extrabold cursor-pointer"
                        >
                          Adjust Permissions
                        </button>

                        {!role.isSystemRole && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}

              {/* Add Custom Role Box */}
              <div 
                onClick={handleInitCreateRole}
                className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 hover:bg-slate-100 transition flex flex-col items-center justify-center text-center space-y-2 group cursor-pointer"
              >
                <div className="p-3 bg-white border border-slate-202 rounded-full text-slate-500 group-hover:text-orange-550 transition shadow-3xs">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-black text-slate-800 text-sm">Deploy Custom Access Role</span>
                  <p className="text-[10px] text-slate-450 mt-1 max-w-xs leading-relaxed">
                    Instantly declare modular constraints, custom data scopes, and navigation limits for specific departments.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 3: AUDITS & HISTORICAL IP/LOGIN LOGS */}
      {activeTab === 'Security Logs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* SECURITY STATUS METRIC */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-850 space-y-2 relative overflow-hidden">
              <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-500">Intrusion Shield Status</span>
              <span className="text-xl font-mono text-emerald-400 font-black flex items-center gap-1">
                ● SECURITY SAFE / ONLINE
              </span>
              <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans font-light">
                Secure SSL/HTTPS certificates active. Multi-tier API route proxy filters are active with 0 active breaches logged.
              </p>
            </div>

            <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-850 space-y-2 relative overflow-hidden">
              <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-500">Live Workspace Session Connections</span>
              <span className="text-xl font-mono text-white font-black">
                {adminUsers.length} Active Nodes Coordinates
              </span>
              <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans font-light">
                Session cookie tokens verification cycle runs on every sub-route interaction. Re-auth triggers on 12hr idle bounds.
              </p>
            </div>

            <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-850 space-y-2 relative overflow-hidden">
              <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-500">IP Tunnel Encapsulations</span>
              <span className="text-xl font-mono text-blue-400 font-black">
                128-Bit SHA Encryption
              </span>
              <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans font-light">
                Operational records and private owner direct coordinates encrypted on cold relational database files directly.
              </p>
            </div>

          </div>

          {/* ACTIVE TELEMETRY LOG TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center select-none font-mono text-[10px] uppercase font-bold text-slate-600">
              <span>🔒 Multi-User Action Audit Audit Logs (Last 50 Actions)</span>
              <span>IP Tracking: Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse text-slate-700">
                <thead>
                  <tr className="bg-slate-100 font-mono text-[9px] uppercase tracking-widest text-slate-450 h-10 border-b border-slate-200">
                    <th className="pl-6 font-black py-3">Timestamp</th>
                    <th className="font-black py-3">Access Member Node</th>
                    <th className="font-black py-3">Operation Target Action</th>
                    <th className="font-black py-3 text-center">Connection Client IP</th>
                    <th className="font-black py-3">Device Engine Platform</th>
                    <th className="font-black py-3 text-right pr-6">Status Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-light text-slate-605">
                  {auditLogs.slice(0, 50).map((lg, idx) => (
                    <tr key={idx} className="hover:bg-slate-5/5 transition-all text-xs">
                      <td className="pl-6 py-4 font-mono text-[10.5px] text-slate-450">{lg.ts}</td>
                      <td className="py-4 font-extrabold text-slate-800">{lg.name}</td>
                      <td className="py-4 text-[#0f172a] font-normal italic">"{lg.act}"</td>
                      <td className="py-4 font-mono text-[10.5px] text-slate-500 text-center">{lg.ip}</td>
                      <td className="py-4 text-slate-500 font-sans text-[11px]">{lg.dev}</td>
                      <td className="py-4 text-right pr-6 font-mono text-[10px] font-black">
                        <span className={`px-2 py-0.5 rounded-md ${
                          lg.state.includes('_OK') || lg.state === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'bg-red-50 text-red-600'
                        }`}>
                          {lg.state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3. MODAL COMPONENT WINDOWS */}

      {/* MODAL 3A: RESET COORDINATES PASSCODE DIALOGUE */}
      {resetPassUserId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-left">
          <div className="bg-white border border-slate-205 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setResetPassUserId(null)}
              className="absolute right-4.5 top-4.5 p-1 text-slate-400 hover:text-slate-655 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-xl text-orange-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">Reset Coordinator Passcode</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Assign dynamic login password values</p>
              </div>
            </div>

            <form onSubmit={handleResetPasswordCommit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-slate-400">Target Coordinator email ID</label>
                <div className="w-full bg-slate-50 p-2.5 rounded-lg text-slate-500 font-mono select-all">
                  {adminUsers.find(u => u.id === resetPassUserId)?.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase tracking-wider text-slate-400">New Password Passcode *</label>
                <input
                  type="text" required
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="Minimum 6 digits/characters..."
                  className="w-full bg-white border border-slate-200 text-slate-705 text-xs rounded-xl px-4 py-2.5 font-mono outline-none focus:border-orange-555"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setResetPassUserId(null)}
                  className="py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold font-mono tracking-wider rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Confirm Reset PASS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3B: HISTORICAL LOGIN ENTRY TRIGGERS LIST */}
      {viewHistoryUserId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-left">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setViewHistoryUserId(null)}
              className="absolute right-4.5 top-4.5 p-1 text-slate-400 hover:text-slate-655 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                  Credential Log Telemetry: {adminUsers.find(u => u.id === viewHistoryUserId)?.name}
                </h4>
                <p className="text-[10px] text-slate-450 mt-0.5">Historical verification attempts tracking coordinates</p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(loginHistories[viewHistoryUserId] || [
                { id: '1', timestamp: new Date().toLocaleString(), ip: '182.74.4.102', device: 'iOS iPhone 15', browser: 'Safari Mobile Core', location: 'Whitefield, Bengaluru', status: 'Success' },
                { id: '2', timestamp: new Date(Date.now() - 3600000 * 48).toLocaleString(), ip: '106.51.52.4', device: 'Windows Desktop PC', browser: 'Chrome Premium Core', location: 'Hebbal, Bengaluru', status: 'Success' }
              ]).map((lh) => (
                <div key={lh.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10.5px] text-slate-450 block">{lh.timestamp}</span>
                    <span className="font-bold text-slate-800 block text-[11px]">{lh.device} ({lh.browser})</span>
                    <span className="text-[10px] text-slate-400 font-light block">📍 {lh.location} • Client IP: {lh.ip}</span>
                  </div>
                  <span className="px-2.5 py-0.5 border border-emerald-100 bg-emerald-50 text-emerald-700 rounded-full font-mono text-[9px] font-black">
                    {lh.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewHistoryUserId(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold font-sans cursor-pointer"
              >
                Close Audit panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3C: CONFLICT ERROR DATA TRANSIT DIALOGUE */}
      {transferDataState && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-left">
          <div className="bg-white border border-slate-150 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl relative">
            
            <div className="flex items-center gap-3 text-orange-550 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-xl">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#0f172a] leading-tight">Data Override: Transfer Assets</h4>
                <p className="text-[10px] text-slate-450 mt-0.5 uppercase tracking-wide font-mono">Purge Conflict override panel</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Old advisor email <strong>({transferDataState.sourceUserEmail})</strong> manages active listed property assets in your registry pool. Before coordinates are dropped, specify a recipient advisor:
            </p>

            <div className="space-y-4 pt-1.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-slate-400">Target Recipient Advisor Node</label>
                <select
                  value={transferDataState.targetUserEmail}
                  onChange={(e) => setTransferDataState({ ...transferDataState, targetUserEmail: e.target.value })}
                  className="w-full bg-white border border-slate-205 text-slate-705 text-xs p-2.5 rounded-xl cursor-pointer font-bold"
                >
                  {agents.filter(a => a.email !== transferDataState.sourceUserEmail).map(a => (
                    <option key={a.id} value={a.email}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-2 font-bold text-slate-655 cursor-pointer text-[10.5px]">
                  <input
                    type="checkbox"
                    checked={transferDataState.transferProperties}
                    onChange={(e) => setTransferDataState({ ...transferDataState, transferProperties: e.target.checked })}
                    className="rounded text-orange-500 font-bold"
                  /> Re-delegate Active listed properties
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-655 cursor-pointer text-[10.5px]">
                  <input
                    type="checkbox"
                    checked={transferDataState.transferLeads}
                    onChange={(e) => setTransferDataState({ ...transferDataState, transferLeads: e.target.checked })}
                    className="rounded text-orange-500 font-bold"
                  /> Re-delegate assigned lead CRM files
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                onClick={() => setTransferDataState(null)}
                className="py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel, Retain Advisor
              </button>
              <button
                type="button"
                onClick={handleCommitDataTransfer}
                className="py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer font-mono tracking-wider shadow-md hover:bg-slate-800"
              >
                Commit Data Transit
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREDENTIALS SHARING LAYER MAIN MODAL */}
      {activeSharePkg && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-left">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setActiveSharePkg(null)}
              className="absolute right-4.5 top-4.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-xl text-[#ff5a3c]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                  {activeSharePkg.isNewUser ? 'Staff Onboarding Credentials' : 'Staff Login Credentials'}
                </h4>
                <p className="text-[10px] text-slate-450 mt-0.5 font-mono">Automatically generated data distribution layer</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl font-mono space-y-2 select-all">
                <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">Staff Login Information</h3>
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span className="text-slate-500 text-[10px]">Name:</span>
                  <span className="text-slate-900 font-bold">{activeSharePkg.user.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span className="text-slate-500 text-[10px]">Role:</span>
                  <span className="text-slate-900 font-bold">{activeSharePkg.user.roleName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span className="text-slate-500 text-[10px]">Login URL:</span>
                  <span className="text-blue-600 font-bold underline select-all break-all">{window.location.origin}/admin/login</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span className="text-slate-500 text-[10px]">Email:</span>
                  <span className="text-slate-900 font-bold select-all">{activeSharePkg.user.email}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500 text-[10px]">Password:</span>
                  <span className="text-amber-605 font-black tracking-wide select-all bg-amber-50 px-1.5 rounded">{activeSharePkg.tempPassword}</span>
                </div>
              </div>

              <div className="bg-slate-55 border border-slate-150 p-3 rounded-lg text-[10.5px] text-slate-500 leading-relaxed font-sans font-normal">
                💡 <span className="font-semibold text-slate-705">Account Activation Status:</span> Active & Pending password-change lock enforced. Login portal redirection requires coordinate Super Admin clearance passcodes.
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSendViaWhatsApp(activeSharePkg.user, activeSharePkg.tempPassword || '')}
                  className="py-2 px-3 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold rounded-xl text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs"
                >
                  <span>Send via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendViaEmail(activeSharePkg.user, activeSharePkg.tempPassword || '')}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs"
                >
                  <span>Send via Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopyCleanLoginCredentials(activeSharePkg.user, activeSharePkg.tempPassword);
                  }}
                  className="py-2 px-3 col-span-2 border border-slate-205 text-slate-705 hover:bg-slate-50 font-bold rounded-xl text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Copy Credentials Package</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSharePkg(null)}
                  className="py-2 px-3 col-span-2 border border-dashed border-slate-200 text-slate-400 hover:text-slate-600 font-bold rounded-xl text-[11px] transition cursor-pointer"
                >
                  Cancel Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
