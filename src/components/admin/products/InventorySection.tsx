'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { ProductFormData } from '@/app/admin/products/add/page';

type Props = { form: ProductFormData; update: (f: Partial<ProductFormData>) => void };

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-gray-900' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-1'}`} />
      </button>
    </label>
  );
}

export default function InventorySection({ form, update }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Inventory</h2>

      <div className="space-y-4">
        <Toggle checked={form.trackInventory} onChange={v => update({ trackInventory: v })} label="Track quantity" />

        <AnimatePresence>
          {form.trackInventory && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="pt-4 border-t border-gray-100 space-y-4">
                {/* Location row */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin size={14} className="text-gray-400" />
                    <span>Shop Location</span>
                  </div>
                  <input type="number" min={0} value={form.quantity}
                    onChange={e => update({ quantity: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-gray-900/10"
                    placeholder="0" />
                </div>
                <Toggle checked={form.continueSelling} onChange={v => update({ continueSelling: v })} label="Continue selling when out of stock" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">SKU (Stock Keeping Unit)</label>
            <input type="text" value={form.sku} onChange={e => update({ sku: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              placeholder="e.g. VIU-TEA-001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Barcode (ISBN, UPC, GTIN, etc.)</label>
            <input type="text" value={form.barcode} onChange={e => update({ barcode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
              placeholder="" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
