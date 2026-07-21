import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  UploadCloud,
  Check,
  X,
  FolderOpen,
  Info,
  Grid,
  List,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileText,
  Bookmark,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  ArrowUpDown,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface MediaItem {
  id: string;
  title: string;
  seo_filename: string;
  slug: string;
  alt_text: string | null;
  caption: string | null;
  description: string | null;
  keywords: string | null;
  folder: string;
  category: string;
  width: number | null;
  height: number | null;
  aspect_ratio: string | null;
  format: string | null;
  file_size: number;
  storage_path: string;
  public_url: string;
  thumbnail_url: string | null;
  medium_url: string | null;
  large_url: string | null;
  original_url: string | null;
  uploaded_by: string | null;
  status: string;
  usage_count: number;
  relative_path?: string | null;
  last_used_at?: string | null;
  favorite?: number;
  seo_slug?: string | null;
  canonical_filename?: string | null;
  hash?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: MediaItem[]) => void;
  allowMultiple?: boolean;
  allowedFolder?: string; // Limit selection to a specific folder (e.g. "logos")
  allowedCategory?: string; // Limit selection to a specific category
  initialTab?: "library" | "upload";
}

const folders = [
  "properties",
  "logos",
  "blogs",
  "banners",
  "agents",
  "customers",
  "documents",
  "testimonials",
  "projects"
];

