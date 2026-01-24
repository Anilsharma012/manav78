import {
  Admin, Student, Result, AdmitCard as AdmitCardType, Membership, MenuItem, AdminSetting, PaymentConfig,
  ContentSection, VolunteerApplication, FeeStructure, MembershipCard, MemberCard, Page, ContactInquiry, ContactInfo, TermsAndConditions, News, Event,
  InsertAdmin, InsertStudent, InsertResult, InsertAdmitCard, InsertMembership,
  InsertMenuItem, InsertAdminSetting, InsertPaymentConfig, InsertContentSection,
  InsertVolunteerApplication, InsertFeeStructure, InsertMembershipCard, InsertMemberCard, InsertPage, InsertContactInquiry,
  InsertVolunteerAccount, InsertPaymentTransaction, InsertTeamMember, InsertService, InsertGalleryImage, InsertTermsAndConditions, InsertNews, InsertEvent
} from "@shared/schema";
import {
  Admin as AdminModel, Student as StudentModel, Result as ResultModel, AdmitCard as AdmitCardModel,
  Membership as MembershipModel, MenuItem as MenuItemModel, AdminSetting as AdminSettingModel,
  PaymentConfig as PaymentConfigModel, ContentSection as ContentSectionModel,
  VolunteerApplication as VolunteerApplicationModel, FeeStructure as FeeStructureModel,
  MembershipCard as MembershipCardModel, MemberCard as MemberCardModel, Page as PageModel, ContactInquiry as ContactInquiryModel,
  VolunteerAccount as VolunteerAccountModel, PaymentTransaction as PaymentTransactionModel,
  TeamMember as TeamMemberModel, Service as ServiceModel, GalleryImage as GalleryImageModel, ContactInfo as ContactInfoModel,
  TermsAndConditions as TermsAndConditionsModel, News as NewsModel, Event as EventModel
} from "./models";

function toPlain<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id?.toString() || obj.id;
  delete obj._id;
  delete obj.__v;
  
  // Handle nested populated documents
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object' && obj[key]._id) {
      obj[key].id = obj[key]._id?.toString() || obj[key].id;
      delete obj[key]._id;
      delete obj[key].__v;
    }
  }
  
  return obj as T;
}

function toPlainArray<T>(docs: any[]): T[] {
  return docs.map(doc => toPlain<T>(doc));
}

export interface IStorage {
  createAdmin(data: InsertAdmin): Promise<Admin>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminById(id: string): Promise<Admin | undefined>;

  createStudent(data: InsertStudent): Promise<Student>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  getStudentById(id: string): Promise<Student | undefined>;
  getStudentByRollNumber(rollNumber: string): Promise<Student | undefined>;
  getStudentByRegistrationNumber(registrationNumber: string): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  updateStudent(id: string, data: Partial<InsertStudent>): Promise<Student | undefined>;
  countStudentsWithRegPrefix(prefix: string): Promise<number>;
  countStudentsToday(): Promise<number>;
  countStudentsFeePaid(): Promise<number>;
  countActiveStudents(): Promise<number>;

  createResult(data: InsertResult): Promise<Result>;
  getResultsByStudentId(studentId: string, publishedOnly?: boolean): Promise<Result[]>;
  getAllResults(publishedOnly?: boolean): Promise<Result[]>;
  updateResult(id: string, data: Partial<InsertResult>): Promise<Result | undefined>;

  createAdmitCard(data: InsertAdmitCard): Promise<AdmitCardType>;
  getAdmitCardsByStudentId(studentId: string): Promise<AdmitCardType[]>;
  getAllAdmitCards(): Promise<AdmitCardType[]>;
  deleteAdmitCard(id: string): Promise<void>;

  createMembership(data: InsertMembership): Promise<Membership>;
  getMembershipByUserId(userId: string): Promise<Membership | undefined>;
  getAllMemberships(): Promise<Membership[]>;
  updateMembership(id: string, data: Partial<InsertMembership>): Promise<Membership | undefined>;
  countMemberships(): Promise<number>;

