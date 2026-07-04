import React from 'react';
import { ShieldCheck, KeyRound, Edit, Trash2 } from 'lucide-react';
import { AdminUser, PermissionSet } from '../types';

interface StaffAccessMatrixProps {
  adminUsers: AdminUser[];
  editingUserId: string | null;
  newUserName: string;
  setNewUserName: (val: string) => void;
  newUserEmail: string;
  setNewUserEmail: (val: string) => void;
  newUserPassword: string;
  setNewUserPassword: (val: string) => void;
  newUserRoleName: string;
  setNewUserRoleName: (val: string) => void;
  newUserPermissions: PermissionSet;
  setNewUserPermissions: (val: PermissionSet) => void;
  userActionSuccess: string | null;
  handleCreateOrUpdateUser: (e: React.FormEvent) => void;
  handleEditUserClick: (user: AdminUser) => void;
  handleDeleteUserClick: (id: string, name: string) => void;
  resetUsersForm: () => void;
}

export default function StaffAccessMatrix({
  adminUsers,
  editingUserId,
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserRoleName,
  setNewUserRoleName,
  newUserPermissions,
  setNewUserPermissions,
  userActionSuccess,
  handleCreateOrUpdateUser,
  handleEditUserClick,
  handleDeleteUserClick,
  resetUsersForm
}: StaffAccessMatrixProps) {
  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300" id="staff-access-matrix-viewport">
      
      {/* Educational Header */}
      <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-orange-400/10 text-orange-400 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">System Access Authorization Board</h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              As the Administrator, you represent the highest node in the network chain of command. You have total agency to register portal credentials for advisors/assistant staff which are stored persistently. By selecting or deselecting individual checkboxes, you declare exactly which menus, configuration buttons, and administrative parameters are visible and accessible to them!
            </p>
          </div>
        </div>
      </div>

      {/* Twin Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 1. Left Column: Security Co-ordinator Registration Form */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-850 p-6 rounded-2xl">
          <h3 className="text-white text-sm font-extrabold font-mono tracking-wide uppercase border-b border-slate-900 pb-3 flex items-center gap-2">
            <KeyRound className="h-4.5 w-4.5 text-orange-400" />
            {editingUserId ? 'Modify Security Credentials' : 'Register New Coordinator'}
          </h3>

          <form onSubmit={handleCreateOrUpdateUser} className="space-y-4.5 mt-5">
            {userActionSuccess && (
              <div className="p-3.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-xl font-mono text-[10px] font-bold text-center animate-pulse">
                {userActionSuccess}
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="block text-slate-450 font-mono text-[9px] uppercase font-black">Staff Full Name</label>
              <input
                type="text"
                placeholder="e.g. Raghav Reddy"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 p-3 rounded-xl text-white outline-none focus:border-[#ff5a3c] text-xs transition"
                required
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-450 font-mono text-[9px] uppercase font-black">Email Coordinate (User Login ID)</label>
              <input
                type="email"
                placeholder="staff@dvarixrealty.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 p-3 rounded-xl text-white outline-none focus:border-[#ff5a3c] text-xs transition"
                required
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-450 font-mono text-[9px] uppercase font-black">Access Passcode (Password)</label>
              <input
                type="text"
                placeholder="A secure password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 p-3 rounded-xl text-white outline-none focus:border-[#ff5a3c] text-xs transition font-mono"
                required
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-455 font-mono text-[9px] uppercase font-black">Corporate Role Label</label>
              <input
                type="text"
                placeholder="e.g. Portfolio Manager"
                value={newUserRoleName}
                onChange={(e) => setNewUserRoleName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 p-3 rounded-xl text-white outline-none focus:border-[#ff5a3c] text-xs transition"
                required
              />
            </div>

            {/* Permission Checkboxes Section */}
            <div className="space-y-3 bg-slate-905 p-4 border border-slate-900 rounded-xl mt-2">
              <span className="block text-slate-400 font-mono text-[9.5px] uppercase font-black tracking-wide border-b border-slate-850 pb-1.5 mb-2 text-[#ff5a3c]">
                Authorized Option Checkboxes
              </span>

              <div className="space-y-2.5 font-mono text-[10.5px]">
                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newUserPermissions.canManageProperties}
                    onChange={(e) => setNewUserPermissions({
                      ...newUserPermissions,
                      canManageProperties: e.target.checked
                    })}
                    className="rounded accent-[#ff5a3c] h-3.5 w-3.5 cursor-pointer bg-slate-800"
                  />
                  Allow property insertions/edits
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newUserPermissions.canManageCategories}
                    onChange={(e) => setNewUserPermissions({
                      ...newUserPermissions,
                      canManageCategories: e.target.checked
                    })}
                    className="rounded accent-[#ff5a3c] h-3.5 w-3.5 cursor-pointer bg-slate-800"
                  />
                  Authorize Category classification modify
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newUserPermissions.canManageAgents}
                    onChange={(e) => setNewUserPermissions({
                      ...newUserPermissions,
                      canManageAgents: e.target.checked
                    })}
                    className="rounded accent-[#ff5a3c] h-3.5 w-3.5 cursor-pointer bg-slate-800"
                  />
                  Authorize Advisor listing and roster actions
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newUserPermissions.canManageMap}
                    onChange={(e) => setNewUserPermissions({
                      ...newUserPermissions,
                      canManageMap: e.target.checked
                    })}
                    className="rounded accent-[#ff5a3c] h-3.5 w-3.5 cursor-pointer bg-slate-800"
                  />
                  Authorize territorial GIS node mapping
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newUserPermissions.canReplyInquiries}
                    onChange={(e) => setNewUserPermissions({
                      ...newUserPermissions,
                      canReplyInquiries: e.target.checked
                    })}
                    className="rounded accent-[#ff5a3c] h-3.5 w-3.5 cursor-pointer bg-slate-800"
                  />
                  Allow replying direct leads inboxes
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newUserPermissions.canManageUsers}
                    onChange={(e) => setNewUserPermissions({
                      ...newUserPermissions,
                      canManageUsers: e.target.checked
                    })}
                    className="rounded accent-[#ff5a3c] h-3.5 w-3.5 cursor-pointer bg-slate-800"
                  />
                  Authorize User Account Administration
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#ff5a3c] text-white rounded-xl hover:opacity-90 transition font-mono text-[10.5px] font-black uppercase tracking-wider cursor-pointer"
              >
                {editingUserId ? 'Update Authorized Access' : 'Authorize Coordinator Credentials'}
              </button>
              {editingUserId && (
                <button
                  type="button"
                  onClick={resetUsersForm}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition font-mono text-[10.5px] uppercase cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 2. Registered Clearance List & Active Status */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-850 p-6 rounded-2xl relative">
          <h3 className="text-white text-sm font-extrabold font-mono tracking-wide uppercase border-b border-slate-900 pb-3">
            Active Clearance Registry ({adminUsers.length})
          </h3>

          <div className="space-y-4.5 mt-5">
            {adminUsers.map((user) => {
              const permissionsList = [
                { name: 'Properties', active: user.permissions.canManageProperties },
                { name: 'Categories', active: user.permissions.canManageCategories },
                { name: 'Agents', active: user.permissions.canManageAgents },
                { name: 'GIS Maps', active: user.permissions.canManageMap },
                { name: 'Leads CRM', active: user.permissions.canReplyInquiries },
                { name: 'Users Matrix', active: user.permissions.canManageUsers }
              ];

              return (
                <div
                  key={user.id}
                  className={`p-4 bg-slate-900/45 border ${
                    user.id === editingUserId ? 'border-[#ff5a3c]' : 'border-slate-905'
                  } rounded-xl hover:border-slate-800 transition`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-extrabold text-sm block">{user.name}</span>
                        <span className="px-2 py-0.5 rounded bg-orange-400/10 text-orange-400 text-[8px] font-mono font-bold uppercase border border-orange-400/20">
                          {user.roleName}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px] mt-0.5 block">{user.email}</span>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={() => handleEditUserClick(user)}
                        className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-[9.5px] font-mono font-semibold uppercase tracking-wider rounded-md border border-slate-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="h-3 w-3" /> Adjust Options
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUserClick(user.id, user.name)}
                        className={`px-2.5 py-1 bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 text-[9.5px] font-mono font-semibold uppercase tracking-wider rounded-md border border-slate-900 transition flex items-center gap-1 cursor-pointer ${
                          user.id === 'user-super' ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        disabled={user.id === 'user-super'}
                      >
                        <Trash2 className="h-3 w-3" /> Revoke
                      </button>
                    </div>
                  </div>

                  {/* Permissions pills status */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/60">
                    <span className="block text-[8px] uppercase text-slate-500 font-mono font-extrabold tracking-widest mb-1.5">
                      Authorized options checkboxes status:
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
                      {permissionsList.map((p) => (
                        <span
                          key={p.name}
                          className={`px-2 py-0.5 rounded-full border ${
                            p.active
                              ? 'bg-emerald-450/10 text-emerald-400 border-emerald-450/20 font-bold'
                              : 'bg-slate-900/60 text-slate-600 border-slate-950'
                          }`}
                        >
                          {p.name}: {p.active ? 'YES ✓' : 'NO ❌'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
