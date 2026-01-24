import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface IStudent extends Document {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfBirth?: string;
  gender?: string;
  photoUrl?: string;
  class: string;
  registrationNumber: string;
  rollNumber?: string;
  feeLevel: 'village' | 'block' | 'district' | 'haryana';
  feeAmount: number;
  feePaid: boolean;
  paymentDate?: Date;
  isActive: boolean;
  registrationDate: Date;
  expiryDate: Date;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResult extends Document {
  studentId: mongoose.Types.ObjectId;
  examName: string;
  marksObtained?: number;
  totalMarks: number;
  grade?: string;
  rank?: number;
  resultDate?: string;
  remarks?: string;
  isPublished: boolean;
  createdAt: Date;
}

export interface IAdmitCard extends Document {
  studentId: mongoose.Types.ObjectId;
  examName: string;
  fileUrl: string;
  fileName: string;
  termsEnglish?: string;
  termsHindi?: string;
  studentPhotoUrl?: string;
  uploadedAt: Date;
}

export interface IMembership extends Document {
  userId?: mongoose.Types.ObjectId;
  memberName: string;
  memberEmail?: string;
  memberPhone: string;
  memberAddress?: string;
  membershipType: string;
  membershipNumber?: string;
  qrCodeUrl?: string;
  upiId?: string;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  createdAt: Date;
}

export interface IMenuItem extends Document {
  title: string;
  titleHindi?: string;
  path: string;
  iconKey: string;
  order: number;
  isActive: boolean;
  group?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminSetting extends Document {
  key: string;
  value: string;
  label: string;
  labelHindi?: string;
  description?: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentConfig extends Document {
  type: 'donation' | 'fee' | 'membership' | 'general';
  name: string;
  nameHindi?: string;
  qrCodeUrl?: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  level?: 'village' | 'block' | 'district' | 'haryana';
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentSection extends Document {
  sectionKey: 'about' | 'services' | 'gallery' | 'events' | 'joinUs' | 'contact' | 'volunteer' | 'team' | 'home';
  title: string;
  titleHindi?: string;
  content: string;
  contentHindi?: string;
  imageUrls?: string[];
  isActive: boolean;
  order: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVolunteerApplication extends Document {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  occupation?: string;
  skills?: string;
  availability?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeeStructure extends Document {
  name: string;
  nameHindi?: string;
  level: 'village' | 'block' | 'district' | 'haryana';
  amount: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMembershipCard extends Document {
  membershipId: mongoose.Types.ObjectId;
  cardNumber: string;
  memberName: string;
  memberPhoto?: string;
  validFrom: string;
  validUntil: string;
  cardImageUrl?: string;
  isGenerated: boolean;
  paymentStatus: 'pending' | 'paid' | 'approved';
  paymentAmount?: number;
  paymentDate?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPage extends Document {
  slug: string;
  title: string;
  titleHindi?: string;
  content: string;
  contentHindi?: string;
  metaDescription?: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVolunteerAccount extends Document {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  city?: string;
  photoUrl?: string;
  occupation?: string;
  skills?: string;
  availability?: string;
  isActive: boolean;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentTransaction extends Document {
  type: 'donation' | 'membership' | 'fee' | 'other';
  name: string;
  email?: string;
  phone: string;
  amount: number;
  transactionId: string;
  paymentMethod?: string;
  purpose?: string;
  status: 'pending' | 'approved' | 'rejected';
  membershipId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  photoUrl?: string;
  fatherName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  membershipLevel?: string;
  adminNotes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamMember extends Document {
  name: string;
  nameHindi?: string;
  designation: string;
  designationHindi?: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  bio?: string;
  bioHindi?: string;
  socialLinks?: any;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IService extends Document {
  name: string;
  nameHindi?: string;
  description: string;
  descriptionHindi?: string;
  iconKey?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGalleryImage extends Document {
  imageUrl: string;
  title: string;
  category: string;
  date?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvent extends Document {
  title: string;
  titleHindi?: string;
  description: string;
  descriptionHindi?: string;
  imageUrl: string;
  category: string;
  categoryHindi?: string;
  date: string;
  time: string;
  timeHindi?: string;
  location: string;
  locationHindi?: string;
  eventType: 'upcoming' | 'past';
  attendees?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface INews extends Document {
  title: string;
  titleHindi?: string;
  excerpt: string;
  excerptHindi?: string;
  content?: string;
  contentHindi?: string;
  imageUrl: string;
  category: string;
  categoryHindi?: string;
  source?: string;
  date: Date;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'student' | 'member';
  token: string;
  email: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface IMember extends Document {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  city?: string;
  membershipType: string;
  membershipNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  iCardId?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  membershipStartDate: Date;
  membershipExpiryDate: Date;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemberCard extends Document {
  memberId: mongoose.Types.ObjectId;
  membershipNumber: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberCity?: string;
  memberAddress?: string;
  cardNumber: string;
  qrCodeUrl?: string;
  cardImageUrl?: string;
  isGenerated: boolean;
  validFrom: string;
  validUntil: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactInfo extends Document {
  address?: string;
  phone?: string;
  email?: string;
  otherInformation?: string;
  mapEmbedUrl?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ITermsAndConditions extends Document {
  type: 'student' | 'membership' | 'donation' | 'general';
  titleEnglish: string;
  titleHindi?: string;
  contentEnglish: string;
  contentHindi?: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const StudentSchema = new Schema<IStudent>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: String,
  fatherName: String,
  motherName: String,
  address: String,
  city: String,
  state: { type: String, default: 'Haryana' },
  pincode: String,
  dateOfBirth: String,
  gender: String,
  photoUrl: String,
  class: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  rollNumber: String,
  feeLevel: { type: String, enum: ['village', 'block', 'district', 'haryana'], default: 'village' },
  feeAmount: { type: Number, default: 99 },
  feePaid: { type: Boolean, default: false },
  paymentDate: Date,
  isActive: { type: Boolean, default: true },
  registrationDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; } },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ResultSchema = new Schema<IResult>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  examName: { type: String, required: true },
  marksObtained: Number,
  totalMarks: { type: Number, default: 100 },
  grade: String,
  rank: Number,
  resultDate: String,
  remarks: String,
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const AdmitCardSchema = new Schema<IAdmitCard>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  examName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  termsEnglish: String,
  termsHindi: String,
  studentPhotoUrl: String,
  uploadedAt: { type: Date, default: Date.now }
});

const MembershipSchema = new Schema<IMembership>({
  userId: { type: Schema.Types.ObjectId, ref: 'Student' },
  memberName: { type: String, required: true },
  memberEmail: String,
  memberPhone: { type: String, required: true },
  memberAddress: String,
  membershipType: { type: String, default: 'regular' },
  membershipNumber: { type: String, unique: true, sparse: true },
  qrCodeUrl: String,
  upiId: String,
  isActive: { type: Boolean, default: true },
  validFrom: String,
  validUntil: String,
  createdAt: { type: Date, default: Date.now }
});

const MenuItemSchema = new Schema<IMenuItem>({
  title: { type: String, required: true },
  titleHindi: String,
  path: { type: String, required: true },
  iconKey: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  group: { type: String, default: 'main' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AdminSettingSchema = new Schema<IAdminSetting>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  labelHindi: String,
  description: String,
  type: { type: String, enum: ['boolean', 'string', 'number', 'json'], default: 'boolean' },
  category: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PaymentConfigSchema = new Schema<IPaymentConfig>({
  type: { type: String, enum: ['donation', 'fee', 'membership', 'general'], required: true },
  name: { type: String, required: true },
  nameHindi: String,
  qrCodeUrl: String,
  upiId: String,
  bankName: String,
  accountNumber: String,
  ifscCode: String,
  accountHolderName: String,
  level: { type: String, enum: ['village', 'block', 'district', 'haryana'] },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ContentSectionSchema = new Schema<IContentSection>({
  sectionKey: { type: String, enum: ['about', 'services', 'gallery', 'events', 'joinUs', 'contact', 'volunteer', 'team', 'home'], required: true },
  title: { type: String, required: true },
  titleHindi: String,
  content: { type: String, required: true },
  contentHindi: String,
  imageUrls: [String],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  metadata: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  city: String,
  occupation: String,
  skills: String,
  availability: String,
  message: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const FeeStructureSchema = new Schema<IFeeStructure>({
  name: { type: String, required: true },
  nameHindi: String,
  level: { type: String, enum: ['village', 'block', 'district', 'haryana'], required: true },
  amount: { type: Number, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MembershipCardSchema = new Schema<IMembershipCard>({
  membershipId: { type: Schema.Types.ObjectId, ref: 'Membership', required: true },
  cardNumber: { type: String, required: true, unique: true },
  memberName: { type: String, required: true },
  memberPhoto: String,
  validFrom: { type: String, required: true },
  validUntil: { type: String, required: true },
  cardImageUrl: String,
  isGenerated: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'approved'], default: 'pending' },
  paymentAmount: Number,
  paymentDate: Date,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PageSchema = new Schema<IPage>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  titleHindi: String,
  content: { type: String, required: true },
  contentHindi: String,
  metaDescription: String,
  isPublished: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ContactInquirySchema = new Schema<IContactInquiry>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'read', 'replied'], default: 'pending' },
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const VolunteerAccountSchema = new Schema<IVolunteerAccount>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  city: String,
  photoUrl: String,
  occupation: String,
  skills: String,
  availability: String,
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PaymentTransactionSchema = new Schema<IPaymentTransaction>({
  type: { type: String, enum: ['donation', 'membership', 'fee', 'other'], required: true },
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  paymentMethod: String,
  purpose: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  membershipId: { type: Schema.Types.ObjectId, ref: 'Membership' },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  photoUrl: String,
  fatherName: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  membershipLevel: String,
  adminNotes: String,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TeamMemberSchema = new Schema<ITeamMember>({
  name: { type: String, required: true },
  nameHindi: String,
  designation: { type: String, required: true },
  designationHindi: String,
  photoUrl: String,
  phone: String,
  email: String,
  bio: String,
  bioHindi: String,
  socialLinks: Schema.Types.Mixed,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ServiceSchema = new Schema<IService>({
  name: { type: String, required: true },
  nameHindi: String,
  description: { type: String, required: true },
  descriptionHindi: String,
  iconKey: String,
  imageUrl: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const GalleryImageSchema = new Schema<IGalleryImage>({
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  titleHindi: String,
  description: { type: String, required: true },
  descriptionHindi: String,
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  categoryHindi: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  timeHindi: String,
  location: { type: String, required: true },
  locationHindi: String,
  eventType: { type: String, enum: ['upcoming', 'past'], required: true },
  attendees: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const NewsSchema = new Schema<INews>({
  title: { type: String, required: true },
  titleHindi: String,
  excerpt: { type: String, required: true },
  excerptHindi: String,
  content: String,
  contentHindi: String,
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  categoryHindi: String,
  source: String,
  date: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: { type: Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['student', 'member'], required: true },
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ContactInfoSchema = new Schema<IContactInfo>({
  address: String,
  phone: String,
  email: String,
  otherInformation: String,
  mapEmbedUrl: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String,
    whatsapp: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TermsAndConditionsSchema = new Schema<ITermsAndConditions>({
  type: { type: String, enum: ['student', 'membership', 'donation', 'general'], required: true },
  titleEnglish: { type: String, required: true },
  titleHindi: String,
  contentEnglish: { type: String, required: true },
  contentHindi: String,
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MemberSchema = new Schema<IMember>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  city: String,
  membershipType: { type: String, default: 'regular' },
  membershipNumber: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  iCardId: { type: Schema.Types.ObjectId, ref: 'MemberCard' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
  membershipStartDate: { type: Date, default: Date.now },
  membershipExpiryDate: { type: Date, default: () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; } },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: Date,
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: Date,
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MemberCardSchema = new Schema<IMemberCard>({
  memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  membershipNumber: { type: String, required: true },
  memberName: { type: String, required: true },
  memberEmail: { type: String, required: true },
  memberPhone: { type: String, required: true },
  memberCity: String,
  memberAddress: String,
  cardNumber: { type: String, unique: true, required: true },
  qrCodeUrl: String,
  cardImageUrl: String,
  isGenerated: { type: Boolean, default: false },
  validFrom: { type: String, default: () => new Date().toISOString().split('T')[0] },
  validUntil: { type: String, default: () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
export const Student = mongoose.model<IStudent>('Student', StudentSchema);
export const Result = mongoose.model<IResult>('Result', ResultSchema);
export const AdmitCard = mongoose.model<IAdmitCard>('AdmitCard', AdmitCardSchema);
export const Membership = mongoose.model<IMembership>('Membership', MembershipSchema);
export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
export const AdminSetting = mongoose.model<IAdminSetting>('AdminSetting', AdminSettingSchema);
export const PaymentConfig = mongoose.model<IPaymentConfig>('PaymentConfig', PaymentConfigSchema);
export const ContentSection = mongoose.model<IContentSection>('ContentSection', ContentSectionSchema);
export const VolunteerApplication = mongoose.model<IVolunteerApplication>('VolunteerApplication', VolunteerApplicationSchema);
export const FeeStructure = mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);
export const MembershipCard = mongoose.model<IMembershipCard>('MembershipCard', MembershipCardSchema);
export const Page = mongoose.model<IPage>('Page', PageSchema);
export const ContactInquiry = mongoose.model<IContactInquiry>('ContactInquiry', ContactInquirySchema);
export const VolunteerAccount = mongoose.model<IVolunteerAccount>('VolunteerAccount', VolunteerAccountSchema);
export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);
export const TeamMember = mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
export const Service = mongoose.model<IService>('Service', ServiceSchema);
export const GalleryImage = mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
export const Event = mongoose.model<IEvent>('Event', EventSchema);
export const News = mongoose.model<INews>('News', NewsSchema);
export const PasswordResetToken = mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
export const Member = mongoose.model<IMember>('Member', MemberSchema);
export const MemberCard = mongoose.model<IMemberCard>('MemberCard', MemberCardSchema);
export const ContactInfo = mongoose.model<IContactInfo>('ContactInfo', ContactInfoSchema);
export const TermsAndConditions = mongoose.model<ITermsAndConditions>('TermsAndConditions', TermsAndConditionsSchema);
