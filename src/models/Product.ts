import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'size' | 'color'
  value: { type: String, required: true },
  price: { type: Number },
  additionalPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
});

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    images: [{ type: String }],
    category: { type: String, default: '' },
    categories: [{ type: String }],

    // Pricing
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    chargeTax: { type: Boolean, default: false },
    costPerItem: { type: Number, default: 0 },

    // Inventory
    trackInventory: { type: Boolean, default: false },
    quantity: { type: Number, default: 0 },
    sku: { type: String, default: '' },
    barcode: { type: String, default: '' },
    continueSelling: { type: Boolean, default: false },

    // Shipping
    isPhysical: { type: Boolean, default: true },
    weight: { type: Number, default: 0 },
    weightUnit: { type: String, default: 'kg' },
    countryOrigin: { type: String, default: '' },
    hsCode: { type: String, default: '' },

    // Variants
    variants: [VariantSchema],

    // SEO
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoSlug: { type: String, default: '' },

    // Organization
    status: { type: String, enum: ['active', 'draft'], default: 'draft' },
    productType: { type: String, default: '' },
    vendor: { type: String, default: '' },
    collections: [{ type: String }],
    tags: [{ type: String }],
    themeTemplate: { type: String, default: 'default' },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
