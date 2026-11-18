'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { menuApi, uploadApi } from '@/lib/api';
import { MenuCategory, MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';

const CATEGORIES: MenuCategory[] = [
  'Classic Pizzas',
  'Vegetarian Pizzas',
  'Meat Lovers',
  'Specialty / Gourmet Pizzas',
  'Sides & Appetizers',
  'Beverages & Desserts',
];

interface EditProps {
  params: Promise<{ id: string }>;
}

export default function EditMenuItemPage({ params }: EditProps) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  const [loading, setLoading] = useState<boolean>(true);
  const [itemName, setItemName] = useState<string>('');
  const [category, setCategory] = useState<MenuCategory>('Classic Pizzas');
  const [price, setPrice] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        let loaded: MenuItem | null = null;
        try {
          const res = await menuApi.getItemById(itemId);
          if (res?.data) loaded = res.data;
        } catch {
          // Check local cache
          if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('pizzahub_vendor_items');
            if (raw) {
              const list: MenuItem[] = JSON.parse(raw);
              const found = list.find((i) => i._id === itemId);
              if (found) loaded = found;
            }
          }
        }

        if (loaded) {
          setItemName(loaded.itemName);
          setCategory(loaded.category);
          setPrice(loaded.price.toString());
          setLocation(loaded.location);
          setDescription(loaded.description);
          setImages(loaded.images || []);
        } else {
          setErrorMessage('Recipe could not be found.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [itemId]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      let uploadedUrl: string;
      try {
        const response = await uploadApi.uploadImage(file);
        uploadedUrl = response.data.url;
      } catch {
        uploadedUrl = URL.createObjectURL(file);
      }
      setImages((prev) => [...prev, uploadedUrl]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddDirectUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Price must be a valid positive number.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please provide at least one photo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const updatePayload: Partial<MenuItem> = {
      itemName: itemName.trim(),
      category,
      price: numPrice,
      location: location.trim(),
      description: description.trim(),
      images,
    };

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(itemId);
      if (isMongoId) {
        await menuApi.updateItem(itemId, updatePayload);
      }

      // Update local storage cache
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('pizzahub_vendor_items');
        if (raw) {
          const list: MenuItem[] = JSON.parse(raw);
          const idx = list.findIndex((i) => i._id === itemId);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updatePayload };
            localStorage.setItem('pizzahub_vendor_items', JSON.stringify(list));
          }
        }
      }

      setSuccessMessage('Recipe updated successfully!');
      setTimeout(() => {
        router.push('/dashboard/vendor');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update recipe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/dashboard/vendor"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-pizza-red transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Kitchen Deck
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100">
            Edit Pizza Recipe
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Update pricing, fermentation details, or photography.
          </p>
        </div>
      </div>

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
            <button onClick={() => setErrorMessage(null)} className="text-xs font-semibold underline">
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Recipe Title
              </label>
              <Input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Category
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Price ($ USD)
              </label>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Origin / Region
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Tasting Notes & Ingredients
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs focus:ring-2 focus:ring-pizza-orange/30 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Photography */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Artisanal Photos
          </h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/40"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <Upload className="w-5 h-5 text-pizza-orange" />
              <p className="text-xs font-semibold">
                {isUploading ? 'Uploading to ImgBB...' : 'Upload New Image'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Or paste direct image URL..."
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="text-xs rounded-xl"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDirectUrl}
              className="rounded-xl text-xs"
            >
              Add
            </Button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {images.map((imgUrl, i) => (
                <div
                  key={i}
                  className="relative group rounded-xl overflow-hidden aspect-square border border-zinc-200 dark:border-zinc-800 bg-zinc-900"
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/vendor">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-xs h-10 px-4"
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="h-10 px-5 rounded-xl bg-pizza-red hover:bg-pizza-red/90 text-white font-bold text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...
              </>
            ) : (
              'Save Recipe Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
