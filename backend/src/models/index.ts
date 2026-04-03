import mongoose, { Schema } from 'mongoose';
import { BookingStatus, DeploymentStatus, OrderStatus, PaymentProvider } from '@/lib/enums';

function addIdTransform(schema: Schema) {
  schema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
      const o = ret as Record<string, unknown> & { _id?: mongoose.Types.ObjectId };
      o.id = o._id?.toString();
      delete o._id;
      delete o.__v;
      return o;
    },
  });
}

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: null },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);
addIdTransform(UserSchema);

const RefreshTokenSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
addIdTransform(RefreshTokenSchema);

const TemplateSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    niche: { type: String, required: true },
    description: { type: String, required: true },
    previewUrl: { type: String, default: null },
    defaultAccent: { type: String, default: '#0d9488' },
    demoTagline: { type: String, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
addIdTransform(TemplateSchema);

const StoreSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'NGN' },
    niche: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    brandColor: { type: String, default: '#0d9488' },
    /** E.164 digits only (e.g. 2348012345678) for wa.me checkout links */
    whatsappPhone: { type: String, default: null },
    logoUrl: { type: String, default: null },
    /** Hero subtitle; falls back to template demo tagline then niche copy */
    tagline: { type: String, default: null },
    /** Optional hero heading override per selected template */
    heroTitle: { type: String, default: null },
    /** Optional hero subheading override per selected template */
    heroSubtitle: { type: String, default: null },
    /** Optional hero image override per selected template */
    heroImageUrl: { type: String, default: null },
    /** Hero content alignment: left, center, right */
    heroAlign: { type: String, default: 'left' },
    /** Editable storefront navigation items */
    templateMenu: { type: [String], default: [] },
    /** Optional longer blurb (e.g. footer / about) */
    siteDescription: { type: String, default: null },
    onboardingComplete: { type: Boolean, default: false },
    aiEnabled: { type: Boolean, default: true },
    deploymentStatus: {
      type: String,
      enum: Object.values(DeploymentStatus),
      default: DeploymentStatus.PENDING,
    },
    coolifyDeploymentId: { type: String, default: null },
    /** Selected section-template layout id (e.g. ng-ecom-catalog) */
    sectionTemplate: { type: String, default: null },
  },
  { timestamps: true },
);
addIdTransform(StoreSchema);

const ProductSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    sku: { type: String, default: null },
    stock: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);
addIdTransform(ProductSchema);

const OrderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    customerEmail: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    total: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentRef: { type: String, default: null },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      default: PaymentProvider.MANUAL,
    },
  },
  { timestamps: true },
);
addIdTransform(OrderSchema);

const OrderItemSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { timestamps: true },
);
addIdTransform(OrderItemSchema);

const AnalyticsEventSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
addIdTransform(AnalyticsEventSchema);

const MarketingCampaignSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    channel: { type: String, required: true },
    scheduledAt: { type: Date, default: null },
    body: { type: String, default: '' },
  },
  { timestamps: true },
);
addIdTransform(MarketingCampaignSchema);

const BookingSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
  },
  { timestamps: true },
);
addIdTransform(BookingSchema);

export const User = mongoose.models.User ?? mongoose.model('User', UserSchema);
export const RefreshToken =
  mongoose.models.RefreshToken ?? mongoose.model('RefreshToken', RefreshTokenSchema);
export const Template = mongoose.models.Template ?? mongoose.model('Template', TemplateSchema);
export const Store = mongoose.models.Store ?? mongoose.model('Store', StoreSchema);
export const Product = mongoose.models.Product ?? mongoose.model('Product', ProductSchema);
export const Order = mongoose.models.Order ?? mongoose.model('Order', OrderSchema);
export const OrderItem = mongoose.models.OrderItem ?? mongoose.model('OrderItem', OrderItemSchema);
export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent ?? mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
export const MarketingCampaign =
  mongoose.models.MarketingCampaign ?? mongoose.model('MarketingCampaign', MarketingCampaignSchema);
export const Booking = mongoose.models.Booking ?? mongoose.model('Booking', BookingSchema);
