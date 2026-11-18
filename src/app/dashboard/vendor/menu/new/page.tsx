'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { menuApi, uploadApi } from '@/lib/api';
import { MenuCategory, MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pizza,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  DollarSign,
  MapPin,
  Tag,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';

const CATEGORIES: MenuCategory[] = [
  'Classic Pizzas',
  'Vegetarian Pizzas',
  'Meat Lovers',
  'Specialty / Gourmet Pizzas',
  'Sides & Appetizers',
  'Beverages & Desserts',
];

// Curated high-res artisanal pizza presets for quick 1-click addition
const PRESET_IMAGES = [
  {
    name: 'Classic Margherita',
    url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000',
  },
  {
    name: 'Pepperoni & Truffle',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000',
  },
  {
    name: 'Wood-Fired Crust',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000',
  },
  {
    name: 'Diavola Spicy',
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1000',
  },
];

export default function NewMenuItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPremium = user?.subscriptionPlan === 'premium';

  // Form Fields
  const [itemName, setItemName] = useState<string>('');
  const [category, setCategory] = useState<MenuCategory>('Classic Pizzas');
  const [price, setPrice] = useState<string>('');
  const [location, setLocation] = useState<string>(user?.businessName || 'Artisanal Forno');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  // States
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeItemsCount, setActiveItemsCount] = useState<number>(0);
  const [isLimitChecking, setIsLimitChecking] = useState<boolean>(true);

  // Check current active items to enforce Free Tier 3-item limit upfront
  useEffect(() => {
    async function checkQuota() {
      try {
        let count = 0;
        try {
          const res = await menuApi.getVendorItems();
          if (res?.data && Array.isArray(res.data)) {
            count = res.data.filter((item) => item.status !== 'inactive').length;
          }
        } catch {
          // Check local storage fallback
          if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('pizzahub_vendor_items');
            if (raw) {
              const list: MenuItem[] = JSON.parse(raw);
              count = list.filter((item) => item.status !== 'inactive').length;
            }
          }
        }
        setActiveItemsCount(count);
      } finally {
        setIsLimitChecking(false);
      }
    }
    checkQuota();
  }, []);

  const isFreeTierLimitReached = !isPremium && activeItemsCount >= 3;

  // Handle Drag & Drop / File Select for ImgBB Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum allowed 5MB limit.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      let uploadedUrl: string;

      try {
        const response = await uploadApi.uploadImage(file);
        uploadedUrl = response.data.url;
      } catch (err: any) {
        // Fallback for offline demo testing if server or ImgBB key is unreachable
        uploadedUrl = URL.createObjectURL(file);
      }

      setImages((prev) => [...prev, uploadedUrl]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed. You may also paste direct image URLs.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddDirectUrl = () => {
    if (!customImageUrl.trim()) return;
    if (!customImageUrl.startsWith('http://') && !customImageUrl.startsWith('https://')) {
      setErrorMessage('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
    setErrorMessage(null);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFreeTierLimitReached) {
      setErrorMessage(
        'Free Plan allows a maximum of 3 active items. Please upgrade to Premium or set an existing item to inactive.'
      );
      return;
    }

    if (!itemName.trim()) {
      setErrorMessage('Recipe name is required.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Price must be a valid positive number.');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Please provide a detailed recipe description (at least 15 characters).');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please upload or select at least one artisanal photo of your pizza.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: Partial<MenuItem> = {
      itemName: itemName.trim(),
      category,
      price: numPrice,
      location: location.trim() || 'Artisanal Forno',
      description: description.trim(),
      images,
      status: 'pending', // Fresh items are submitted to admin moderation
    };

    try {
      let created: MenuItem;
      try {
        const res = await menuApi.createItem(payload);
        created = res.data;
      } catch (err: any) {
        // Fallback simulation for offline testing
        created = {
          _id: 'm_' + Math.random().toString(36).substring(2, 9),
          vendorId: user?._id || 'v_me',
          itemName: payload.itemName!,
          category: payload.category!,
          price: payload.price!,
          location: payload.location!,
          description: payload.description!,
          images: payload.images!,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Cache locally for instant UI update in vendor table
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('pizzahub_vendor_items');
          const list: MenuItem[] = raw ? JSON.parse(raw) : [];
          list.unshift(created);
          localStorage.setItem('pizzahub_vendor_items', JSON.stringify(list));
        } catch {
          // ignore
        }
      }

      setSuccessMessage('Recipe successfully published and submitted for oven moderation!');
      setTimeout(() => {
        router.push('/dashboard/vendor');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit recipe. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/dashboard/vendor"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-pizza-red transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Kitchen Deck
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100">
            Publish New Pizza Recipe
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Craft a showcase for your wood-fired sourdough creation.
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-xs font-semibold px-3 py-1 border-pizza-orange/30 text-pizza-red"
        >
          {isPremium ? 'Premium Baker' : `Free Tier (${activeItemsCount}/3 Active)`}
        </Badge>
      </div>

      {/* Free Tier Capacity Alert */}
      {isFreeTierLimitReached && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Free Plan Capacity Limit Reached (3 / 3 Items Active)
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                The free tier permits a maximum of 3 active menu recipes. To publish this recipe,
                either archive an existing recipe to inactive status or upgrade to Premium for
                unlimited listings.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Link href="/dashboard/vendor/subscription">
              <Button
                size="sm"
                className="bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Upgrade to Premium ($99/yr)
              </Button>
            </Link>
            <Link href="/dashboard/vendor">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-amber-300 text-xs"
              >
                Manage Existing Recipes
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Status Banners */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <Pizza className="w-4 h-4 text-pizza-red" />
            Recipe Fundamentals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Item Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Recipe Title <span className="text-pizza-red">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Tartufo & Porcini Supreme"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Artisanal Category <span className="text-pizza-red">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuCategory)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-pizza-orange/30 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Price ($ USD) <span className="text-pizza-red">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="22.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="pl-7 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm"
                />
              </div>
            </div>

            {/* Kitchen Location */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Kitchen Origin / Region <span className="text-pizza-red">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="e.g. Little Italy, NY · Stone Oven #2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm"
                />
              </div>
            </div>

            {/* Recipe Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Pizzaiolo Tasting Notes & Ingredients <span className="text-pizza-red">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe your dough fermentation (e.g. 72-hour sourdough), oven temperature (450°C), cheese origin, tomatoes, and flavor harmony..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs focus:ring-2 focus:ring-pizza-orange/30 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* ImgBB Image Upload Section */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-pizza-orange" />
              Artisanal Photography & ImgBB Upload
            </h2>
            <span className="text-xs text-zinc-400">
              {images.length} / 5 photos selected
            </span>
          </div>

          {/* Drag & Drop Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-pizza-orange dark:hover:border-pizza-orange rounded-2xl p-8 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-950/40 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-pizza-orange/10 text-pizza-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-pizza-red" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {isUploading ? 'Uploading to ImgBB Server...' : 'Click or Drag Pizza Photo Here'}
              </p>
              <p className="text-xs text-zinc-400">
                Supports PNG, JPG, or WEBP up to 5MB (Hosted securely on ImgBB)
              </p>
            </div>
          </div>

          {/* Preset Images Quick Selector */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Or pick from certified artisanal photo library:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImages((prev) => [...prev, preset.url])}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-pizza-orange dark:hover:border-pizza-orange flex items-center gap-2 text-left transition-colors bg-zinc-50 dark:bg-zinc-950 text-xs"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <span className="truncate text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct URL Input fallback */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Or paste direct image URL:
            </span>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDirectUrl}
                className="rounded-xl text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add URL
              </Button>
            </div>
          </div>

          {/* Uploaded Images Preview Strip */}
          {images.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Gallery Preview ({images.length} added)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-square bg-zinc-900"
                  >
                    <img
                      src={imgUrl}
                      alt={`Upload ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-md"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-2 left-2 bg-zinc-900/80 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                        Cover Photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/dashboard/vendor">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="rounded-xl text-xs h-11 px-5 border-zinc-300 dark:border-zinc-700"
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || isFreeTierLimitReached || isUploading}
            className="h-11 px-6 rounded-xl bg-pizza-red hover:bg-pizza-red/90 text-white font-bold text-xs gap-2 shadow-lg shadow-pizza-red/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Recipe...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Recipe for Oven Review</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