const categories = [
  "All",
  "Apartments",
  "Villas",
  "Commercial",
  "Lands",
  "Logos",
  "Portraits",
  "Marketing",
  "Banners",
  "Uncategorized"
];

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  allowMultiple = false,
  allowedFolder,
  allowedCategory,
  initialTab = "library"
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbFolders, setDbFolders] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  
  // Tabs & Views
  const [activeTab, setActiveTab] = useState<"library" | "upload">(initialTab);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>(allowedFolder || "all");
  const [selectedCategory, setSelectedCategory] = useState<string>(allowedCategory || "all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Selection state
  const [selectedAssets, setSelectedAssets] = useState<MediaItem[]>([]);
  const [focusedAsset, setFocusedAsset] = useState<MediaItem | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadSeoFilename, setUploadSeoFilename] = useState("");
  const [uploadFolder, setUploadFolder] = useState(allowedFolder || "properties");
  const [uploadCategory, setUploadCategory] = useState(allowedCategory || "All");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [fRes, cRes] = await Promise.all([
          fetch("/api/mysql/media_folders").then(r => r.json()),
          fetch("/api/mysql/media_categories").then(r => r.json())
        ]);
        if (fRes.success) setDbFolders(fRes.data);
        if (cRes.success) setDbCategories(cRes.data);
      } catch (err) {
        console.error("Failed to load folders/categories in picker modal:", err);
      }
    };
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  const dynamicFolders = dbFolders.length > 0 ? dbFolders.map(f => f.path) : folders;
  const dynamicCategories = dbCategories.length > 0 
    ? dbCategories.filter(c => c.status === "Active").map(c => c.name) 
    : categories.filter(c => c !== "All");

  // Load items on mount/open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchAssets();
      setSelectedAssets([]);
      setFocusedAsset(null);
      resetUploadForm();
    }
  }, [isOpen, selectedFolder, selectedCategory, sortBy, filterFavorites, initialTab]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedFolder !== "all") params.append("folder", selectedFolder);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (filterFavorites) params.append("favorite", "true");
      if (searchQuery) params.append("search", searchQuery);
      
      let serverSort = "recent";
      if (sortBy === "size_desc") serverSort = "size_desc";
      if (sortBy === "size_asc") serverSort = "size_asc";
      if (sortBy === "usages_desc") serverSort = "usages_desc";
      if (sortBy === "name_asc") serverSort = "name_asc";
      params.append("sortBy", serverSort);

      const res = await fetch(`/api/media/assets?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error("Failed to load picker assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadAlt("");
    setUploadSeoFilename("");
    setUploadFolder(allowedFolder || "properties");
    setUploadCategory(allowedCategory || "All");
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupFileForUpload(e.target.files[0]);
    }
  };

  const setupFileForUpload = (file: File) => {
    const nameWithoutExt = file.name.split(".")[0];
    const friendlyTitle = nameWithoutExt.replace(/[-_]/g, " ");
    const seoFriendlyName = nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    setUploadFile(file);
    setUploadTitle(friendlyTitle);
    setUploadAlt(friendlyTitle);
    setUploadSeoFilename(seoFriendlyName);
    setUploadError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
      if (!allowedTypes.includes(file.mimetype || file.type)) {
        setUploadError("Invalid file type. Only JPG, PNG, WEBP, and SVG are supported.");
        return;
      }
      setupFileForUpload(file);
    }
  };

  // Upload submission
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("original", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("alt_text", uploadAlt);
      formData.append("seo_filename", uploadSeoFilename);
      formData.append("category", uploadCategory);

      const res = await fetch(`/api/media/upload?folder=${uploadFolder}`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccess(true);
        // Add new asset to list and auto-select
        const newAsset = data.data;
        setItems(prev => [newAsset, ...prev]);
        
        if (allowMultiple) {
          setSelectedAssets(prev => [...prev, newAsset]);
        } else {
          setSelectedAssets([newAsset]);
        }
        setFocusedAsset(newAsset);

        // Notify user, switch to library
        setTimeout(() => {
          setActiveTab("library");
          resetUploadForm();
        }, 800);
      } else {
        setUploadError(data.error || "Failed to upload file.");
      }
    } catch (err: any) {
      setUploadError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const toggleAssetSelection = (asset: MediaItem) => {
    if (allowMultiple) {
      const alreadySelected = selectedAssets.some(it => it.id === asset.id);
      if (alreadySelected) {
        setSelectedAssets(prev => prev.filter(it => it.id !== asset.id));
      } else {
        setSelectedAssets(prev => [...prev, asset]);
      }
    } else {
      setSelectedAssets([asset]);
    }
    setFocusedAsset(asset);
  };

  const handleInsertConfirm = async () => {
    if (selectedAssets.length === 0) return;
    
    // Register usage metrics in background for selected assets
    for (const asset of selectedAssets) {
      try {
        await fetch("/api/media/select", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: asset.id })
        });
      } catch (err) {
        console.warn("Could not register asset select metric:", err);
      }
    }

    onSelect(selectedAssets);
    onClose();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative flex h-[85vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-indigo-600/20 p-2 text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Media Asset Picker</h2>
              <p className="text-xs text-slate-400">
                {allowMultiple ? "Select one or more assets to insert." : "Select a single asset to insert."}
                {allowedFolder && ` Restricted to folder: "${allowedFolder}"`}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-6">
          <button
            onClick={() => setActiveTab("library")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === "library" 
                ? "border-indigo-500 text-indigo-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Media Library
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === "upload" 
                ? "border-indigo-500 text-indigo-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* LIBRARY TAB */}
          {activeTab === "library" && (
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar Filter Column */}
              <div className="hidden w-56 flex-col border-r border-slate-800 bg-slate-950/20 p-4 overflow-y-auto md:flex">
                <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Folders</span>
                <div className="mb-6 space-y-1">
                  <button
                    onClick={() => setSelectedFolder("all")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedFolder === "all" ? "bg-indigo-600/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                    disabled={!!allowedFolder}
                  >
                    <span>All Folders</span>
                  </button>
                  {dynamicFolders.map(fold => (
                    <button
                      key={fold}
                      onClick={() => setSelectedFolder(fold)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                        selectedFolder === fold ? "bg-indigo-600/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                      disabled={allowedFolder ? allowedFolder !== fold : false}
                    >
                      <span>{fold}</span>
                    </button>
                  ))}
                </div>

                <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Categories</span>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedCategory === "all" ? "bg-indigo-600/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {dynamicCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        selectedCategory === cat ? "bg-indigo-600/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Assets Grid Panel */}
              <div className="flex flex-1 flex-col bg-slate-950/10 p-5 overflow-y-auto">
                {/* Search & Sort Row */}
                <form onSubmit={handleSearchSubmit} className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search title, keywords or filename..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setFilterFavorites(prev => !prev)}
                      className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                        filterFavorites 
                          ? "bg-amber-600/20 text-amber-400 border-amber-600/40" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${filterFavorites ? "fill-amber-400 text-amber-400" : ""}`} />
                      <span>Favorites</span>
                    </button>

                    <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`rounded p-1 transition-colors ${viewMode === "grid" ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        <Grid className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={`rounded p-1 transition-colors ${viewMode === "list" ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="recent">Recently Uploaded</option>
                      <option value="name_asc">Name A-Z</option>
                      <option value="usages_desc">Popular Usage</option>
                      <option value="size_desc">Size (Large to Small)</option>
                      <option value="size_asc">Size (Small to Large)</option>
                    </select>

                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </form>

                {/* Loading State */}
                {loading ? (
                  <div className="flex flex-1 flex-col items-center justify-center space-y-3 py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    <p className="text-xs text-slate-400">Loading library assets...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-slate-800/50 p-4 text-slate-500 mb-3">
                      <FolderOpen className="h-8 w-8" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">No assets found</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      No matching media files were found in the selected filters.
                    </p>
                  </div>
                ) : viewMode === "grid" ? (
                  /* Grid view */
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((item) => {
                      const isSelected = selectedAssets.some(it => it.id === item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleAssetSelection(item)}
                          className={`group relative flex cursor-pointer flex-col rounded-xl border bg-slate-900 overflow-hidden transition-all duration-200 ${
                            isSelected 
                              ? "border-indigo-500 ring-2 ring-indigo-500/20 scale-[0.98]" 
                              : "border-slate-800/80 hover:border-slate-700 hover:shadow-lg"
                          }`}
                        >
                          {/* Image Wrapper */}
                          <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                            <img
                              src={item.thumbnail_url || item.public_url}
                              alt={item.alt_text || item.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Checkmark overlay */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                                <div className="rounded-full bg-indigo-600 p-1.5 text-white shadow-lg">
                                  <Check className="h-4 w-4 stroke-[3]" />
                                </div>
                              </div>
                            )}

                            {/* Format label */}
                            <span className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1 py-0.5 text-[9px] font-semibold uppercase text-slate-300">
                              {item.format}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-2.5">
                            <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-white" title={item.title}>
                              {item.title}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>{item.width && item.height ? `${item.width}x${item.height}` : "Vector"}</span>
                              <span>{formatBytes(item.file_size)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* List view */
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                      <div className="col-span-6">Asset Name</div>
                      <div className="col-span-2">Folder / Category</div>
                      <div className="col-span-2">Resolution</div>
                      <div className="col-span-2 text-right">Size</div>
                    </div>
                    {items.map((item) => {
                      const isSelected = selectedAssets.some(it => it.id === item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleAssetSelection(item)}
                          className={`grid grid-cols-12 gap-3 items-center rounded-lg px-4 py-2 border cursor-pointer text-xs font-medium transition-colors ${
                            isSelected 
                              ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-200" 
                              : "bg-slate-900 border-transparent hover:bg-slate-800/50 hover:border-slate-800 text-slate-300"
                          }`}
                        >
                          <div className="col-span-6 flex items-center space-x-3 min-w-0">
                            <div className="h-10 w-16 flex-shrink-0 bg-slate-950 rounded overflow-hidden relative">
                              <img 
                                src={item.thumbnail_url || item.public_url} 
                                alt="" 
                                className="h-full w-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{item.seo_filename}</p>
                            </div>
                          </div>
                          <div className="col-span-2 truncate text-slate-400 capitalize">
                            {item.folder} / {item.category}
                          </div>
                          <div className="col-span-2 font-mono text-slate-400">
                            {item.width && item.height ? `${item.width}x${item.height}` : "Vector"} ({item.format})
                          </div>
                          <div className="col-span-2 text-right font-mono text-slate-400">
                            {formatBytes(item.file_size)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Detail Panel */}
              <div className="hidden w-64 flex-col border-l border-slate-800 bg-slate-950/20 p-4 lg:flex overflow-y-auto">
                {focusedAsset ? (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Asset Profile</span>
                    
                    {/* Preview box */}
                    <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center relative group">
                      <img
                        src={focusedAsset.public_url}
                        alt=""
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <a 
                        href={focusedAsset.public_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 rounded-md bg-slate-900/80 p-1.5 text-slate-300 hover:text-white hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">Title</label>
                        <p className="text-xs font-semibold text-slate-200 mt-0.5 break-words">{focusedAsset.title}</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">SEO Filename</label>
                        <p className="text-xs font-mono text-slate-300 mt-0.5 break-all bg-slate-950 p-1 rounded border border-slate-800">
                          {focusedAsset.seo_filename}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Folder:</span>
                          <p className="font-semibold text-slate-200 capitalize">{focusedAsset.folder}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Category:</span>
                          <p className="font-semibold text-slate-200">{focusedAsset.category}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Dimensions:</span>
                          <p className="font-mono text-slate-200">
                            {focusedAsset.width && focusedAsset.height ? `${focusedAsset.width}x${focusedAsset.height}` : "Vector"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Format:</span>
                          <p className="font-mono text-slate-200 uppercase">{focusedAsset.format}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">File Size:</span>
                          <p className="font-mono text-slate-200">{formatBytes(focusedAsset.file_size)}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Usage Count:</span>
                          <p className="font-semibold text-indigo-400">{focusedAsset.usage_count || 0} times</p>
                        </div>
                      </div>

                      {focusedAsset.alt_text && (
                        <div className="border-t border-slate-800/60 pt-2">
                          <label className="text-[10px] font-semibold text-slate-400">Alt Text</label>
                          <p className="text-xs text-slate-300 mt-0.5 italic">"{focusedAsset.alt_text}"</p>
                        </div>
                      )}

                      {focusedAsset.hash && (
                        <div className="border-t border-slate-800/60 pt-2">
                          <label className="text-[10px] font-mono text-slate-500">Asset HASH</label>
                          <p className="text-[10px] font-mono text-slate-400 select-all truncate">{focusedAsset.hash}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-500">
                    <Info className="h-6 w-6 mb-2 text-slate-600" />
                    <p className="text-xs">Select an asset to view its detailed profile metrics.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === "upload" && (
            <div className="flex-1 overflow-y-auto bg-slate-950/10 p-6">
              <div className="mx-auto max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                
                {/* Drag-and-drop zone */}
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    uploadFile 
                      ? "border-emerald-500 bg-emerald-500/5" 
                      : "border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.webp,.svg"
                    className="hidden"
                  />

                  {uploadFile ? (
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-emerald-500/20 p-2.5 text-emerald-400">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">{uploadFile.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{formatBytes(uploadFile.size)}</p>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); resetUploadForm(); }}
                        className="mt-3 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="mb-2 rounded-full bg-indigo-600/10 p-3 text-indigo-400">
                        <UploadCloud className="h-7 w-7" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">Drag & Drop file here</h4>
                      <p className="text-xs text-slate-400 mt-1">or click to browse from device</p>
                      <span className="text-[10px] text-slate-500 mt-3">Supports JPG, PNG, WEBP, and SVG (Max 50MB)</span>
                    </div>
                  )}
                </div>

                {/* Upload Form */}
                {uploadFile && (
                  <form onSubmit={handleUploadSubmit} className="mt-6 space-y-4 border-t border-slate-800/80 pt-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Asset Title</label>
                        <input
                          type="text"
                          required
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Alt Text (SEO)</label>
                        <input
                          type="text"
                          value={uploadAlt}
                          onChange={(e) => setUploadAlt(e.target.value)}
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">SEO Filename (URL slug)</label>
                        <input
                          type="text"
                          required
                          value={uploadSeoFilename}
                          onChange={(e) => setUploadSeoFilename(e.target.value)}
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                          placeholder="e.g. prestige-whitefield-villa"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value)}
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          {["All", ...dynamicCategories].map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Folder Path</label>
                        <select
                          value={uploadFolder}
                          onChange={(e) => setUploadFolder(e.target.value)}
                          className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          disabled={!!allowedFolder}
                        >
                          {dynamicFolders.map((fold) => (
                            <option key={fold} value={fold}>{fold}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end pb-1.5">
                        <span className="text-[10px] text-slate-500">
                          File will be served stably at <code className="text-slate-400 font-mono">/uploads/{uploadFolder}/[filename]</code>
                        </span>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="flex items-start space-x-2 rounded-lg bg-red-950/40 border border-red-900/60 p-3 text-xs text-red-400">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="flex items-start space-x-2 rounded-lg bg-emerald-950/40 border border-emerald-900/60 p-3 text-xs text-emerald-400">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Asset uploaded successfully! Regenerating versions and auto-selecting.</span>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={resetUploadForm}
                        disabled={uploading}
                        className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="flex items-center space-x-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white transition-colors"
                      >
                        {uploading ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                            <span>Processing Upload...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="h-4 w-4" />
                            <span>Upload & Auto Select</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Selection Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-6 py-4">
          <div className="flex items-center space-x-3">
            {selectedAssets.length > 0 ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                  {selectedAssets.length}
                </span>
                <span className="text-xs text-slate-300">assets selected</span>
                <button
                  onClick={() => setSelectedAssets([])}
                  className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 ml-2 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No assets selected. Select items from the library or upload a file.</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsertConfirm}
              disabled={selectedAssets.length === 0}
              className={`rounded-lg px-5 py-2 text-xs font-bold text-white shadow-lg transition-all ${
                selectedAssets.length > 0 
                  ? "bg-indigo-600 hover:bg-indigo-500 cursor-pointer active:scale-95" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Insert Selected Assets ({selectedAssets.length})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
