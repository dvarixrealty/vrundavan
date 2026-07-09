import React, { useState, useEffect } from 'react';
import { 
  Palette, Save, RotateCcw, Copy, Clipboard, Check, 
  Trash2, Plus, Download, Upload, Shield, Users, 
  Settings, Layers, Sliders, Type, Grid, FileText, 
  Eye, EyeOff, Layout, Heart, HelpCircle
} from 'lucide-react';
import { AdminTheme } from '../types';
import { firebaseService } from '../lib/firebaseService';

export const PRESET_THEMES: Record<string, Omit<AdminTheme, 'themeId' | 'createdBy' | 'updatedAt'>> = {
  royal_blue: {
    themeName: 'Royal Blue (Default)',
    sidebar: {
      background: '#0f172a', hover: '#1e293b', active: '#1e3a8a', border: '#1e293b',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', text: '#94a3b8', activeText: '#ffffff',
      icon: '#64748b', activeIcon: '#3b82f6', divider: '#1e293b', badgeBg: '#ef4444',
      badgeText: '#ffffff', accordionBg: '#0f172a', accordionHover: '#1e293b', accordionBorder: '#1e293b',
    },
    header: {
      background: '#ffffff', border: '#e2e8f0', text: '#0f172a', searchBg: '#f1f5f9',
      notificationIcon: '#64748b', profileIcon: '#3b82f6', shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    content: {
      background: '#f8fafc', pageBg: '#f8fafc', cards: '#ffffff', tables: '#ffffff',
      forms: '#ffffff', dialogs: '#ffffff', popups: '#ffffff', drawer: '#ffffff',
    },
    buttons: {
      primaryBg: '#2563eb', primaryText: '#ffffff', secondaryBg: '#64748b', secondaryText: '#ffffff',
      successBg: '#16a34a', successText: '#ffffff', dangerBg: '#dc2626', dangerText: '#ffffff',
      warningBg: '#ca8a04', warningText: '#ffffff', infoBg: '#0891b2', infoText: '#ffffff',
      hoverOpacity: 85, shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', borderRadius: '0.375rem',
    },
    inputs: {
      background: '#ffffff', border: '#cbd5e1', focusBorder: '#3b82f6', placeholder: '#94a3b8',
      checkbox: '#2563eb', radio: '#2563eb', switchBg: '#cbd5e1', dropdown: '#ffffff',
    },
    typography: {
      headingFont: 'Inter', bodyFont: 'Inter', sidebarFont: 'Inter',
      menuWeight: '500', headingWeight: '600', buttonWeight: '500',
      fontSize: '0.875rem', letterSpacing: '0px',
    },
    icons: {
      pack: 'Lucide', size: '18px', color: '#64748b', activeColor: '#3b82f6',
      hoverColor: '#1e293b', rounded: true, outlined: true, filled: false,
    },
    borderRadius: {
      global: '0.5rem', cards: '0.5rem', buttons: '0.375rem', inputs: '0.375rem',
      sidebar: '0.375rem', dropdown: '0.375rem', dialogs: '0.5rem', sliders: '9999px',
    },
    shadowSettings: { type: 'Soft' },
    layout: {
      sidebarWidth: '280px', expandedWidth: '280px', miniWidth: '72px', headerHeight: '64px',
      contentWidth: 'Comfortable', compactMode: false, comfortableMode: true, spaciousMode: false,
    }
  },
  enterprise_cyan: {
    themeName: 'Enterprise Cyan',
    sidebar: {
      background: '#0c1a24', hover: '#162e3d', active: '#0ea5e9', border: '#162e3d',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', text: '#cbd5e1', activeText: '#ffffff',
      icon: '#38bdf8', activeIcon: '#ffffff', divider: '#162e3d', badgeBg: '#06b6d4',
      badgeText: '#ffffff', accordionBg: '#0c1a24', accordionHover: '#162e3d', accordionBorder: '#162e3d',
    },
    header: {
      background: '#0f2433', border: '#162e3d', text: '#cbd5e1', searchBg: '#0c1a24',
      notificationIcon: '#38bdf8', profileIcon: '#0ea5e9', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    content: {
      background: '#09131a', pageBg: '#09131a', cards: '#0c1a24', tables: '#0c1a24',
      forms: '#0f2433', dialogs: '#0c1a24', popups: '#0c1a24', drawer: '#0c1a24',
    },
    buttons: {
      primaryBg: '#0ea5e9', primaryText: '#ffffff', secondaryBg: '#475569', secondaryText: '#ffffff',
      successBg: '#10b981', successText: '#ffffff', dangerBg: '#f43f5e', dangerText: '#ffffff',
      warningBg: '#f59e0b', warningText: '#ffffff', infoBg: '#06b6d4', infoText: '#ffffff',
      hoverOpacity: 80, shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '0.5rem',
    },
    inputs: {
      background: '#09131a', border: '#162e3d', focusBorder: '#0ea5e9', placeholder: '#64748b',
      checkbox: '#0ea5e9', radio: '#0ea5e9', switchBg: '#1e293b', dropdown: '#0c1a24',
    },
    typography: {
      headingFont: 'Space Grotesk', bodyFont: 'Inter', sidebarFont: 'Space Grotesk',
      menuWeight: '600', headingWeight: '700', buttonWeight: '600',
      fontSize: '0.875rem', letterSpacing: '0.5px',
    },
    icons: {
      pack: 'Lucide', size: '18px', color: '#38bdf8', activeColor: '#ffffff',
      hoverColor: '#0ea5e9', rounded: true, outlined: true, filled: true,
    },
    borderRadius: {
      global: '0.75rem', cards: '0.75rem', buttons: '0.5rem', inputs: '0.5rem',
      sidebar: '0.5rem', dropdown: '0.5rem', dialogs: '0.75rem', sliders: '9999px',
    },
    shadowSettings: { type: 'Luxury' },
    layout: {
      sidebarWidth: '280px', expandedWidth: '280px', miniWidth: '72px', headerHeight: '64px',
      contentWidth: 'Comfortable', compactMode: false, comfortableMode: true, spaciousMode: false,
    }
  },
  emerald: {
    themeName: 'Emerald Workspace',
    sidebar: {
      background: '#064e3b', hover: '#047857', active: '#059669', border: '#047857',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', text: '#d1fae5', activeText: '#ffffff',
      icon: '#34d399', activeIcon: '#ffffff', divider: '#047857', badgeBg: '#10b981',
      badgeText: '#ffffff', accordionBg: '#064e3b', accordionHover: '#047857', accordionBorder: '#047857',
    },
    header: {
      background: '#ffffff', border: '#e2e8f0', text: '#064e3b', searchBg: '#f0fdf4',
      notificationIcon: '#059669', profileIcon: '#059669', shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    },
    content: {
      background: '#f0fdf4', pageBg: '#f0fdf4', cards: '#ffffff', tables: '#ffffff',
      forms: '#ffffff', dialogs: '#ffffff', popups: '#ffffff', drawer: '#ffffff',
    },
    buttons: {
      primaryBg: '#059669', primaryText: '#ffffff', secondaryBg: '#64748b', secondaryText: '#ffffff',
      successBg: '#10b981', successText: '#ffffff', dangerBg: '#ef4444', dangerText: '#ffffff',
      warningBg: '#f59e0b', warningText: '#ffffff', infoBg: '#06b6d4', infoText: '#ffffff',
      hoverOpacity: 85, shadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)', borderRadius: '0.375rem',
    },
    inputs: {
      background: '#ffffff', border: '#a7f3d0', focusBorder: '#059669', placeholder: '#64748b',
      checkbox: '#059669', radio: '#059669', switchBg: '#cbd5e1', dropdown: '#ffffff',
    },
    typography: {
      headingFont: 'Outfit', bodyFont: 'Inter', sidebarFont: 'Outfit',
      menuWeight: '500', headingWeight: '600', buttonWeight: '600',
      fontSize: '0.875rem', letterSpacing: '0px',
    },
    icons: {
      pack: 'Lucide', size: '18px', color: '#34d399', activeColor: '#ffffff',
      hoverColor: '#059669', rounded: true, outlined: true, filled: false,
    },
    borderRadius: {
      global: '0.5rem', cards: '0.5rem', buttons: '0.375rem', inputs: '0.375rem',
      sidebar: '0.375rem', dropdown: '0.375rem', dialogs: '0.5rem', sliders: '9999px',
    },
    shadowSettings: { type: 'Soft' },
    layout: {
      sidebarWidth: '280px', expandedWidth: '280px', miniWidth: '72px', headerHeight: '64px',
      contentWidth: 'Comfortable', compactMode: false, comfortableMode: true, spaciousMode: false,
    }
  },
  slate: {
    themeName: 'Slate Professional',
    sidebar: {
      background: '#1e293b', hover: '#334155', active: '#475569', border: '#334155',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', text: '#cbd5e1', activeText: '#ffffff',
      icon: '#94a3b8', activeIcon: '#ffffff', divider: '#334155', badgeBg: '#e2e8f0',
      badgeText: '#0f172a', accordionBg: '#1e293b', accordionHover: '#334155', accordionBorder: '#334155',
    },
    header: {
      background: '#f8fafc', border: '#cbd5e1', text: '#1e293b', searchBg: '#ffffff',
      notificationIcon: '#475569', profileIcon: '#475569', shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    content: {
      background: '#f1f5f9', pageBg: '#f1f5f9', cards: '#ffffff', tables: '#ffffff',
      forms: '#ffffff', dialogs: '#ffffff', popups: '#ffffff', drawer: '#ffffff',
    },
    buttons: {
      primaryBg: '#334155', primaryText: '#ffffff', secondaryBg: '#64748b', secondaryText: '#ffffff',
      successBg: '#0f766e', successText: '#ffffff', dangerBg: '#991b1b', dangerText: '#ffffff',
      warningBg: '#a16207', warningText: '#ffffff', infoBg: '#0e7490', infoText: '#ffffff',
      hoverOpacity: 90, shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', borderRadius: '0.25rem',
    },
    inputs: {
      background: '#ffffff', border: '#94a3b8', focusBorder: '#334155', placeholder: '#64748b',
      checkbox: '#334155', radio: '#334155', switchBg: '#cbd5e1', dropdown: '#ffffff',
    },
    typography: {
      headingFont: 'Inter', bodyFont: 'Inter', sidebarFont: 'Inter',
      menuWeight: '500', headingWeight: '600', buttonWeight: '500',
      fontSize: '0.875rem', letterSpacing: '0px',
    },
    icons: {
      pack: 'Lucide', size: '18px', color: '#94a3b8', activeColor: '#ffffff',
      hoverColor: '#475569', rounded: false, outlined: true, filled: false,
    },
    borderRadius: {
      global: '0.25rem', cards: '0.25rem', buttons: '0.25rem', inputs: '0.25rem',
      sidebar: '0.25rem', dropdown: '0.25rem', dialogs: '0.25rem', sliders: '9999px',
    },
    shadowSettings: { type: 'None' },
    layout: {
      sidebarWidth: '280px', expandedWidth: '280px', miniWidth: '72px', headerHeight: '64px',
      contentWidth: 'Comfortable', compactMode: false, comfortableMode: true, spaciousMode: false,
    }
  },
  corporate_gray: {
    themeName: 'Corporate Gray',
    sidebar: {
      background: '#374151', hover: '#4b5563', active: '#1f2937', border: '#4b5563',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', text: '#f3f4f6', activeText: '#ffffff',
      icon: '#d1d5db', activeIcon: '#ffffff', divider: '#4b5563', badgeBg: '#ef4444',
      badgeText: '#ffffff', accordionBg: '#374151', accordionHover: '#4b5563', accordionBorder: '#4b5563',
    },
    header: {
      background: '#ffffff', border: '#e5e7eb', text: '#374151', searchBg: '#f3f4f6',
      notificationIcon: '#4b5563', profileIcon: '#1f2937', shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    content: {
      background: '#f9fafb', pageBg: '#f9fafb', cards: '#ffffff', tables: '#ffffff',
      forms: '#ffffff', dialogs: '#ffffff', popups: '#ffffff', drawer: '#ffffff',
    },
    buttons: {
      primaryBg: '#1f2937', primaryText: '#ffffff', secondaryBg: '#4b5563', secondaryText: '#ffffff',
      successBg: '#10b981', successText: '#ffffff', dangerBg: '#ef4444', dangerText: '#ffffff',
      warningBg: '#f59e0b', warningText: '#ffffff', infoBg: '#3b82f6', infoText: '#ffffff',
      hoverOpacity: 85, shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', borderRadius: '0.375rem',
    },
    inputs: {
      background: '#ffffff', border: '#d1d5db', focusBorder: '#1f2937', placeholder: '#9ca3af',
      checkbox: '#1f2937', radio: '#1f2937', switchBg: '#cbd5e1', dropdown: '#ffffff',
    },
    typography: {
      headingFont: 'Inter', bodyFont: 'Inter', sidebarFont: 'Inter',
      menuWeight: '500', headingWeight: '600', buttonWeight: '500',
      fontSize: '0.875rem', letterSpacing: '0px',
    },
    icons: {
      pack: 'Lucide', size: '18px', color: '#9ca3af', activeColor: '#ffffff',
      hoverColor: '#4b5563', rounded: true, outlined: true, filled: false,
    },
    borderRadius: {
      global: '0.375rem', cards: '0.375rem', buttons: '0.375rem', inputs: '0.375rem',
      sidebar: '0.375rem', dropdown: '0.375rem', dialogs: '0.375rem', sliders: '9999px',
    },
    shadowSettings: { type: 'Soft' },
    layout: {
      sidebarWidth: '280px', expandedWidth: '280px', miniWidth: '72px', headerHeight: '64px',
      contentWidth: 'Comfortable', compactMode: false, comfortableMode: true, spaciousMode: false,
    }
  },
  dark_mode: {
    themeName: 'Midnight Dark',
    sidebar: {
      background: '#090d16', hover: '#121824', active: '#3b82f6', border: '#121824',
      shadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', text: '#94a3b8', activeText: '#ffffff',
      icon: '#64748b', activeIcon: '#60a5fa', divider: '#121824', badgeBg: '#ef4444',
      badgeText: '#ffffff', accordionBg: '#090d16', accordionHover: '#121824', accordionBorder: '#121824',
    },
    header: {
      background: '#0d1321', border: '#1e293b', text: '#f8fafc', searchBg: '#090d16',
      notificationIcon: '#94a3b8', profileIcon: '#60a5fa', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)',
    },
    content: {
      background: '#05070c', pageBg: '#05070c', cards: '#0d1321', tables: '#0d1321',
      forms: '#0d1321', dialogs: '#0d1321', popups: '#0d1321', drawer: '#0d1321',
    },
    buttons: {
      primaryBg: '#3b82f6', primaryText: '#ffffff', secondaryBg: '#475569', secondaryText: '#ffffff',
      successBg: '#10b981', successText: '#ffffff', dangerBg: '#f43f5e', dangerText: '#ffffff',
      warningBg: '#ca8a04', warningText: '#ffffff', infoBg: '#06b6d4', infoText: '#ffffff',
      hoverOpacity: 85, shadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)', borderRadius: '0.375rem',
    },
    inputs: {
      background: '#05070c', border: '#1e293b', focusBorder: '#3b82f6', placeholder: '#475569',
      checkbox: '#3b82f6', radio: '#3b82f6', switchBg: '#1e293b', dropdown: '#0d1321',
    },
    typography: {
      headingFont: 'Inter', bodyFont: 'Inter', sidebarFont: 'Inter',
      menuWeight: '500', headingWeight: '600', buttonWeight: '500',
      fontSize: '0.875rem', letterSpacing: '0px',
    },
    icons: {
      pack: 'Lucide', size: '18px', color: '#64748b', activeColor: '#60a5fa',
      hoverColor: '#3b82f6', rounded: true, outlined: true, filled: false,
    },
    borderRadius: {
      global: '0.5rem', cards: '0.5rem', buttons: '0.375rem', inputs: '0.375rem',
      sidebar: '0.375rem', dropdown: '0.375rem', dialogs: '0.5rem', sliders: '9999px',
    },
    shadowSettings: { type: 'Deep' },
    layout: {
      sidebarWidth: '280px', expandedWidth: '280px', miniWidth: '72px', headerHeight: '64px',
      contentWidth: 'Comfortable', compactMode: false, comfortableMode: true, spaciousMode: false,
    }
  },
  ocean: {
    themeName: 'Ocean Breeze',
    sidebar: {
      background: '#075985', hover: '#0369a1', active: '#0284c7', border: '#0369a1',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', text: '#e0f2fe', activeText: '#ffffff',
      icon: '#7dd3fc', activeIcon: '#ffffff', divider: '#0369a1', badgeBg: '#38bdf8',
      badgeText: '#0f172a', accordionBg: '#075985', accordionHover: '#0369a1', accordionBorder: '#0369a1',
    },
    header: {
      background: '#ffffff', border: '#bae6fd', text: '#0369a1', searchBg: '#f0f9ff',
      notificationIcon: '#0284c7', profileIcon: '#0284c7', shadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
    },
    content: {
      background: '#f0f9ff', pageBg: '#f0f9ff', cards: '#ffffff', tables: '#ffffff',
      forms: '#ffffff', dialogs: '#ffffff', popups: '#ffffff', drawer: '#ffffff',
    },
    buttons: {
      primaryBg: '#0284c7', primaryText: '#ffffff', secondaryBg: '#64748b', secondaryText: '#ffffff',
      successBg: '#0d9488', successText: '#ffffff', dangerBg: '#e11d48', dangerText: '#ffffff',
      warningBg: '#d97706', warningText: '#ffffff', infoBg: '#0891b2', infoText: '#ffffff',
      hoverOpacity: 85, shadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)', borderRadius: '0.5rem',
    },
    inputs: {
      background: '#ffffff', border: '#7dd3fc', focusBorder: '#0284c7', placeholder: '#64748b',
      checkbox: '#0284c7', radio: '#0284c7', switchBg: '#cbd5e1', dropdown: '#ffffff',
    },
    typography: {
      headingFont: 'Outfit', bodyFont: 'Inter', sidebarFont: 'Outfit',
      menuWeight: '500', headingWeight: '600', buttonWeight: '600',
      fontSize: '0.875rem', letterSpacing: '0px',
    },
    icons: {
      pack: 'Lucide', size: '18px', color: '#7dd3fc', activeColor: '#ffffff',
      hoverColor: '#0284c7', rounded: true, outlined: true, filled: false,
    },
    borderRadius: {
      global: '0.5rem', cards: '0.5rem', buttons: '0.375rem', inputs: '0.375rem',
      sidebar: '0.375rem', dropdown: '0.375rem', dialogs: '0.5rem', sliders: '9999px',
    },
    shadowSettings: { type: 'Soft' },
    layout: {
      sidebarWidth: '280px', expandedWidth: '280px', miniWidth: '72px', headerHeight: '64px',
      contentWidth: 'Comfortable', compactMode: false, comfortableMode: true, spaciousMode: false,
    }
  },
  purple: {
    themeName: 'Royal Violet',
    sidebar: {
      background: '#4c1d95', hover: '#5b21b6', active: '#6d28d9', border: '#5b21b6',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', text: '#f5f3ff', activeText: '#ffffff',
      icon: '#c084fc', activeIcon: '#ffffff', divider: '#5b21b6', badgeBg: '#a78bfa',
      badgeText: '#1e1b4b', accordionBg: '#4c1d95', accordionHover: '#5b21b6', accordionBorder: '#5b21b6',
    },
    header: {
      background: '#ffffff', border: '#ddd6fe', text: '#5b21b6', searchBg: '#faf5ff',
      notificationIcon: '#6d28d9', profileIcon: '#6d28d9', shadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
    },
    content: {
      background: '#faf5ff', pageBg: '#faf5ff', cards: '#ffffff', tables: '#ffffff',
      forms: '#ffffff', dialogs: '#ffffff', popups: '#ffffff', drawer: '#ffffff',
    },
    buttons: {
      primaryBg: '#6d28d9', primaryText: '#ffffff', secondaryBg: '#64748b', secondaryText: '#ffffff',
      successBg: '#059669', successText: '#ffffff', dangerBg: '#dc2626', dangerText: '#ffffff',
      warningBg: '#d97706', warningText: '#ffffff', infoBg: '#0284c7', infoText: '#ffffff',
      hoverOpacity: 85, shadow: '0 2px 4px 0 rgb(0 0 0 / 0.05)', borderRadius: '0.5rem',
    },
    inputs: {
      background: '#ffffff', border: '#c084fc', focusBorder: '#6d28d9', placeholder: '#64748b',
      checkbox: '#6d28d9', radio: '#6d28d9', switchBg: '#cbd5e1', dropdown: '#ffffff',
    },
    typography: {
      headingFont: 'Outfit', bodyFont: 'Inter', sidebarFont: 'Outfit',
      menuWeight: '500', headingWeight: '600', buttonWeight: '600',
      fontSize: '0.875rem', letterSpacing: '0px',
    },
    icons: {
      pack: 'Lucide', size: '18px', color: '#c084fc', activeColor: '#ffffff',
      hoverColor: '#6d28d9', rounded: true, outlined: true, filled: false,
    },
    borderRadius: {
      global: '0.5rem', cards: '0.5rem', buttons: '0.375rem', inputs: '0.375rem',
      sidebar: '0.375rem', dropdown: '0.375rem', dialogs: '0.5rem', sliders: '9999px',
    },
    shadowSettings: { type: 'Soft' },
    layout: {
      sidebarWidth: '280px', expandedWidth: '280px', miniWidth: '72px', headerHeight: '64px',
      contentWidth: 'Comfortable', compactMode: false, comfortableMode: true, spaciousMode: false,
    }
  }
};

