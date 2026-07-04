import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, Plus, Search, MapPin, DollarSign, Layers, CheckSquare, 
  Trash2, Edit, Check, ShieldCheck, FileText, ChevronRight, ListCollapse,
  BadgePercent, Eye, Compass, Coins, Users, Share2, Printer, RefreshCw, 
  Archive, FileCode, CheckCircle2, X, XCircle, Play, History, Calendar, PlusCircle, ArrowLeftRight,
  Sparkles, ToggleLeft, Settings, Database, Activity, AlertTriangle, Download, Trash, CheckSquare as CheckSquareIcon
} from 'lucide-react';
import { Property, CustomRequirement, Agent, PropertyCardConfig, PropertyCardTemplate } from '../types';
import PropertyCard, { formatCurrencyIndia } from './PropertyCard';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { firebaseService } from '../lib/firebaseService';

interface SaaSPropertiesModuleProps {
  properties: Property[];
  categories: any[];
  agents: Agent[];
  isSuperAdmin: boolean;
  userPermissions: any;
  onEditProperty: (p: Property) => void;
  onDeleteProperty: (id: string) => void;
  onSubmitProperty: (e: React.FormEvent, data: any) => void;
  customRequirements: CustomRequirement[];
  mapLocations?: any;
  setMapLocations?: (newMapLocations: any) => void;
  onAddCategory?: (name: string) => void;
  onDeleteCategory?: (name: string) => void;
  setProperties?: (newProperties: Property[]) => void;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  propertyTitle: string;
  action: string;
  operator: string;
  details?: string;
}