  createMenuItem(data: InsertMenuItem): Promise<MenuItem>;
  getActiveMenuItems(): Promise<MenuItem[]>;
  getAllMenuItems(): Promise<MenuItem[]>;
  updateMenuItem(id: string, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: string): Promise<void>;

  createAdminSetting(data: InsertAdminSetting): Promise<AdminSetting>;
  getAdminSettingByKey(key: string): Promise<AdminSetting | undefined>;
  getAllAdminSettings(): Promise<AdminSetting[]>;
  updateAdminSettingByKey(key: string, data: Partial<InsertAdminSetting>): Promise<AdminSetting | undefined>;

  createPaymentConfig(data: InsertPaymentConfig): Promise<PaymentConfig>;
  getPaymentConfigsByType(type: string): Promise<PaymentConfig[]>;
  getAllPaymentConfigs(): Promise<PaymentConfig[]>;
  updatePaymentConfig(id: string, data: Partial<InsertPaymentConfig>): Promise<PaymentConfig | undefined>;
  deletePaymentConfig(id: string): Promise<void>;

  createContentSection(data: InsertContentSection): Promise<ContentSection>;
  getContentSectionsByKey(key: string): Promise<ContentSection[]>;
  getAllContentSections(): Promise<ContentSection[]>;
  updateContentSection(id: string, data: Partial<InsertContentSection>): Promise<ContentSection | undefined>;
  deleteContentSection(id: string): Promise<void>;

  createVolunteerApplication(data: InsertVolunteerApplication): Promise<VolunteerApplication>;
  getAllVolunteerApplications(): Promise<VolunteerApplication[]>;
  updateVolunteerApplication(id: string, data: Partial<InsertVolunteerApplication>): Promise<VolunteerApplication | undefined>;

  createFeeStructure(data: InsertFeeStructure): Promise<FeeStructure>;
  getAllFeeStructures(): Promise<FeeStructure[]>;
  updateFeeStructure(id: string, data: Partial<InsertFeeStructure>): Promise<FeeStructure | undefined>;

  createMembershipCard(data: InsertMembershipCard): Promise<MembershipCard>;
  getMembershipCardByMembershipId(membershipId: string): Promise<MembershipCard | undefined>;
  getAllMembershipCards(): Promise<MembershipCard[]>;
  updateMembershipCard(id: string, data: Partial<InsertMembershipCard>): Promise<MembershipCard | undefined>;

  createMemberCard(data: InsertMemberCard): Promise<MemberCard>;
  getMemberCardByMemberId(memberId: string): Promise<MemberCard | undefined>;
  getMemberCardById(id: string): Promise<MemberCard | undefined>;
  updateMemberCard(id: string, data: Partial<InsertMemberCard>): Promise<MemberCard | undefined>;

  createPage(data: InsertPage): Promise<Page>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  getAllPages(): Promise<Page[]>;
  updatePage(id: string, data: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: string): Promise<void>;

  createContactInquiry(data: InsertContactInquiry): Promise<ContactInquiry>;
  getAllContactInquiries(): Promise<ContactInquiry[]>;
  updateContactInquiry(id: string, data: Partial<InsertContactInquiry>): Promise<ContactInquiry | undefined>;

  createVolunteerAccount(data: InsertVolunteerAccount): Promise<VolunteerAccount>;
  getVolunteerAccountByEmail(email: string): Promise<VolunteerAccount | undefined>;
  getVolunteerAccountById(id: string): Promise<VolunteerAccount | undefined>;
  getAllVolunteerAccounts(): Promise<VolunteerAccount[]>;
  updateVolunteerAccount(id: string, data: Partial<InsertVolunteerAccount>): Promise<VolunteerAccount | undefined>;

