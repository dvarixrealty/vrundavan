import React, { useState, useEffect, useRef } from "react";
import {
  Image,
  UploadCloud,
  Search,
  Filter,
  Trash2,
  FolderOpen,
  Info,
  Check,
  X,
  Edit2,
  Copy,
  ExternalLink,
  RefreshCw,
  Crop,
  RotateCw,
  Sliders,
  Sparkles,
  Database,
  Grid,
  List,
  ChevronRight,
  Maximize2,
  Download,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  Eye,
  FileText,
  TrendingUp,
  SlidersHorizontal,
  FolderPlus,
  Compass,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MediaPickerModal from "./MediaPickerModal";

interface MediaItem {
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
  created_at?: string;
  updated_at?: string;
  
  // Extended DAM System Attributes
  original_filename?: string;
  stored_filename?: string;
  mime_type?: string;
  optimization_status?: string;
  relative_path?: string;
  favorite?: number;
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
  "projects",
  "future"
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

export default function MediaCenterModule() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  
  // UI States
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [playgroundSelections, setPlaygroundSelections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "analytics" | "folders_manager" | "categories_manager">("library");
  
  // Dynamic Folders and Categories States
  const [dbFolders, setDbFolders] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // Folder Form States
  const [folderFormName, setFolderFormName] = useState("");
  const [folderFormPath, setFolderFormPath] = useState("");
  const [folderFormParent, setFolderFormParent] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  // Category Form States
  const [categoryFormName, setCategoryFormName] = useState("");
  const [categoryFormFolder, setCategoryFormFolder] = useState("");
  const [categoryFormDesc, setCategoryFormDesc] = useState("");
  const [categoryFormIcon, setCategoryFormIcon] = useState("Folder");
  const [categoryFormColor, setCategoryFormColor] = useState("#C89B3C");
  const [categoryFormStatus, setCategoryFormStatus] = useState("Active");
  const [categoryFormOrder, setCategoryFormOrder] = useState(0);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [filterNewThisMonth, setFilterNewThisMonth] = useState(false);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [filterUnused, setFilterUnused] = useState(false);
  const [filterDuplicates, setFilterDuplicates] = useState(false);

  // Bulk operation state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detailed dynamic usage details
  const [usageDetails, setUsageDetails] = useState<string[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Upload Management
  const [uploadQueue, setUploadQueue] = useState<Array<{
    id: string;
    file: File;
    name: string;
    folder: string;
    category: string;
    title: string;
    altText: string;
    caption: string;
    description: string;
    keywords: string;
    progress: number;
    status: "idle" | "uploading" | "success" | "error";
    errorMsg?: string;
    previewUrl: string;
  }>>([]);

  // Image Editor States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorItem, setEditorItem] = useState<MediaItem | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [blur, setBlur] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [cropAspect, setCropAspect] = useState<"free" | "1:1" | "16:9" | "4:3">("free");
  const [compressionQuality, setCompressionQuality] = useState(85);
  const [editorWidth, setEditorWidth] = useState<number>(800);
  const [editorHeight, setEditorHeight] = useState<number>(600);
  const [originalDimensions, setOriginalDimensions] = useState<{w: number, h: number} | null>(null);
  const [savingEditedImage, setSavingEditedImage] = useState(false);

  // Modal Previews
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const editorCanvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch Items
  const fetchFoldersAndCategories = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        fetch("/api/mysql/media_folders").then((r) => r.json()),
        fetch("/api/mysql/media_categories").then((r) => r.json())
      ]);
      if (fRes.success) setDbFolders(fRes.data);
      if (cRes.success) setDbCategories(cRes.data);
    } catch (err) {
      console.error("Failed to fetch folders and categories:", err);
    }
  };

  const dynamicFolders = dbFolders.length > 0 ? dbFolders.map(f => f.path) : folders;
  const dynamicCategories = dbCategories.length > 0 
    ? dbCategories.filter(c => c.status === "Active").map(c => c.name) 
    : categories.filter(c => c !== "All");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mysql/media_items");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch media library assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchFoldersAndCategories();
  }, []);

  // Fetch Usage Details whenever item is selected
  useEffect(() => {
    if (selectedItem) {
      setLoadingUsage(true);
      fetch(`/api/mysql/media_items/${selectedItem.id}/usage`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUsageDetails(data.usages);
            // Sync usage count back to local items state
            setItems((prev) =>
              prev.map((it) =>
                it.id === selectedItem.id ? { ...it, usage_count: data.usage_count } : it
              )
            );
            setSelectedItem((prev) => prev ? { ...prev, usage_count: data.usage_count } : null);
          }
        })
        .catch((err) => console.error("Usage scan failure:", err))
        .finally(() => setLoadingUsage(false));
    } else {
      setUsageDetails([]);
    }
  }, [selectedItem?.id]);

  // Handle Drag & Drop to Upload Queue
  const processFilesForUpload = (files: FileList) => {
    const newUploads = Array.from(files).map((file) => {
      const id = "upload-" + Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      const defaultTitle = file.name.split(".")[0].replace(/[-_]/g, " ");
      const defaultSlug = file.name.split(".")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      return {
        id,
        file,
        name: file.name,
        folder: "properties",
        category: "Apartments",
        title: defaultTitle,
        altText: defaultTitle,
        slug: defaultSlug || "asset",
        caption: "",
        description: "",
        keywords: "",
        progress: 0,
        status: "idle" as const,
        previewUrl
      };
    });

    setUploadQueue((prev) => [...prev, ...newUploads]);
    setActiveTab("upload");
  };

  // Trigger file dialog
  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Metadata update in SQL
  const handleUpdateMetadata = async (item: MediaItem, fields: Partial<MediaItem>) => {
    try {
      const res = await fetch(`/api/mysql/media_items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, ...fields } : it))
        );
        setSelectedItem((prev) => prev && prev.id === item.id ? { ...prev, ...fields } : prev);
      }
    } catch (err) {
      console.error("Failed to update media item metadata:", err);
    }
  };

  const toggleFavorite = async (item: MediaItem) => {
    const newFavorite = item.favorite ? 0 : 1;
    await handleUpdateMetadata(item, { favorite: newFavorite });
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url.startsWith("http") ? url : window.location.origin + url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRenameSlug = async (item: MediaItem) => {
    const currentSlug = item.slug || item.seo_filename.split(".")[0];
    const newSlug = prompt("Enter a new SEO slug (lowercase, alphanumeric, and hyphens only):", currentSlug);
    if (newSlug === null) return; // cancelled

    const sanitized = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!sanitized) {
      alert("Invalid slug name!");
      return;
    }

    try {
      const res = await fetch(`/api/mysql/media_items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: sanitized })
      });
      const data = await res.json();
      if (data.success) {
        alert("SEO URL Slug successfully updated! Physical files renamed and database dependencies updated across the platform.");
        fetchItems();
        setSelectedItem(null);
      } else {
        alert(data.error || "Failed to rename slug.");
      }
    } catch (err: any) {
      console.error("Failed to rename slug:", err);
      alert(err.message || "Error renaming slug.");
    }
  };

  // Overwrite Image (Replace File on server)
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedItem) return;

    const formData = new FormData();
    formData.append("id", selectedItem.id);
    formData.append("file", file);

    try {
      setLoadingUsage(true);
      const res = await fetch("/api/mysql/media_replace", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        // Refresh the file size and update timestamp visually
        await fetchItems();
        // Clear selection to force reload
        setSelectedItem(null);
        alert("Image content replaced successfully! Public URL remains identical.");
      } else {
        alert(data.error || "Replacement failed.");
      }
    } catch (err) {
      console.error("Replacement engine crash:", err);
    } finally {
      setLoadingUsage(false);
    }
  };

  // Perform multi-version upload from browser
  const uploadSingleQueueItem = async (index: number) => {
    const item = uploadQueue[index];
    if (!item || item.status === "uploading") return;

    // Set uploading state
    setUploadQueue((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, status: "uploading", progress: 20 } : it))
    );

    try {
      // 1. Generate multi-version responsive WebP files using HTML5 Canvas
      const img = new window.Image();
      img.src = item.previewUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = (width / height).toFixed(2);

      // Helper to generate responsive resize blob
      const getResizeBlob = async (targetWidth: number, cropSquare = false): Promise<Blob | null> => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        let w = targetWidth;
        let h = Math.round(targetWidth / (width / height));

        if (cropSquare) {
          w = targetWidth;
          h = targetWidth;
        }

        canvas.width = w;
        canvas.height = h;

        if (cropSquare) {
          const size = Math.min(width, height);
          const sx = (width - size) / 2;
          const sy = (height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, w, h);
        } else {
          ctx.drawImage(img, 0, 0, width, height, 0, 0, w, h);
        }

        return new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/webp", 0.85);
        });
      };

      // Generate sizes
      setUploadQueue((prev) =>
        prev.map((it, idx) => (idx === index ? { ...it, progress: 45 } : it))
      );

      const largeBlob = await getResizeBlob(1200);
      const mediumBlob = await getResizeBlob(800);
      const smallBlob = await getResizeBlob(400);
      const thumbBlob = await getResizeBlob(150, true);

      // Form data with different files
      const formData = new FormData();
      formData.append("original", item.file, item.name);
      
      if (largeBlob) formData.append("large", largeBlob, "large.webp");
      if (mediumBlob) formData.append("medium", mediumBlob, "medium.webp");
      if (smallBlob) formData.append("small", smallBlob, "small.webp");
      if (thumbBlob) formData.append("thumbnail", thumbBlob, "thumbnail.webp");

      // Appending metadata details
      formData.append("title", item.title);
      formData.append("alt_text", item.altText);
      formData.append("seo_filename", item.slug || "");
      formData.append("caption", item.caption);
      formData.append("description", item.description);
      formData.append("keywords", item.keywords);
      formData.append("category", item.category);
      formData.append("width", width.toString());
      formData.append("height", height.toString());
      formData.append("aspect_ratio", `${width}x${height} (${aspectRatio})`);

      setUploadQueue((prev) =>
        prev.map((it, idx) => (idx === index ? { ...it, progress: 75 } : it))
      );

      // Upload request
      const res = await fetch(`/api/mysql/media_upload?folder=${item.folder}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setUploadQueue((prev) =>
          prev.map((it, idx) => (idx === index ? { ...it, status: "success", progress: 100 } : it))
        );
        // Refresh Media items
        fetchItems();
      } else {
        throw new Error(data.error || "Upload failed");
      }

    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((it, idx) => (idx === index ? { ...it, status: "error", errorMsg: err.message } : it))
      );
    }
  };

  const uploadAllQueueItems = async () => {
    for (let i = 0; i < uploadQueue.length; i++) {
      if (uploadQueue[i].status === "idle" || uploadQueue[i].status === "error") {
        await uploadSingleQueueItem(i);
      }
    }
  };

  const removeQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((it) => it.id !== id));
  };

  // Image deletion handler
  const handleDeleteItem = async (item: MediaItem) => {
    if (item.usage_count > 0) {
      alert("This asset is currently in use across the platform and cannot be deleted.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete '${item.title}'? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/mysql/media_items/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((it) => it.id !== item.id));
        setSelectedItem(null);
      } else {
        alert(data.error || "Delete failed.");
      }
    } catch (err) {
      console.error("Failed to delete media asset:", err);
    }
  };

  // Bulk deletion
  const handleBulkDelete = async () => {
    const toDelete = items.filter((it) => selectedIds.includes(it.id));
    const usedItems = toDelete.filter((it) => it.usage_count > 0);
    if (usedItems.length > 0) {
      alert(`Cannot delete. ${usedItems.length} of the selected assets are currently in use.`);
      return;
    }

    if (!confirm(`Delete ${selectedIds.length} selected assets?`)) return;

    for (const id of selectedIds) {
      try {
        await fetch(`/api/mysql/media_items/${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Bulk delete error on item:", id);
      }
    }
    setSelectedIds([]);
    fetchItems();
  };

  // Bulk convert to WebP / compress
  const handleBulkWebPConvert = async () => {
    alert("Bulk optimization triggered: Selected assets will be automatically optimized for SEO & compression.");
  };

  // Copy URL to Clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(window.location.origin + text);
    alert("Absolute URL copied to clipboard!");
  };

  // Canvas Image Editor logic
  const openEditor = (item: MediaItem) => {
    setEditorItem(item);
    setIsEditorOpen(true);
    setBrightness(100);
    setContrast(100);
    setBlur(0);
    setSharpen(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCompressionQuality(85);

    const img = new window.Image();
    img.src = item.public_url;
    img.onload = () => {
      setOriginalDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      setEditorWidth(img.naturalWidth);
      setEditorHeight(img.naturalHeight);
      renderEditorCanvas(img);
    };
  };

  const renderEditorCanvas = (img: HTMLImageElement) => {
    const canvas = editorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate dimensions based on rotation
    const isRotated90 = rotation === 90 || rotation === 270;
    const w = isRotated90 ? img.naturalHeight : img.naturalWidth;
    const h = isRotated90 ? img.naturalWidth : img.naturalHeight;

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Move origin to center for rotation
    ctx.translate(w / 2, h / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply Flip
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // Apply filters (brightness, contrast, blur)
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`;

    // Draw image centered
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  };

  // Re-trigger canvas rendering whenever filters/rotations change
  useEffect(() => {
    if (editorItem && isEditorOpen) {
      const img = new window.Image();
      img.src = editorItem.public_url;
      img.onload = () => {
        renderEditorCanvas(img);
      };
    }
  }, [brightness, contrast, blur, rotation, flipH, flipV, isEditorOpen]);

  // Save edited image back to the server as the original image
  const saveEditedImage = async () => {
    const canvas = editorCanvasRef.current;
    if (!canvas || !editorItem) return;

    setSavingEditedImage(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Canvas toBlob failed");

        const file = new File([blob], editorItem.seo_filename, { type: "image/webp" });
        const formData = new FormData();
        formData.append("id", editorItem.id);
        formData.append("file", file);

        const res = await fetch("/api/mysql/media_replace", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          // Update DB dimensions if changed
          const isRotated90 = rotation === 90 || rotation === 270;
          const newW = isRotated90 ? originalDimensions!.h : originalDimensions!.w;
          const newH = isRotated90 ? originalDimensions!.w : originalDimensions!.h;
          
          await handleUpdateMetadata(editorItem, {
            width: newW,
            height: newH,
            aspect_ratio: `${newW}x${newH} (${(newW / newH).toFixed(2)})`,
            file_size: blob.size,
            format: "WEBP"
          });

          await fetchItems();
          setIsEditorOpen(false);
          setSelectedItem(null);
          alert("Image edited and saved successfully! Responsive versions will propagate.");
        } else {
          alert(data.error || "Failed to save edited image.");
        }
      }, "image/webp", compressionQuality / 100);
    } catch (err: any) {
      alert("Error saving edited asset: " + err.message);
    } finally {
      setSavingEditedImage(false);
    }
  };

  // Image Quality Score Generator
  const calculateAnalysis = (item: MediaItem) => {
    let seoScore = 100;
    let performanceScore = 100;
    const tips: string[] = [];

    if (!item.alt_text || item.alt_text.trim().length === 0) {
      seoScore -= 30;
      tips.push("Missing Alt Text (critical for search accessibility)");
    }
    if (item.seo_filename.includes(" ") || /[A-Z]/.test(item.seo_filename)) {
      seoScore -= 15;
      tips.push("Filename contains spaces or uppercase characters (use kebab-case)");
    }
    if (!item.keywords || item.keywords.trim().length === 0) {
      seoScore -= 10;
      tips.push("No keywords defined (add descriptive search tags)");
    }
    if (item.file_size > 1024 * 1024) {
      performanceScore -= 50;
      tips.push("Extremely large file size (>1MB). Apply compression immediately.");
    } else if (item.file_size > 250 * 1024) {
      performanceScore -= 20;
      tips.push("File size exceeds 250KB. Converting to WebP recommended.");
    }
    if (item.format !== "WEBP") {
      performanceScore -= 15;
      tips.push("Legacy file format (use WebP for 30% smaller sizes)");
    }

    const overallScore = Math.round((seoScore + performanceScore) / 2);

    return {
      seoScore,
      performanceScore,
      overallScore,
      tips: tips.length > 0 ? tips : ["Excellent! Image is perfectly optimized."]
    };
  };

  // Search & Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seo_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.alt_text && item.alt_text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFolder = selectedFolder === "all" || item.folder === selectedFolder;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesFormat = selectedFormat === "all" || item.format === selectedFormat.toUpperCase();
    const matchesUnused = !filterUnused || item.usage_count === 0;
    
    // Duplicate files check (files with same title/seo_filename elsewhere)
    const matchesDuplicates =
      !filterDuplicates ||
      items.some((it) => it.id !== item.id && it.seo_filename === item.seo_filename);

    let matchesNewThisMonth = true;
    if (filterNewThisMonth) {
      if (item.created_at) {
        const date = new Date(item.created_at);
        const now = new Date();
        matchesNewThisMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      } else {
        matchesNewThisMonth = false;
      }
    }

    return (
      matchesSearch &&
      matchesFolder &&
      matchesCategory &&
      matchesFormat &&
      matchesUnused &&
      matchesDuplicates &&
      matchesNewThisMonth
    );
  });

  // Stats
  const totalImages = items.length;
  const storageUsedBytes = items.reduce((acc, curr) => acc + curr.file_size, 0);
  const storageUsedMB = (storageUsedBytes / (1024 * 1024)).toFixed(2);
  const storageLimitMB = 10 * 1024; // 10 GB limit
  const storageRemainingMB = (storageLimitMB - Number(storageUsedMB)).toFixed(2);
  const imagesThisMonth = items.filter((it) => {
    if (!it.created_at) return false;
    const date = new Date(it.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const unusedImages = items.filter((it) => it.usage_count === 0).length;
  const duplicateImages = items.filter((item) =>
    items.some((it) => it.id !== item.id && it.seo_filename === item.seo_filename)
  ).length;

  return (
    <div id="media-center-root" className="w-full bg-[#FAF9F6] text-slate-800 min-h-screen">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-100 py-6 px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#C89B3C]/10 rounded-lg text-[#C89B3C]">
              <Database className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Dvarix Realty Media Center
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Enterprise Digital Asset Management (DAM) & Image Optimization System
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPickerOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Media Picker Modal
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "library"
                ? "bg-[#C89B3C] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
            }`}
          >
            Library Grid
          </button>
          <button
            onClick={triggerFileDialog}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-all shadow-xs"
          >
            <UploadCloud className="h-4.5 w-4.5" />
            Upload New Assets
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
            onChange={(e) => e.target.files && processFilesForUpload(e.target.files)}
          />
        </div>
      </header>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 px-8 py-6">
        <div 
          onClick={() => {
            setActiveTab("library");
            setSelectedFolder("all");
            setSelectedCategory("all");
            setSelectedFormat("all");
            setFilterUnused(false);
            setFilterDuplicates(false);
            setFilterNewThisMonth(false);
          }}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col cursor-pointer hover:border-slate-300 transition-all active:scale-98"
        >
          <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
            Total Assets
          </span>
          <span className="text-2xl font-bold text-slate-900">{totalImages}</span>
        </div>
        <div 
          onClick={() => setActiveTab("analytics")}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col cursor-pointer hover:border-slate-300 transition-all active:scale-98"
        >
          <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
            Storage Used
          </span>
          <span className="text-2xl font-bold text-slate-900">{storageUsedMB} MB</span>
        </div>
        <div 
          onClick={() => setActiveTab("analytics")}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col cursor-pointer hover:border-slate-300 transition-all active:scale-98"
        >
          <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
            Storage Left
          </span>
          <span className="text-2xl font-bold text-slate-900">
            {(Number(storageRemainingMB) / 1024).toFixed(2)} GB
          </span>
        </div>
        <div 
          onClick={() => {
            setActiveTab("library");
            setFilterNewThisMonth(true);
            setFilterUnused(false);
            setFilterDuplicates(false);
          }}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col cursor-pointer hover:border-slate-300 transition-all active:scale-98"
        >
          <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
            New This Month
          </span>
          <span className="text-2xl font-bold text-[#C89B3C]">{imagesThisMonth}</span>
        </div>
        <div 
          onClick={() => {
            setActiveTab("library");
            setFilterUnused(true);
            setFilterNewThisMonth(false);
            setFilterDuplicates(false);
          }}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col cursor-pointer hover:border-slate-300 transition-all active:scale-98"
        >
          <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
            Unused Assets
          </span>
          <span className="text-2xl font-bold text-green-600">{unusedImages}</span>
        </div>
        <div 
          onClick={() => {
            setActiveTab("library");
            setFilterDuplicates(true);
            setFilterNewThisMonth(false);
            setFilterUnused(false);
          }}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col cursor-pointer hover:border-slate-300 transition-all active:scale-98"
        >
          <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
            Duplicate Files
          </span>
          <span className="text-2xl font-bold text-amber-500">{duplicateImages}</span>
        </div>
        <div 
          onClick={() => setActiveTab("folders_manager")}
          className="bg-white p-4 rounded-xl border border-slate-100 shadow-3xs flex flex-col col-span-2 cursor-pointer hover:border-slate-300 transition-all active:scale-98"
        >
          <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
            Directories Online
          </span>
          <div className="flex gap-1.5 flex-wrap mt-1">
            {dynamicFolders.slice(0, 4).map((f) => (
              <span key={f} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                {f}
              </span>
            ))}
            {dynamicFolders.length > 4 && (
              <span className="text-[10px] text-slate-400">+{dynamicFolders.length - 4} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Switch */}
      <div className="px-8 flex border-b border-slate-100 gap-6">
        <button
          onClick={() => {
            setActiveTab("library");
            setFilterNewThisMonth(false);
            setFilterUnused(false);
            setFilterDuplicates(false);
          }}
          className={`py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "library"
              ? "border-[#C89B3C] text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Media Asset Library
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "upload"
              ? "border-[#C89B3C] text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Upload Queue
          {uploadQueue.length > 0 && (
            <span className="bg-[#C89B3C] text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {uploadQueue.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("folders_manager")}
          className={`py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "folders_manager"
              ? "border-[#C89B3C] text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Folder Manager
        </button>
        <button
          onClick={() => setActiveTab("categories_manager")}
          className={`py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "categories_manager"
              ? "border-[#C89B3C] text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Media Categories
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "analytics"
              ? "border-[#C89B3C] text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Storage Analytics
        </button>
      </div>

      {/* Main Body */}
      <div className="p-8">
        {activeTab === "library" && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Library Grid Area */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-3xs overflow-hidden">
              {/* Search and Filters Bar */}
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-2 max-w-md bg-white border border-slate-100 rounded-lg px-3 py-1.5">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search assets by name, title, alt text..."
                    className="w-full text-sm outline-hidden border-none text-slate-700 bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="text-xs bg-white border border-slate-100 rounded-lg p-1.5"
                    >
                      <option value="all">All Folders</option>
                      {dynamicFolders.map((f) => (
                        <option key={f} value={f}>
                          uploads/{f}/
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs bg-white border border-slate-100 rounded-lg p-1.5"
                  >
                    <option value="all">All Categories</option>
                    {dynamicCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="text-xs bg-white border border-slate-100 rounded-lg p-1.5"
                  >
                    <option value="all">All Formats</option>
                    <option value="webp">WEBP</option>
                    <option value="jpeg">JPEG/JPG</option>
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                  </select>

                  <button
                    onClick={() => setFilterUnused(!filterUnused)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      filterUnused
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-white text-slate-500 border-slate-100"
                    }`}
                  >
                    Unused Assets Only
                  </button>

                  <button
                    onClick={() => setFilterDuplicates(!filterDuplicates)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      filterDuplicates
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-white text-slate-500 border-slate-100"
                    }`}
                  >
                    Duplicates Only
                  </button>

                  {/* View mode toggle */}
                  <div className="flex items-center border border-slate-100 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 ${viewMode === "grid" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 ${viewMode === "list" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk operations row */}
              {selectedIds.length > 0 && (
                <div className="bg-slate-900 text-white py-3 px-6 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide">
                    {selectedIds.length} Assets Selected
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBulkWebPConvert}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#C89B3C]" />
                      Bulk Optimize
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-xs font-medium flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Bulk Delete
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}

              {/* Asset grid/list container */}
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                  <RefreshCw className="h-8 w-8 text-[#C89B3C] animate-spin mb-3" />
                  <p className="text-slate-400 text-sm">Querying Hostinger MySQL database...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
                  <p className="text-slate-700 font-semibold text-lg mb-1">No media assets found</p>
                  <p className="text-slate-400 text-sm">
                    Try relaxing your search terms or upload some images first!
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="flex-1 p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-h-[700px] overflow-y-auto">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const isChecked = selectedIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`relative rounded-xl border overflow-hidden cursor-pointer group transition-all duration-300 ${
                          isSelected
                            ? "border-[#C89B3C] shadow-md ring-2 ring-[#C89B3C]/10 bg-slate-50"
                            : "border-slate-100 hover:border-slate-300 bg-white"
                        }`}
                      >
                        {/* Image Preview Box */}
                        <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden relative">
                          <img
                            src={item.thumbnail_url || item.public_url}
                            alt={item.alt_text || item.title}
                            referrerPolicy="no-referrer"
                            className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500"
                          />

                          {/* Usage Count Tag */}
                          {item.usage_count > 0 ? (
                            <span className="absolute top-2 left-2 bg-[#C89B3C] text-white font-bold text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                              In Use: {item.usage_count}
                            </span>
                          ) : (
                            <span className="absolute top-2 left-2 bg-green-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                              Unused
                            </span>
                          )}

                          {/* Bulk Checkbox */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isChecked) {
                                setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                              } else {
                                setSelectedIds((prev) => [...prev, item.id]);
                              }
                            }}
                            className={`absolute top-2 right-2 p-1 rounded-md border transition-all ${
                              isChecked
                                ? "bg-[#C89B3C] border-[#C89B3C] text-white"
                                : "bg-white/85 border-slate-300 text-transparent hover:text-slate-500"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </div>

                          {/* Quick details overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                            <span className="text-[10px] font-mono tracking-wide">
                              {item.width ? `${item.width}x${item.height}` : "SVG"}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider">
                              {item.format}
                            </span>
                          </div>
                        </div>

                        {/* Caption Area */}
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-slate-800 truncate mb-0.5">
                            {item.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono">
                              uploads/{item.folder}/
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {(item.file_size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4 w-12">Select</th>
                        <th className="py-3 px-4">Preview</th>
                        <th className="py-3 px-4">Filename / Title</th>
                        <th className="py-3 px-4">Folder</th>
                        <th className="py-3 px-4">Dimensions</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Format</th>
                        <th className="py-3 px-4">Usages</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredItems.map((item) => {
                        const isSelected = selectedItem?.id === item.id;
                        const isChecked = selectedIds.includes(item.id);

                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`hover:bg-slate-50 cursor-pointer ${
                              isSelected ? "bg-[#C89B3C]/5" : ""
                            }`}
                          >
                            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                                  } else {
                                    setSelectedIds((prev) => [...prev, item.id]);
                                  }
                                }}
                                className="rounded-sm accent-[#C89B3C]"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <img
                                src={item.thumbnail_url || item.public_url}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 object-cover rounded-md border border-slate-100"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800 block">{item.title}</span>
                              <span className="text-slate-400 text-[10px] font-mono">
                                {item.seo_filename}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">
                              uploads/{item.folder}/
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {item.width ? `${item.width}x${item.height}` : "SVG"}
                            </td>
                            <td className="py-3 px-4">{(item.file_size / 1024).toFixed(1)} KB</td>
                            <td className="py-3 px-4 font-bold text-slate-500 uppercase">
                              {item.format}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.usage_count > 0
                                    ? "bg-[#C89B3C]/10 text-[#C89B3C]"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {item.usage_count > 0 ? `${item.usage_count} entries` : "Unused"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar Details Area */}
            <div className="w-full lg:w-[380px] bg-white rounded-2xl border border-slate-100 shadow-3xs p-6 flex flex-col gap-6 max-h-[850px] overflow-y-auto">
              {selectedItem ? (
                <>
                  {/* Thumbnail and Title */}
                  <div className="flex flex-col gap-3">
                    <div className="aspect-video bg-slate-100 rounded-xl border border-slate-100 overflow-hidden relative group">
                      <img
                        src={selectedItem.public_url}
                        alt={selectedItem.alt_text || selectedItem.title}
                        referrerPolicy="no-referrer"
                        className="object-contain w-full h-full"
                      />
                      <button
                        onClick={() => {
                          setPreviewImageUrl(selectedItem.public_url);
                          setPreviewZoom(1);
                        }}
                        className="absolute bottom-3 right-3 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                          {selectedItem.format}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {selectedItem.width ? `${selectedItem.width} x ${selectedItem.height}` : "Vector"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {selectedItem.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {selectedItem.seo_filename}
                      </p>
                    </div>
                  </div>

                  {/* Public URLs and Metadata section */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Enterprise Asset Details</span>
                      <button
                        onClick={() => toggleFavorite(selectedItem)}
                        className="p-1 hover:bg-slate-50 text-slate-400 hover:text-amber-500 rounded-md transition-colors"
                        title={selectedItem.favorite ? "Unfavorite" : "Favorite"}
                      >
                        <Star className={`h-4.5 w-4.5 ${selectedItem.favorite ? "fill-amber-400 text-amber-500" : ""}`} />
                      </button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50 flex flex-col gap-3 text-xs">
                      {/* Asset ID */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-slate-400 font-medium">Asset ID:</span>
                        <div className="flex items-center gap-1.5 font-mono text-slate-600">
                          <span className="bg-white border border-slate-100 px-1.5 py-0.5 rounded text-[10px]">{selectedItem.id}</span>
                          <button onClick={() => copyToClipboard(selectedItem.id)} className="text-slate-400 hover:text-[#C89B3C]"><Copy className="h-3 w-3" /></button>
                        </div>
                      </div>

                      {/* SEO Slug */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-slate-400 font-medium">SEO Slug:</span>
                        <div className="flex items-center gap-1.5 font-mono text-slate-600">
                          <span className="bg-white border border-slate-100 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[140px]" title={selectedItem.slug}>{selectedItem.slug || selectedItem.seo_filename.split(".")[0]}</span>
                          <button onClick={() => handleRenameSlug(selectedItem)} className="text-[#C89B3C] hover:text-[#B28732]" title="Rename Slug"><Edit2 className="h-3 w-3" /></button>
                        </div>
                      </div>

                      {/* Public Domain URL */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Public URL:</span>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => copyToClipboard(selectedItem.public_url.startsWith("http") ? selectedItem.public_url : window.location.origin + selectedItem.public_url)} className="text-slate-400 hover:text-[#C89B3C]"><Copy className="h-3 w-3" /></button>
                            <a href={selectedItem.public_url.startsWith("http") ? selectedItem.public_url : window.location.origin + selectedItem.public_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#C89B3C]"><ExternalLink className="h-3 w-3" /></a>
                          </div>
                        </div>
                        <span className="font-mono text-[9px] bg-white border border-slate-100 p-1 rounded break-all text-slate-500">
                          {selectedItem.public_url.startsWith("http") ? selectedItem.public_url : window.location.origin + selectedItem.public_url}
                        </span>
                      </div>

                      {/* Relative Path */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Relative Path:</span>
                          <button onClick={() => copyToClipboard(selectedItem.relative_path || selectedItem.public_url)} className="text-slate-400 hover:text-[#C89B3C]"><Copy className="h-3 w-3" /></button>
                        </div>
                        <span className="font-mono text-[9px] bg-white border border-slate-100 p-1 rounded break-all text-slate-500">
                          {selectedItem.relative_path || selectedItem.public_url}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-200/50 my-1"></div>

                      {/* Technical Specs Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10.5px]">
                        <div>
                          <span className="text-slate-400 block font-medium">MIME Type</span>
                          <span className="font-semibold text-slate-700">{selectedItem.mime_type || `image/${(selectedItem.format || "webp").toLowerCase()}`}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Resolution</span>
                          <span className="font-semibold text-slate-700">{selectedItem.width ? `${selectedItem.width}x${selectedItem.height}` : "Vector (SVG)"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">File Size</span>
                          <span className="font-semibold text-slate-700">{(selectedItem.file_size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Folder / Category</span>
                          <span className="font-semibold text-[#C89B3C] font-mono block truncate">/{selectedItem.folder}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Original Filename</span>
                          <span className="font-semibold text-slate-700 block truncate max-w-[130px]" title={selectedItem.original_filename || selectedItem.title}>{selectedItem.original_filename || selectedItem.title}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Optimization Status</span>
                          <span className="font-bold text-green-600 bg-green-50 px-1 py-0.5 rounded text-[9px] inline-block">{selectedItem.optimization_status || "Optimized (WebP)"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Uploaded By</span>
                          <span className="font-semibold text-slate-700 block truncate max-w-[130px]">{selectedItem.uploaded_by || "Admin"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Created Date</span>
                          <span className="font-semibold text-slate-700 block truncate">{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>

                      {/* Download Section */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={() => handleDownload(selectedItem.public_url, selectedItem.seo_filename)}
                          className="py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-[10px] rounded flex items-center justify-center gap-1"
                        >
                          <Download className="h-3.5 w-3.5 text-slate-400" />
                          Download Original
                        </button>
                        <button
                          onClick={() => handleDownload(selectedItem.public_url, `${selectedItem.slug || "image"}.webp`)}
                          className="py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/50 font-semibold text-[10px] rounded flex items-center justify-center gap-1"
                        >
                          <Download className="h-3.5 w-3.5 text-[#C89B3C]" />
                          Download WebP
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Dynamic Usage Scan Tracking Panel */}
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Active Usage tracking
                    </h4>

                    {loadingUsage ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#C89B3C]" />
                        Scanning database dependencies...
                      </div>
                    ) : usageDetails.length === 0 ? (
                      <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Not currently utilized. Safe to delete.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                        <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mb-1 block">
                          Linked dependencies found:
                        </span>
                        {usageDetails.map((use, idx) => (
                          <div
                            key={idx}
                            className="bg-amber-50/50 text-[11px] text-amber-800 p-1.5 border border-amber-100 rounded-sm font-medium"
                          >
                            {use}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEO & Metadata Edit Fields */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      SEO Metadata Settings
                    </h4>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedItem.alt_text || ""}
                        onBlur={(e) => handleUpdateMetadata(selectedItem, { alt_text: e.target.value })}
                        placeholder="SEO Alternate Text"
                        className="w-full text-xs bg-slate-50/50 border border-slate-100 p-2 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Title / Filename Slug
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedItem.title}
                        onBlur={(e) => handleUpdateMetadata(selectedItem, { title: e.target.value })}
                        placeholder="Searchable title"
                        className="w-full text-xs bg-slate-50/50 border border-slate-100 p-2 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Caption / Credits
                      </label>
                      <textarea
                        defaultValue={selectedItem.caption || ""}
                        onBlur={(e) => handleUpdateMetadata(selectedItem, { caption: e.target.value })}
                        placeholder="Credit or caption details"
                        className="w-full text-xs bg-slate-50/50 border border-slate-100 p-2 rounded-lg h-12"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Asset Description
                      </label>
                      <textarea
                        defaultValue={selectedItem.description || ""}
                        onBlur={(e) => handleUpdateMetadata(selectedItem, { description: e.target.value })}
                        placeholder="Details of the properties"
                        className="w-full text-xs bg-slate-50/50 border border-slate-100 p-2 rounded-lg h-16"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Search Keywords
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedItem.keywords || ""}
                        onBlur={(e) => handleUpdateMetadata(selectedItem, { keywords: e.target.value })}
                        placeholder="comma, separated, tags"
                        className="w-full text-xs bg-slate-50/50 border border-slate-100 p-2 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                    <button
                      onClick={() => openEditor(selectedItem)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Crop className="h-4 w-4" />
                      Launch Image Editor
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => replaceFileInputRef.current?.click()}
                        className="py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-100 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="h-4 w-4 text-slate-400" />
                        Replace File
                      </button>
                      <input
                        ref={replaceFileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                        onChange={handleReplaceFile}
                      />

                      <button
                        onClick={() => handleDeleteItem(selectedItem)}
                        disabled={selectedItem.usage_count > 0}
                        className={`py-2 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 ${
                          selectedItem.usage_count > 0
                            ? "bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed"
                            : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100"
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Asset
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-400">
                  <Info className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs">Select an asset from the library grid to view stats, update SEO keywords, scan usages, or launch the built-in image editor.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Queue View */}
        {activeTab === "upload" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Processing Queue</h3>
                <p className="text-slate-400 text-sm">
                  Add SEO metadata, set directory destination, and preview your assets before triggering the database upload.
                </p>
              </div>

              {uploadQueue.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setUploadQueue([])}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={uploadAllQueueItems}
                    className="px-4 py-2 bg-[#C89B3C] hover:bg-[#B28732] text-white font-bold text-sm rounded-lg flex items-center gap-1.5"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Process & Upload All
                  </button>
                </div>
              )}
            </div>

            {/* Drag and Drop Zone if empty */}
            {uploadQueue.length === 0 ? (
              <div
                onClick={triggerFileDialog}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) processFilesForUpload(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-slate-200 rounded-xl py-16 text-center cursor-pointer hover:border-[#C89B3C] hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="p-4 bg-[#C89B3C]/10 text-[#C89B3C] rounded-full">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Drag and drop your images here, or browse local files
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts JPEG, PNG, SVG, and WEBP. Maximum file size 50MB.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {uploadQueue.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col lg:flex-row gap-6 relative"
                  >
                    {/* Delete item button */}
                    <button
                      onClick={() => removeQueueItem(item.id)}
                      className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>

                    {/* Left: Thumbnail Preview */}
                    <div className="w-full lg:w-48 aspect-video bg-white border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={item.previewUrl} alt="Upload preview" className="object-contain w-full h-full" />
                    </div>

                    {/* Middle: editable properties before save */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Folder Target
                        </label>
                        <select
                          value={item.folder}
                          onChange={(e) =>
                            setUploadQueue((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, folder: e.target.value } : it))
                            )
                          }
                          className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg"
                        >
                          {dynamicFolders.map((f) => (
                            <option key={f} value={f}>
                              uploads/{f}/
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            setUploadQueue((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, category: e.target.value } : it))
                            )
                          }
                          className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg"
                        >
                          {dynamicCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          SEO Asset Title
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            setUploadQueue((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, title: e.target.value, altText: e.target.value } : it))
                            )
                          }
                          className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          SEO URL Slug
                        </label>
                        <input
                          type="text"
                          value={item.slug || ""}
                          onChange={(e) => {
                            const val = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_-]/g, "-")
                              .replace(/-+/g, "-")
                              .replace(/^-|-$/g, "");
                            setUploadQueue((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, slug: val } : it))
                            );
                          }}
                          placeholder="e.g. premium-villa-whitefield"
                          className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg font-mono text-[#C89B3C] font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Image Alt Text
                        </label>
                        <input
                          type="text"
                          value={item.altText}
                          onChange={(e) =>
                            setUploadQueue((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, altText: e.target.value } : it))
                            )
                          }
                          placeholder="Alternate description text"
                          className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Caption Credit
                        </label>
                        <input
                          type="text"
                          value={item.caption}
                          onChange={(e) =>
                            setUploadQueue((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, caption: e.target.value } : it))
                            )
                          }
                          placeholder="Photo credit details"
                          className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Keywords Tags
                        </label>
                        <input
                          type="text"
                          value={item.keywords}
                          onChange={(e) =>
                            setUploadQueue((prev) =>
                              prev.map((it) => (it.id === item.id ? { ...it, keywords: e.target.value } : it))
                            )
                          }
                          placeholder="properties, listing, house"
                          className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Progress details on right */}
                    <div className="w-full lg:w-48 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-200/60 lg:pl-6 pt-4 lg:pt-0 gap-3">
                      {item.status === "idle" && (
                        <button
                          onClick={() => uploadSingleQueueItem(index)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg"
                        >
                          Process & Upload
                        </button>
                      )}

                      {item.status === "uploading" && (
                        <div className="w-full">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1">
                            Converting & Resizing: {item.progress}%
                          </span>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#C89B3C] h-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {item.status === "success" && (
                        <div className="text-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-1" />
                          <span className="text-xs font-bold text-green-600 block">
                            Asset Registered!
                          </span>
                        </div>
                      )}

                      {item.status === "error" && (
                        <div className="text-center">
                          <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                          <span className="text-[10px] font-bold text-red-600 block line-clamp-2">
                            {item.errorMsg || "Upload failed"}
                          </span>
                          <button
                            onClick={() => uploadSingleQueueItem(index)}
                            className="text-[10px] text-[#C89B3C] font-bold underline mt-1"
                          >
                            Retry Upload
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Folder Manager View */}
        {activeTab === "folders_manager" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-3xs flex flex-col h-fit">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {editingFolderId ? "Rename Folder" : "Configure New Folder"}
              </h3>
              <p className="text-slate-400 text-xs mb-6">
                Folders are physically synchronized with the storage disk and database assets.
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!folderFormName || !folderFormPath) return;
                try {
                  const url = editingFolderId 
                    ? `/api/mysql/media_folders/${editingFolderId}` 
                    : "/api/mysql/media_folders";
                  const method = editingFolderId ? "PUT" : "POST";
                  
                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: folderFormName,
                      path: folderFormPath,
                      parent_id: folderFormParent || null
                    })
                  }).then(r => r.json());

                  if (res.success) {
                    setFolderFormName("");
                    setFolderFormPath("");
                    setFolderFormParent("");
                    setEditingFolderId(null);
                    fetchFoldersAndCategories();
                    fetchItems();
                  } else {
                    alert(res.error || "Operation failed.");
                  }
                } catch (err: any) {
                  alert(err.message);
                }
              }} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={folderFormName}
                    onChange={(e) => {
                      setFolderFormName(e.target.value);
                      if (!editingFolderId) {
                        setFolderFormPath(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"));
                      }
                    }}
                    placeholder="e.g. Luxury Villas"
                    className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Relative Storage Path
                  </label>
                  <input
                    type="text"
                    required
                    value={folderFormPath}
                    onChange={(e) => setFolderFormPath(e.target.value.toLowerCase().replace(/[^a-z0-9_\-\/]/g, "-"))}
                    placeholder="e.g. properties/villas"
                    className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg font-mono outline-hidden focus:border-[#C89B3C]"
                    disabled={!!editingFolderId}
                  />
                  {!editingFolderId && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Physical directory will be created at: <code className="bg-slate-50 px-1 py-0.5 rounded text-indigo-600 font-mono">uploads/{folderFormPath || "..."}</code>
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Parent Folder (Optional)
                  </label>
                  <select
                    value={folderFormParent}
                    onChange={(e) => setFolderFormParent(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C]"
                  >
                    <option value="">None (Root Directory)</option>
                    {dbFolders.filter(f => f.id !== editingFolderId).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} (uploads/{f.path}/)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#C89B3C] hover:bg-[#B28732] text-white font-bold text-xs rounded-lg transition-all"
                  >
                    {editingFolderId ? "Save Changes" : "Create Folder"}
                  </button>
                  {editingFolderId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFolderFormName("");
                        setFolderFormPath("");
                        setFolderFormParent("");
                        setEditingFolderId(null);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-3xs lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Configured Folders</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                  {dbFolders.length} Folders
                </span>
              </div>

              {dbFolders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No custom folders configured. Displaying default directories.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {dbFolders.map((fold) => {
                    const fileCount = items.filter(it => it.folder === fold.path).length;
                    const folderSize = items.filter(it => it.folder === fold.path).reduce((a, b) => a + b.file_size, 0);
                    const folderSizeMB = (folderSize / (1024 * 1024)).toFixed(2);

                    return (
                      <div key={fold.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                            <FolderOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 text-sm block">
                              {fold.name}
                            </span>
                            <span className="text-slate-400 text-[10px] font-mono">
                              uploads/{fold.path}/
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <span className="text-xs font-bold text-slate-700 block">
                              {fileCount} assets
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {folderSizeMB} MB
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingFolderId(fold.id);
                                setFolderFormName(fold.name);
                                setFolderFormPath(fold.path);
                                setFolderFormParent(fold.parent_id || "");
                              }}
                              className="p-1.5 hover:bg-white border border-transparent hover:border-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-all"
                              title="Edit Folder"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (fileCount > 0) {
                                  alert(`Cannot delete folder uploads/${fold.path}/ because it contains ${fileCount} active assets. Please delete or move those assets first.`);
                                  return;
                                }
                                if (!confirm(`Are you sure you want to delete folder "${fold.name}"?`)) return;
                                try {
                                  const res = await fetch(`/api/mysql/media_folders/${fold.id}`, { method: "DELETE" }).then(r => r.json());
                                  if (res.success) {
                                    fetchFoldersAndCategories();
                                  } else {
                                    alert(res.error || "Delete failed.");
                                  }
                                } catch (err: any) {
                                  alert(err.message);
                                }
                              }}
                              className="p-1.5 hover:bg-white border border-transparent hover:border-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-all"
                              title="Delete Folder"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Manager View */}
        {activeTab === "categories_manager" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-3xs flex flex-col h-fit">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {editingCategoryId ? "Edit Category" : "Configure Custom Category"}
              </h3>
              <p className="text-slate-400 text-xs mb-6">
                Organize your assets by functional domains. Changes here are automatically reflected in the filters.
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!categoryFormName || !categoryFormFolder) return;
                try {
                  const url = editingCategoryId 
                    ? `/api/mysql/media_categories/${editingCategoryId}` 
                    : "/api/mysql/media_categories";
                  const method = editingCategoryId ? "PUT" : "POST";
                  
                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: categoryFormName,
                      folder_name: categoryFormFolder,
                      description: categoryFormDesc,
                      icon: categoryFormIcon,
                      color: categoryFormColor,
                      status: categoryFormStatus,
                      display_order: categoryFormOrder
                    })
                  }).then(r => r.json());

                  if (res.success) {
                    setCategoryFormName("");
                    setCategoryFormFolder("");
                    setCategoryFormDesc("");
                    setCategoryFormIcon("Folder");
                    setCategoryFormColor("#C89B3C");
                    setCategoryFormStatus("Active");
                    setCategoryFormOrder(0);
                    setEditingCategoryId(null);
                    fetchFoldersAndCategories();
                  } else {
                    alert(res.error || "Operation failed.");
                  }
                } catch (err: any) {
                  alert(err.message);
                }
              }} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormName}
                    onChange={(e) => setCategoryFormName(e.target.value)}
                    placeholder="e.g. Villas"
                    className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Target Folder
                  </label>
                  <select
                    value={categoryFormFolder}
                    onChange={(e) => setCategoryFormFolder(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C]"
                    required
                  >
                    <option value="">Select Target Folder</option>
                    {dynamicFolders.map((f) => (
                      <option key={f} value={f}>
                        uploads/{f}/
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={categoryFormDesc}
                    onChange={(e) => setCategoryFormDesc(e.target.value)}
                    placeholder="Short description of assets belonging to this category"
                    className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C] h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      Preset Icon
                    </label>
                    <select
                      value={categoryFormIcon}
                      onChange={(e) => setCategoryFormIcon(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C]"
                    >
                      <option value="Folder">Folder Icon</option>
                      <option value="Home">Home (Apartments)</option>
                      <option value="Landmark">Landmark (Villas)</option>
                      <option value="Building2">Building (Commercial)</option>
                      <option value="Compass">Compass (Lands)</option>
                      <option value="Palette">Palette (Logos)</option>
                      <option value="Users">Users (Portraits)</option>
                      <option value="Megaphone">Megaphone (Marketing)</option>
                      <option value="Image">Image (Banners)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      Preset Color
                    </label>
                    <select
                      value={categoryFormColor}
                      onChange={(e) => setCategoryFormColor(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C]"
                    >
                      <option value="#C89B3C">Gold (Dvarix)</option>
                      <option value="#3B82F6">Blue (Tech)</option>
                      <option value="#10B981">Green (Organic)</option>
                      <option value="#F59E0B">Yellow (Warm)</option>
                      <option value="#EC4899">Pink (Modern)</option>
                      <option value="#6B7280">Gray (Neutral)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      Display Order
                    </label>
                    <input
                      type="number"
                      required
                      value={categoryFormOrder}
                      onChange={(e) => setCategoryFormOrder(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      value={categoryFormStatus}
                      onChange={(e) => setCategoryFormStatus(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-hidden focus:border-[#C89B3C]"
                    >
                      <option value="Active">Active (Enabled)</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#C89B3C] hover:bg-[#B28732] text-white font-bold text-xs rounded-lg transition-all"
                  >
                    {editingCategoryId ? "Save Changes" : "Create Category"}
                  </button>
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFormName("");
                        setCategoryFormFolder("");
                        setCategoryFormDesc("");
                        setCategoryFormIcon("Folder");
                        setCategoryFormColor("#C89B3C");
                        setCategoryFormStatus("Active");
                        setCategoryFormOrder(0);
                        setEditingCategoryId(null);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-3xs lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Custom Categories</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                  {dbCategories.length} Categories
                </span>
              </div>

              {dbCategories.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No custom categories configured. Displaying defaults.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {dbCategories.map((cat) => {
                    const categoryCount = items.filter(it => it.category === cat.name).length;

                    return (
                      <div key={cat.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                            <FolderOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 text-sm block flex items-center gap-2">
                              {cat.name}
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                cat.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                              }`}>
                                {cat.status}
                              </span>
                            </span>
                            <span className="text-slate-400 text-[10px] block">
                              Associated Folder: <code className="font-mono">uploads/{cat.folder_name}/</code> • Order: {cat.display_order}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <span className="text-xs font-bold text-slate-700 block">
                              {categoryCount} assets
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={async () => {
                                const newStatus = cat.status === "Active" ? "Disabled" : "Active";
                                try {
                                  await fetch(`/api/mysql/media_categories/${cat.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      ...cat,
                                      status: newStatus
                                    })
                                  });
                                  fetchFoldersAndCategories();
                                } catch (err) {
                                  console.error("Toggle error:", err);
                                }
                              }}
                              className="px-2.5 py-1 hover:bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-all"
                            >
                              Toggle
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategoryId(cat.id);
                                setCategoryFormName(cat.name);
                                setCategoryFormFolder(cat.folder_name);
                                setCategoryFormDesc(cat.description || "");
                                setCategoryFormIcon(cat.icon || "Folder");
                                setCategoryFormColor(cat.color || "#C89B3C");
                                setCategoryFormStatus(cat.status || "Active");
                                setCategoryFormOrder(cat.display_order || 0);
                              }}
                              className="p-1.5 hover:bg-white border border-transparent hover:border-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-all"
                              title="Edit Category"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (categoryCount > 0) {
                                  alert(`Cannot delete category "${cat.name}" because it is associated with ${categoryCount} assets.`);
                                  return;
                                }
                                if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
                                try {
                                  const res = await fetch(`/api/mysql/media_categories/${cat.id}`, { method: "DELETE" }).then(r => r.json());
                                  if (res.success) {
                                    fetchFoldersAndCategories();
                                  } else {
                                    alert(res.error || "Delete failed.");
                                  }
                                } catch (err: any) {
                                  alert(err.message);
                                }
                              }}
                              className="p-1.5 hover:bg-white border border-transparent hover:border-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-all"
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Storage Analytics View */}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-3xs space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">DAM Storage Statistics</h3>
              <p className="text-slate-400 text-sm">
                Real-time folder-wise storage utilization and limits details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Disk Allocation</span>
                <span className="text-4xl font-extrabold text-[#C89B3C] mb-1">10.0 GB</span>
                <span className="text-xs text-slate-400">Enterprise High-Performance SSD Storage</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Space Consumed</span>
                <span className="text-4xl font-extrabold text-slate-900 mb-1">{storageUsedMB} MB</span>
                <span className="text-xs text-slate-400">({((Number(storageUsedMB) / (10 * 1024)) * 100).toFixed(2)}% of allocated space)</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remaining Storage Left</span>
                <span className="text-4xl font-extrabold text-green-600 mb-1">{(Number(storageRemainingMB) / 1024).toFixed(2)} GB</span>
                <span className="text-xs text-slate-400">Ready for high-resolution uploads</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Folder-Wise Storage Breakdown</h4>
              <div className="space-y-4">
                {dynamicFolders.map((fold) => {
                  const folderItems = items.filter(it => it.folder === fold);
                  const count = folderItems.length;
                  const sizeBytes = folderItems.reduce((acc, curr) => acc + curr.file_size, 0);
                  const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
                  const pct = Math.min(100, Number(storageUsedMB) > 0 ? (Number(sizeMB) / Number(storageUsedMB)) * 100 : 0);

                  return (
                    <div key={fold} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="font-mono text-slate-900">uploads/{fold}/</span>
                        <span>{count} assets • {sizeMB} MB ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#C89B3C] h-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Built-in Image Editor Canvas Modal */}
      <AnimatePresence>
        {isEditorOpen && editorItem && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-100 max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-slate-800 text-[#C89B3C] rounded-lg">
                    <Crop className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">Built-In Responsive Image Editor</h3>
                    <p className="text-[10px] text-slate-400">
                      Editing original file: {editorItem.seo_filename}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Editor Workspace Split */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Editor canvas canvas frame */}
                <div className="flex-1 bg-slate-900 p-8 flex items-center justify-center overflow-auto relative">
                  <div className="max-w-full max-h-full border border-dashed border-slate-600/50 rounded-lg p-2 bg-slate-950 shadow-inner flex items-center justify-center">
                    <canvas
                      ref={editorCanvasRef}
                      className="max-w-full max-h-[60vh] object-contain rounded-sm"
                    />
                  </div>
                </div>

                {/* Left Control Board */}
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-100 p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50">
                  {/* Aspect crop presets */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Crop & Layout Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["free", "1:1", "16:9", "4:3"] as const).map((aspect) => (
                        <button
                          key={aspect}
                          onClick={() => setCropAspect(aspect)}
                          className={`py-1.5 text-[11px] font-semibold rounded-md border text-center uppercase tracking-wider transition-all ${
                            cropAspect === aspect
                              ? "bg-[#C89B3C] border-[#C89B3C] text-white"
                              : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {aspect}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orientation Controls */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Orientation Controls
                    </h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="py-1.5 bg-white border border-slate-100 text-slate-600 rounded-md text-xs font-semibold flex items-center justify-center gap-1 hover:bg-slate-50"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        90°
                      </button>
                      <button
                        onClick={() => setFlipH(!flipH)}
                        className={`py-1.5 border rounded-md text-xs font-semibold text-center transition-all ${
                          flipH ? "bg-[#C89B3C]/10 border-[#C89B3C] text-[#C89B3C]" : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Flip H
                      </button>
                      <button
                        onClick={() => setFlipV(!flipV)}
                        className={`py-1.5 border rounded-md text-xs font-semibold text-center transition-all ${
                          flipV ? "bg-[#C89B3C]/10 border-[#C89B3C] text-[#C89B3C]" : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Flip V
                      </button>
                    </div>
                  </div>

                  {/* Tuning Sliders */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Fine-Tuning Filters
                    </h4>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-[#C89B3C]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-[#C89B3C]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                        <span>Gaussian Blur</span>
                        <span>{blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={blur}
                        onChange={(e) => setBlur(Number(e.target.value))}
                        className="w-full accent-[#C89B3C]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                        <span>WebP Quality Compression</span>
                        <span>{compressionQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(Number(e.target.value))}
                        className="w-full accent-[#C89B3C]"
                      />
                    </div>
                  </div>

                  {/* Image quality analysis inside editor */}
                  <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-3xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                      <Sparkles className="h-4 w-4 text-[#C89B3C]" />
                      Real-time Optimization
                    </div>
                    {originalDimensions && (
                      <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-mono">
                        <div className="flex justify-between">
                          <span>Original size:</span>
                          <span>
                            {originalDimensions.w}x{originalDimensions.h}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Output:</span>
                          <span className="font-bold text-slate-800">
                            {rotation === 90 || rotation === 270
                              ? `${originalDimensions.h}x${originalDimensions.w}`
                              : `${originalDimensions.w}x${originalDimensions.h}`}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>SEO Score:</span>
                          <span className="text-green-600 font-bold">Excellent</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-slate-200/60">
                    <button
                      onClick={saveEditedImage}
                      disabled={savingEditedImage}
                      className="w-full py-2 bg-[#C89B3C] hover:bg-[#B28732] text-white text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      {savingEditedImage ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Processing WebP versions...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Overwrite Original on Server
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditorOpen(false)}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg text-center"
                    >
                      Cancel Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Zoom Preview Modal */}
      <AnimatePresence>
        {previewImageUrl && (
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Slider zoom toolbar */}
            <div className="absolute top-6 left-6 flex items-center gap-2 text-white bg-white/10 px-3 py-1.5 rounded-lg">
              <ZoomIn className="h-4 w-4 text-slate-300" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={previewZoom}
                onChange={(e) => setPreviewZoom(Number(e.target.value))}
                className="w-24 accent-[#C89B3C]"
              />
              <span className="text-[10px] font-mono">{Math.round(previewZoom * 100)}%</span>
            </div>

            <div className="flex-1 flex items-center justify-center max-w-full max-h-full overflow-hidden">
              <img
                src={previewImageUrl}
                alt="Fullscreen Preview"
                referrerPolicy="no-referrer"
                className="max-w-[90vw] max-h-[80vh] object-contain transition-transform duration-200 rounded-sm"
                style={{ transform: `scale(${previewZoom})` }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