export default function SaaSPropertiesModule({
  properties,
  categories,
  agents,
  isSuperAdmin,
  userPermissions,
  onEditProperty,
  onDeleteProperty,
  onSubmitProperty,
  customRequirements,
  setProperties,
  onAddCategory,
  onDeleteCategory
}: SaaSPropertiesModuleProps) {
  
  // Navigation Tabs
  type SubTabType = 'Overview' | 'Manage Listings' | 'Add/Edit Property' | 'Trash & Archives' | 'Card Configurations' | 'Activity Logs' | 'Master Taxonomies';
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('Overview');

  // Taxonomy Master States (with fallback localStorage persistent caching)
  const [taxCategories, setTaxCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem('dvarix_tax_categories');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'cat-res', name: 'Residential', status: 'Enabled' },
      { id: 'cat-com', name: 'Commercial', status: 'Enabled' },
      { id: 'cat-ind', name: 'Industrial', status: 'Enabled' },
      { id: 'cat-agr', name: 'Agricultural', status: 'Enabled' }
    ];
  });

  const [taxTypes, setTaxTypes] = useState<any[]>(() => {
    const saved = localStorage.getItem('dvarix_tax_types');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'typ-apt', name: 'Apartment', categoryId: 'cat-res' },
      { id: 'typ-vil', name: 'Villa', categoryId: 'cat-res' },
      { id: 'typ-pen', name: 'Penthouse', categoryId: 'cat-res' },
      { id: 'typ-pg', name: 'PG/Hostel', categoryId: 'cat-res' },
      { id: 'typ-off', name: 'Office Space', categoryId: 'cat-com' },
      { id: 'typ-ret', name: 'Retail Shop', categoryId: 'cat-com' },
      { id: 'typ-war', name: 'Warehouse', categoryId: 'cat-ind' }
    ];
  });

  const [taxStatuses, setTaxStatuses] = useState<any[]>(() => {
    const saved = localStorage.getItem('dvarix_tax_statuses');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'stat-published', name: 'Published', color: 'emerald', isCustom: false },
      { id: 'stat-available', name: 'Available', color: 'emerald', isCustom: false },
      { id: 'stat-reserved', name: 'Reserved', color: 'amber', isCustom: false },
      { id: 'stat-sold', name: 'Sold', color: 'sky', isCustom: false },
      { id: 'stat-rented', name: 'Rented', color: 'blue', isCustom: false },
      { id: 'stat-pending', name: 'Pending', color: 'purple', isCustom: false },
      { id: 'stat-draft', name: 'Draft', color: 'indigo', isCustom: false }
    ];
  });

  const [taxLocations, setTaxLocations] = useState<any[]>(() => {
    const saved = localStorage.getItem('dvarix_tax_locations');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'loc-jp-nagar', name: 'JP Nagar', city: 'Bengaluru', state: 'Karnataka', status: 'Enabled' },
      { id: 'loc-whitefield', name: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', status: 'Enabled' },
      { id: 'loc-indiranagar', name: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', status: 'Enabled' },
      { id: 'loc-hebbal', name: 'Hebbal', city: 'Bengaluru', state: 'Karnataka', status: 'Enabled' },
      { id: 'loc-mumbai-bandra', name: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', status: 'Enabled' },
      { id: 'loc-hyd-gachibowli', name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', status: 'Enabled' }
    ];
  });

  const [taxAmenities, setTaxAmenities] = useState<any[]>(() => {
    const saved = localStorage.getItem('dvarix_tax_amenities');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'amen-pool', name: 'Swimming Pool' },
      { id: 'amen-power', name: 'Power Backup' },
      { id: 'amen-security', name: '24/7 Security Concierge' },
      { id: 'amen-elevator', name: 'Private Elevator' },
      { id: 'amen-gym', name: 'Clubhouse/Gym' },
      { id: 'amen-ev', name: 'Electric Vehicle Charger' },
      { id: 'amen-wifi', name: 'Wi-Fi Connectivity' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dvarix_tax_categories', JSON.stringify(taxCategories));
  }, [taxCategories]);

  useEffect(() => {
    localStorage.setItem('dvarix_tax_types', JSON.stringify(taxTypes));
  }, [taxTypes]);

  useEffect(() => {
    localStorage.setItem('dvarix_tax_statuses', JSON.stringify(taxStatuses));
  }, [taxStatuses]);

  useEffect(() => {
    localStorage.setItem('dvarix_tax_locations', JSON.stringify(taxLocations));
  }, [taxLocations]);

  useEffect(() => {
    localStorage.setItem('dvarix_tax_amenities', JSON.stringify(taxAmenities));
  }, [taxAmenities]);

  // Taxonomies creation/editing state targets
  const [activeTaxTab, setActiveTaxTab] = useState<'Categories' | 'Types' | 'Statuses' | 'Locations' | 'Amenities'>('Categories');
  const [taxNameInput, setTaxNameInput] = useState('');
  const [taxColorInput, setTaxColorInput] = useState('emerald');
  const [taxMapCategory, setTaxMapCategory] = useState('cat-res');
  const [taxMapCity, setTaxMapCity] = useState('');
  const [taxMapState, setTaxMapState] = useState('');
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);

  // Dynamic Prompt Modals for Actions Menu
  const [assignAgentPropId, setAssignAgentPropId] = useState<string | null>(null);
  const [changeStatusPropId, setChangeStatusPropId] = useState<string | null>(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterAgent, setFilterAgent] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterDate, setFilterDate] = useState<string>('All'); // 'All' | '7days' | '30days'
  
  // Selection for Bulk Actions
  const [selectedPropIds, setSelectedPropIds] = useState<string[]>([]);
  
  // Activity Ledger (local + persistent storage fallback)
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const savedLogs = localStorage.getItem('dvarix_pms_logs');
    if (savedLogs) return JSON.parse(savedLogs);
    return [
      { id: '1', timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(), propertyTitle: 'JP Nagar High-Street Commercial', action: 'Created Listing', operator: 'Priya Sharma' },
      { id: '2', timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString(), propertyTitle: 'Whitefield Smart-Grid Atrium', action: 'Marked as Sold', operator: 'Raghav Reddy' },
      { id: '3', timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(), propertyTitle: 'Indiranagar Eco-Villa Block', action: 'Updated Pricing', operator: 'System Automated' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dvarix_pms_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (title: string, action: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      propertyTitle: title,
      action,
      operator: 'Super Admin',
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Global Card Design & Template State Config
  const [cardTemplate, setCardTemplate] = useState<PropertyCardTemplate>(() => {
    return (localStorage.getItem('dvarix_card_template') as PropertyCardTemplate) || 'Classic';
  });

  const [cardConfig, setCardConfig] = useState<PropertyCardConfig>(() => {
    const saved = localStorage.getItem('dvarix_card_config');
    if (saved) return JSON.parse(saved);
    return {
      showLocation: true,
      showPrice: true,
      showPropertyType: true,
      showArea: true,
      showPropertyStatus: true,
      showProjectName: true,
      showBuilderName: true,
      showFeaturedBadge: true,
      showVerifiedBadge: true,
      showDemandLevel: true,
      showInvestmentScore: true,
      showPossessionDate: true,
      showAgentInformation: false,
    };
  });

  const updateCardConfig = (key: keyof PropertyCardConfig, value: boolean) => {
    const updated = { ...cardConfig, [key]: value };
    setCardConfig(updated);
    localStorage.setItem('dvarix_card_config', JSON.stringify(updated));
  };

  const handleTemplateChange = (t: PropertyCardTemplate) => {
    setCardTemplate(t);
    localStorage.setItem('dvarix_card_template', t);
  };

  // Detailed modal selector
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  // Form Submission Field States (Enriched PMS variables)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formAmenities, setFormAmenities] = useState<string[]>([]);
  const [formBasic, setFormBasic] = useState({
    title: '', code: '', type: 'Apartment', category: 'Residential', status: 'Published', description: '', image: '', imagesStr: ''
  });

  const [currentPropertyId, setCurrentPropertyId] = useState<string>('');

  // Image upload states
  const [coverProgress, setCoverProgress] = useState<number>(0);
  const [coverUploading, setCoverUploading] = useState<boolean>(false);
  const [galleryUploads, setGalleryUploads] = useState<Array<{ id: string; name: string; progress: number; uploading: boolean; url: string }>>([]);
  const [dragActiveCover, setDragActiveCover] = useState<boolean>(false);
  const [dragActiveGallery, setDragActiveGallery] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPropertyId) {
      setCurrentPropertyId('prop-' + Date.now());
    }
  }, []);

  // Helper to compress images using Canvas
  const compressImage = (file: File, maxW = 1200, maxH = 1200, quality = 0.85): Promise<Blob | File> => {
    return new Promise((resolve) => {
      if (file.size < 300 * 1024) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxW) {
              height = Math.round((height * maxW) / width);
              width = maxW;
            }
          } else {
            if (height > maxH) {
              width = Math.round((width * maxH) / height);
              height = maxH;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Upload single file
  const uploadImageFile = async (
    file: File, 
    pathType: 'cover' | 'gallery', 
    onProgress: (p: number) => void
  ): Promise<string> => {
    // 1. Validate format
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedFormats.includes(file.type)) {
      throw new Error('Unsupported file format. Please upload JPG, PNG, or WEBP images.');
    }

    // 2. Validate file size (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File is too large. Maximum allowed size is 10 MB.');
    }

    // 3. Compress if large
    const compressedBlob = await compressImage(file);
    
    // Determine storage path
    const propId = editingId || currentPropertyId || `prop-${Date.now()}`;
    if (!currentPropertyId) {
      setCurrentPropertyId(propId);
    }

    const filename = pathType === 'cover' 
      ? `cover.jpg` 
      : `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`;

    const storagePath = `properties/${propId}/${pathType}/${filename}`;
    const storageRef = ref(storage, storagePath);

    // 4. Upload to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          if (error.code === 'storage/unauthorized') {
            reject(new Error('Firebase permission denied: Unauthorized access to storage.'));
          } else if (error.code === 'storage/canceled') {
            reject(new Error('Upload cancelled.'));
          } else {
            reject(new Error(`Upload failed: ${error.message}`));
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err: any) {
            reject(new Error(`Failed to generate download URL: ${err.message}`));
          }
        }
      );
    });
  };

  const handleCoverUpload = async (file: File) => {
    setImageError(null);
    setImageSuccess(null);
    setCoverUploading(true);
    setCoverProgress(0);

    try {
      const downloadUrl = await uploadImageFile(file, 'cover', (progress) => {
        setCoverProgress(progress);
      });

      setFormBasic(prev => ({ ...prev, image: downloadUrl }));
      setImageSuccess('✅ Cover image uploaded successfully');
    } catch (err: any) {
      setImageError(err.message || 'Cover image upload failed');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveCover = () => {
    setFormBasic(prev => ({ ...prev, image: '' }));
    setCoverProgress(0);
    setImageSuccess(null);
  };

  const handleGalleryUpload = async (files: FileList | File[]) => {
    setImageError(null);
    setImageSuccess(null);

    const fileList = Array.from(files);
    
    // Check total limit (max 25)
    const currentCount = galleryUploads.length;
    if (currentCount + fileList.length > 25) {
      setImageError('Maximum 25 images allowed in the gallery.');
      return;
    }

    // Prepare uploads in state to show progress
    const newUploads = fileList.map((file, i) => {
      const tempId = `temp-${Date.now()}-${i}`;
      return {
        id: tempId,
        name: file.name,
        progress: 0,
        uploading: true,
        url: ''
      };
    });

    setGalleryUploads(prev => [...prev, ...newUploads]);

    let successCount = 0;
    const updatedUrls: string[] = formBasic.imagesStr ? formBasic.imagesStr.split(',').map(s => s.trim()).filter(Boolean) : [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const tempId = newUploads[i].id;

      try {
        const downloadUrl = await uploadImageFile(file, 'gallery', (progress) => {
          setGalleryUploads(prev => prev.map(u => u.id === tempId ? { ...u, progress } : u));
        });

        setGalleryUploads(prev => prev.map(u => u.id === tempId ? { ...u, uploading: false, progress: 100, url: downloadUrl } : u));
        updatedUrls.push(downloadUrl);
        successCount++;
      } catch (err: any) {
        setImageError(`Some uploads failed: ${err.message}`);
        setGalleryUploads(prev => prev.filter(u => u.id !== tempId));
      }
    }

    setFormBasic(prev => ({ ...prev, imagesStr: updatedUrls.join(', ') }));
    
    if (successCount > 0) {
      setImageSuccess(`✅ ${successCount} Gallery images uploaded`);
    }
  };

  const handleRemoveGalleryImage = (id: string, url: string) => {
    setGalleryUploads(prev => prev.filter(u => u.id !== id));
    
    const currentUrls = formBasic.imagesStr ? formBasic.imagesStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const filteredUrls = currentUrls.filter(u => u !== url);
    setFormBasic(prev => ({ ...prev, imagesStr: filteredUrls.join(', ') }));
  };

  const handleSetAsCover = (url: string) => {
    setFormBasic(prev => ({ ...prev, image: url }));
    setImageSuccess('✅ Selected gallery image set as Cover');
  };

  const handleMoveGalleryImage = (index: number, direction: 'up' | 'down') => {
    const newUploads = [...galleryUploads];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newUploads.length) return;

    // Swap
    const temp = newUploads[index];
    newUploads[index] = newUploads[targetIdx];
    newUploads[targetIdx] = temp;

    setGalleryUploads(newUploads);

    // Update imagesStr
    const urls = newUploads.map(u => u.url).filter(Boolean);
    setFormBasic(prev => ({ ...prev, imagesStr: urls.join(', ') }));
  };

  const handleDragOverCover = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActiveCover(true);
  };

  const handleDragLeaveCover = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActiveCover(false);
  };

  const handleDropCover = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActiveCover(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOverGallery = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActiveGallery(true);
  };

  const handleDragLeaveGallery = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActiveGallery(false);
  };

  const handleDropGallery = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActiveGallery(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleGalleryUpload(e.dataTransfer.files);
    }
  };
  const [formLocation, setFormLocation] = useState({
    locationName: '', city: 'Bengaluru', state: 'Karnataka', country: 'India', landmark: '', googleMapLocation: '', latitude: '', longitude: ''
  });
  const [formPricing, setFormPricing] = useState({
    price: '', pricePerSqFt: '', negotiable: false, priceStatus: 'All-inclusive'
  });
  const [formSpecs, setFormSpecs] = useState({
    sqft: '', plotSize: '', builtUpArea: '', beds: '', baths: '', parking: '', floorNumber: '', totalFloors: '', facing: 'East', furnishingStatus: 'Semi-Furnished', propertyAge: ''
  });
  const [formProject, setFormProject] = useState({
    projectName: '', builderName: '', reraNumber: '', possessionDate: '', developmentStatus: 'Under Construction'
  });
  const [formInvestment, setFormInvestment] = useState({
    expectedROI: '', rentalYield: '', appreciationPotential: 'High', demandLevel: 'High Demand', investmentScore: '90'
  });
  const [formBadges, setFormBadges] = useState({
    badgeFeatured: false, badgeVerified: true, badgePremium: false, badgeHot: false, badgeNewLaunch: false, badgeTrending: false, badgeInvestmentOpportunity: false, badgeLimitedAvailability: false, badgePriceDrop: false, badgeBestSeller: false
  });
  const [formAgent, setFormAgent] = useState({
    assignedAgentId: '', agentContact: '', ownerName: '', ownerContact: ''
  });

  // Custom Confirmation Modal Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'delete' | 'perm_delete' | 'archive' | 'restore' | 'bulk_delete' | 'bulk_archive' | 'bulk_restore' | 'sold' | 'rented' | 'reserved' | 'status';
    targetId?: string;
    payload?: any;
  } | null>(null);

  // Trigger Confirmation Panel Helper
  const triggerConfirm = (title: string, description: string, actionType: any, targetId?: string, payload?: any) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      actionType,
      targetId,
      payload
    });
  };

  // Perform Confirmation Mutation
  const handleConfirmedAction = () => {
    if (!confirmDialog || !setProperties) return;
    const { actionType, targetId, payload } = confirmDialog;

    if (actionType === 'delete' && targetId) {
      const prop = properties.find(p => p.id === targetId);
      if (prop) {
        const updatedProp = { ...prop, status: 'Trashed', isTrashed: true };
        firebaseService.saveProperty(updatedProp).then(() => {
          addLog(prop.title, 'Moved to Trash', 'Administrator completed soft-deletion transfer.');
        }).catch(err => console.error("Firestore trash failed", err));
      }
    } else if (actionType === 'perm_delete' && targetId) {
      const prop = properties.find(p => p.id === targetId);
      if (prop) {
        firebaseService.deleteProperty(targetId).then(() => {
          addLog(prop.title, 'Permanently Deleted', 'Irreversibly purged property from catalog databases.');
        }).catch(err => console.error("Firestore delete failed", err));
      }
    } else if (actionType === 'archive' && targetId) {
      const prop = properties.find(p => p.id === targetId);
      if (prop) {
        const updatedProp = { ...prop, status: 'Archived', isArchived: true };
        firebaseService.saveProperty(updatedProp).then(() => {
          addLog(prop.title, 'Catalog Archived', 'Moved asset listings into secondary cold storage view.');
        }).catch(err => console.error("Firestore archive failed", err));
      }
    } else if (actionType === 'restore' && targetId) {
      const prop = properties.find(p => p.id === targetId);
      if (prop) {
        const updatedProp = { ...prop, status: 'Available', isTrashed: false, isArchived: false };
        firebaseService.saveProperty(updatedProp).then(() => {
          addLog(prop.title, 'Restored Listing', 'Brought property back to available market catalog status.');
        }).catch(err => console.error("Firestore restore failed", err));
      }
    } else if (actionType === 'status' && targetId && payload) {
      const prop = properties.find(p => p.id === targetId);
      if (prop) {
        const updatedProp = { ...prop, status: payload.status };
        firebaseService.saveProperty(updatedProp).then(() => {
          addLog(prop.title, `Status Changed`, `Updated active status to: ${payload.status}`);
        }).catch(err => console.error("Firestore status update failed", err));
      }
    } else if (actionType === 'bulk_delete') {
      selectedPropIds.forEach(id => {
        const prop = properties.find(p => p.id === id);
        if (prop) {
          firebaseService.saveProperty({ ...prop, status: 'Trashed', isTrashed: true })
            .catch(err => console.error("Bulk trash failed", err));
        }
      });
      addLog('Bulk Items', 'Bulk Moved to Trash', `Soft-deleted ${selectedPropIds.length} properties.`);
      setSelectedPropIds([]);
    } else if (actionType === 'bulk_archive') {
      selectedPropIds.forEach(id => {
        const prop = properties.find(p => p.id === id);
        if (prop) {
          firebaseService.saveProperty({ ...prop, status: 'Archived', isArchived: true })
            .catch(err => console.error("Bulk archive failed", err));
        }
      });
      addLog('Bulk Items', 'Bulk Archived', `Transferred ${selectedPropIds.length} properties into cold storage.`);
      setSelectedPropIds([]);
    } else if (actionType === 'bulk_restore') {
      selectedPropIds.forEach(id => {
        const prop = properties.find(p => p.id === id);
        if (prop) {
          firebaseService.saveProperty({ ...prop, status: 'Available', isTrashed: false, isArchived: false })
            .catch(err => console.error("Bulk restore failed", err));
        }
      });
      addLog('Bulk Items', 'Bulk Restored', `Restored ${selectedPropIds.length} properties from trash/archive.`);
      setSelectedPropIds([]);
    }

    setConfirmDialog(null);
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedPropIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (activeList: Property[]) => {
    const activeIds = activeList.map(a => a.id);
    const allSelected = activeIds.every(id => selectedPropIds.includes(id));
    if (allSelected) {
      setSelectedPropIds(prev => prev.filter(id => !activeIds.includes(id)));
    } else {
      setSelectedPropIds(prev => Array.from(new Set([...prev, ...activeIds])));
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = (status: string) => {
    if (!setProperties || selectedPropIds.length === 0) return;
    selectedPropIds.forEach(id => {
      const prop = properties.find(p => p.id === id);
      if (prop) {
        firebaseService.saveProperty({ ...prop, status })
          .catch(err => console.error("Firestore bulk status failed", err));
      }
    });
    addLog('Bulk Items', 'Bulk Status Changed', `Updated active status to ${status} for ${selectedPropIds.length} units.`);
    setSelectedPropIds([]);
  };

  const handleBulkAgentAssign = (agentName: string) => {
    if (!setProperties || selectedPropIds.length === 0) return;
    const matchedAgent = agents.find(a => a.name === agentName);
    if (!matchedAgent) return;
    selectedPropIds.forEach(id => {
      const prop = properties.find(p => p.id === id);
      if (prop) {
        firebaseService.saveProperty({
          ...prop,
          agent: {
            name: matchedAgent.name,
            role: matchedAgent.role,
            avatar: matchedAgent.avatar,
            phone: matchedAgent.phone,
            email: matchedAgent.email
          }
        }).catch(err => console.error("Firestore bulk agent failed", err));
      }
    });
    addLog('Bulk Items', 'Bulk Advisor Update', `Reassigned oversight to ${agentName} for ${selectedPropIds.length} records.`);
    setSelectedPropIds([]);
  };

  const handleBulkExport = () => {
    const selectedData = properties.filter(p => selectedPropIds.includes(p.id));
    if (selectedData.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dvarix_pms_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog('Bulk Items', 'Exported Records', `Generated dynamic JSON catalog files for ${selectedPropIds.length} assets.`);
    setSelectedPropIds([]);
  };

  // Single Actions Helpers
  const duplicateProperty = (p: Property) => {
    if (!setProperties) return;
    const copyId = `prop-copy-${Date.now()}`;
    const copyTitle = `${p.title} - Copy`;
    const copyObj: Property = {
      ...p,
      id: copyId,
      title: copyTitle,
      status: 'Draft',
      isTrashed: false,
      isArchived: false,
      createdAt: new Date().toISOString()
    };
    firebaseService.saveProperty(copyObj).then(() => {
      addLog(copyTitle, 'Duplicated Listing', `Created separate dynamic carbon copy based on prototype template ID: ${p.id}`);
    }).catch(err => console.error("Firestore duplicate failed", err));
  };

  // Load Edit Form
  const triggerEdit = (p: Property) => {
    setEditingId(p.id);
    setCurrentPropertyId(p.id);
    setCoverProgress(100);
    setCoverUploading(false);
    setImageError(null);
    setImageSuccess(null);
    
    // Populate gallery uploads with existing image URLs
    const existingGalleryUrls = p.images || p.galleryImages || [];
    const initialGallery = existingGalleryUrls.map((url, index) => ({
      id: `existing-${index}-${Date.now()}`,
      name: `Gallery Image ${index + 1}`,
      progress: 100,
      uploading: false,
      url: url
    }));
    setGalleryUploads(initialGallery);

    setFormBasic({
      title: p.title || '',
      code: p.code || '',
      type: p.type || 'Apartment',
      category: p.category || 'Residential',
      status: p.status || 'Available',
      description: p.description || '',
      image: p.image || '',
      imagesStr: p.images ? p.images.join(', ') : ''
    });
    setFormLocation({
      locationName: p.locationName || p.location || '',
      city: p.city || 'Bengaluru',
      state: p.state || 'Karnataka',
      country: p.country || 'India',
      landmark: p.landmark || '',
      googleMapLocation: p.googleMapLocation || '',
      latitude: p.latitude ? String(p.latitude) : '',
      longitude: p.longitude ? String(p.longitude) : ''
    });
    setFormPricing({
      price: String(p.price || ''),
      pricePerSqFt: String(p.pricePerSqFt || ''),
      negotiable: p.negotiable || false,
      priceStatus: p.priceStatus || 'All-inclusive'
    });
    setFormSpecs({
      sqft: String(p.sqft || ''),
      plotSize: p.plotSize || '',
      builtUpArea: p.builtUpArea ? String(p.builtUpArea) : '',
      beds: String(p.beds || ''),
      baths: String(p.baths || ''),
      parking: String(p.parking || ''),
      floorNumber: String(p.floorNumber || ''),
      totalFloors: String(p.totalFloors || ''),
      facing: p.facing || 'East',
      furnishingStatus: p.furnishingStatus || 'Semi-Furnished',
      propertyAge: String(p.propertyAge || '')
    });
    setFormProject({
      projectName: p.projectName || '',
      builderName: p.builderName || '',
      reraNumber: p.reraNumber || '',
      possessionDate: p.possessionDate || '',
      developmentStatus: p.developmentStatus || 'Under Construction'
    });
    setFormInvestment({
      expectedROI: p.expectedROI ? String(p.expectedROI) : '',
      rentalYield: p.rentalYield ? String(p.rentalYield) : '',
      appreciationPotential: p.appreciationPotential || 'High',
      demandLevel: p.demandLevel || 'High Demand',
      investmentScore: String(p.investmentScore || '90')
    });
    setFormBadges({
      badgeFeatured: p.badgeFeatured || false,
      badgeVerified: p.badgeVerified !== false,
      badgePremium: p.badgePremium || false,
      badgeHot: p.badgeHot || false,
      badgeNewLaunch: p.badgeNewLaunch || false,
      badgeTrending: p.badgeTrending || false,
      badgeInvestmentOpportunity: p.badgeInvestmentOpportunity || false,
      badgeLimitedAvailability: p.badgeLimitedAvailability || false,
      badgePriceDrop: p.badgePriceDrop || false,
      badgeBestSeller: p.badgeBestSeller || false
    });
    setFormAgent({
      assignedAgentId: agents.find(a => a.name === p.agent?.name)?.id || '',
      agentContact: p.agentContact || p.agent?.phone || '',
      ownerName: p.ownerName || '',
      ownerContact: p.ownerContact || ''
    });
    setFormAmenities(p.amenities || []);
    setActiveSubTab('Add/Edit Property');
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    const newId = 'prop-' + Date.now();
    setCurrentPropertyId(newId);
    setCoverProgress(0);
    setCoverUploading(false);
    setGalleryUploads([]);
    setImageError(null);
    setImageSuccess(null);
    setFormBasic({ title: '', code: '', type: 'Apartment', category: 'Residential', status: 'Published', description: '', image: '', imagesStr: '' });
    setFormLocation({ locationName: '', city: 'Bengaluru', state: 'Karnataka', country: 'India', landmark: '', googleMapLocation: '', latitude: '', longitude: '' });
    setFormPricing({ price: '', pricePerSqFt: '', negotiable: false, priceStatus: 'All-inclusive' });
    setFormSpecs({ sqft: '', plotSize: '', builtUpArea: '', beds: '', baths: '', parking: '', floorNumber: '', totalFloors: '', facing: 'East', furnishingStatus: 'Semi-Furnished', propertyAge: '' });
    setFormProject({ projectName: '', builderName: '', reraNumber: '', possessionDate: '', developmentStatus: 'Under Construction' });
    setFormInvestment({ expectedROI: '', rentalYield: '', appreciationPotential: 'High', demandLevel: 'High Demand', investmentScore: '90' });
    setFormBadges({ badgeFeatured: false, badgeVerified: true, badgePremium: false, badgeHot: false, badgeNewLaunch: false, badgeTrending: false, badgeInvestmentOpportunity: false, badgeLimitedAvailability: false, badgePriceDrop: false, badgeBestSeller: false });
    setFormAgent({ assignedAgentId: '', agentContact: '', ownerName: '', ownerContact: '' });
    setFormAmenities([]);
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizeNumber = (val: any, defaultVal = 0): number => {
      if (typeof val === 'number') {
        return isNaN(val) ? defaultVal : val;
      }
      if (!val) return defaultVal;
      const cleaned = String(val).replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? defaultVal : parsed;
    };

    const data = {
      id: editingId || currentPropertyId,
      title: formBasic.title,
      code: formBasic.code,
      type: formBasic.type,
      category: formBasic.category,
      status: formBasic.status,
      description: formBasic.description,
      image: formBasic.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      imagesStr: formBasic.imagesStr,
      
      // CMS & Upload Metadata
      coverImage: formBasic.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      galleryImages: formBasic.imagesStr ? formBasic.imagesStr.split(',').map(s => s.trim()).filter(Boolean) : [],
      imageCount: formBasic.imagesStr ? formBasic.imagesStr.split(',').map(s => s.trim()).filter(Boolean).length : 0,
      uploadedBy: auth.currentUser?.email || auth.currentUser?.displayName || 'Admin',
      updatedAt: new Date().toISOString(),
      
      // Location
      location: formLocation.city, // Backward-compatible
      locationName: formLocation.locationName,
      city: formLocation.city,
      state: formLocation.state,
      country: formLocation.country,
      landmark: formLocation.landmark,
      address: `${formLocation.locationName ? formLocation.locationName + ', ' : ''}${formLocation.city}, ${formLocation.state}`,
      googleMapLocation: formLocation.googleMapLocation,
      latitude: formLocation.latitude ? sanitizeNumber(formLocation.latitude) : undefined,
      longitude: formLocation.longitude ? sanitizeNumber(formLocation.longitude) : undefined,

      // Pricing
      price: sanitizeNumber(formPricing.price),
      pricePerSqFt: formPricing.pricePerSqFt ? sanitizeNumber(formPricing.pricePerSqFt) : undefined,
      negotiable: formPricing.negotiable,
      priceStatus: formPricing.priceStatus,

      // Specs
      sqft: formSpecs.sqft ? sanitizeNumber(formSpecs.sqft) : undefined,
      plotSize: formSpecs.plotSize || undefined,
      builtUpArea: formSpecs.builtUpArea ? sanitizeNumber(formSpecs.builtUpArea) : undefined,
      beds: formSpecs.beds ? sanitizeNumber(formSpecs.beds) : undefined,
      baths: formSpecs.baths ? sanitizeNumber(formSpecs.baths) : undefined,
      parking: formSpecs.parking || undefined,
      floorNumber: formSpecs.floorNumber ? sanitizeNumber(formSpecs.floorNumber) : undefined,
      totalFloors: formSpecs.totalFloors ? sanitizeNumber(formSpecs.totalFloors) : undefined,
      facing: formSpecs.facing || undefined,
      furnishingStatus: formSpecs.furnishingStatus || undefined,
      propertyAge: formSpecs.propertyAge || undefined,

      // Project
      projectName: formProject.projectName,
      builderName: formProject.builderName,
      reraNumber: formProject.reraNumber,
      possessionDate: formProject.possessionDate,
      developmentStatus: formProject.developmentStatus,

      // Badges
      badgeFeatured: formBadges.badgeFeatured,
      badgeVerified: formBadges.badgeVerified,
      badgePremium: formBadges.badgePremium,
      badgeHot: formBadges.badgeHot,
      badgeNewLaunch: formBadges.badgeNewLaunch,
      badgeTrending: formBadges.badgeTrending,
      badgeInvestmentOpportunity: formBadges.badgeInvestmentOpportunity,
      badgeLimitedAvailability: formBadges.badgeLimitedAvailability,
      badgePriceDrop: formBadges.badgePriceDrop,
      badgeBestSeller: formBadges.badgeBestSeller,

      // Investment
      expectedROI: formInvestment.expectedROI,
      rentalYield: formInvestment.rentalYield,
      appreciationPotential: formInvestment.appreciationPotential,
      demandLevel: formInvestment.demandLevel,
      investmentScore: Number(formInvestment.investmentScore) || 90,

      // Agent/Owner
      agentId: formAgent.assignedAgentId,
      agentContact: formAgent.agentContact,
      ownerName: formAgent.ownerName,
      ownerContact: formAgent.ownerContact,

      // Dynamic Taxonomies
      amenities: formAmenities
    };

    console.log("[CMS DEBUG 1] handleCreateOrUpdate click handler executed!");
    console.log("[CMS DEBUG 1] Exact file path: src/components/SaaSPropertiesModule.tsx");
    console.log("[CMS DEBUG 1] Generated property data payload:", JSON.stringify(data, null, 2));

    onSubmitProperty(e, data);
    addLog(data.title, editingId ? 'Metadata Updated' : 'Created Listing', editingId ? 'Modified active properties schema fields.' : 'Introduced fresh real estate portfolio entry.');
    resetForm();
    setActiveSubTab('Manage Listings');
  };

  // Derived Filter Lists
  const activeProperties = useMemo(() => {
    return properties.filter(p => !p.isTrashed && p.status !== 'Trashed' && p.status !== 'Archived' && !p.isArchived);
  }, [properties]);

  const archivedProperties = useMemo(() => {
    return properties.filter(p => p.status === 'Archived' || p.isArchived);
  }, [properties]);

  const trashedProperties = useMemo(() => {
    return properties.filter(p => p.status === 'Trashed' || p.isTrashed);
  }, [properties]);

  // Master List for Filters
  const masterFilteredProperties = useMemo(() => {
    let list = activeProperties;
    const term = searchTerm.toLowerCase();
    
    // Global filter search
    if (term) {
      list = list.filter(p => 
        p.title.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term) ||
        (p.projectName && p.projectName.toLowerCase().includes(term)) ||
        (p.builderName && p.builderName.toLowerCase().includes(term))
      );
    }
    // Filter status
    if (filterStatus !== 'All') {
      list = list.filter(p => p.status === filterStatus);
    }
    // Filter agent
    if (filterAgent !== 'All') {
      list = list.filter(p => p.agent?.name === filterAgent);
    }
    // Filter type
    if (filterType !== 'All') {
      list = list.filter(p => p.type === filterType);
    }
    // Filter date bracket
    if (filterDate === '7days') {
      const boundary = Date.now() - 7 * 86400000;
      list = list.filter(p => p.createdAt ? new Date(p.createdAt).getTime() > boundary : true);
    } else if (filterDate === '30days') {
      const boundary = Date.now() - 30 * 86400000;
      list = list.filter(p => p.createdAt ? new Date(p.createdAt).getTime() > boundary : true);
    }

    return list;
  }, [activeProperties, searchTerm, filterStatus, filterAgent, filterType, filterDate]);

  // Sample listing for visual style preview inside settings
  const samplePreviewListing = useMemo(() => {
    return properties[0] || {
      id: 'prop-sample',
      title: 'JP Nagar Prestige Prime Penthouse',
      projectName: 'Prestige Lakeside Suites',
      type: 'Penthouse',
      price: 7800000,
      sqft: 1200,
      beds: 3,
      baths: 3,
      address: 'JP Nagar Phase 2, Bengaluru',
      locationName: 'JP Nagar, Bengaluru',
      description: 'Elegant penthouse offering high-end features, rooftop terraces, green sky lounges and modular facilities in Southern Bengaluru.',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      images: [],
      rating: 4.9,
      reviews: 14,
      featured: true,
      amenities: [],
      agent: {
        name: 'Raghav Reddy',
        role: 'Portfolio Executive',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
        phone: '+91 6300984846',
        email: 'raghav.r@dvarix.com'
      },
      badgeVerified: true,
      demandLevel: 'High Demand',
      possessionDate: 'Dec 2027',
      builderName: 'Prestige Group Builders'
    };
  }, [properties]);

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto" id="saas-pms-custom-panel">
      
      {/* 1. TOP HEADER BRAND PANEL */}
      <div className="bg-gradient-to-r from-sky-50 to-white border border-sky-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-sky-655 tracking-widest block font-mono">Dvarix Realty Cloud PMS v2.4</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-sky-500 shrink-0" /> Property Administration Hub
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-xl">
            Complete property database lifecycle coordination panel. Toggle visual card layout variables, restore dumpster backups, track operator audit logs.
          </p>
        </div>
        
        {/* SUB NAVIGATORS */}
        <div className="flex flex-wrap gap-1 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          {(['Overview', 'Manage Listings', 'Add/Edit Property', 'Trash & Archives', 'Card Configurations', 'Activity Logs', 'Master Taxonomies'] as SubTabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveSubTab(tab);
                if (tab !== 'Add/Edit Property') resetForm();
              }}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === tab ? 'bg-white shadow text-sky-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab === 'Add/Edit Property' && editingId ? 'Modify Details' : tab === 'Master Taxonomies' ? 'Manage Taxonomies 📁' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SKY-BLUE METRIC SCORECARDS */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        {[
          { label: 'Total Portfolio', val: properties.length, color: 'text-slate-800 bg-slate-50' },
          { label: 'Active Listed', val: activeProperties.length, color: 'text-emerald-700 bg-emerald-50/50 border border-emerald-100' },
          { label: 'Draft Files', val: properties.filter(p => p.status === 'Draft' || !p.status).length, color: 'text-indigo-700 bg-indigo-50/50 border border-indigo-100' },
          { label: 'Archived Cold', val: archivedProperties.length, color: 'text-amber-700 bg-amber-50/50 border border-amber-100' },
          { label: 'Trash Dump', val: trashedProperties.length, color: 'text-rose-700 bg-rose-50/50 border border-rose-100' },
          { label: 'Units Sold', val: properties.filter(p => p.status === 'Sold').length, color: 'text-sky-700 bg-sky-50 border border-sky-100' },
          { label: 'Unlocked Rented', val: properties.filter(p => p.status === 'Rented').length, color: 'text-blue-700 bg-blue-50/50 border border-blue-100' }
        ].map((item, idx) => (
          <div key={idx} className={`p-3.5 rounded-2xl flex flex-col justify-center space-y-0.5 text-center shadow-3xs ${item.color}`}>
            <span className="text-[9px] font-black uppercase font-mono text-slate-400 tracking-wider block">{item.label}</span>
            <span className="text-lg font-black tracking-tight">{item.val}</span>
          </div>
        ))}
      </div>

      {/* 3. SWITCH RENDER SUBTABS PANEL */}

      {/* TAB A: OVERVIEW */}
      {activeSubTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-4">
              <h3 className="text-sm font-black text-slate-805 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Database className="h-4.5 w-4.5 text-sky-500" /> Catalog Registry Control Deck
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Review available inventory classes by regional corridors, execute structural checks, and ensure listings abide by RERA compliances.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px] pt-2">
                <div className="p-4 bg-sky-50/20 border border-sky-100/60 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-400 block font-bold">RERA Approved Listings</span>
                  <span className="text-lg font-black text-sky-700 block">
                    {properties.filter(p => p.reraNumber).length} Mapped
                  </span>
                </div>
                <div className="p-4 bg-amber-50/30 border border-amber-100/60 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-400 block font-bold">High Yield Investments</span>
                  <span className="text-lg font-black text-amber-700 block">
                    {properties.filter(p => Number(p.expectedROI) > 8).length || 2} Mapped
                  </span>
                </div>
                <div className="p-4 bg-emerald-50/30 border border-emerald-100/60 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-400 block font-bold">Total Area Monitored</span>
                  <span className="text-lg font-black text-emerald-700 block text-nowrap">
                    {properties.reduce((acc, p) => acc + (p.sqft || 0), 0).toLocaleString()} Sqft
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100/80 pt-4 flex gap-2">
                <button 
                  onClick={() => setActiveSubTab('Manage Listings')}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-sky-600 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ListCollapse className="h-3.5 w-3.5" /> Open Listing Table
                </button>
                <button 
                  onClick={() => {
                    resetForm();
                    setActiveSubTab('Add/Edit Property');
                  }}
                  className="px-4 py-2 bg-sky-100 text-sky-700 border border-sky-200/50 font-bold text-xs rounded-xl hover:bg-sky-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Property Form
                </button>
              </div>
            </div>

            {/* Quick Activity history list */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-805 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-500" /> Operator Registry Feed
                </h3>
                <button 
                  onClick={() => setActiveSubTab('Activity Logs')}
                  className="text-sky-600 hover:text-sky-700 font-bold text-[10px] uppercase font-mono"
                >
                  See Full Logs &rarr;
                </button>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {logs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-[11px]">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-850 block">{log.propertyTitle}</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" /> {log.action}
                      </span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="font-mono text-[9px] text-slate-400 block">{log.timestamp}</span>
                      <span className="text-[9px] bg-slate-200/60 px-1.5 py-0.5 rounded font-bold text-slate-600">{log.operator}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANELS */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-4 text-xs">
              <div>
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[11px] font-mono">Catalog Classification split</h4>
                <p className="text-[10px] text-slate-450">Review mapped units by designated real-estate tags.</p>
              </div>

              <div className="space-y-2">
                {categories.map((c) => {
                  const items = properties.filter(p => p.type === c.id);
                  return (
                    <div key={c.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700">{c.title}</span>
                      <span className="bg-sky-50 text-sky-600 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-sky-100">
                        {items.length} units
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: MANAGE LISTINGS */}
      {activeSubTab === 'Manage Listings' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs animate-in fade-in duration-200">
          
          {/* SEARCH AND FILTERS WRAPPER */}
          <div className="p-4 bg-slate-50 border-b border-slate-150 space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5">
              
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query across project title, builder name, state coordinates, properties codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                
                {/* Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-slate-202 bg-white p-2 rounded-xl text-slate-600 font-semibold outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Available">Available</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                  <option value="Rented">Rented</option>
                </select>

                {/* Type */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-slate-202 bg-white p-2 rounded-xl text-slate-600 font-semibold outline-none"
                >
                  <option value="All">All types</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>

                {/* Agent */}
                <select
                  value={filterAgent}
                  onChange={(e) => setFilterAgent(e.target.value)}
                  className="border border-slate-202 bg-white p-2 rounded-xl text-slate-600 font-semibold outline-none"
                >
                  <option value="All">All agents</option>
                  {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>

                {/* Date Created */}
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border border-slate-202 bg-white p-2 rounded-xl text-slate-600 font-semibold outline-none"
                >
                  <option value="All">Any creation date</option>
                  <option value="7days">Within 7 days</option>
                  <option value="30days">Within 30 days</option>
                </select>

              </div>
            </div>

            {/* BULK ACTIONS BANNER PANEL */}
            {selectedPropIds.length > 0 && (
              <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-1">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
                  <CheckSquareIcon className="h-4.5 w-4.5 text-sky-600" />
                  <span>{selectedPropIds.length} properties selected on current view</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => triggerConfirm('Bulk Soft-Delete', `You are about to transfer ${selectedPropIds.length} items to Trash dump. Proceed?`, 'bulk_delete')}
                    className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[10px] rounded-lg border border-rose-200 transition cursor-pointer"
                  >
                    Trash Selected
                  </button>
                  <button
                    onClick={() => triggerConfirm('Bulk Archive', `You are about to archive ${selectedPropIds.length} selected listings. Proceed?`, 'bulk_archive')}
                    className="py-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[10px] rounded-lg border border-amber-202 transition cursor-pointer"
                  >
                    Archive Selected
                  </button>

                  <span className="h-4 w-px bg-slate-300"></span>

                  {/* Bulk change status */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Status:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkStatusChange(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="border border-slate-200 bg-white p-1 rounded-lg text-[10.5px] font-semibold text-slate-605 focus:outline-none focus:border-sky-500"
                    >
                      <option value="">- Change -</option>
                      <option value="Available">Available</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                      <option value="Rented">Rented</option>
                    </select>
                  </div>

                  {/* Bulk reassign agent */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Agent:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkAgentAssign(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="border border-slate-200 bg-white p-1 rounded-lg text-[10.5px] font-semibold text-slate-605 focus:outline-none"
                    >
                      <option value="">- Assign -</option>
                      {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>

                  <button
                    onClick={handleBulkExport}
                    className="py-1 px-2 bg-slate-900 text-white hover:bg-slate-800 text-[10px] rounded border border-slate-900 cursor-pointer flex items-center gap-1 font-bold"
                  >
                    <Download className="h-3 w-3" /> Export Selected
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans text-slate-700">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={masterFilteredProperties.length > 0 && masterFilteredProperties.every(p => selectedPropIds.includes(p.id))}
                      onChange={() => handleSelectAll(masterFilteredProperties)}
                      className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Property & Listing Details</th>
                  <th className="p-4">Category Type</th>
                  <th className="p-4">Interactive Status</th>
                  <th className="p-4">Specifications</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4 text-right">Unified Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masterFilteredProperties.map((p) => {
                  const isSelected = selectedPropIds.includes(p.id);
                  return (
                    <tr key={p.id} className={`hover:bg-sky-50/20 transition-all ${isSelected ? 'bg-sky-50/10' : ''}`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.image} 
                            alt={p.title} 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-202 bg-slate-50 shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span 
                              onClick={() => triggerEdit(p)}
                              className="font-extrabold text-slate-900 block hover:text-sky-655 cursor-pointer text-xs"
                            >
                              {p.projectName ? `${p.projectName} / ${p.title}` : p.title}
                            </span>
                            <span className="text-[10px] text-slate-400 block max-w-xs truncate">
                              📍 {p.address || p.locationName || 'JP Nagar, Bengaluru'}
                            </span>
                            <span className="text-sky-605 font-mono font-black mt-0.5 block text-[11px]">
                              {formatCurrencyIndia(p.price)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[10px] uppercase font-bold text-slate-500">
                        {p.type}
                      </td>

                      <td className="p-4">
                        <select
                          value={p.status || 'Published'}
                          onChange={(e) => triggerConfirm('Change Status', `Change property "${p.title}" status to "${e.target.value}"?`, 'status', p.id, { status: e.target.value })}
                          className={`font-semibold border text-[10px] p-1.5 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-sky-500 ${
                            p.status === 'Available' || p.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            p.status === 'Reserved' ? 'bg-amber-50 text-amber-705 border-amber-100' :
                            p.status === 'Sold' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                            p.status === 'Draft' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="Published">Published</option>
                          <option value="Available">Available</option>
                          <option value="Draft">Draft</option>
                          <option value="Pending">Pending</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                          <option value="Rented">Rented</option>
                        </select>
                      </td>

                      <td className="p-4 font-mono text-[10px] text-slate-500 space-y-0.5">
                        <span className="block font-bold">{p.sqft} Sq.Ft Area</span>
                        <span className="block text-[9px] text-slate-400">{p.beds} BHK • {p.baths} Bath</span>
                      </td>

                      <td className="p-4 text-slate-655 font-bold font-mono">
                        {p.agent?.name || 'Unassigned Advisory'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => triggerEdit(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg hover:text-slate-900 transition"
                            title="Edit Listing details"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <div className="relative group/acts">
                            <span className="p-1 px-2 border border-slate-205 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-[10.5px] font-extrabold cursor-pointer select-none">
                              Actions
                            </span>

                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 hidden group-hover/acts:block text-left font-semibold text-[11px] text-slate-605">
                              
                              <button
                                onClick={() => setDetailProperty(p)}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer text-slate-700 font-bold"
                              >
                                <Eye className="h-3.5 w-3.5 text-sky-500" /> View Catalog Card
                              </button>

                              <button
                                onClick={() => triggerEdit(p)}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer text-slate-705 font-bold"
                              >
                                <Edit className="h-3.5 w-3.5 text-slate-400" /> Edit Specifications
                              </button>

                              <button
                                onClick={() => duplicateProperty(p)}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer text-slate-705"
                              >
                                <PlusCircle className="h-3.5 w-3.5 text-emerald-500" /> Duplicate Asset
                              </button>

                              <button
                                onClick={() => setAssignAgentPropId(p.id)}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer text-slate-705"
                              >
                                <Users className="h-3.5 w-3.5 text-indigo-500" /> Assign Advisor
                              </button>

                              <button
                                onClick={() => setChangeStatusPropId(p.id)}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer text-slate-705"
                              >
                                <Settings className="h-3.5 w-3.5 text-slate-500" /> Change Status
                              </button>

                              <button
                                onClick={() => {
                                  const updatedProp = { ...p, badgeFeatured: !p.badgeFeatured };
                                  firebaseService.saveProperty(updatedProp).then(() => {
                                    addLog(p.title, p.badgeFeatured ? 'Standard Asset' : 'Featured Asset', p.badgeFeatured ? 'Removed featured badge highlights.' : 'Highlighted listing under featured directory cards.');
                                  }).catch(err => console.error("Firestore badgeFeatured update failed", err));
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer text-slate-705"
                              >
                                <Sparkles className={`h-3.5 w-3.5 ${p.badgeFeatured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                                {p.badgeFeatured ? 'Unfeature Listing' : 'Feature Listing'}
                              </button>

                              <div className="border-t border-slate-150 my-1"></div>

                              <button
                                onClick={() => triggerConfirm('Mark as Sold', `Record property "${p.title}" as Sold?`, 'status', p.id, { status: 'Sold' })}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 text-sky-600 cursor-pointer"
                              >
                                <Check className="h-3 w-3" /> Mark as Sold
                              </button>

                              <button
                                onClick={() => triggerConfirm('Mark as Rented', `Record property "${p.title}" as Rented?`, 'status', p.id, { status: 'Rented' })}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 text-blue-600 cursor-pointer"
                              >
                                <Play className="h-3 w-3" /> Mark as Rented
                              </button>

                              <button
                                onClick={() => triggerConfirm('Archive Property', `Move property "${p.title}" to archives folder?`, 'archive', p.id)}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 text-amber-600 cursor-pointer"
                              >
                                <Archive className="h-3 w-3" /> Archive Catalog
                              </button>

                              <button
                                onClick={() => triggerConfirm('Disable Listing', `Mark listing "${p.title}" as Draft to hide?`, 'status', p.id, { status: 'Draft' })}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 text-indigo-650 cursor-pointer"
                              >
                                <XCircle className="h-3 w-3" /> Disable Listing
                              </button>

                              <button
                                onClick={() => triggerConfirm('Enable Listing', `Enable listed status of "${p.title}"?`, 'status', p.id, { status: 'Available' })}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-1.5 text-emerald-600 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Enable Listing
                              </button>

                              <div className="border-t border-slate-100 my-1"></div>

                              <button
                                onClick={() => triggerConfirm('Move to Trash', `Delete property "${p.title}"? It can be recovered from Trash database.`, 'delete', p.id)}
                                className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 font-bold cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3 text-rose-550" /> Move to Trash
                              </button>

                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {masterFilteredProperties.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 space-y-2">
                      <Search className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="text-xs font-mono font-bold">No active properties found matching specified search filters.</p>
                      <button 
                        onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterAgent('All'); setFilterType('All'); setFilterDate('All'); }}
                        className="py-1 px-3 bg-sky-50 text-sky-600 text-[10px] rounded-lg font-bold border border-sky-100 hover:bg-sky-100"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: ADD OR EDIT PROPERTY FORM */}
      {activeSubTab === 'Add/Edit Property' && (
        <form onSubmit={handleCreateOrUpdate} className="bg-white border border-slate-205 rounded-2xl p-6 shadow-3xs space-y-6 animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap">
            <div className="space-y-0.5 text-left">
              <h3 className="font-extrabold text-slate-900 tracking-tight text-sm">
                {editingId ? `Edit Listing Specifications: #${editingId}` : 'Publish New Real-Estate Asset Profile'}
              </h3>
              <p className="text-[11px] text-slate-450 leading-relaxed font-sans">Fill in parameters categorized below. Unfilled optional fields fallback to beautiful template designs.</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="py-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-[11px] font-bold rounded-lg text-slate-600 transition"
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[11px] rounded-lg transition"
              >
                {editingId ? 'Update Listing Details' : 'Publish Property Profile'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
            
            {/* 1. BASIC INFORMATION */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">🏢 Basic Specifications</h4>
              
              <div className="space-y-1">
                <label className="font-extrabold text-slate-505 block">Listing Title *</label>
                <input
                  type="text" required
                  value={formBasic.title}
                  onChange={(e) => setFormBasic({ ...formBasic, title: e.target.value })}
                  placeholder="e.g. Sarjapur Landmark Penthouse"
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-lg outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Property Code</label>
                  <input
                    type="text"
                    value={formBasic.code}
                    onChange={(e) => setFormBasic({ ...formBasic, code: e.target.value })}
                    placeholder="e.g. PL-5324"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Property Type</label>
                  <select
                    value={formBasic.type}
                    onChange={(e) => setFormBasic({ ...formBasic, type: e.target.value })}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-semibold text-slate-700 text-xs cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Property Category</label>
                  <select
                    value={formBasic.category}
                    onChange={(e) => setFormBasic({ ...formBasic, category: e.target.value })}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-semibold text-slate-700 text-xs cursor-pointer"
                  >
                    {taxCategories.filter(c => c.status !== 'Disabled').map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Marketing Status</label>
                  <select
                    value={formBasic.status}
                    onChange={(e) => setFormBasic({ ...formBasic, status: e.target.value })}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-semibold text-slate-700 text-xs cursor-pointer"
                  >
                    {taxStatuses.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-505 block">Short / Detailed Description</label>
                <textarea
                  value={formBasic.description}
                  onChange={(e) => setFormBasic({ ...formBasic, description: e.target.value })}
                  placeholder="Breathtaking architectural masterpiece in Bengaluru corridor offering full smart-home operations..."
                  rows={3}
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-lg outline-none text-slate-700"
                />
              </div>

              {/* Image Upload Status Messages */}
              {(imageError || imageSuccess) && (
                <div className="p-3.5 rounded-xl border text-xs font-medium space-y-1 animate-fade-in">
                  {imageError && (
                    <div className="text-red-600 border-red-100 bg-red-50 flex items-center gap-2 p-2 rounded-lg">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{imageError}</span>
                    </div>
                  )}
                  {imageSuccess && (
                    <div className="text-emerald-600 border-emerald-100 bg-emerald-50 flex items-center gap-2 p-2 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 shrink-0 animate-bounce" />
                      <span>{imageSuccess}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Cover Image Upload (Drag & Drop) */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 block text-xs uppercase font-mono tracking-wider">🏠 Cover Image Upload</label>
                
                {formBasic.image ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-48 flex items-center justify-center">
                    <img 
                      src={formBasic.image} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-100 transition cursor-pointer shadow-md">
                        <RefreshCw className="h-4 w-4" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCoverUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <button 
                        type="button" 
                        onClick={handleRemoveCover}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-md"
                        title="Remove cover image"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider">
                      COVER SELECTED
                    </div>
                  </div>
                ) : (
                  <div 
                    onDragOver={handleDragOverCover}
                    onDragLeave={handleDragLeaveCover}
                    onDrop={handleDropCover}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition cursor-pointer ${
                      dragActiveCover 
                        ? 'border-sky-500 bg-sky-50/50' 
                        : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <input 
                      id="cover-file-input"
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleCoverUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="cover-file-input" className="flex flex-col items-center cursor-pointer w-full">
                      <div className="p-3 bg-sky-50 rounded-full text-sky-600 mb-3">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Drag & Drop Cover Image</span>
                      <span className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WEBP (Max 10MB)</span>
                      <span className="mt-3 px-3.5 py-1.5 bg-sky-100 text-sky-700 font-extrabold text-[10px] rounded-lg tracking-wider uppercase">
                        Browse Files
                      </span>
                    </label>
                  </div>
                )}

                {coverUploading && (
                  <div className="space-y-1 bg-sky-50 border border-sky-150 p-2.5 rounded-lg">
                    <div className="flex justify-between text-[10px] font-black text-sky-700 font-mono">
                      <span>UPLOADING COVER...</span>
                      <span>{coverProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-600 h-full transition-all duration-300" style={{ width: `${coverProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Image Upload */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-slate-800 block text-xs uppercase font-mono tracking-wider">📷 Gallery Upload</label>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                    {galleryUploads.length} / 25 IMAGES
                  </span>
                </div>

                <div 
                  onDragOver={handleDragOverGallery}
                  onDragLeave={handleDragLeaveGallery}
                  onDrop={handleDropGallery}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition cursor-pointer ${
                    dragActiveGallery 
                      ? 'border-sky-500 bg-sky-50/50' 
                      : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <input 
                    id="gallery-file-input"
                    type="file" 
                    multiple 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleGalleryUpload(e.target.files);
                      }
                    }}
                  />
                  <label htmlFor="gallery-file-input" className="flex flex-col items-center cursor-pointer w-full">
                    <div className="p-2.5 bg-sky-50 rounded-full text-sky-600 mb-2">
                      <PlusCircle className="h-5.5 w-5.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Drag & Drop Gallery Images</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Select up to 25 high-resolution photographs</span>
                    <span className="mt-2.5 px-3 py-1 bg-sky-100 text-sky-700 font-extrabold text-[10px] rounded-lg tracking-wider uppercase">
                      Select Multiple Files
                    </span>
                  </label>
                </div>

                {/* Previews & Sorting Container */}
                {galleryUploads.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto p-1.5 border border-slate-150 rounded-xl bg-slate-50/30">
                    {galleryUploads.map((img, index) => (
                      <div key={img.id} className="relative group bg-white border border-slate-200 rounded-lg p-1 shadow-3xs flex flex-col justify-between overflow-hidden">
                        
                        {/* Thumbnail View */}
                        <div className="relative aspect-video rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                          {img.uploading ? (
                            <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white p-2">
                              <span className="text-[9px] font-black tracking-wider uppercase font-mono animate-pulse">Uploading</span>
                              <span className="text-[11px] font-mono font-bold mt-1">{img.progress}%</span>
                              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1 max-w-[50px]">
                                <div className="bg-white h-full" style={{ width: `${img.progress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <img src={img.url} alt={`Gallery ${index}`} className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                          )}

                          {/* Quick delete / make cover overlays */}
                          {!img.uploading && img.url && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSetAsCover(img.url)}
                                className="p-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
                                title="Set as main cover image"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(img.id, img.url)}
                                className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                                title="Delete image"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Title and control actions */}
                        <div className="mt-1.5 flex justify-between items-center px-1">
                          <span className="text-[9px] font-mono text-slate-400 truncate max-w-[65px]">
                            #{index + 1} Image
                          </span>
                          
                          {/* Reordering actions */}
                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveGalleryImage(index, 'up')}
                              className="p-1 bg-slate-50 border border-slate-150 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:pointer-events-none"
                              title="Move up / left"
                            >
                              <span className="text-[8px] font-bold">◀</span>
                            </button>
                            <button
                              type="button"
                              disabled={index === galleryUploads.length - 1}
                              onClick={() => handleMoveGalleryImage(index, 'down')}
                              className="p-1 bg-slate-50 border border-slate-150 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:pointer-events-none"
                              title="Move down / right"
                            >
                              <span className="text-[8px] font-bold">▶</span>
                            </button>
                          </div>
                        </div>

                        {/* Is Active Cover Badge Indicator */}
                        {formBasic.image === img.url && img.url && (
                          <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black font-mono tracking-wider uppercase shadow-sm">
                            Active Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. LOCATION DETAILS */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">📍 Geographic Location Mapping</h4>
              
              <div className="space-y-1">
                <label className="font-extrabold text-slate-505 block">Location / Neighborhood Name</label>
                <select
                  value={formLocation.locationName}
                  onChange={(e) => {
                    const selLoc = taxLocations.find(l => l.name === e.target.value);
                    setFormLocation({
                      ...formLocation,
                      locationName: e.target.value,
                      city: selLoc ? selLoc.city : formLocation.city,
                      state: selLoc ? selLoc.state : formLocation.state
                    });
                  }}
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-lg text-xs font-semibold text-slate-705 cursor-pointer"
                >
                  <option value="">- Select Registered Location -</option>
                  {taxLocations.filter(l => l.status !== 'Disabled').map(l => (
                    <option key={l.id} value={l.name}>{l.name} ({l.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block font-mono text-[10px]">City *</label>
                  <input
                    type="text" required
                    value={formLocation.city}
                    onChange={(e) => setFormLocation({ ...formLocation, city: e.target.value })}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-555 block">State</label>
                  <input
                    type="text"
                    value={formLocation.state}
                    onChange={(e) => setFormLocation({ ...formLocation, state: e.target.value })}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-555 block">Country</label>
                  <input
                    type="text"
                    value={formLocation.country}
                    onChange={(e) => setFormLocation({ ...formLocation, country: e.target.value })}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-505 block">Landmark Accents</label>
                <input
                  type="text"
                  value={formLocation.landmark}
                  onChange={(e) => setFormLocation({ ...formLocation, landmark: e.target.value })}
                  placeholder="e.g. Near Metro Rail Station Interchange"
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-505 block">Google Maps Location Link</label>
                <input
                  type="text"
                  value={formLocation.googleMapLocation}
                  onChange={(e) => setFormLocation({ ...formLocation, googleMapLocation: e.target.value })}
                  placeholder="https://goo.gl/maps/..."
                  className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Latitude Scale</label>
                  <input
                    type="text"
                    value={formLocation.latitude}
                    onChange={(e) => setFormLocation({ ...formLocation, latitude: e.target.value })}
                    placeholder="12.9716"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Longitude Scale</label>
                  <input
                    type="text"
                    value={formLocation.longitude}
                    onChange={(e) => setFormLocation({ ...formLocation, longitude: e.target.value })}
                    placeholder="77.5946"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. PRICING & VALUATION */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">💰 Pricing Models</h4>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Price in INR (₹) *</label>
                  <input
                    type="number" required
                    value={formPricing.price}
                    onChange={(e) => setFormPricing({ ...formPricing, price: e.target.value })}
                    placeholder="e.g. 7800000"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Price Per Sq.Ft (₹)</label>
                  <input
                    type="number"
                    value={formPricing.pricePerSqFt}
                    onChange={(e) => setFormPricing({ ...formPricing, pricePerSqFt: e.target.value })}
                    placeholder="6500"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Price Status / Disclaimer</label>
                  <input
                    type="text"
                    value={formPricing.priceStatus}
                    onChange={(e) => setFormPricing({ ...formPricing, priceStatus: e.target.value })}
                    placeholder="All-inclusive, Price on Request, negotiable..."
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
                <div className="pt-6 flex items-center">
                  <label className="flex items-center gap-2 font-bold text-slate-655 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPricing.negotiable}
                      onChange={(e) => setFormPricing({ ...formPricing, negotiable: e.target.checked })}
                      className="rounded text-sky-500 focus:ring-sky-500"
                    /> Price is Negotiable
                  </label>
                </div>
              </div>
            </div>

            {/* 4. DIMENSIONAL SPECIFICATIONS */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">📐 Architectural Dimensions</h4>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block font-mono text-[10px]">Area SqFt</label>
                  <input
                    type="number"
                    value={formSpecs.sqft}
                    onChange={(e) => setFormSpecs({ ...formSpecs, sqft: e.target.value })}
                    placeholder="1200"
                    className="w-full border border-slate-200 bg-white p-2 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block font-mono text-[10px]">Plot Size</label>
                  <input
                    type="text"
                    value={formSpecs.plotSize}
                    onChange={(e) => setFormSpecs({ ...formSpecs, plotSize: e.target.value })}
                    placeholder="30 x 40"
                    className="w-full border border-slate-200 bg-white p-2 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block font-mono text-[10px]">Built-Up Area</label>
                  <input
                    type="number"
                    value={formSpecs.builtUpArea}
                    onChange={(e) => setFormSpecs({ ...formSpecs, builtUpArea: e.target.value })}
                    placeholder="1000"
                    className="w-full border border-slate-200 bg-white p-2 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-[10px] text-slate-505 block">BHK Beds</label>
                  <input
                    type="number"
                    value={formSpecs.beds}
                    onChange={(e) => setFormSpecs({ ...formSpecs, beds: e.target.value })}
                    placeholder="3"
                    className="w-full border border-slate-200 bg-white p-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-[10px] text-slate-505 block">Baths</label>
                  <input
                    type="number"
                    value={formSpecs.baths}
                    onChange={(e) => setFormSpecs({ ...formSpecs, baths: e.target.value })}
                    placeholder="3"
                    className="w-full border border-slate-200 bg-white p-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-[10px] text-slate-505 block">Parking slots</label>
                  <input
                    type="text"
                    value={formSpecs.parking}
                    onChange={(e) => setFormSpecs({ ...formSpecs, parking: e.target.value })}
                    placeholder="1 Covered"
                    className="w-full border border-slate-200 bg-white p-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-[10px] text-slate-505 block">Facing</label>
                  <select
                    value={formSpecs.facing}
                    onChange={(e) => setFormSpecs({ ...formSpecs, facing: e.target.value })}
                    className="w-full border border-slate-200 bg-white p-2 rounded-lg text-[11px]"
                  >
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="North-East">North-East</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-555 block text-[10px]">Furnishing</label>
                  <select
                    value={formSpecs.furnishingStatus}
                    onChange={(e) => setFormSpecs({ ...formSpecs, furnishingStatus: e.target.value })}
                    className="w-full border p-2 rounded-lg bg-white"
                  >
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-555 block text-[10px]">Floor lvl</label>
                  <input
                    type="number"
                    value={formSpecs.floorNumber}
                    onChange={(e) => setFormSpecs({ ...formSpecs, floorNumber: e.target.value })}
                    placeholder="2"
                    className="w-full border p-2 rounded-lg bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-555 block text-[10px]">Age (Yrs)</label>
                  <input
                    type="text"
                    value={formSpecs.propertyAge}
                    onChange={(e) => setFormSpecs({ ...formSpecs, propertyAge: e.target.value })}
                    placeholder="New / 2 Years"
                    className="w-full border p-2 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 5. PROJECT & DEVELOPERS INFO */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">🏗️ Project & Builder compliance</h4>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Project Name (Recommended)</label>
                  <input
                    type="text"
                    value={formProject.projectName}
                    onChange={(e) => setFormProject({ ...formProject, projectName: e.target.value })}
                    placeholder="e.g. Prestige Lakeside"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Builder / Developer Name</label>
                  <input
                    type="text"
                    value={formProject.builderName}
                    onChange={(e) => setFormProject({ ...formProject, builderName: e.target.value })}
                    placeholder="Prestige Group Builders"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">RERA Number</label>
                  <input
                    type="text"
                    value={formProject.reraNumber}
                    onChange={(e) => setFormProject({ ...formProject, reraNumber: e.target.value })}
                    placeholder="e.g. PRM/KA/RERA/..."
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Possession Date</label>
                  <input
                    type="text"
                    value={formProject.possessionDate}
                    onChange={(e) => setFormProject({ ...formProject, possessionDate: e.target.value })}
                    placeholder="Dec 2027 / Ready"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* 6. INVESTMENT PRESETS */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">📈 Investment Indicators</h4>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-555 block font-mono text-[9px]">Expected ROI (%)</label>
                  <input
                    type="text"
                    value={formInvestment.expectedROI}
                    onChange={(e) => setFormInvestment({ ...formInvestment, expectedROI: e.target.value })}
                    placeholder="9.6"
                    className="w-full border p-2 rounded-lg bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-555 block font-mono text-[9px]">Rental Yield (%)</label>
                  <input
                    type="text"
                    value={formInvestment.rentalYield}
                    onChange={(e) => setFormInvestment({ ...formInvestment, rentalYield: e.target.value })}
                    placeholder="4.2"
                    className="w-full border p-2 rounded-lg bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-555 block font-mono text-[9px]">Investment Score</label>
                  <input
                    type="number"
                    value={formInvestment.investmentScore}
                    onChange={(e) => setFormInvestment({ ...formInvestment, investmentScore: e.target.value })}
                    placeholder="92"
                    className="w-full border p-2 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Appreciation Potential</label>
                  <select
                    value={formInvestment.appreciationPotential}
                    onChange={(e) => setFormInvestment({ ...formInvestment, appreciationPotential: e.target.value })}
                    className="w-full border p-2.5 rounded-lg bg-white"
                  >
                    <option value="Moderate">Moderate Growth</option>
                    <option value="High">High Growth</option>
                    <option value="Exceptional">Exceptional Growth</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Demand Level Badge</label>
                  <select
                    value={formInvestment.demandLevel}
                    onChange={(e) => setFormInvestment({ ...formInvestment, demandLevel: e.target.value })}
                    className="w-full border p-2.5 rounded-lg bg-white font-bold"
                  >
                    <option value="Moderate Demand">Moderate Demand</option>
                    <option value="High Demand">High Demand</option>
                    <option value="Very High Demand">Very High Demand</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 7. MARKETING DISPLAY BADGES TOGGLES */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5 md:col-span-2">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">🏷️ Marketing & Verification Display Badges</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-bold text-slate-655">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgeVerified} onChange={(e) => setFormBadges({ ...formBadges, badgeVerified: e.target.checked })} className="rounded text-sky-500" />
                  <span>Verified Listing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgeFeatured} onChange={(e) => setFormBadges({ ...formBadges, badgeFeatured: e.target.checked })} className="rounded text-sky-500" />
                  <span>Featured Property</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgePremium} onChange={(e) => setFormBadges({ ...formBadges, badgePremium: e.target.checked })} className="rounded text-sky-500 animate-pulse" />
                  <span>Premium Tier</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgeHot} onChange={(e) => setFormBadges({ ...formBadges, badgeHot: e.target.checked })} className="rounded text-sky-500" />
                  <span>Hot Asset 🔥</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgeNewLaunch} onChange={(e) => setFormBadges({ ...formBadges, badgeNewLaunch: e.target.checked })} className="rounded text-sky-500" />
                  <span>New Launch 🚀</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgeTrending} onChange={(e) => setFormBadges({ ...formBadges, badgeTrending: e.target.checked })} className="rounded text-sky-500" />
                  <span>Trending Property</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgeInvestmentOpportunity} onChange={(e) => setFormBadges({ ...formBadges, badgeInvestmentOpportunity: e.target.checked })} className="rounded text-sky-500" />
                  <span>High ROI Deal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgeLimitedAvailability} onChange={(e) => setFormBadges({ ...formBadges, badgeLimitedAvailability: e.target.checked })} className="rounded text-sky-500" />
                  <span>Limited Space ⏳</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgePriceDrop} onChange={(e) => setFormBadges({ ...formBadges, badgePriceDrop: e.target.checked })} className="rounded text-sky-500" />
                  <span>Price Drop 📉</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-150">
                  <input type="checkbox" checked={formBadges.badgeBestSeller} onChange={(e) => setFormBadges({ ...formBadges, badgeBestSeller: e.target.checked })} className="rounded text-sky-500" />
                  <span>Best Seller 👑</span>
                </label>
              </div>
            </div>

            {/* 8. AGENT & OWNER INFORMATION */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5 md:col-span-2">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">👤 Contact Personnel Information</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Assigned Advisory Agent *</label>
                  <select
                    value={formAgent.assignedAgentId}
                    onChange={(e) => setFormAgent({ ...formAgent, assignedAgentId: e.target.value })}
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg text-xs"
                  >
                    <option value="">- Select Active Advisor -</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Agent Direct Contact</label>
                  <input
                    type="text"
                    value={formAgent.agentContact}
                    onChange={(e) => setFormAgent({ ...formAgent, agentContact: e.target.value })}
                    placeholder="+91 63009 84846"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Owner Name (Private Record)</label>
                  <input
                    type="text"
                    value={formAgent.ownerName}
                    onChange={(e) => setFormAgent({ ...formAgent, ownerName: e.target.value })}
                    placeholder="Sri Devanand Reddy"
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-505 block">Owner Contact (Private Record)</label>
                  <input
                    type="text"
                    value={formAgent.ownerContact}
                    onChange={(e) => setFormAgent({ ...formAgent, ownerContact: e.target.value })}
                    placeholder="+91 94402..."
                    className="w-full border border-slate-200 bg-white p-2.5 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 9. AMENITIES SELECTION CHECKLIST */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3.5 md:col-span-2">
              <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600">⚓ Dynamic Amenities Checklist</h4>
              <p className="text-[11px] text-slate-450 font-sans leading-relaxed">Toggle amenities registered in taxonomy registry. Customer searches actively look up these metrics.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
                {taxAmenities.map((am) => {
                  const isChecked = formAmenities.includes(am.name);
                  return (
                    <label 
                      key={am.id} 
                      className={`flex items-center gap-2 cursor-pointer p-2 rounded-xl border transition-all text-xs font-semibold ${
                        isChecked 
                          ? 'bg-sky-50 border-sky-200 text-sky-800 font-extrabold' 
                          : 'bg-white border-slate-205 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormAmenities([...formAmenities, am.name]);
                          } else {
                            setFormAmenities(formAmenities.filter(x => x !== am.name));
                          }
                        }}
                        className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer h-4 w-4"
                      />
                      <span>{am.name}</span>
                    </label>
                  );
                })}
                {taxAmenities.length === 0 && (
                  <div className="col-span-full text-center py-4 bg-white border border-slate-200 rounded-xl font-mono text-[10px] uppercase font-bold text-slate-400">
                    No amenities registered in lookup tables. Navigate to 'Manage Taxonomies' to add features.
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="py-2.5 px-5 border border-slate-202 hover:bg-slate-50 text-xs font-bold rounded-xl text-slate-600 transition cursor-pointer"
            >
              Reset / Cancel Form
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-slate-900 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              {editingId ? 'Update Real Estate Asset File' : 'Publish Asset Profile'}
            </button>
          </div>
        </form>
      )}

      {/* TAB D: TRASH AND DELETION ARCHIVES */}
      {activeSubTab === 'Trash & Archives' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* TRASH DIVISION */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
            <div className="p-4 bg-rose-50/35 border-b border-rose-100/50 flex justify-between items-center flex-wrap gap-2 text-left">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                  <Trash className="h-4.5 w-4.5 text-rose-500" /> Bin Database
                </h3>
                <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans">Temporary store of deleted properties. Restore listings or complete permanent deletion.</p>
              </div>

              {trashedProperties.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to permanently erase all trashed files? This cannot be undone.")) {
                        if (setProperties) setProperties(properties.filter(p => !p.isTrashed && p.status !== 'Trashed'));
                        addLog('Trash Bin', 'Bulk Purged Trash', 'Irreversibly erased all files in database trash dumpster.');
                      }
                    }}
                    className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg transition cursor-pointer shadow-3xs"
                  >
                    Empty Trash Dumpster
                  </button>
                </div>
              )}
            </div>

            <div className="p-4">
              {trashedProperties.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2 font-mono text-xs font-bold">
                  <span>Bin database is clear. Safe and empty!</span>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  {trashedProperties.map((p) => (
                    <div key={p.id} className="p-4 border border-slate-202 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                      <div className="flex gap-3">
                        <img src={p.image} alt={p.title} className="w-12 h-12 object-cover rounded-xl border shrink-0" referrerPolicy="no-referrer" />
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{p.title}</span>
                          <span className="text-[10px] text-slate-500 block">📍 Address: {p.address || p.locationName || 'Bengaluru'}</span>
                          <span className="text-[9px] font-mono text-rose-600 block mt-0.5">Asset Code: {p.code || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => triggerConfirm('Restore Listing', `Are you sure you want to restore "${p.title}" back under active listed assets?`, 'restore', p.id)}
                          className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold rounded-lg border border-emerald-200 transition text-[11px] cursor-pointer"
                        >
                          Restore Asset
                        </button>
                        <button
                          onClick={() => triggerConfirm('Permanent Purge', `Are you absolutely sure you want to permanently delete "${p.title}"? This cannot be undone.`, 'perm_delete', p.id)}
                          className="py-1.5 px-3 hover:bg-rose-50 text-rose-600 font-bold rounded-lg transition text-[11px] cursor-pointer border border-transparent hover:border-rose-200"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE ARCHIVES DIVISION */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
            <div className="p-4 bg-amber-50/30 border-b border-amber-100/50 flex justify-between items-center text-left">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                  <Archive className="h-4.5 w-4.5 text-amber-500" /> Cold Storage Archives
                </h3>
                <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans">Compare properties held securely in offline archive storage.</p>
              </div>
            </div>

            <div className="p-4 text-left">
              {archivedProperties.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-mono text-xs font-bold">
                  <span>No archived properties in catalog vaults.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {archivedProperties.map((p) => (
                    <div key={p.id} className="p-4 border border-slate-202 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/40">
                      <div className="flex gap-3">
                        <img src={p.image} alt={p.title} className="w-12 h-12 object-cover rounded-xl border shrink-0" />
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{p.title}</span>
                          <span className="text-[10px] text-slate-500 block">📍 {p.address} • {formatCurrencyIndia(p.price)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => triggerConfirm('Restore Archive', `Bring property "${p.title}" back from archives?`, 'restore', p.id)}
                          className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-202 text-[11px]"
                        >
                          Restore to Market
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB E: CARD CONFIGURATIONS & TEMPLATE CONTROLS */}
      {activeSubTab === 'Card Configurations' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-4 text-left space-y-1 mb-6">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5"><Settings className="h-4.5 w-4.5 text-sky-500" /> Visual card config & CSS Layout templates</h3>
            <p className="text-xs text-slate-500 font-sans leading-relaxed">Ensure total graphical autonomy. Customize card template presets and configure toggle switches for customer-facing displays.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* TOGGLES DIVISION */}
            <div className="lg:col-span-1 space-y-5 text-left text-xs bg-slate-50/50 p-5 rounded-2xl border border-slate-150">
              <h4 className="font-black text-slate-805 uppercase font-mono tracking-wider text-[10px] pb-2 border-b border-slate-200 flex items-center gap-1 text-sky-600"><CheckSquare className="h-4 w-4" /> Card Display Toggles</h4>
              
              <div className="space-y-3.5 font-bold text-slate-655">
                {[
                  { key: 'showLocation', label: 'Show Location Address' },
                  { key: 'showPrice', label: 'Show Valuation Price' },
                  { key: 'showPropertyType', label: 'Show Classification Type' },
                  { key: 'showArea', label: 'Show Dimension Area (SqFt)' },
                  { key: 'showPropertyStatus', label: 'Show Active Status Tag' },
                  { key: 'showProjectName', label: 'Show Project / Building Name' },
                  { key: 'showBuilderName', label: 'Show Builder Developer Name' },
                  { key: 'showFeaturedBadge', label: 'Show Featured Badging' },
                  { key: 'showVerifiedBadge', label: 'Show Verified Listing Badging' },
                  { key: 'showDemandLevel', label: 'Show High-Demand Indicators' },
                  { key: 'showInvestmentScore', label: 'Show Spec Investment Scores' },
                  { key: 'showPossessionDate', label: 'Show Project Possession Dates' },
                  { key: 'showAgentInformation', label: 'Show Representative Representative Card' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between cursor-pointer group p-1 hover:bg-white rounded transition">
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={!!cardConfig[item.key as keyof PropertyCardConfig]}
                      onChange={(e) => updateCardConfig(item.key as keyof PropertyCardConfig, e.target.checked)}
                      className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer h-4 w-4"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* TEMPLATES DIVISION */}
            <div className="lg:col-span-2 space-y-6 text-left">
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 uppercase font-mono tracking-wider text-[10px] flex items-center gap-1 text-sky-600"><Compass className="h-4.5 w-4.5" /> Select Card CSS Template Layout</h4>
                <p className="text-xs text-slate-450 font-sans leading-relaxed">Admins can switch the card template globally across listings. No code modification required.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'Classic', desc: 'Standard catalog theme layout' },
                    { id: 'Modern', desc: 'Sleek rounded geometry accents' },
                    { id: 'Luxury', desc: 'Golden and deep dark borders' },
                    { id: 'Investment', desc: 'Metrics and ROI projection details' },
                    { id: 'Commercial', desc: 'RERA and workspace elements focus' },
                    { id: 'Minimal', desc: 'Clean borderless layout with Negative space' },
                    { id: 'Custom', desc: 'Strict adherence to toggled switches' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTemplateChange(t.id as PropertyCardTemplate)}
                      className={`p-3 text-center border rounded-xl transition text-xs font-black relative flex flex-col justify-between h-20 ${
                        cardTemplate === t.id 
                          ? 'border-sky-505 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20' 
                          : 'border-slate-202 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{t.id}</span>
                      <span className="text-[8px] font-medium font-sans text-slate-400 block line-clamp-2 leading-tight">{t.desc}</span>
                      {cardTemplate === t.id && (
                        <div className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-sky-500 text-white rounded-full flex items-center justify-center text-[8px]">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE RENDER PREVIEW */}
              <div className="border border-sky-100 bg-sky-50/15 p-6 rounded-2xl flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2 max-w-sm">
                  <span className="text-[9px] font-black uppercase font-mono tracking-wider text-sky-600 bg-sky-100/50 px-2.5 py-0.5 rounded border border-sky-100 inline-block">Real-time Admin Preview Frame</span>
                  <h4 className="text-xs font-black text-slate-805 uppercase font-mono">Simulated customer card view</h4>
                  <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                    Preview of the exact property card layout rendered to customer-facing screens. Toggle buttons left to see live variations.
                  </p>
                </div>

                <div className="w-full max-w-sm shrink-0">
                  <PropertyCard
                    property={samplePreviewListing}
                    config={cardConfig}
                    template={cardTemplate}
                    onViewDetails={() => alert('Detail Modal Simulated')}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB F: ACTIVITY HISTORY LOGS */}
      {activeSubTab === 'Activity Logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs text-xs text-left animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-sky-600 animate-pulse" /> Asset Lifecycle Activity Logs Ledger</h3>
              <p className="text-slate-500 text-[11px]">Comprehensive tracking records of operator listings adjustments.</p>
            </div>
            
            <button
              onClick={() => {
                if (confirm("Reset logs history?")) {
                  setLogs([]);
                }
              }}
              className="py-1 px-2 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold"
            >
              Reset Audit Logs
            </button>
          </div>

          <div className="overflow-x-auto font-mono text-[11px]">
            <table className="w-full border-collapse text-slate-655 text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400">
                  <th className="p-3">Audit Date</th>
                  <th className="p-3">Operation Event</th>
                  <th className="p-3">Reference Asset</th>
                  <th className="p-3">Authorized operator</th>
                  <th className="p-3">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-450">{log.timestamp}</td>
                    <td className="p-3 font-black text-slate-800">{log.action}</td>
                    <td className="p-3 font-semibold text-slate-700">{log.propertyTitle}</td>
                    <td className="p-3">
                      <span className="bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded text-[10px] border border-sky-100">
                        {log.operator}
                      </span>
                    </td>
                    <td className="p-3 text-slate-450 leading-normal">{log.details || 'Dynamic operator action recorded.'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-10 text-slate-405 font-bold">
                      No logs mapped. Complete CRUD transactions to record trace history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB G: MASTER REAL ESTATE TAXONOMIES MODULE */}
      {activeSubTab === 'Master Taxonomies' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="text-left space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase font-mono tracking-wide">
                <Database className="h-4.5 w-4.5 text-sky-500" /> Real Estate Master Taxonomy Management
              </h3>
              <p className="text-xs text-slate-450 leading-relaxed font-sans">
                Manage lookup tables, dynamic tags, property categories, architectural Types, and Amenities checklist for the system directory.
              </p>
            </div>

            {/* Sub taxonomy selectors */}
            <div className="flex flex-wrap gap-1 bg-slate-100/80 p-0.5 rounded-xl border border-slate-200 text-xs">
              {(['Categories', 'Types', 'Statuses', 'Locations', 'Amenities'] as typeof activeTaxTab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTaxTab(tab);
                    setEditingTaxId(null);
                    setTaxNameInput('');
                    setTaxColorInput('emerald');
                    setTaxMapCategory(taxCategories[0]?.id || 'cat-res');
                    setTaxMapCity('');
                    setTaxMapState('');
                  }}
                  className={`px-3 py-1 font-extrabold rounded-lg transition-all cursor-pointer ${
                    activeTaxTab === tab ? 'bg-white shadow text-sky-655' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left text-xs">
            
            {/* LEFT COLUMN: TAXONOMY ADD/EDIT FORM */}
            <div className="lg:col-span-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-150 space-y-4">
              <span className="block font-mono text-[9px] uppercase font-black text-sky-600 tracking-widest border-b border-slate-200 pb-1.5 text-left">
                {editingTaxId ? 'Modify Masters Record' : `Add Master ${activeTaxTab}`}
              </span>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!taxNameInput) return;

                  if (activeTaxTab === 'Categories') {
                    if (editingTaxId) {
                      const existingCat = categories.find(c => c.id === editingTaxId);
                      if (existingCat) {
                        const updatedCat = { ...existingCat, title: taxNameInput };
                        firebaseService.saveCategory(updatedCat).then(() => {
                          addLog(taxNameInput, 'Modified Category', `Set Category status coordinates.`);
                        }).catch(err => console.error("Failed to update category:", err));
                      }
                    } else {
                      onAddCategory?.(taxNameInput);
                      addLog(taxNameInput, 'Inserted Category', `Set Category status coordinates.`);
                    }
                  } else if (activeTaxTab === 'Types') {
                    if (editingTaxId) {
                      setTaxTypes(taxTypes.map(t => t.id === editingTaxId ? { ...t, name: taxNameInput, categoryId: taxMapCategory } : t));
                    } else {
                      setTaxTypes([...taxTypes, { id: 'typ-' + Date.now(), name: taxNameInput, categoryId: taxMapCategory }]);
                    }
                    addLog(taxNameInput, editingTaxId ? 'Modified Type' : 'Inserted Type', `Mapped to category identity.`);
                  } else if (activeTaxTab === 'Statuses') {
                    if (editingTaxId) {
                      setTaxStatuses(taxStatuses.map(s => s.id === editingTaxId ? { ...s, name: taxNameInput, color: taxColorInput } : s));
                    } else {
                      setTaxStatuses([...taxStatuses, { id: 'stat-' + Date.now(), name: taxNameInput, color: taxColorInput, isCustom: true }]);
                    }
                    addLog(taxNameInput, editingTaxId ? 'Modified Status' : 'Inserted Status', `Custom marketing status active.`);
                  } else if (activeTaxTab === 'Locations') {
                    if (editingTaxId) {
                      setTaxLocations(taxLocations.map(l => l.id === editingTaxId ? { ...l, name: taxNameInput, city: taxMapCity || 'Bengaluru', state: taxMapState || 'Karnataka' } : l));
                    } else {
                      setTaxLocations([...taxLocations, { id: 'loc-' + Date.now(), name: taxNameInput, city: taxMapCity || 'Bengaluru', state: taxMapState || 'Karnataka', status: 'Enabled' }]);
                    }
                    addLog(taxNameInput, editingTaxId ? 'Modified Location' : 'Inserted Location', `Mapped coordinates: ${taxMapCity}, ${taxMapState}`);
                  } else if (activeTaxTab === 'Amenities') {
                    if (editingTaxId) {
                      setTaxAmenities(taxAmenities.map(a => a.id === editingTaxId ? { ...a, name: taxNameInput } : a));
                    } else {
                      setTaxAmenities([...taxAmenities, { id: 'amen-' + Date.now(), name: taxNameInput }]);
                    }
                    addLog(taxNameInput, editingTaxId ? 'Modified Amenity' : 'Inserted Amenity', `Feature checkbox dynamically deployed.`);
                  }

                  // Clear form fields
                  setEditingTaxId(null);
                  setTaxNameInput('');
                  setTaxMapCity('');
                  setTaxMapState('');
                }}
                className="space-y-4 text-xs font-sans text-slate-700"
              >
                
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-black text-slate-500 font-mono">Label Name *</label>
                  <input
                    type="text" required
                    value={taxNameInput}
                    onChange={(e) => setTaxNameInput(e.target.value)}
                    placeholder={`e.g. Unique ${activeTaxTab}`}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                {activeTaxTab === 'Types' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black text-slate-500 font-mono">Parent Category Mapping</label>
                    <select
                      value={taxMapCategory}
                      onChange={(e) => setTaxMapCategory(e.target.value)}
                      className="w-full bg-white border border-slate-205 rounded-lg p-2 cursor-pointer"
                    >
                      {taxCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTaxTab === 'Statuses' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black text-slate-500 font-mono">Status Color Theme Badge</label>
                    <select
                      value={taxColorInput}
                      onChange={(e) => setTaxColorInput(e.target.value)}
                      className="w-full bg-white border border-slate-205 rounded-lg p-2 cursor-pointer font-bold text-slate-705"
                    >
                      <option value="emerald">Emerald Green (Available/OK)</option>
                      <option value="amber">Amber Gold (Reserved/Engaged)</option>
                      <option value="sky">Sky Blue (Sold Units)</option>
                      <option value="blue">Royal Blue (Rented Units)</option>
                      <option value="purple">Warm Purple (Pending Review)</option>
                      <option value="indigo">Deep Indigo (Internal Draft)</option>
                      <option value="rose">Red Rose (Trashed/Out of Pool)</option>
                      <option value="slate">Slate Gray (Archived/Default)</option>
                    </select>
                  </div>
                )}

                {activeTaxTab === 'Locations' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono text-slate-400 font-extrabold">City</label>
                      <input
                        type="text"
                        value={taxMapCity}
                        onChange={(e) => setTaxMapCity(e.target.value)}
                        placeholder="Bengaluru"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-mono text-slate-400 font-extrabold">State</label>
                      <input
                        type="text"
                        value={taxMapState}
                        onChange={(e) => setTaxMapState(e.target.value)}
                        placeholder="Karnataka"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="flex-grow py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-850 cursor-pointer uppercase font-mono tracking-wider text-[10.5px]"
                  >
                    {editingTaxId ? 'Rewrite Masters Key' : 'Deploy Master Entry'}
                  </button>
                  {editingTaxId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTaxId(null);
                        setTaxNameInput('');
                        setTaxMapCity('');
                        setTaxMapState('');
                      }}
                      className="px-3 py-2 border border-slate-202 text-slate-605 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </form>

            </div>

            {/* RIGHT COLUMN: TAXONOMY DATA LIST VIEWS */}
            <div className="lg:col-span-8 bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-3xs">
              <div className="p-4 bg-slate-50 border-b border-slate-105 flex justify-between items-center select-none">
                <span className="font-mono text-[10px] uppercase font-black text-slate-555">
                  Managed {activeTaxTab} List
                </span>
                <span className="text-[10px] bg-sky-50 text-sky-655 font-mono font-bold px-2.5 py-0.5 rounded border border-sky-100">
                  Data Persistent
                </span>
              </div>

              <div className="divide-y divide-slate-150 max-h-120 overflow-y-auto">
                
                {/* 1. CATEGORIES RENDER */}
                {activeTaxTab === 'Categories' && categories.map(cat => {
                  const isEnabled = cat.status !== 'Disabled';
                  return (
                    <div key={cat.id} className="p-3.5 flex justify-between items-center hover:bg-slate-5/5 transition-all">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs block">{cat.title}</span>
                        <span className="font-mono text-[9px] text-slate-400 block uppercase">Identity Code: {cat.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedCat = { ...cat, status: isEnabled ? 'Disabled' : 'Active' };
                            firebaseService.saveCategory(updatedCat).then(() => {
                              addLog(cat.title, isEnabled ? 'Disabled Category' : 'Enabled Category', `Set category status constraint.`);
                            }).catch(err => console.error("Failed to update category status:", err));
                          }}
                          className="cursor-pointer font-bold font-mono text-[10px]"
                        >
                          {isEnabled ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">● Enabled</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-450 border border-slate-200">Disabled</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaxId(cat.id);
                            setTaxNameInput(cat.title);
                          }}
                          className="p-1 px-2.5 border border-slate-200 font-bold hover:bg-slate-100/50 rounded-lg text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCategory?.(cat.id);
                            addLog(cat.title, 'Purged Category', 'Dropped from system masters.');
                          }}
                          className="p-1 px-1.5 hover:bg-rose-50 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. TYPES RENDER */}
                {activeTaxTab === 'Types' && taxTypes.map(typ => {
                  const mappedCategory = taxCategories.find(c => c.id === typ.categoryId)?.name || 'Residential';
                  return (
                    <div key={typ.id} className="p-3.5 flex justify-between items-center hover:bg-slate-5/5 transition">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs block">{typ.name}</span>
                        <span className="font-mono text-[9px] text-slate-450 block uppercase">Mapped Class Category: {mappedCategory}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaxId(typ.id);
                            setTaxNameInput(typ.name);
                            setTaxMapCategory(typ.categoryId);
                          }}
                          className="p-1 px-2.5 border border-slate-200 font-bold hover:bg-slate-100 rounded-lg text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTaxTypes(taxTypes.filter(t => t.id !== typ.id));
                            addLog(typ.name, 'Purged Property Type', 'Dropped.');
                          }}
                          className="p-1 px-1.5 hover:bg-rose-50 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 3. STATUS RENDER */}
                {activeTaxTab === 'Statuses' && taxStatuses.map(stat => {
                  const isCustom = stat.isCustom !== false;
                  return (
                    <div key={stat.id} className="p-3.5 flex justify-between items-center hover:bg-slate-5/5 transition-all animate-in fade-in">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-850 text-xs block flex items-center gap-1.5">
                          <span className={`h-2.5 w-2.5 rounded-full bg-${stat.color}-500 inline-block`} /> {stat.name}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 block uppercase">Color CSS: text-{stat.color}-500 • {isCustom ? 'Custom Status' : 'Framework Status'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaxId(stat.id);
                            setTaxNameInput(stat.name);
                            setTaxColorInput(stat.color);
                          }}
                          className="p-1 px-2.5 border border-slate-200 font-bold hover:bg-slate-100 rounded-lg text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isCustom) {
                              alert('Design Constraint: Built-in framework status tags cannot be dropped.');
                              return;
                            }
                            setTaxStatuses(taxStatuses.filter(s => s.id !== stat.id));
                            addLog(stat.name, 'Purged Marketing Status', 'Dropped.');
                          }}
                          className={`p-1 px-1.5 rounded ${!isCustom ? 'opacity-30 cursor-not-allowed text-slate-300' : 'hover:bg-rose-50 hover:text-rose-650'}`}
                          disabled={!isCustom}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 4. LOCATIONS RENDER */}
                {activeTaxTab === 'Locations' && taxLocations.map(loc => {
                  const isEnabled = loc.status !== 'Disabled';
                  return (
                    <div key={loc.id} className="p-3.5 flex justify-between items-center hover:bg-slate-5/5 transition-all">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-805 text-xs block">{loc.name}</span>
                        <span className="font-mono text-[9px] text-slate-450 block">Territory: {loc.city}, {loc.state}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const next = taxLocations.map(l => l.id === loc.id ? { ...l, status: isEnabled ? 'Disabled' : 'Enabled' } : l);
                            setTaxLocations(next);
                            addLog(loc.name, isEnabled ? 'Disabled Location' : 'Enabled Location', 'Set regional availability.');
                          }}
                          className="cursor-pointer font-bold font-mono text-[10px]"
                        >
                          {isEnabled ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Enabled</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-450 border border-slate-200">Disabled</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaxId(loc.id);
                            setTaxNameInput(loc.name);
                            setTaxMapCity(loc.city);
                            setTaxMapState(loc.state);
                          }}
                          className="p-1 px-2.5 border border-slate-200 font-bold hover:bg-slate-100 rounded-lg text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTaxLocations(taxLocations.filter(l => l.id !== loc.id));
                            addLog(loc.name, 'Purged Location Master', 'Dropped.');
                          }}
                          className="p-1 px-1.5 hover:bg-rose-50 hover:text-rose-650 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 5. AMENITIES RENDER */}
                {activeTaxTab === 'Amenities' && taxAmenities.map(am => {
                  return (
                    <div key={am.id} className="p-3.5 flex justify-between items-center hover:bg-slate-5/5 transition-all">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs block">{am.name}</span>
                        <span className="font-mono text-[9px] text-slate-400 block uppercase">Identifier Coordinate: {am.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaxId(am.id);
                            setTaxNameInput(am.name);
                          }}
                          className="p-1 px-2.5 border border-slate-200 font-bold hover:bg-slate-105 rounded-lg text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTaxAmenities(taxAmenities.filter(a => a.id !== am.id));
                            addLog(am.name, 'Purged Amenity Master', 'Dropped from checklist.');
                          }}
                          className="p-1 px-1.5 hover:bg-rose-50 hover:text-rose-650 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC FORM ACTIONS TARGET MODALS */}

      {/* 1. STATUS OPTION CHANGED DIALOG MENU */}
      {changeStatusPropId && (
        <div className="fixed inset-0 bg-slate-909/40 z-50 backdrop-blur-xs flex items-center justify-center p-4 text-left font-sans text-xs">
          <div className="bg-white border border-slate-202 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl relative animate-in fade-in duration-100">
            <button 
              onClick={() => setChangeStatusPropId(null)}
              className="absolute right-4.5 top-4.5 p-1 text-slate-400 hover:text-slate-600 block cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2">Change Marketing status tag</h4>
            <div className="space-y-3 pt-1">
              <span className="block text-[10px] text-slate-450 uppercase font-mono font-bold">Select dynamic status option</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                {taxStatuses.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      const updated = properties.map(p => p.id === changeStatusPropId ? { ...p, status: st.name } : p);
                      setProperties?.(updated);
                      addLog(properties.find(p => p.id === changeStatusPropId)?.title || '', 'Changed Status', `Modified status coordinates to ${st.name}`);
                      setChangeStatusPropId(null);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-sky-50 hover:text-sky-850 rounded-xl transition-all border border-slate-200 hover:border-sky-200 text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className={`h-2 w-2 rounded-full bg-${st.color}-500 shrink-0 inline-block`} />
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AGENT ADVISOR ASSIGNMENT DIALOG MODAL */}
      {assignAgentPropId && (
        <div className="fixed inset-0 bg-slate-909/40 z-50 backdrop-blur-xs flex items-center justify-center p-4 text-left font-sans text-xs">
          <div className="bg-white border border-slate-202 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl relative animate-in fade-in duration-100">
            <button 
              onClick={() => setAssignAgentPropId(null)}
              className="absolute right-4.5 top-4.5 p-1 text-slate-400 hover:text-slate-600 block cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h4 className="font-black text-slate-900 border-b border-slate-100 pb-2">Re-assign Representative Agent</h4>
            <div className="space-y-3 pt-1">
              <span className="block text-[10px] text-slate-450 uppercase font-mono font-bold">Select active corporate advisor</span>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {agents.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      const updated = properties.map(p => {
                        if (p.id === assignAgentPropId) {
                          return {
                            ...p,
                            agent: {
                              name: a.name,
                              role: a.role,
                              avatar: a.avatar,
                              phone: a.phone,
                              email: a.email
                            }
                          };
                        }
                        return p;
                      });
                      setProperties?.(updated);
                      addLog(properties.find(p => p.id === assignAgentPropId)?.title || '', 'Assigned Representative Agent', `Assigned directly to advisor ${a.name}`);
                      setAssignAgentPropId(null);
                    }}
                    className="w-full p-2.5 bg-slate-50 hover:bg-sky-50 hover:text-sky-850 rounded-xl transition-all border border-slate-200 hover:border-sky-150 text-left flex items-center gap-3 cursor-pointer"
                  >
                    <img src={a.avatar} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full border bg-slate-100 shrink-0" alt="" />
                    <div className="font-extrabold">
                      <span className="block text-slate-900 leading-tight text-[11px]">{a.name}</span>
                      <span className="block text-[9.5px] text-slate-400 font-medium font-mono uppercase mt-0.5">{a.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODULAR CUSTOM CONFIRMATION POPUP DIALOG */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-905/30 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-100">
          <div className="bg-white border border-slate-250 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 border-b border-slate-100 pb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 animate-bounce" />
              <h4 className="font-extrabold text-slate-900 text-sm">{confirmDialog.title}</h4>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed text-left">
              {confirmDialog.description}
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="py-1.5 px-3.5 border border-slate-205 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel Action
              </button>
              <button
                onClick={handleConfirmedAction}
                className="py-1.5 px-4 bg-slate-900 hover:bg-sky-600 text-white font-extrabold text-[11px] rounded-xl transition"
              >
                Proceed Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
