'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, MenuItem, User, OrderStatus } from '@/types';
import { orderApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
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
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Store,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  X,
  Truck,
  Sparkles,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCancelled?: (updatedOrder: Order) => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onOrderCancelled,
}: OrderDetailsModalProps) {
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!order) return null;

  const itemObj = typeof order.itemId === 'object' ? (order.itemId as MenuItem) : null;
  const vendorObj = typeof order.vendorId === 'object' ? (order.vendorId as User) : null;

  const itemName = itemObj?.itemName || 'Artisanal Wood-Fired Pizza';
  const itemPrice = itemObj?.price || 18.5;
  const itemCategory = itemObj?.category || 'Classic Pizzas';
  const itemImage =
    itemObj?.images?.[0] ||
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800';
  const vendorName = vendorObj?.businessName || vendorObj?.name || 'Master Artisan Baker';

  const isPending = order.status === 'pending';
  const isAccepted = order.status === 'accepted';
  const isCancelled = order.status === 'cancelled';
  const isRejected = order.status === 'rejected';

  // Format order placement timestamp
  const orderDateFormatted = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCancelOrder = async () => {
    if (!isPending) return;

    setCancelling(true);
    setErrorMessage(null);

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(order._id);

    try {
      let updated: Order;

      if (isMongoId) {
        const response = await orderApi.cancelOrder(order._id);
        updated = response.data;
      } else {
        // Fallback simulation for offline/demo orders
        await new Promise((resolve) => setTimeout(resolve, 600));
        updated = {
          ...order,
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        };
      }

      // Update localStorage cached orders if present
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('pizzahub_customer_orders');
          if (raw) {
            const list: Order[] = JSON.parse(raw);
            const idx = list.findIndex((o) => o._id === order._id);
            if (idx !== -1) {
              list[idx].status = 'cancelled';
              list[idx].updatedAt = new Date().toISOString();
              localStorage.setItem('pizzahub_customer_orders', JSON.stringify(list));
            }
          }
        } catch {
          // ignore
        }
      }

      setShowConfirmCancel(false);
      if (onOrderCancelled) {
        onOrderCancelled(updated);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Could not cancel order. Please ensure the order is still pending.'
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !cancelling && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-pizza-warm-cream/50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pizza-red/10 text-pizza-red flex items-center justify-center font-bold">
                <Pizza className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Order #{order._id.slice(-6).toUpperCase()}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                  Placed on {orderDateFormatted}
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={cancelling}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {/* Visual Order Status Timeline Stepper */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Live Kitchen & Dispatch Timeline
              </span>
              {isPending && (
                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px]">
                  Pending Confirmation
                </Badge>
              )}
              {isAccepted && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px]">
                  Baking in 450°C Stone
                </Badge>
              )}
              {isCancelled && (
                <Badge className="bg-zinc-500/10 text-zinc-600 border border-zinc-500/30 text-[10px]">
                  Order Cancelled
                </Badge>
              )}
              {isRejected && (
                <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/30 text-[10px]">
                  Declined by Baker
                </Badge>
              )}
            </div>

            {/* Stepper Progress Bar */}
            {isCancelled || isRejected ? (
              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {isCancelled
                      ? 'Order was cancelled by the customer.'
                      : 'Order was declined by the master baker due to oven capacity.'}
                  </p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">
                    No charges apply. Feel free to re-order from another master baker anytime.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative pt-2 pb-1">
                {/* Connecting Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0" />
                <div
                  className={`absolute top-6 left-6 h-0.5 bg-pizza-orange transition-all duration-500 z-0 ${
                    isAccepted ? 'right-6' : 'w-1/3'
                  }`}
                />

                {/* Stepper Steps */}
                <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                  {/* Step 1: Dispatched */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-pizza-orange text-white flex items-center justify-center font-bold shadow-md ring-4 ring-white dark:ring-zinc-900">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                      Order Placed
                    </span>
                    <span className="text-[10px] text-zinc-400">Request Sent</span>
                  </div>

                  {/* Step 2: Confirmation */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-md ring-4 ring-white dark:ring-zinc-900 transition-all ${
                        isAccepted
                          ? 'bg-pizza-orange text-white'
                          : 'bg-amber-500 text-white animate-pulse'
                      }`}
                    >
                      {isAccepted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                      Baker Review
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {isAccepted ? 'Confirmed' : 'Awaiting'}
                    </span>
                  </div>

                  {/* Step 3: Stone Oven */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ring-4 ring-white dark:ring-zinc-900 transition-all ${
                        isAccepted
                          ? 'bg-emerald-500 text-white shadow-md animate-bounce'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                      In the Oven
                    </span>
                    <span className="text-[10px] text-zinc-400">450°C Stone</span>
                  </div>

                  {/* Step 4: Out for Delivery */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ring-4 ring-white dark:ring-zinc-900 transition-all ${
                        isAccepted
                          ? 'bg-emerald-600/20 text-emerald-600 border border-emerald-500/40'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                      Dispatched
                    </span>
                    <span className="text-[10px] text-zinc-400">Fresh Arrival</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pizza Item & Baker Summary */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={itemImage}
                alt={itemName}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
              />
              <div>
                <Badge variant="outline" className="text-[10px] mb-1">
                  {itemCategory}
                </Badge>
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {itemName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-pizza-orange" />
                  <span>{vendorName}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-zinc-400 block font-medium">Billed Amount</span>
              <span className="text-2xl font-extrabold text-pizza-red">
                ${itemPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery & Schedule Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-pizza-orange" />
                <span>Scheduled Delivery</span>
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {order.deliveryDate}
              </p>
              <p className="text-xs text-zinc-500">
                Prepared hot for direct table service
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-pizza-orange" />
                <span>Delivery Address</span>
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {order.deliveryAddress}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {order.message || 'Standard artisanal delivery instructions'}
              </p>
            </div>
          </div>

          {/* Pricing & Receipt Ledger */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs space-y-2">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Artisanal Wood-Fired Pizza (1x)</span>
              <span>${itemPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Thermal Insulated Pizza Box</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Direct Baker Courier Service</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800 font-bold text-sm">
              <span>Grand Total:</span>
              <span className="text-pizza-red">${itemPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Confirmation Box for Cancellation */}
          <AnimatePresence>
            {showConfirmCancel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-rose-900 dark:text-rose-200">
                      Confirm Order Cancellation
                    </p>
                    <p className="text-rose-700 dark:text-rose-300 mt-0.5">
                      Are you sure you want to cancel this order? Once cancelled, the baker will be
                      notified and this action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={cancelling}
                    onClick={() => setShowConfirmCancel(false)}
                    className="rounded-lg text-xs h-8 border-zinc-300 dark:border-zinc-700"
                  >
                    Keep Order
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={cancelling}
                    onClick={handleCancelOrder}
                    className="rounded-lg text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel Order'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            {isPending ? (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" /> Free cancellation available
              </span>
            ) : isAccepted ? (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5" /> Oven firing · Order locked
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">Order finalized</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPending && !showConfirmCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmCancel(true)}
                className="rounded-xl border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs h-9"
              >
                Cancel Order
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs h-9"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OrderDetailsModal;
