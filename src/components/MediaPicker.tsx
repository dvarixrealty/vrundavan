import React, { useState } from "react";
import { Image, FileImage, Link2, X, Sparkles, FolderOpen, UploadCloud } from "lucide-react";
import MediaPickerModal, { MediaItem } from "./MediaPickerModal";

interface MediaPickerProps {
  value?: string; // Can be a URL, JSON string, or Media Item ID
  onChange: (url: string, item?: MediaItem) => void;
  label?: string;
  folder?: string;
  category?: string;
  className?: string;
  helperText?: string;
}

export default function MediaPicker({
  value = "",
  onChange,
  label = "Asset Image",
  folder = "properties",
  category = "All",
  className = "",
  helperText = ""
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<"library" | "upload">("library");

  const handleOpenLibrary = () => {
    setPickerTab("library");
    setIsOpen(true);
  };

  const handleOpenUpload = () => {
    setPickerTab("upload");
    setIsOpen(true);
  };

  const handleSelect = (selectedItems: MediaItem[]) => {
    if (selectedItems.length > 0) {
      const selected = selectedItems[0];
      // Use the public url for rendering
      onChange(selected.public_url, selected);
    }
  };

  const handleClear = () => {
    onChange("");
  };

  // Determine if value is a valid URL or media ID
  const isImageSelected = value && value.trim().length > 0;
  
  // Try to render the value nicely
  let displayUrl = value;
  if (value && value.startsWith("media-")) {
    // If it's a media ID, we will try to render its public path,
    // but typically the value stored in DB will be resolved to a public URL.
    // We will support IDs by checking if it contains "media-" and appending standard path
    // or we can store the public_url itself. To preserve backward compatibility, 
    // storing the actual URL or relative path is extremely safe!
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}

      <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-3 transition-all hover:border-slate-700">
        {isImageSelected ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Visual Preview */}
            <div className="relative aspect-video w-full sm:w-36 rounded-lg bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
              <img
                src={displayUrl}
                alt={label}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-1.5 right-1.5 rounded-full bg-slate-950/80 p-1 text-red-400 hover:text-red-300 hover:bg-slate-950 transition-colors"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Asset details / controls */}
            <div className="flex-1 min-w-0 w-full text-center sm:text-left space-y-1">
              <p className="text-xs font-mono text-slate-300 truncate" title={displayUrl}>
                {displayUrl.substring(displayUrl.lastIndexOf("/") + 1)}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate" title={displayUrl}>
                Path: {displayUrl}
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenLibrary}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-[10px] font-semibold rounded-md flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <FolderOpen className="h-3 w-3 text-indigo-400" />
                  Select Different
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-[10px] font-semibold rounded-md transition-all active:scale-95 cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="rounded-full bg-slate-950 p-2.5 text-slate-600 mb-2 border border-slate-800">
              <Image className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-medium text-slate-400">No media selected</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Please choose from the library or upload a new file</p>
            
            {/* Split controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleOpenLibrary}
                className="px-3.5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Select From Library
              </button>
              
              <span className="text-[10px] font-semibold text-slate-600 uppercase">OR</span>
              
              <button
                type="button"
                onClick={handleOpenUpload}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Upload New Asset
              </button>
            </div>
          </div>
        )}
      </div>
      {helperText && (
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          {helperText}
        </p>
      )}

      <MediaPickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        allowMultiple={false}
        allowedFolder={folder}
        allowedCategory={category}
        initialTab={pickerTab}
      />
    </div>
  );
}