interface ThemeStudioProps {
  currentTheme: AdminTheme;
  onApplyTheme: (theme: AdminTheme) => void;
  isSuperAdminUser: boolean;
  loggedInUserEmail?: string;
}

export default function SaaSThemeStudioModule({ 
  currentTheme, 
  onApplyTheme, 
  isSuperAdminUser,
  loggedInUserEmail 
}: ThemeStudioProps) {
  
  const [activeTab, setActiveTab] = useState<'presets' | 'sidebar' | 'header' | 'content' | 'buttons' | 'inputs' | 'typography' | 'icons' | 'radius' | 'layout' | 'json'>('presets');
  const [themeForm, setThemeForm] = useState<AdminTheme>(() => JSON.parse(JSON.stringify(currentTheme)));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<AdminTheme[]>([]);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load custom presets from Firebase
  useEffect(() => {
    const unsub = firebaseService.subscribeThemePresets(
      (presets) => {
        setCustomPresets(presets);
      },
      (err) => console.error("Could not load custom presets:", err)
    );
    return unsub;
  }, []);

  // Sync themeForm when currentTheme changes globally
  useEffect(() => {
    setThemeForm(JSON.parse(JSON.stringify(currentTheme)));
  }, [currentTheme]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateField = (category: keyof AdminTheme, field: string, value: any) => {
    const updated = { ...themeForm };
    if (category === 'sidebar' || category === 'header' || category === 'content' || category === 'buttons' || category === 'inputs' || category === 'typography' || category === 'icons' || category === 'borderRadius' || category === 'layout') {
      (updated[category] as any)[field] = value;
    } else {
      (updated as any)[category] = value;
    }
    setThemeForm(updated);
    
    // Live preview! Apply instantly
    onApplyTheme(updated);
  };

  const handleSelectPreset = (key: string, isCustom: boolean = false) => {
    let selectedPreset: Omit<AdminTheme, 'themeId' | 'createdBy' | 'updatedAt'>;
    let themeId = key;
    let name = '';

    if (isCustom) {
      const found = customPresets.find(p => p.themeId === key);
      if (!found) return;
      selectedPreset = found;
      name = found.themeName;
    } else {
      selectedPreset = PRESET_THEMES[key];
      name = selectedPreset.themeName;
    }

    const newTheme: AdminTheme = {
      ...JSON.parse(JSON.stringify(selectedPreset)),
      themeId,
      themeName: name,
      createdBy: isCustom ? 'Super Admin' : 'System',
      updatedAt: new Date().toISOString()
    };

    setThemeForm(newTheme);
    onApplyTheme(newTheme);
    showToast(`Applied Theme preset: ${name}`);
  };

  const handleSaveThemeToCloud = async () => {
    try {
      await firebaseService.saveAdminTheme(themeForm);
      showToast("Theme configuration permanently saved & deployed to Firestore!");
    } catch (e) {
      console.error(e);
      showToast("Failed to save theme in Firestore.");
    }
  };

  const handleCreateCustomPreset = async () => {
    if (!newPresetName.trim()) return;
    
    const presetId = `custom_${Date.now()}`;
    const newPreset: AdminTheme = {
      ...JSON.parse(JSON.stringify(themeForm)),
      themeId: presetId,
      themeName: newPresetName.trim(),
      createdBy: loggedInUserEmail || 'Super Admin',
      updatedAt: new Date().toISOString()
    };

    try {
      await firebaseService.saveThemePreset(newPreset);
      setShowSavePresetModal(false);
      setNewPresetName('');
      showToast(`Custom theme preset "${newPreset.themeName}" created!`);
    } catch (e) {
      console.error(e);
      showToast("Failed to create preset.");
    }
  };

  const handleDeletePreset = async (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this custom theme preset?")) return;

    try {
      await firebaseService.deleteThemePreset(presetId);
      showToast("Theme preset deleted successfully.");
    } catch (e) {
      console.error(e);
      showToast("Failed to delete preset.");
    }
  };

  const handleResetToDefault = () => {
    const defaults = PRESET_THEMES.royal_blue;
    const newTheme: AdminTheme = {
      ...JSON.parse(JSON.stringify(defaults)),
      themeId: 'royal_blue',
      themeName: 'Royal Blue (Default)',
      createdBy: 'Super Admin',
      updatedAt: new Date().toISOString()
    };
    setThemeForm(newTheme);
    onApplyTheme(newTheme);
    showToast("Reset workspace theme back to defaults.");
  };

  const handleCopyThemeJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(themeForm, null, 2));
    showToast("Theme configuration JSON copied to clipboard!");
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(pasteInput);
      if (!parsed.sidebar || !parsed.header || !parsed.content) {
        alert("Invalid theme JSON structure. Must contain sidebar, header, and content groups.");
        return;
      }
      const newTheme: AdminTheme = {
        ...parsed,
        themeId: parsed.themeId || `imported_${Date.now()}`,
        themeName: parsed.themeName || 'Imported Theme',
        createdBy: parsed.createdBy || 'Super Admin',
        updatedAt: new Date().toISOString()
      };
      setThemeForm(newTheme);
      onApplyTheme(newTheme);
      setShowPasteModal(false);
      setPasteInput('');
      showToast("Successfully imported theme configuration!");
    } catch (e) {
      alert("Invalid JSON format. Please verify formatting.");
    }
  };

  const handleExportFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(themeForm, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${themeForm.themeName.toLowerCase().replace(/\s+/g, '_')}_theme.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Theme config file exported!");
  };

  const handleCopyHex = (hex: string, key: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Convert Hex to RGB representation helper
  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    if (h.length === 3) {
      const r = parseInt(h.substring(0, 1) + h.substring(0, 1), 16);
      const g = parseInt(h.substring(1, 2) + h.substring(1, 2), 16);
      const b = parseInt(h.substring(2, 3) + h.substring(2, 3), 16);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (h.length === 6) {
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return 'rgb(0, 0, 0)';
  };

  // Color picker custom item helper
  const renderColorRow = (label: string, category: keyof AdminTheme, field: string) => {
    const value = (themeForm[category] as any)[field] || '#ffffff';
    const uniqueKey = `${category}-${field}`;
    
    return (
      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200 shadow-2xs">
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-700">{label}</span>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5">{uniqueKey}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Opacity slider or HEX info */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{value}</span>
              <button 
                onClick={() => handleCopyHex(value, uniqueKey)}
                className="p-1 hover:bg-slate-200 rounded transition text-slate-400 hover:text-slate-600"
                title="Copy color"
              >
                {copiedKey === uniqueKey ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1">{hexToRgb(value)}</span>
          </div>

          {/* Real Input Color picker with elegant size and border */}
          <div className="relative w-10 h-10 rounded-xl border border-slate-300 overflow-hidden shadow-inner cursor-pointer hover:scale-105 transition duration-150">
            <input 
              type="color" 
              value={value.substring(0, 7)} 
              onChange={(e) => handleUpdateField(category, field, e.target.value)}
              className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-125"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] shadow-lg relative font-sans">
      
      {/* Absolute floating success toast */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-slate-900 text-white border border-slate-800 text-xs py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-none">Theme & Appearance Studio</h2>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Configured theme is loaded dynamically across all ERP workspace modules</span>
            </div>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2">
          {isSuperAdminUser ? (
            <>
              <button 
                onClick={handleSaveThemeToCloud}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Theme</span>
              </button>
              
              <button 
                onClick={() => setShowSavePresetModal(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save Preset</span>
              </button>

              <button 
                onClick={() => setShowPasteModal(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-200"
                title="Import Theme JSON"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import JSON</span>
              </button>

              <button 
                onClick={handleExportFile}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-200"
                title="Export Theme JSON file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs border border-amber-100 font-semibold">
              <Shield className="h-3.5 w-3.5" />
              <span>Managers are in theme select-only mode</span>
            </div>
          )}

          <button 
            onClick={handleResetToDefault}
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 p-1.5 rounded-lg border border-slate-200 transition"
            title="Reset theme to system default"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ACTIVE METADATA STATE BAR */}
      <div className="px-5 py-2.5 bg-blue-50/20 border-b border-slate-100 text-left flex items-center justify-between text-[11px] shrink-0 font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current active design schema:</span>
          <span className="font-extrabold text-blue-700">{themeForm.themeName}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Author: <strong className="text-slate-700">{themeForm.createdBy}</strong></span>
          <span>Last deployed: <strong className="text-slate-700">{new Date(themeForm.updatedAt).toLocaleDateString()}</strong></span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN STUDIO INTERFACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sub-Tabs Navigation */}
        <div className="w-56 border-r border-slate-100 overflow-y-auto bg-slate-50/30 py-3 flex flex-col justify-between">
          <div className="px-2 space-y-1">
            <button 
              onClick={() => setActiveTab('presets')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'presets' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Heart className="h-4 w-4" />
              <span>Theme Presets</span>
            </button>
            <div className="h-px bg-slate-200/50 my-2" />
            
            <button 
              onClick={() => setActiveTab('sidebar')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'sidebar' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Layout className="h-4 w-4" />
              <span>Sidebar Colors</span>
            </button>
            <button 
              onClick={() => setActiveTab('header')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'header' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Settings className="h-4 w-4" />
              <span>Header Colors</span>
            </button>
            <button 
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'content' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Layers className="h-4 w-4" />
              <span>Content Canvas</span>
            </button>
            <button 
              onClick={() => setActiveTab('buttons')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'buttons' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Sliders className="h-4 w-4" />
              <span>Button States</span>
            </button>
            <button 
              onClick={() => setActiveTab('inputs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'inputs' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Grid className="h-4 w-4" />
              <span>Input Widgets</span>
            </button>
            <button 
              onClick={() => setActiveTab('typography')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'typography' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Type className="h-4 w-4" />
              <span>Typography Fonts</span>
            </button>
            <button 
              onClick={() => setActiveTab('icons')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'icons' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Palette className="h-4 w-4" />
              <span>Icons Styling</span>
            </button>
            <button 
              onClick={() => setActiveTab('radius')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'radius' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Plus className="h-4 w-4" />
              <span>Border Radii</span>
            </button>
            <button 
              onClick={() => setActiveTab('layout')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${activeTab === 'layout' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Layout className="h-4 w-4" />
              <span>Structure Layout</span>
            </button>
          </div>

          <div className="px-3">
            <button 
              onClick={() => setActiveTab('json')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-mono font-bold text-left transition ${activeTab === 'json' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-850'}`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>PRO_EXPORT_JSON</span>
            </button>
          </div>
        </div>

        {/* Right Active Tab Content Playground Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          
          {/* TAB 1: PRESET THEMES LIST */}
          {activeTab === 'presets' && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Premium ERP Presets</h3>
                <p className="text-xs text-slate-500 mt-1">Deploy stunning, balanced corporate color themes across the system instantly with one tap.</p>
              </div>

              {/* Standard presets grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(PRESET_THEMES).map((key) => {
                  const p = PRESET_THEMES[key];
                  const isActive = themeForm.themeId === key;
                  return (
                    <div 
                      key={key}
                      onClick={() => handleSelectPreset(key, false)}
                      className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between h-36 ${isActive ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10' : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-xs'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-850 block group-hover:text-blue-600 transition">{p.themeName}</span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">SYSTEM PRESET</span>
                        </div>
                        {isActive && <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">ACTIVE</span>}
                      </div>

                      {/* Visual colored swatches representation */}
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.sidebar.background }} title="Sidebar bg" />
                        <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.header.background }} title="Header bg" />
                        <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.content.background }} title="Content bg" />
                        <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.buttons.primaryBg }} title="Buttons bg" />
                        <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.inputs.background }} title="Inputs bg" />
                      </div>

                      <div className="text-[10px] text-slate-500 mt-2 font-mono flex items-center justify-between">
                        <span>Font: {p.typography.headingFont}</span>
                        <span>Radius: {p.borderRadius.global}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom saved presets list */}
              {customPresets.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Organization Presets</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Saves and presets crafted by your Super Admin profiles</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customPresets.map((p) => {
                      const isActive = themeForm.themeId === p.themeId;
                      return (
                        <div 
                          key={p.themeId}
                          onClick={() => handleSelectPreset(p.themeId, true)}
                          className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between h-36 ${isActive ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10' : 'bg-white border-slate-200 hover:border-slate-350'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-850 block">{p.themeName}</span>
                              <span className="text-[10px] font-mono text-slate-400 mt-0.5">BY: {p.createdBy}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              {isActive && <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">ACTIVE</span>}
                              {isSuperAdminUser && (
                                <button 
                                  onClick={(e) => handleDeletePreset(p.themeId, e)}
                                  className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                                  title="Delete custom preset"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-4">
                            <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.sidebar.background }} />
                            <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.header.background }} />
                            <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.content.background }} />
                            <div className="w-6 h-6 rounded-lg border border-slate-100 shadow-2xs" style={{ backgroundColor: p.buttons.primaryBg }} />
                          </div>

                          <div className="text-[10px] text-slate-500 mt-2 font-mono flex items-center justify-between">
                            <span>Saved: {new Date(p.updatedAt).toLocaleDateString()}</span>
                            <span>Font: {p.typography.headingFont}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIDEBAR COLOR CONTROLS */}
          {activeTab === 'sidebar' && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Sidebar Customization</h3>
                <p className="text-xs text-slate-500 mt-1">Design the left main navigation structure according to corporate identity rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {renderColorRow("Sidebar Background Color", "sidebar", "background")}
                {renderColorRow("Sidebar Item Hover Background", "sidebar", "hover")}
                {renderColorRow("Sidebar Item Active Background", "sidebar", "active")}
                {renderColorRow("Sidebar Right Border Line", "sidebar", "border")}
                {renderColorRow("Normal Menu Text Color", "sidebar", "text")}
                {renderColorRow("Active Menu Text Color", "sidebar", "activeText")}
                {renderColorRow("Icon Default Tone", "sidebar", "icon")}
                {renderColorRow("Icon Selected Tone", "sidebar", "activeIcon")}
                {renderColorRow("Menu Dividers Color", "sidebar", "divider")}
                {renderColorRow("Status Badge Background", "sidebar", "badgeBg")}
                {renderColorRow("Status Badge Text Color", "sidebar", "badgeText")}
                {renderColorRow("Submenu Accordion Canvas Background", "sidebar", "accordionBg")}
                {renderColorRow("Submenu Accordion Hover", "sidebar", "accordionHover")}
                {renderColorRow("Submenu Accordion Left Border", "sidebar", "accordionBorder")}
              </div>
            </div>
          )}

          {/* TAB 3: HEADER COLOR CONTROLS */}
          {activeTab === 'header' && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Header Customization</h3>
                <p className="text-xs text-slate-500 mt-1">Style the sticky top header bar containing search logs, user profiles, and buttons.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {renderColorRow("Header Background Color", "header", "background")}
                {renderColorRow("Header Bottom Border", "header", "border")}
                {renderColorRow("Header Text/Title Color", "header", "text")}
                {renderColorRow("Global Search Box Background", "header", "searchBg")}
                {renderColorRow("Notification Bell Icon Color", "header", "notificationIcon")}
                {renderColorRow("Profile Picture Default Border/Icon", "header", "profileIcon")}
              </div>
            </div>
          )}

          {/* TAB 4: CONTENT COLORS */}
          {activeTab === 'content' && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Main Content Canvas</h3>
                <p className="text-xs text-slate-500 mt-1">Design the appearance of dashboard modules, tables, data cards, and dialogue popups.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {renderColorRow("Workspace Overall Background", "content", "background")}
                {renderColorRow("Sub-Page Body Background", "content", "pageBg")}
                {renderColorRow("Data Cards Background Color", "content", "cards")}
                {renderColorRow("Tables Headers/Rows Canvas", "content", "tables")}
                {renderColorRow("Create/Edit Forms Canvas", "content", "forms")}
                {renderColorRow("Dialog Modal Popups Background", "content", "dialogs")}
                {renderColorRow("Dropdown Menu/Popover Background", "content", "popups")}
                {renderColorRow("Sliding Drawers Canvas", "content", "drawer")}
              </div>
            </div>
          )}

          {/* TAB 5: BUTTON COLORS */}
          {activeTab === 'buttons' && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Interactive Action Buttons</h3>
                <p className="text-xs text-slate-500 mt-1">Apply specific tones to state buttons like primary actions, success submission, or danger deleting.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {renderColorRow("Primary Button Background", "buttons", "primaryBg")}
                {renderColorRow("Primary Button Text", "buttons", "primaryText")}
                {renderColorRow("Secondary Button Background", "buttons", "secondaryBg")}
                {renderColorRow("Secondary Button Text", "buttons", "secondaryText")}
                {renderColorRow("Success Actions Background", "buttons", "successBg")}
                {renderColorRow("Success Actions Text Color", "buttons", "successText")}
                {renderColorRow("Danger Actions Background", "buttons", "dangerBg")}
                {renderColorRow("Danger Actions Text Color", "buttons", "dangerText")}
                {renderColorRow("Warning Status Background", "buttons", "warningBg")}
                {renderColorRow("Warning Status Text Color", "buttons", "warningText")}
                {renderColorRow("Info/Advisory Background", "buttons", "infoBg")}
                {renderColorRow("Info/Advisory Text Color", "buttons", "infoText")}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Button State Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Hover Opacity Overlay</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={themeForm.buttons.hoverOpacity}
                        onChange={(e) => handleUpdateField("buttons", "hoverOpacity", parseInt(e.target.value))}
                        className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border">{themeForm.buttons.hoverOpacity}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Adjusts background color opacity on hover</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Shadow Preset</label>
                    <select 
                      value={themeForm.buttons.shadow}
                      onChange={(e) => handleUpdateField("buttons", "shadow", e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500"
                    >
                      <option value="none">None (Flat)</option>
                      <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Soft (1px)</option>
                      <option value="0 4px 6px -1px rgb(0 0 0 / 0.1)">Medium (4px)</option>
                      <option value="0 10px 15px -3px rgb(0 0 0 / 0.1)">Luxury (10px)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INPUTS COLOR CONTROLS */}
          {activeTab === 'inputs' && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Form Input Widgets</h3>
                <p className="text-xs text-slate-500 mt-1">Design the style of text boxes, dropdown selections, check fields, and slider tracks.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {renderColorRow("Input Field Background", "inputs", "background")}
                {renderColorRow("Input Field Border line", "inputs", "border")}
                {renderColorRow("Focus/Select Border line", "inputs", "focusBorder")}
                {renderColorRow("Input Placeholder Text", "inputs", "placeholder")}
                {renderColorRow("Checkbox Fill Color", "inputs", "checkbox")}
                {renderColorRow("Radio Bullet Color", "inputs", "radio")}
                {renderColorRow("Switch Track Background", "inputs", "switchBg")}
                {renderColorRow("Select Dropdown Option Canvas", "inputs", "dropdown")}
              </div>
            </div>
          )}

          {/* TAB 7: TYPOGRAPHY SETTINGS */}
          {activeTab === 'typography' && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Corporate Typography & Font Selection</h3>
                <p className="text-xs text-slate-500 mt-1">Choose elegant typography pairings to give your Realty ERP an elite feeling.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Display Heading Font</label>
                  <select 
                    value={themeForm.typography.headingFont}
                    onChange={(e) => handleUpdateField("typography", "headingFont", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="Inter">Inter (Clean modern)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech forward)</option>
                    <option value="Outfit">Outfit (High prestige)</option>
                    <option value="Playfair Display">Playfair Display (Luxury Editorial)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Symmetry Mono)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Main Body Text Font</label>
                  <select 
                    value={themeForm.typography.bodyFont}
                    onChange={(e) => handleUpdateField("typography", "bodyFont", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="Inter">Inter (Highly legible)</option>
                    <option value="Outfit">Outfit (Warm corporate)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Technical data)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Sidebar Font Style</label>
                  <select 
                    value={themeForm.typography.sidebarFont}
                    onChange={(e) => handleUpdateField("typography", "sidebarFont", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Outfit">Outfit</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Font Size (Base Size)</label>
                  <select 
                    value={themeForm.typography.fontSize}
                    onChange={(e) => handleUpdateField("typography", "fontSize", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="0.8125rem">13px (Compact)</option>
                    <option value="0.875rem">14px (Standard)</option>
                    <option value="0.9375rem">15px (Comfortable)</option>
                    <option value="1rem">16px (Spacious)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Menu Font Weight</label>
                  <select 
                    value={themeForm.typography.menuWeight}
                    onChange={(e) => handleUpdateField("typography", "menuWeight", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Heading Font Weight</label>
                  <select 
                    value={themeForm.typography.headingWeight}
                    onChange={(e) => handleUpdateField("typography", "headingWeight", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extrabold (800)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ICONS STYLING */}
          {activeTab === 'icons' && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">System Icons Styling</h3>
                <p className="text-xs text-slate-500 mt-1">Configure look-and-feel of all illustrative vector action widgets in sidebar and pages.</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5 shadow-2xs">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Active Icon Color</label>
                  <input 
                    type="color" 
                    value={themeForm.icons.activeColor}
                    onChange={(e) => handleUpdateField("icons", "activeColor", e.target.value)}
                    className="w-full h-10 p-0 border-0 cursor-pointer scale-100 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Base Vector Icon Size</label>
                  <select 
                    value={themeForm.icons.size}
                    onChange={(e) => handleUpdateField("icons", "size", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="16px">16px (Micro)</option>
                    <option value="18px">18px (Medium Default)</option>
                    <option value="20px">20px (Comfortable)</option>
                    <option value="22px">22px (Large)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-slate-700 block">Style Formats</span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={themeForm.icons.rounded}
                        onChange={(e) => handleUpdateField("icons", "rounded", e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>Enforce Circular / Rounded Icon Wrappers</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={themeForm.icons.filled}
                        onChange={(e) => handleUpdateField("icons", "filled", e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>Use Filled/Solid Vector Outlines</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: BORDER RADII */}
          {activeTab === 'radius' && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Border Radii (Roundness)</h3>
                <p className="text-xs text-slate-500 mt-1">Make elements sleek and angular, or smooth and circular.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Global Border Radius</label>
                  <select 
                    value={themeForm.borderRadius.global}
                    onChange={(e) => handleUpdateField("borderRadius", "global", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="0px">0px (Flat / Sharp Angular)</option>
                    <option value="0.25rem">4px (Slight Rounded)</option>
                    <option value="0.375rem">6px (Balanced)</option>
                    <option value="0.5rem">8px (Modern Medium)</option>
                    <option value="0.75rem">12px (Smooth / Curved)</option>
                    <option value="1rem">16px (Hyper-Prestige Card)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Data Cards Radii</label>
                  <select 
                    value={themeForm.borderRadius.cards}
                    onChange={(e) => handleUpdateField("borderRadius", "cards", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="0px">Sharp (0px)</option>
                    <option value="0.375rem">Balanced (6px)</option>
                    <option value="0.5rem">Classic (8px)</option>
                    <option value="0.75rem">Luxury (12px)</option>
                    <option value="1rem">Immersive (16px)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Button Corner Radius</label>
                  <select 
                    value={themeForm.borderRadius.buttons}
                    onChange={(e) => handleUpdateField("borderRadius", "buttons", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="0px">Sharp</option>
                    <option value="0.25rem">Slight (4px)</option>
                    <option value="0.375rem">Standard (6px)</option>
                    <option value="0.5rem">Rounded (8px)</option>
                    <option value="9999px">Pill (Circular Capsule)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Input Corner Radius</label>
                  <select 
                    value={themeForm.borderRadius.inputs}
                    onChange={(e) => handleUpdateField("borderRadius", "inputs", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="0px">Sharp</option>
                    <option value="0.25rem">Balanced (4px)</option>
                    <option value="0.375rem">Standard (6px)</option>
                    <option value="0.5rem">Curved (8px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: STRUCTURE LAYOUT */}
          {activeTab === 'layout' && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Structure & Spacing Controls</h3>
                <p className="text-xs text-slate-500 mt-1">Adjust dimensions, widths, and structural density levels of the workspace layout.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Expanded Sidebar Width</label>
                  <select 
                    value={themeForm.layout.expandedWidth}
                    onChange={(e) => {
                      handleUpdateField("layout", "expandedWidth", e.target.value);
                      handleUpdateField("layout", "sidebarWidth", e.target.value);
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="240px">240px (Ultra Compact)</option>
                    <option value="260px">260px (Standard)</option>
                    <option value="280px">280px (Spacious Default)</option>
                    <option value="300px">300px (Immersive)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Mini Sidebar (Icons Width)</label>
                  <select 
                    value={themeForm.layout.miniWidth}
                    onChange={(e) => handleUpdateField("layout", "miniWidth", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="64px">64px (Micro)</option>
                    <option value="72px">72px (Standard Default)</option>
                    <option value="80px">80px (Wide)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Sticky Top Header Height</label>
                  <select 
                    value={themeForm.layout.headerHeight}
                    onChange={(e) => handleUpdateField("layout", "headerHeight", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="56px">56px (Compact)</option>
                    <option value="64px">64px (Balanced Default)</option>
                    <option value="72px">72px (Spacious)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Density / Spacing Mode</label>
                  <select 
                    value={themeForm.layout.contentWidth}
                    onChange={(e) => {
                      const mode = e.target.value;
                      const updated = { ...themeForm.layout };
                      updated.contentWidth = mode;
                      updated.compactMode = mode === 'Compact';
                      updated.comfortableMode = mode === 'Comfortable';
                      updated.spaciousMode = mode === 'Spacious';
                      
                      const finalTheme = { ...themeForm, layout: updated };
                      setThemeForm(finalTheme);
                      onApplyTheme(finalTheme);
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-250 rounded-lg p-2.5 outline-none"
                  >
                    <option value="Compact">Compact (Tight padding, high density data)</option>
                    <option value="Comfortable">Comfortable (Balanced spacing)</option>
                    <option value="Spacious">Spacious (Generous margin cushions)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: EXPORT JSON CODE */}
          {activeTab === 'json' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-mono">EXPORT / RECOVERY PALETTE RAW SCHEMA</h3>
                  <p className="text-xs text-slate-500 mt-1">Deploy theme configurations across development branches, environments, or backup files.</p>
                </div>
                
                <button 
                  onClick={handleCopyThemeJSON}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition"
                >
                  <Clipboard className="h-3.5 w-3.5 text-emerald-400" />
                  <span>COPY_JSON_CLIPBOARD</span>
                </button>
              </div>

              <textarea 
                readOnly 
                value={JSON.stringify(themeForm, null, 2)} 
                className="w-full h-80 font-mono text-[10px] bg-slate-900 text-green-400 p-4 rounded-xl border border-slate-800 outline-none select-all shadow-inner leading-relaxed"
              />
            </div>
          )}

        </div>
      </div>

      {/* DIALOG MODALS SECTION */}
      {/* 1. NEW CUSTOM PRESET SAVE DIALOG */}
      {showSavePresetModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm text-left shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Create Corporate Preset</h3>
            <p className="text-[11px] text-slate-500 mt-1">This saves the current customized styling options into a new local theme preset accessible under Theme Presets.</p>
            
            <div className="mt-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Preset Theme Name</label>
              <input 
                type="text" 
                placeholder="e.g. Bangalore Emerald Elite" 
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => setShowSavePresetModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCustomPreset}
                disabled={!newPresetName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
              >
                Create Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. IMPORT RAW JSON MODAL */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md text-left shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 font-mono">IMPORT DESIGN CONFIG JSON</h3>
            <p className="text-[11px] text-slate-500 mt-1">Paste a valid theme configurations JSON to load the style parameters instantly.</p>
            
            <div className="mt-4">
              <textarea 
                placeholder="Paste JSON here..." 
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                className="w-full h-48 font-mono text-[10px] bg-slate-50 p-3 border border-slate-250 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => {
                  setShowPasteModal(false);
                  setPasteInput('');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleImportJSON}
                disabled={!pasteInput.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-mono font-bold px-3 py-1.5 rounded-lg text-xs transition"
              >
                IMPORT_PALETTE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