  createPaymentTransaction(data: InsertPaymentTransaction): Promise<PaymentTransaction>;
  getPaymentTransactionById(id: string): Promise<PaymentTransaction | undefined>;
  getPaymentTransactionByTransactionId(transactionId: string): Promise<PaymentTransaction | undefined>;
  getAllPaymentTransactions(): Promise<PaymentTransaction[]>;
  getPaymentTransactionsByType(type: string): Promise<PaymentTransaction[]>;
  getPaymentTransactionsByEmail(email: string): Promise<PaymentTransaction[]>;
  getPendingPaymentTransactions(): Promise<PaymentTransaction[]>;
  updatePaymentTransaction(id: string, data: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction | undefined>;

  createTeamMember(data: InsertTeamMember): Promise<TeamMember>;
  getAllTeamMembers(): Promise<TeamMember[]>;
  getActiveTeamMembers(): Promise<TeamMember[]>;
  updateTeamMember(id: string, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<void>;

  createService(data: InsertService): Promise<Service>;
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;

  createGalleryImage(data: InsertGalleryImage): Promise<GalleryImage>;
  getAllGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImagesByCategory(category: string): Promise<GalleryImage[]>;
  getActiveGalleryImages(): Promise<GalleryImage[]>;
  updateGalleryImage(id: string, data: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: string): Promise<void>;

  createEvent(data: InsertEvent): Promise<Event>;
  getEventById(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getActiveEvents(): Promise<Event[]>;
  getEventsByType(eventType: 'upcoming' | 'past'): Promise<Event[]>;
  updateEvent(id: string, data: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;

  createNews(data: InsertNews): Promise<News>;
  getNewsById(id: string): Promise<News | undefined>;
  getAllNews(): Promise<News[]>;
  getActiveNews(): Promise<News[]>;
  updateNews(id: string, data: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: string): Promise<void>;

  getContactInfo(): Promise<ContactInfo | undefined>;
  updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo | undefined>;

  createTermsAndConditions(data: InsertTermsAndConditions): Promise<TermsAndConditions>;
  getTermsAndConditionsByType(type: string): Promise<TermsAndConditions | undefined>;
  getAllTermsAndConditions(): Promise<TermsAndConditions[]>;
  updateTermsAndConditions(id: string, data: Partial<InsertTermsAndConditions>): Promise<TermsAndConditions | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createAdmin(data: InsertAdmin): Promise<Admin> {
    const admin = await AdminModel.create(data);
    return toPlain<Admin>(admin);
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const admin = await AdminModel.findOne({ email });
    return admin ? toPlain<Admin>(admin) : undefined;
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    const admin = await AdminModel.findById(id);
    return admin ? toPlain<Admin>(admin) : undefined;
  }

  async createStudent(data: InsertStudent): Promise<Student> {
    const student = await StudentModel.create(data);
    return toPlain<Student>(student);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const student = await StudentModel.findOne({ email });
    return student ? toPlain<Student>(student) : undefined;
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    const student = await StudentModel.findById(id);
    return student ? toPlain<Student>(student) : undefined;
  }

  async getStudentByRollNumber(rollNumber: string): Promise<Student | undefined> {
    const student = await StudentModel.findOne({ rollNumber });
    return student ? toPlain<Student>(student) : undefined;
  }

  async getStudentByRegistrationNumber(registrationNumber: string): Promise<Student | undefined> {
    const student = await StudentModel.findOne({ registrationNumber });
    return student ? toPlain<Student>(student) : undefined;
  }

  async getAllStudents(): Promise<Student[]> {
    const students = await StudentModel.find().sort({ createdAt: -1 });
    return toPlainArray<Student>(students);
  }

  async updateStudent(id: string, data: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = await StudentModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return student ? toPlain<Student>(student) : undefined;
  }

  async countStudentsWithRegPrefix(prefix: string): Promise<number> {
    return await StudentModel.countDocuments({ registrationNumber: { $regex: `^${prefix}` } });
  }

  async countStudentsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await StudentModel.countDocuments({ createdAt: { $gte: today } });
  }

  async countStudentsFeePaid(): Promise<number> {
    return await StudentModel.countDocuments({ feePaid: true });
  }

  async countActiveStudents(): Promise<number> {
    return await StudentModel.countDocuments({ isActive: true });
  }

  async createResult(data: InsertResult): Promise<Result> {
    const result = await ResultModel.create(data);
    return toPlain<Result>(result);
  }

  async getResultsByStudentId(studentId: string, publishedOnly = false): Promise<Result[]> {
    const query: any = { studentId };
    if (publishedOnly) query.isPublished = true;
    const results = await ResultModel.find(query).sort({ createdAt: -1 });
    return toPlainArray<Result>(results);
  }

  async getAllResults(publishedOnly = false): Promise<Result[]> {
    const query = publishedOnly ? { isPublished: true } : {};
    const results = await ResultModel.find(query).sort({ createdAt: -1 });
    return toPlainArray<Result>(results);
  }

  async updateResult(id: string, data: Partial<InsertResult>): Promise<Result | undefined> {
    const result = await ResultModel.findByIdAndUpdate(id, data, { new: true });
    return result ? toPlain<Result>(result) : undefined;
  }

  async createAdmitCard(data: InsertAdmitCard): Promise<AdmitCardType> {
    // Check if admit card already exists for this student (one student = one admit card only)
    const existing = await AdmitCardModel.findOne({ studentId: data.studentId });
    if (existing) {
      // Update existing admit card with new data instead of creating duplicate
      const updated = await AdmitCardModel.findByIdAndUpdate(existing._id, data, { new: true });
      return toPlain<AdmitCardType>(updated || existing);
    }
    const admitCard = await AdmitCardModel.create(data);
    return toPlain<AdmitCardType>(admitCard);
  }

  async getAdmitCardsByStudentId(studentId: string): Promise<AdmitCardType[]> {
    const admitCards = await AdmitCardModel.find({ studentId }).populate('studentId').sort({ uploadedAt: -1 });
    return toPlainArray<AdmitCardType>(admitCards);
  }

  async getAllAdmitCards(): Promise<AdmitCardType[]> {
    const admitCards = await AdmitCardModel.find().populate('studentId').sort({ uploadedAt: -1 });
    return toPlainArray<AdmitCardType>(admitCards);
  }

  async deleteAdmitCard(id: string): Promise<void> {
    await AdmitCardModel.findByIdAndDelete(id);
  }

  async createMembership(data: InsertMembership): Promise<Membership> {
    const membership = await MembershipModel.create(data);
    return toPlain<Membership>(membership);
  }

  async getMembershipByUserId(userId: string): Promise<Membership | undefined> {
    const membership = await MembershipModel.findOne({ userId });
    return membership ? toPlain<Membership>(membership) : undefined;
  }

  async getAllMemberships(): Promise<Membership[]> {
    const memberships = await MembershipModel.find().sort({ createdAt: -1 });
    return toPlainArray<Membership>(memberships);
  }

  async updateMembership(id: string, data: Partial<InsertMembership>): Promise<Membership | undefined> {
    const membership = await MembershipModel.findByIdAndUpdate(id, data, { new: true });
    return membership ? toPlain<Membership>(membership) : undefined;
  }

  async countMemberships(): Promise<number> {
    return await MembershipModel.countDocuments();
  }

  async createMenuItem(data: InsertMenuItem): Promise<MenuItem> {
    const item = await MenuItemModel.create(data);
    return toPlain<MenuItem>(item);
  }

  async getActiveMenuItems(): Promise<MenuItem[]> {
    const items = await MenuItemModel.find({ isActive: true }).sort({ order: 1 });
    return toPlainArray<MenuItem>(items);
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    const items = await MenuItemModel.find().sort({ order: 1 });
    return toPlainArray<MenuItem>(items);
  }

  async updateMenuItem(id: string, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const item = await MenuItemModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return item ? toPlain<MenuItem>(item) : undefined;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await MenuItemModel.findByIdAndDelete(id);
  }

  async createAdminSetting(data: InsertAdminSetting): Promise<AdminSetting> {
    const setting = await AdminSettingModel.create(data);
    return toPlain<AdminSetting>(setting);
  }

  async getAdminSettingByKey(key: string): Promise<AdminSetting | undefined> {
    const setting = await AdminSettingModel.findOne({ key });
    return setting ? toPlain<AdminSetting>(setting) : undefined;
  }

  async getAllAdminSettings(): Promise<AdminSetting[]> {
    const settings = await AdminSettingModel.find().sort({ category: 1, key: 1 });
    return toPlainArray<AdminSetting>(settings);
  }

  async updateAdminSettingByKey(key: string, data: Partial<InsertAdminSetting>): Promise<AdminSetting | undefined> {
    const existing = await AdminSettingModel.findOne({ key });
    if (!existing) {
      const setting = await AdminSettingModel.create({ ...data, key, value: data.value || "", label: data.label || key });
      return toPlain<AdminSetting>(setting);
    }
    const setting = await AdminSettingModel.findOneAndUpdate({ key }, { ...data, updatedAt: new Date() }, { new: true });
    return setting ? toPlain<AdminSetting>(setting) : undefined;
  }

  async createPaymentConfig(data: InsertPaymentConfig): Promise<PaymentConfig> {
    const config = await PaymentConfigModel.create(data);
    return toPlain<PaymentConfig>(config);
  }

  async getPaymentConfigsByType(type: string): Promise<PaymentConfig[]> {
    const configs = await PaymentConfigModel.find({ type, isActive: true }).sort({ order: 1 });
    return toPlainArray<PaymentConfig>(configs);
  }

  async getAllPaymentConfigs(): Promise<PaymentConfig[]> {
    const configs = await PaymentConfigModel.find().sort({ type: 1, order: 1 });
    return toPlainArray<PaymentConfig>(configs);
  }

  async updatePaymentConfig(id: string, data: Partial<InsertPaymentConfig>): Promise<PaymentConfig | undefined> {
    const config = await PaymentConfigModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return config ? toPlain<PaymentConfig>(config) : undefined;
  }

  async deletePaymentConfig(id: string): Promise<void> {
    await PaymentConfigModel.findByIdAndDelete(id);
  }

  async createContentSection(data: InsertContentSection): Promise<ContentSection> {
    const section = await ContentSectionModel.create(data);
    return toPlain<ContentSection>(section);
  }

  async getContentSectionsByKey(key: string): Promise<ContentSection[]> {
    const sections = await ContentSectionModel.find({ sectionKey: key, isActive: true }).sort({ order: 1 });
    return toPlainArray<ContentSection>(sections);
  }

  async getAllContentSections(): Promise<ContentSection[]> {
    const sections = await ContentSectionModel.find().sort({ sectionKey: 1, order: 1 });
    return toPlainArray<ContentSection>(sections);
  }

  async updateContentSection(id: string, data: Partial<InsertContentSection>): Promise<ContentSection | undefined> {
    const section = await ContentSectionModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return section ? toPlain<ContentSection>(section) : undefined;
  }

  async deleteContentSection(id: string): Promise<void> {
    await ContentSectionModel.findByIdAndDelete(id);
  }

  async createVolunteerApplication(data: InsertVolunteerApplication): Promise<VolunteerApplication> {
    const app = await VolunteerApplicationModel.create(data);
    return toPlain<VolunteerApplication>(app);
  }

  async getAllVolunteerApplications(): Promise<VolunteerApplication[]> {
    const apps = await VolunteerApplicationModel.find().sort({ createdAt: -1 });
    return toPlainArray<VolunteerApplication>(apps);
  }

  async updateVolunteerApplication(id: string, data: Partial<InsertVolunteerApplication>): Promise<VolunteerApplication | undefined> {
    const app = await VolunteerApplicationModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return app ? toPlain<VolunteerApplication>(app) : undefined;
  }

  async createFeeStructure(data: InsertFeeStructure): Promise<FeeStructure> {
    const fee = await FeeStructureModel.create(data);
    return toPlain<FeeStructure>(fee);
  }

  async getAllFeeStructures(): Promise<FeeStructure[]> {
    const fees = await FeeStructureModel.find().sort({ level: 1 });
    return toPlainArray<FeeStructure>(fees);
  }

  async updateFeeStructure(id: string, data: Partial<InsertFeeStructure>): Promise<FeeStructure | undefined> {
    const fee = await FeeStructureModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return fee ? toPlain<FeeStructure>(fee) : undefined;
  }

  async createMembershipCard(data: InsertMembershipCard): Promise<MembershipCard> {
    const card = await MembershipCardModel.create(data);
    return toPlain<MembershipCard>(card);
  }

  async getMembershipCardByMembershipId(membershipId: string): Promise<MembershipCard | undefined> {
    const card = await MembershipCardModel.findOne({ membershipId });
    return card ? toPlain<MembershipCard>(card) : undefined;
  }

  async getAllMembershipCards(): Promise<MembershipCard[]> {
    const cards = await MembershipCardModel.find().sort({ createdAt: -1 });
    return toPlainArray<MembershipCard>(cards);
  }

  async updateMembershipCard(id: string, data: Partial<InsertMembershipCard>): Promise<MembershipCard | undefined> {
    const card = await MembershipCardModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return card ? toPlain<MembershipCard>(card) : undefined;
  }

  async createMemberCard(data: InsertMemberCard): Promise<MemberCard> {
    const card = await MemberCardModel.create(data);
    return toPlain<MemberCard>(card);
  }

  async getMemberCardByMemberId(memberId: string): Promise<MemberCard | undefined> {
    const card = await MemberCardModel.findOne({ memberId });
    return card ? toPlain<MemberCard>(card) : undefined;
  }

  async getMemberCardById(id: string): Promise<MemberCard | undefined> {
    const card = await MemberCardModel.findById(id);
    return card ? toPlain<MemberCard>(card) : undefined;
  }

  async updateMemberCard(id: string, data: Partial<InsertMemberCard>): Promise<MemberCard | undefined> {
    const card = await MemberCardModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return card ? toPlain<MemberCard>(card) : undefined;
  }

  async createPage(data: InsertPage): Promise<Page> {
    const page = await PageModel.create(data);
    return toPlain<Page>(page);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const page = await PageModel.findOne({ slug });
    return page ? toPlain<Page>(page) : undefined;
  }

  async getAllPages(): Promise<Page[]> {
    const pages = await PageModel.find().sort({ order: 1 });
    return toPlainArray<Page>(pages);
  }

  async updatePage(id: string, data: Partial<InsertPage>): Promise<Page | undefined> {
    const page = await PageModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return page ? toPlain<Page>(page) : undefined;
  }

  async deletePage(id: string): Promise<void> {
    await PageModel.findByIdAndDelete(id);
  }

  async createContactInquiry(data: InsertContactInquiry): Promise<ContactInquiry> {
    const inquiry = await ContactInquiryModel.create(data);
    return toPlain<ContactInquiry>(inquiry);
  }

  async getAllContactInquiries(): Promise<ContactInquiry[]> {
    const inquiries = await ContactInquiryModel.find().sort({ createdAt: -1 });
    return toPlainArray<ContactInquiry>(inquiries);
  }

  async updateContactInquiry(id: string, data: Partial<InsertContactInquiry>): Promise<ContactInquiry | undefined> {
    const inquiry = await ContactInquiryModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return inquiry ? toPlain<ContactInquiry>(inquiry) : undefined;
  }

  async createVolunteerAccount(data: InsertVolunteerAccount): Promise<VolunteerAccount> {
    const account = await VolunteerAccountModel.create(data);
    return toPlain<VolunteerAccount>(account);
  }

  async getVolunteerAccountByEmail(email: string): Promise<VolunteerAccount | undefined> {
    const account = await VolunteerAccountModel.findOne({ email });
    return account ? toPlain<VolunteerAccount>(account) : undefined;
  }

  async getVolunteerAccountById(id: string): Promise<VolunteerAccount | undefined> {
    const account = await VolunteerAccountModel.findById(id);
    return account ? toPlain<VolunteerAccount>(account) : undefined;
  }

  async getAllVolunteerAccounts(): Promise<VolunteerAccount[]> {
    const accounts = await VolunteerAccountModel.find().sort({ createdAt: -1 });
    return toPlainArray<VolunteerAccount>(accounts);
  }

  async updateVolunteerAccount(id: string, data: Partial<InsertVolunteerAccount>): Promise<VolunteerAccount | undefined> {
    const account = await VolunteerAccountModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return account ? toPlain<VolunteerAccount>(account) : undefined;
  }

  async deleteVolunteerAccount(id: string): Promise<void> {
    await VolunteerAccountModel.findByIdAndDelete(id);
  }

  async createPaymentTransaction(data: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const transaction = await PaymentTransactionModel.create(data);
    return toPlain<PaymentTransaction>(transaction);
  }

  async getPaymentTransactionById(id: string): Promise<PaymentTransaction | undefined> {
    const transaction = await PaymentTransactionModel.findById(id);
    return transaction ? toPlain<PaymentTransaction>(transaction) : undefined;
  }

  async getPaymentTransactionByTransactionId(transactionId: string): Promise<PaymentTransaction | undefined> {
    const transaction = await PaymentTransactionModel.findOne({ transactionId });
    return transaction ? toPlain<PaymentTransaction>(transaction) : undefined;
  }

  async getAllPaymentTransactions(): Promise<PaymentTransaction[]> {
    const transactions = await PaymentTransactionModel.find().sort({ createdAt: -1 });
    return toPlainArray<PaymentTransaction>(transactions);
  }

  async getPaymentTransactionsByType(type: string): Promise<PaymentTransaction[]> {
    const transactions = await PaymentTransactionModel.find({ type }).sort({ createdAt: -1 });
    return toPlainArray<PaymentTransaction>(transactions);
  }

  async getPaymentTransactionsByEmail(email: string): Promise<PaymentTransaction[]> {
    const transactions = await PaymentTransactionModel.find({ email }).sort({ createdAt: -1 });
    return toPlainArray<PaymentTransaction>(transactions);
  }

  async getPendingPaymentTransactions(): Promise<PaymentTransaction[]> {
    const transactions = await PaymentTransactionModel.find({ status: "pending" }).sort({ createdAt: -1 });
    return toPlainArray<PaymentTransaction>(transactions);
  }

  async updatePaymentTransaction(id: string, data: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction | undefined> {
    const transaction = await PaymentTransactionModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return transaction ? toPlain<PaymentTransaction>(transaction) : undefined;
  }

  async createTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const member = await TeamMemberModel.create(data);
    return toPlain<TeamMember>(member);
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    const members = await TeamMemberModel.find().sort({ order: 1 });
    return toPlainArray<TeamMember>(members);
  }

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    const members = await TeamMemberModel.find({ isActive: true }).sort({ order: 1 });
    return toPlainArray<TeamMember>(members);
  }

  async updateTeamMember(id: string, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const member = await TeamMemberModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return member ? toPlain<TeamMember>(member) : undefined;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await TeamMemberModel.findByIdAndDelete(id);
  }

  async createService(data: InsertService): Promise<Service> {
    const service = await ServiceModel.create(data);
    return toPlain<Service>(service);
  }

  async getAllServices(): Promise<Service[]> {
    const services = await ServiceModel.find().sort({ order: 1 });
    return toPlainArray<Service>(services);
  }

  async getActiveServices(): Promise<Service[]> {
    const services = await ServiceModel.find({ isActive: true }).sort({ order: 1 });
    return toPlainArray<Service>(services);
  }

  async updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined> {
    const service = await ServiceModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return service ? toPlain<Service>(service) : undefined;
  }

  async deleteService(id: string): Promise<void> {
    await ServiceModel.findByIdAndDelete(id);
  }

  async createGalleryImage(data: InsertGalleryImage): Promise<GalleryImage> {
    const image = await GalleryImageModel.create(data);
    return toPlain<GalleryImage>(image);
  }

  async getAllGalleryImages(): Promise<GalleryImage[]> {
    const images = await GalleryImageModel.find().sort({ order: 1 });
    return toPlainArray<GalleryImage>(images);
  }

  async getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
    const images = await GalleryImageModel.find({ category }).sort({ order: 1 });
    return toPlainArray<GalleryImage>(images);
  }

  async getActiveGalleryImages(): Promise<GalleryImage[]> {
    const images = await GalleryImageModel.find({ isActive: true }).sort({ order: 1 });
    return toPlainArray<GalleryImage>(images);
  }

  async updateGalleryImage(id: string, data: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const image = await GalleryImageModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return image ? toPlain<GalleryImage>(image) : undefined;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    await GalleryImageModel.findByIdAndDelete(id);
  }

  async createEvent(data: InsertEvent): Promise<Event> {
    const event = await EventModel.create(data);
    return toPlain<Event>(event);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const event = await EventModel.findById(id);
    return event ? toPlain<Event>(event) : undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    const events = await EventModel.find().sort({ date: 1, order: 1 });
    return toPlainArray<Event>(events);
  }

  async getActiveEvents(): Promise<Event[]> {
    const events = await EventModel.find({ isActive: true }).sort({ date: 1, order: 1 });
    return toPlainArray<Event>(events);
  }

  async getEventsByType(eventType: 'upcoming' | 'past'): Promise<Event[]> {
    const events = await EventModel.find({ eventType, isActive: true }).sort({ date: eventType === 'upcoming' ? 1 : -1, order: 1 });
    return toPlainArray<Event>(events);
  }

  async updateEvent(id: string, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await EventModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return event ? toPlain<Event>(event) : undefined;
  }

  async deleteEvent(id: string): Promise<void> {
    await EventModel.findByIdAndDelete(id);
  }

  async createNews(data: InsertNews): Promise<News> {
    const news = await NewsModel.create(data);
    return toPlain<News>(news);
  }

  async getNewsById(id: string): Promise<News | undefined> {
    const news = await NewsModel.findById(id);
    return news ? toPlain<News>(news) : undefined;
  }

  async getAllNews(): Promise<News[]> {
    const news = await NewsModel.find().sort({ date: -1, order: 1 });
    return toPlainArray<News>(news);
  }

  async getActiveNews(): Promise<News[]> {
    const news = await NewsModel.find({ isActive: true }).sort({ date: -1, order: 1 });
    return toPlainArray<News>(news);
  }

  async updateNews(id: string, data: Partial<InsertNews>): Promise<News | undefined> {
    const news = await NewsModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return news ? toPlain<News>(news) : undefined;
  }

  async deleteNews(id: string): Promise<void> {
    await NewsModel.findByIdAndDelete(id);
  }

  async getContactInfo(): Promise<ContactInfo | undefined> {
    const contactInfo = await ContactInfoModel.findOne().sort({ createdAt: -1 });
    return contactInfo ? toPlain<ContactInfo>(contactInfo) : undefined;
  }

  async updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo | undefined> {
    let contactInfo = await ContactInfoModel.findOne();
    if (!contactInfo) {
      contactInfo = await ContactInfoModel.create(data);
    } else {
      contactInfo = await ContactInfoModel.findByIdAndUpdate(contactInfo._id, { ...data, updatedAt: new Date() }, { new: true });
    }
    return contactInfo ? toPlain<ContactInfo>(contactInfo) : undefined;
  }

  async createTermsAndConditions(data: InsertTermsAndConditions): Promise<TermsAndConditions> {
    const termsAndConditions = await TermsAndConditionsModel.create(data);
    return toPlain<TermsAndConditions>(termsAndConditions);
  }

  async getTermsAndConditionsByType(type: string): Promise<TermsAndConditions | undefined> {
    const tac = await TermsAndConditionsModel.findOne({ type, isActive: true }).sort({ version: -1 });
    return tac ? toPlain<TermsAndConditions>(tac) : undefined;
  }

  async getAllTermsAndConditions(): Promise<TermsAndConditions[]> {
    const tac = await TermsAndConditionsModel.find().sort({ type: 1, version: -1 });
    return toPlainArray<TermsAndConditions>(tac);
  }

  async updateTermsAndConditions(id: string, data: Partial<InsertTermsAndConditions>): Promise<TermsAndConditions | undefined> {
    const tac = await TermsAndConditionsModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    return tac ? toPlain<TermsAndConditions>(tac) : undefined;
  }
}

export const storage = new DatabaseStorage();
