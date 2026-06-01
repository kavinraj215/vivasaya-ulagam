'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { ProductFormData } from '@/app/admin/products/add/page';

type Variant = ProductFormData['variants'][number];
type Props = { form: ProductFormData; update: (f: Partial<ProductFormData>) => void };

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '100ml', '250ml', '500ml', '1L', '250g', '500g', '1kg'];
const COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown'];

export default function VariantsSection({ form, update }: Props) {
  const addVariant = (type: 'size' | 'color') =>
    update({ variants: [...form.variants, { type, value: '', price: '', additionalPrice: '', stock: '' }] });

  const updateVariant = (i: number, fields: Partial<Variant>) => {
    const updated = [...form.variants];
    updated[i] = { ...updated[i], ...fields };
    update({ variants: updated });
  };

  const removeVariant = (i: number) =>
    update({ variants: form.variants.filter((_, idx) => idx !== i) });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Variants</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => addVariant('size')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus size={12} /> Add Size
          </button>
          <button type="button" onClick={() => addVariant('color')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus size={12} /> Add Color
          </button>
        </div>
      </div>

      {form.variants.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          No variants yet. Click the buttons above to add size or color options.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-[80px_1fr_105px_110px_90px_40px] gap-2 px-2 mb-1">
            {['Type', 'Value', 'Direct Price (₹)', 'Extra Price (₹)', 'Stock', ''].map(h => (
              <span key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <AnimatePresence>
            {form.variants.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-[80px_1fr_105px_110px_90px_40px] gap-2 items-center p-2 rounded-lg hover:bg-gray-50 group">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md text-center ${v.type === 'size' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                  {v.type}
                </span>
                <select value={v.value} onChange={e => updateVariant(i, { value: e.target.value })}
                  className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 bg-white">
                  <option value="">Select...</option>
                  {(v.type === 'size' ? SIZES : COLORS).map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <input type="number" min={0} value={v.price ?? ''}
                  onChange={e => updateVariant(i, { price: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-gray-900/10" placeholder="Direct Price" />
                <input type="number" min={0} value={v.additionalPrice}
                  onChange={e => updateVariant(i, { additionalPrice: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-gray-900/10" placeholder="0" />
                <input type="number" min={0} value={v.stock}
                  onChange={e => updateVariant(i, { stock: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  className="px-2.5 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-gray-900/10" placeholder="0" />
                <button type="button" onClick={() => removeVariant(i)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
