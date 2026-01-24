import { z } from "zod";

export type FeeLevel = 'village' | 'block' | 'district' | 'haryana';
export type Status = 'pending' | 'approved' | 'rejected';
export type InquiryStatus = 'pending' | 'read' | 'replied';
export type PaymentStatus = 'pending' | 'paid' | 'approved';
export type PaymentType = 'donation' | 'fee' | 'membership' | 'general';
export type SettingType = 'boolean' | 'string' | 'number' | 'json';
export type SectionKey = 'about' | 'services' | 'gallery' | 'events' | 'joinUs' | 'contact' | 'volunteer' | 'team' | 'home';
export type TransactionType = 'donation' | 'membership' | 'fee' | 'other';

export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface Student {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  photoUrl?: string | null;
  class: string;
  registrationNumber: string;
  rollNumber?: string | null;
  feeLevel: FeeLevel;
  feeAmount: number;
  feePaid: boolean;
  paymentDate?: Date | null;
  isActive: boolean;
  registrationDate: Date;
  expiryDate: Date;
  termsAccepted: boolean;
  termsAcceptedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Result {
  id: string;
  studentId: string;
  examName: string;
  marksObtained?: number | null;
  totalMarks: number;
  grade?: string | null;
  rank?: number | null;
  resultDate?: string | null;
  remarks?: string | null;
  isPublished: boolean;
  createdAt: Date;
}

export interface AdmitCard {
  id: string;
  studentId: string;
  examName: string;
  fileUrl: string;
  fileName: string;
  termsEnglish?: string | null;
  termsHindi?: string | null;
  studentPhotoUrl?: string | null;
  uploadedAt: Date;
}

export interface Membership {
  id: string;
  userId?: string | null;
  memberName: string;
  memberEmail?: string | null;
  memberPhone: string;
  memberAddress?: string | null;
  membershipType: string;
  membershipNumber?: string | null;
  qrCodeUrl?: string | null;
  upiId?: string | null;
  isActive: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  title: string;
  titleHindi?: string | null;
  path: string;
  iconKey: string;
  order: number;
  isActive: boolean;
  group?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  labelHindi?: string | null;
  description?: string | null;
  type: SettingType;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentConfig {
  id: string;
  type: PaymentType;
  name: string;
  nameHindi?: string | null;
  qrCodeUrl?: string | null;
  upiId?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountHolderName?: string | null;
  level?: FeeLevel | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentSection {
  id: string;
  sectionKey: SectionKey;
  title: string;
  titleHindi?: string | null;
  content: string;
  contentHindi?: string | null;
  imageUrls?: string[] | null;
  isActive: boolean;
  order: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  occupation?: string | null;
  skills?: string | null;
  availability?: string | null;
  message?: string | null;
  status: Status;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeeStructure {
  id: string;
  name: string;
  nameHindi?: string | null;
  level: FeeLevel;
  amount: number;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipCard {
  id: string;
  membershipId: string;
  cardNumber: string;
  memberName: string;
  memberPhoto?: string | null;
  validFrom: string;
  validUntil: string;
  cardImageUrl?: string | null;
  isGenerated: boolean;
  paymentStatus: PaymentStatus;
  paymentAmount?: number | null;
  paymentDate?: Date | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberCard {
  id: string;
  memberId: string;
  membershipNumber: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberCity?: string | null;
  memberAddress?: string | null;
  cardNumber: string;
  qrCodeUrl?: string | null;
  cardImageUrl?: string | null;
  isGenerated: boolean;
  validFrom: string;
  validUntil: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  titleHindi?: string | null;
  content: string;
  contentHindi?: string | null;
  metaDescription?: string | null;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  photoUrl?: string | null;
  occupation?: string | null;
  skills?: string | null;
  availability?: string | null;
  isActive: boolean;
  isApproved: boolean;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  type: TransactionType;
  name: string;
  email?: string | null;
  phone: string;
  amount: number;
  transactionId: string;
  paymentMethod?: string | null;
  purpose?: string | null;
  status: Status;
  membershipId?: string | null;
  studentId?: string | null;
  photoUrl?: string | null;
  fatherName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  membershipLevel?: string | null;
  adminNotes?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  nameHindi?: string | null;
  designation: string;
  designationHindi?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  bioHindi?: string | null;
  socialLinks?: any;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  nameHindi?: string | null;
  description: string;
  descriptionHindi?: string | null;
  iconKey?: string | null;
  imageUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  date?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  id: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  otherInformation?: string | null;
  mapEmbedUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TermsAndConditions {
  id: string;
  type: 'student' | 'membership' | 'donation' | 'general';
  titleEnglish: string;
  titleHindi?: string | null;
  contentEnglish: string;
  contentHindi?: string | null;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  titleHindi?: string | null;
  description: string;
  descriptionHindi?: string | null;
  imageUrl: string;
  category: string;
  categoryHindi?: string | null;
  date: string;
  time: string;
  timeHindi?: string | null;
  location: string;
  locationHindi?: string | null;
  eventType: 'upcoming' | 'past';
  attendees?: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  titleHindi?: string | null;
  excerpt: string;
  excerptHindi?: string | null;
  content?: string | null;
  contentHindi?: string | null;
  imageUrl: string;
  category: string;
  categoryHindi?: string | null;
  source?: string | null;
  date: Date;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export const insertAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const insertStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  photoUrl: z.string().optional(),
  class: z.string(),
  registrationNumber: z.string(),
  rollNumber: z.string().optional(),
  feeLevel: z.enum(['village', 'block', 'district', 'haryana']).optional(),
  feeAmount: z.number().optional(),
  feePaid: z.boolean().optional(),
  isActive: z.boolean().optional(),
  registrationDate: z.date().optional(),
  expiryDate: z.date().optional(),
  termsAccepted: z.boolean().optional(),
  termsAcceptedAt: z.date().optional(),
});

export const insertResultSchema = z.object({
  studentId: z.string(),
  examName: z.string(),
  marksObtained: z.number().optional(),
  totalMarks: z.number().optional(),
  grade: z.string().optional(),
  rank: z.number().optional(),
  resultDate: z.string().optional(),
  remarks: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const insertAdmitCardSchema = z.object({
  studentId: z.string(),
  examName: z.string(),
  fileUrl: z.string(),
  fileName: z.string(),
  termsEnglish: z.string().optional(),
  termsHindi: z.string().optional(),
  studentPhotoUrl: z.string().optional(),
});

export const insertMembershipSchema = z.object({
  userId: z.string().optional(),
  memberName: z.string(),
  memberEmail: z.string().optional(),
  memberPhone: z.string(),
  memberAddress: z.string().optional(),
  membershipType: z.string().optional(),
  membershipNumber: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  upiId: z.string().optional(),
  isActive: z.boolean().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

export const insertMenuItemSchema = z.object({
  title: z.string(),
  titleHindi: z.string().optional(),
  path: z.string(),
  iconKey: z.string(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  group: z.string().optional(),
});

export const insertAdminSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
  label: z.string(),
  labelHindi: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['boolean', 'string', 'number', 'json']).optional(),
  category: z.string().optional(),
});

export const insertPaymentConfigSchema = z.object({
  type: z.enum(['donation', 'fee', 'membership', 'general']),
  name: z.string(),
  nameHindi: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  upiId: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  accountHolderName: z.string().optional(),
  level: z.enum(['village', 'block', 'district', 'haryana']).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

export const insertContentSectionSchema = z.object({
  sectionKey: z.enum(['about', 'services', 'gallery', 'events', 'joinUs', 'contact', 'volunteer', 'team', 'home']),
  title: z.string(),
  titleHindi: z.string().optional(),
  content: z.string(),
  contentHindi: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
  metadata: z.any().optional(),
});

export const insertVolunteerApplicationSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  occupation: z.string().optional(),
  skills: z.string().optional(),
  availability: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  adminNotes: z.string().optional(),
});

export const insertFeeStructureSchema = z.object({
  name: z.string(),
  nameHindi: z.string().optional(),
  level: z.enum(['village', 'block', 'district', 'haryana']),
  amount: z.number(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const insertMembershipCardSchema = z.object({
  membershipId: z.string(),
  cardNumber: z.string(),
  memberName: z.string(),
  memberPhoto: z.string().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  cardImageUrl: z.string().optional(),
  isGenerated: z.boolean().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'approved']).optional(),
  paymentAmount: z.number().optional(),
});

export const insertMemberCardSchema = z.object({
  memberId: z.string(),
  membershipNumber: z.string(),
  memberName: z.string(),
  memberEmail: z.string().email(),
  memberPhone: z.string(),
  memberCity: z.string().optional(),
  memberAddress: z.string().optional(),
  cardNumber: z.string(),
  qrCodeUrl: z.string().optional(),
  cardImageUrl: z.string().optional(),
  isGenerated: z.boolean().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

export const insertPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  titleHindi: z.string().optional(),
  content: z.string(),
  contentHindi: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
});

export const insertContactInquirySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string(),
  message: z.string(),
  status: z.enum(['pending', 'read', 'replied']).optional(),
  adminNotes: z.string().optional(),
});

export const insertVolunteerAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string(),
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  photoUrl: z.string().optional(),
  occupation: z.string().optional(),
  skills: z.string().optional(),
  availability: z.string().optional(),
  isActive: z.boolean().optional(),
  isApproved: z.boolean().optional(),
});

export const insertPaymentTransactionSchema = z.object({
  type: z.enum(['donation', 'membership', 'fee', 'other']),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string(),
  amount: z.number(),
  transactionId: z.string(),
  paymentMethod: z.string().optional(),
  purpose: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  membershipId: z.string().optional(),
  studentId: z.string().optional(),
  photoUrl: z.string().optional(),
  fatherName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  membershipLevel: z.string().optional(),
  adminNotes: z.string().optional(),
});

export const insertTeamMemberSchema = z.object({
  name: z.string(),
  nameHindi: z.string().optional(),
  designation: z.string(),
  designationHindi: z.string().optional(),
  photoUrl: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  bio: z.string().optional(),
  bioHindi: z.string().optional(),
  socialLinks: z.any().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const insertServiceSchema = z.object({
  name: z.string(),
  nameHindi: z.string().optional(),
  description: z.string(),
  descriptionHindi: z.string().optional(),
  iconKey: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const insertGalleryImageSchema = z.object({
  imageUrl: z.string(),
  title: z.string(),
  category: z.string(),
  date: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const insertContactInfoSchema = z.object({
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  otherInformation: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
});

export const insertTermsAndConditionsSchema = z.object({
  type: z.enum(['student', 'membership', 'donation', 'general']),
  titleEnglish: z.string(),
  titleHindi: z.string().optional(),
  contentEnglish: z.string(),
  contentHindi: z.string().optional(),
  version: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const insertEventSchema = z.object({
  title: z.string(),
  titleHindi: z.string().optional(),
  description: z.string(),
  descriptionHindi: z.string().optional(),
  imageUrl: z.string(),
  category: z.string(),
  categoryHindi: z.string().optional(),
  date: z.string(),
  time: z.string(),
  timeHindi: z.string().optional(),
  location: z.string(),
  locationHindi: z.string().optional(),
  eventType: z.enum(['upcoming', 'past']),
  attendees: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

export const insertNewsSchema = z.object({
  title: z.string(),
  titleHindi: z.string().optional(),
  excerpt: z.string(),
  excerptHindi: z.string().optional(),
  content: z.string().optional(),
  contentHindi: z.string().optional(),
  imageUrl: z.string(),
  category: z.string(),
  categoryHindi: z.string().optional(),
  source: z.string().optional(),
  date: z.date().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type InsertAdmitCard = z.infer<typeof insertAdmitCardSchema>;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type InsertPaymentConfig = z.infer<typeof insertPaymentConfigSchema>;
export type InsertContentSection = z.infer<typeof insertContentSectionSchema>;
export type InsertVolunteerApplication = z.infer<typeof insertVolunteerApplicationSchema>;
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;
export type InsertMembershipCard = z.infer<typeof insertMembershipCardSchema>;
export type InsertMemberCard = z.infer<typeof insertMemberCardSchema>;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;
export type InsertVolunteerAccount = z.infer<typeof insertVolunteerAccountSchema>;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;
export type InsertTermsAndConditions = z.infer<typeof insertTermsAndConditionsSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
