import React from 'react';
import { X, Trash2, Heart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoritesList: Property[];
  onRemoveFavorite: (id: string) => void;
  onViewProperty: (property: Property) => void;
  onClearAll: () => void;
}

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favoritesList,
  onRemoveFavorite,
  onViewProperty,
  onClearAll
}: FavoritesDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" id="favorites-drawer-overlay">
      {/* Dark backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white text-slate-800 shadow-2xl flex flex-col h-full"
          id="favorites-drawer-container"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-left">
              <Heart className="h-5 w-5 text-[#ff5a3c] fill-[#ff5a3c]" />
              <h3 className="font-sans font-bold text-lg text-slate-900">Saved Shortlist</h3>
              <span className="bg-slate-100 text-slate-600 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                {favoritesList.length}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {favoritesList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <Heart className="h-12 w-12 text-slate-200" />
                <h4 className="font-sans font-semibold text-sm text-slate-600">Your shortlist is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs font-light">
                  Tap the heart icon on any project developments card to compile a temporary bookmarks collection list.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoritesList.map((prop) => (
                  <div 
                    key={prop.id}
                    className="flex p-3 rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm transition items-center gap-3 bg-slate-50 text-left"
                  >
                    <img 
                      src={prop.image} 
                      alt={prop.title} 
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-white"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-grow space-y-1 min-w-0">
                      <span className="text-[9px] font-mono tracking-wider text-[#ff5a3c] font-black uppercase">{prop.type}</span>
                      <h5 className="font-bold text-slate-800 text-xs truncate leading-normal">{prop.title}</h5>
                      <span className="block text-xs font-mono font-bold text-[#ff5a3c]">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(prop.price)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onViewProperty(prop);
                          onClose();
                        }}
                        className="p-2 text-slate-500 hover:text-[#ff5a3c] bg-white rounded-lg border border-slate-100 shadow-sm hover:border-[#ff5a3c]/30 hover:bg-orange-50 transition cursor-pointer"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      
                      <button
                        onClick={() => onRemoveFavorite(prop.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer action */}
          {favoritesList.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
              <button
                onClick={onClearAll}
                className="w-full text-center text-xs font-mono font-bold tracking-widest text-slate-400 hover:text-rose-600 uppercase transition cursor-pointer"
              >
                Clear Bookmark shortlist
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
