import React, { useState } from 'react';
import { ShieldAlert, Users, CheckCircle2 } from 'lucide-react';

interface RolePermissionsProps {
  currentRole: string;
  onRoleChange: (newRole: string) => void;
}

export default function RolePermissions({ currentRole, onRoleChange }: RolePermissionsProps) {
  const roles = [
    { id: 'Super Admin', desc: 'Full control over layouts, publishing, database seeding and system versions.' },
    { id: 'Admin', desc: 'Can add, edit, and duplicate banners, but cannot revert database structural schemas.' },
    { id: 'Marketing Manager', desc: 'Can edit titles, buttons, CTA links, and view advanced CTR analytics logs.' },
    { id: 'Content Editor', desc: 'Can adjust descriptions and replace background slide images.' },
    { id: 'Read Only', desc: 'View-only access to preview dimensions and analytics tracking.' }
  ];

  const permissionsList = [
    { name: 'visual_editor_access', label: 'Access Visual Canvas Editor' },
    { name: 'publish_banners', label: 'Publish / Unpublish Slides' },
    { name: 'delete_banners', label: 'Delete / Archive Slides' },
    { name: 'advanced_analytics', label: 'Access CTR Conversion Analytics' },
    { name: 'version_rollback', label: 'Perform Structural Undo / Redo' },
    { name: 'modify_canvas_ratios', label: 'Modify Custom Height & Device Margins' }
  ];

  // Map roles to their pre-set permissions
  const getPermissionsForRole = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return permissionsList.map(p => p.name);
      case 'Admin':
        return ['visual_editor_access', 'publish_banners', 'advanced_analytics', 'modify_canvas_ratios'];
      case 'Marketing Manager':
        return ['visual_editor_access', 'advanced_analytics'];
      case 'Content Editor':
        return ['visual_editor_access'];
      case 'Read Only':
      default:
        return [];
    }
  };

  const activePerms = getPermissionsForRole(currentRole);

  return (
    <div className="space-y-6" id="hero-role-permissions">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <ShieldAlert className="w-5 h-5 text-[#10B981]" />
        <h3 className="font-serif text-lg font-bold text-slate-800">Role-Based Banner Permissions Controls</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Select simulated Role */}
        <div className="space-y-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider font-mono">Simulate Admin Role</p>
          <div className="space-y-3">
            {roles.map((r) => (
              <label 
                key={r.id} 
                className={`p-3 border rounded-xl flex items-start gap-3.5 cursor-pointer transition ${
                  currentRole === r.id 
                    ? 'border-[#10B981] bg-emerald-50/20 shadow-sm' 
                    : 'border-slate-105 bg-white hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="cms_simulated_role" 
                  value={r.id} 
                  checked={currentRole === r.id}
                  onChange={() => onRoleChange(r.id)}
                  className="mt-1 text-[#10B981] focus:ring-[#10B981]"
                />
                <div className="text-xs leading-tight">
                  <p className="font-bold text-slate-800">{r.id}</p>
                  <p className="text-slate-450 mt-1 font-light leading-relaxed">{r.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Permissions check list representation */}
        <div className="space-y-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider font-mono">Permissions for {currentRole}</p>
          
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 text-xs">
            {permissionsList.map((p) => {
              const isEnabled = activePerms.includes(p.name);
              return (
                <div key={p.name} className="flex items-center justify-between p-2.5 bg-white border border-slate-200/60 rounded-xl">
                  <span className="font-medium text-slate-700">{p.label}</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    {isEnabled ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-mono text-[10px] font-black uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Authorized
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px] uppercase">Restricted</span>
                    )}
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
