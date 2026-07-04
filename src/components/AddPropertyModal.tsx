import React, { useState } from 'react';
import { X, Building2, MapPin, DollarSign, Ruler, Bed, Bath, FileText, CheckCircle, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (newProp: Omit<Property, 'id' | 'rating' | 'reviews' | 'featured' | 'agent' | 'images'>) => void;
}

export default function AddPropertyModal({ isOpen, onClose, onAddProperty }: AddPropertyModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Property['type']>('Apartment');
  const [price, setPrice] = useState('');
  const [sqft, setSqft] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('New York');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('Smart Lock, High-speed Fiber, Private Deck');

  const [isSuccess, setIsSuccess] = useState(false);

  // Unsplash beautiful presets if empty
  const presets: { [key: string]: string } = {
    Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    Villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    Commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    Warehouse: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    Homestay: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !sqft || !address || !description) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const finalImage = imageUrl.trim() || presets[type];
    const amenitiesArr = amenitiesText.split(',').map(s => s.trim()).filter(Boolean);

    onAddProperty({
      title,
      type,
      price: Number(price),
      sqft: Number(sqft),
      beds: Number(beds) || 0,
      baths: Number(baths) || 0,
      address,
      location,
      description,
      image: finalImage,
      amenities: amenitiesArr
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      resetForm();
      onClose();
    }, 2500);
  };

  const resetForm = () => {
    setTitle('');
    setType('Apartment');
    setPrice('');
    setSqft('');
    setBeds('');
    setBaths('');
    setAddress('');
    setLocation('New York');
    setDescription('');
    setImageUrl('');
    setAmenitiesText('Smart Lock, High-speed Fiber, Private Deck');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full text-slate-800 shadow-2xl relative border border-slate-200"
        id="add-property-modal-container"
      >
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center space-x-3 text-left border-b border-slate-100 pb-5 mb-6">
            <div className="p-2.5 bg-[#ff5a3c] rounded-xl text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-sans font-extrabold text-slate-900 tracking-tight">Add Company Project</h3>
              <p className="text-xs text-slate-500">Append new active structures dynamically into the public real estate showcase catalog.</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-200">
                  <CheckCircle className="h-8 w-8 animate-bounce" />
                </div>
                <h4 className="font-sans font-extrabold text-lg text-slate-800">Project Registered Successfully!</h4>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  The property was filed into our storage frame structure and is now filterable on the public developments grid.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 text-left">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Horizon Tower"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                  />
                </div>

                {/* Grid Type + Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Category Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as Property['type'])}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] cursor-pointer"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Homestay">Homestay</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Valuation price ($) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        placeholder="e.g. 850000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 pl-8 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                      />
                      <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Area and layouts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Total Area (Sq Ft) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        placeholder="e.g. 2400"
                        value={sqft}
                        onChange={(e) => setSqft(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 pl-8 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                      />
                      <Ruler className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Bedrooms (0 for Comm/Wh)</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="e.g. 4"
                        value={beds}
                        onChange={(e) => setBeds(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 pl-8 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                      />
                      <Bed className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Bathrooms</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="e.g. 3"
                        value={baths}
                        onChange={(e) => setBaths(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 pl-8 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                      />
                      <Bath className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Address and Region location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Full Address *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. 210 Highland Ave"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 pl-8 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                      />
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Region Territory *</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] cursor-pointer"
                    >
                      <option value="California">California</option>
                      <option value="New York">New York</option>
                      <option value="Florida">Florida</option>
                      <option value="Texas">Texas</option>
                    </select>
                  </div>
                </div>

                {/* Custom Image CDN or presets */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Image URL (Optional - Leaves preset for category if blank)</label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 pl-8 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                    />
                    <Image className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Amenities List */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    value={amenitiesText}
                    onChange={(e) => setAmenitiesText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Detailed Project overview *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide professional notes about the structure's layout, utility designs, sustainable grids, or rental potentials..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-4 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] resize-none"
                  />
                </div>

                {/* Button actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 hover:bg-slate-100 text-slate-500 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#ff5a3c] hover:bg-[#e04326] text-white px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-950/20 transition cursor-pointer"
                  >
                    Register Project
                  </button>
                </div>

              </form>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
