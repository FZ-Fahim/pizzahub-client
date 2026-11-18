'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { orderApi } from '@/lib/api';
import { MenuItem, Order, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Pizza,
  Calendar,
  MapPin,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface OrderModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  quantity?: number;
  onSuccess?: (order: Order) => void;
}

export function OrderModal({
  item,
  isOpen,
  onClose,
  quantity = 1,
  onSuccess,
}: OrderModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Calculate default today date in YYYY-MM-DD
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowStr = () => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split('T')[0];
  };

  const [deliveryDate, setDeliveryDate] = useState<string>(getTodayStr());
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('evening');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Reset states whenever modal opens with an item
  useEffect(() => {
    if (isOpen) {
      setDeliveryDate(getTodayStr());
      setErrorMessage(null);
      setSuccessOrder(null);
      // Pre-fill address if available in user profile or saved
      if (typeof window !== 'undefined') {
        const savedAddr = localStorage.getItem('pizzahub_last_address');
        if (savedAddr) setDeliveryAddress(savedAddr);
      }
    }
  }, [isOpen, item]);

  if (!item) return null;

  const vendorObj = typeof item.vendorId === 'object' ? (item.vendorId as User) : null;
  const vendorName = vendorObj?.businessName || vendorObj?.name || 'Artisanal Pizzeria';
  const totalPrice = item.price * quantity;

  // Validation
  const validateForm = (): boolean => {
    setErrorMessage(null);

    if (!deliveryDate) {
      setErrorMessage('Please select a preferred delivery date.');
      return false;
    }

    const today = getTodayStr();
    if (deliveryDate < today) {
      setErrorMessage('Delivery date cannot be in the past.');
      return false;
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 8) {
      setErrorMessage('Please provide a complete delivery address (street, building, unit).');
      return false;
    }

    // Duplicate check on recent orders in local storage
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem('pizzahub_customer_orders');
        if (rawLocal) {
          const localOrders: Order[] = JSON.parse(rawLocal);
          const hasDuplicate = localOrders.some(
            (o) =>
              (typeof o.itemId === 'string' ? o.itemId : o.itemId._id) === item._id &&
              o.deliveryDate === deliveryDate &&
              (o.status === 'pending' || o.status === 'accepted')
          );
          if (hasDuplicate) {
            setErrorMessage(
              `You already have an active order for this pizza on ${deliveryDate}. Please choose a different date.`
            );
            return false;
          }
        }
      } catch {
        // Continue
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/menu/${item._id}`);
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(item._id);

    try {
      let createdOrder: Order;

      if (isMongoId) {
        // Call real backend API
        const fullMessage = message.trim()
          ? `[Slot: ${timeSlot.toUpperCase()}] ${message.trim()}`
          : `[Slot: ${timeSlot.toUpperCase()}] Standard artisanal delivery`;

        const response = await orderApi.createOrder({
          itemId: item._id,
          deliveryDate,
          deliveryAddress: deliveryAddress.trim(),
          message: fullMessage,
        });

        createdOrder = response.data;
      } else {
        // Seamless fallback simulation for mock items / offline test mode
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockId = 'ord_' + Math.random().toString(36).substring(2, 9);
        createdOrder = {
          _id: mockId,
          itemId: item,
          vendorId: item.vendorId,
          customerId: user?._id || 'cust_local',
          deliveryDate,
          deliveryAddress: deliveryAddress.trim(),
          message: message.trim() || `Slot: ${timeSlot.toUpperCase()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Save delivery address for next time
      if (typeof window !== 'undefined') {
        localStorage.setItem('pizzahub_last_address', deliveryAddress.trim());

        // Cache order locally so Customer Dashboard immediately displays it
        try {
          const rawLocal = localStorage.getItem('pizzahub_customer_orders');
          const localOrders: Order[] = rawLocal ? JSON.parse(rawLocal) : [];
          localOrders.unshift(createdOrder);
          localStorage.setItem('pizzahub_customer_orders', JSON.stringify(localOrders));
        } catch {
          // ignore
        }
      }

      setSuccessOrder(createdOrder);
      if (onSuccess) {
        onSuccess(createdOrder);
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to submit pizza order. Please check details and retry.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-pizza-warm-cream/50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pizza-red/10 text-pizza-red flex items-center justify-center font-bold">
                <Pizza className="w-4 h-4" />
              </div>
              <DialogTitle className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
                Order Artisanal Pizza
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Freshly stone-baked upon dispatch confirmation from {vendorName}.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {successOrder ? (
            /* Order Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <Badge className="bg-emerald-500 text-white font-medium mb-2 border-0">
                  Order Successfully Placed
                </Badge>
                <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
                  {item.itemName}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Your artisanal order has been dispatched to{' '}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{vendorName}</span>{' '}
                  for confirmation.
                </p>
              </div>

              {/* Order Receipt Card */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-2">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Order Reference:</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    #{successOrder._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Scheduled Delivery:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {deliveryDate} ({timeSlot})
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Delivery Address:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-right truncate max-w-[200px]">
                    {deliveryAddress}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">Total Billed:</span>
                  <span className="font-bold text-pizza-red text-sm">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => {
                    onClose();
                    router.push('/dashboard/customer');
                  }}
                  className="flex-1 bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl font-medium text-xs h-10 shadow-md"
                >
                  Track in Customer Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs h-10"
                >
                  Continue Browsing
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Order Input Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Item Summary Pill */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <img
                  src={item.images[0] || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300'}
                  alt={item.itemName}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {item.itemName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span>Qty: {quantity}</span>
                    <span>•</span>
                    <span className="font-semibold text-pizza-red">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-zinc-500">
                  {item.category}
                </Badge>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Delivery Date Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-pizza-orange" />
                    Delivery Date <span className="text-pizza-red">*</span>
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDeliveryDate(getTodayStr())}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        deliveryDate === getTodayStr()
                          ? 'bg-pizza-orange/10 border-pizza-orange text-pizza-orange'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryDate(getTomorrowStr())}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        deliveryDate === getTomorrowStr()
                          ? 'bg-pizza-orange/10 border-pizza-orange text-pizza-orange'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <Input
                  type="date"
                  min={getTodayStr()}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"
                />
              </div>

              {/* Delivery Time Slot Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pizza-orange" />
                  Preferred Dispatch Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lunch', label: 'Lunch', sub: '12 - 2 PM' },
                    { id: 'evening', label: 'Dinner', sub: '6 - 8 PM' },
                    { id: 'night', label: 'Late', sub: '8 - 10 PM' },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setTimeSlot(slot.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        timeSlot === slot.id
                          ? 'border-pizza-red bg-pizza-red/10 text-pizza-red font-semibold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <div className="text-xs font-medium">{slot.label}</div>
                      <div className="text-[10px] opacity-75">{slot.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-pizza-orange" />
                  Delivery Destination Address <span className="text-pizza-red">*</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B, Springfield"
                  required
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pizza-orange/30 placeholder:text-zinc-400 resize-none"
                />
              </div>

              {/* Baker's Custom Note (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-pizza-orange" />
                  Special Baker's Instruction (Optional)
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Extra crispy bottom crust, leave at door porch"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pizza-orange/30 placeholder:text-zinc-400"
                />
              </div>

              {/* Submit CTA & Trust Indicator */}
              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-pizza-red hover:bg-pizza-red/90 text-white font-bold rounded-xl shadow-lg shadow-pizza-red/20 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Order to Baker...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm Order · ${totalPrice.toFixed(2)}</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Duplicate Order Protection
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Free Cancellation while Pending
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default OrderModal;
