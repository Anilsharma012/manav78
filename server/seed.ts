import bcrypt from "bcryptjs";
import { storage } from "./storage";

const defaultMenuItems = [
  { title: "Dashboard", titleHindi: "डैशबोर्ड", path: "/admin/dashboard", iconKey: "LayoutDashboard", order: 1, group: "main" },
  { title: "Students", titleHindi: "छात्र", path: "/admin/students", iconKey: "GraduationCap", order: 2, group: "main" },
  { title: "Members", titleHindi: "सदस्य", path: "/admin/members", iconKey: "Users", order: 2.5, group: "main" },
  { title: "Roll Numbers", titleHindi: "रोल नंबर", path: "/admin/roll-numbers", iconKey: "FileText", order: 3, group: "main" },
  { title: "Results", titleHindi: "परिणाम", path: "/admin/results", iconKey: "Award", order: 4, group: "main" },
  { title: "Admit Cards", titleHindi: "प्रवेश पत्र", path: "/admin/admit-cards", iconKey: "IdCard", order: 5, group: "main" },
  { title: "Fees", titleHindi: "शुल्क", path: "/admin/fees", iconKey: "CreditCard", order: 6, group: "main" },
  { title: "Memberships", titleHindi: "सदस्यता", path: "/admin/memberships", iconKey: "Users", order: 7, group: "main" },
  { title: "Volunteers", titleHindi: "स्वयंसेवक", path: "/admin/volunteers", iconKey: "Heart", order: 8, group: "main" },
  { title: "Gallery", titleHindi: "गैलरी", path: "/admin/gallery", iconKey: "Images", order: 9, group: "main" },
  { title: "Content", titleHindi: "सामग्री", path: "/admin/content", iconKey: "FileEdit", order: 10, group: "main" },
  { title: "Pages", titleHindi: "पृष्ठ", path: "/admin/pages", iconKey: "Layout", order: 11, group: "main" },
  { title: "Transactions", titleHindi: "लेनदेन", path: "/admin/transactions", iconKey: "Receipt", order: 12, group: "main" },
  { title: "Contact Inquiries", titleHindi: "संपर्क पूछताछ", path: "/admin/contact-inquiries", iconKey: "MessageSquare", order: 12.5, group: "main" },
  { title: "Payments", titleHindi: "भुगतान", path: "/admin/payments", iconKey: "Wallet", order: 13, group: "main" },
  { title: "Settings", titleHindi: "सेटिंग्स", path: "/admin/settings", iconKey: "Settings", order: 100, group: "system" },
];

const defaultFeeStructures = [
  { name: "Village Level", nameHindi: "ग्राम स्तर", level: "village" as const, amount: 99, description: "For students at village level", isActive: true },
  { name: "Block Level", nameHindi: "ब्लॉक स्तर", level: "block" as const, amount: 199, description: "For students at block level", isActive: true },
  { name: "District Level", nameHindi: "जिला स्तर", level: "district" as const, amount: 299, description: "For students at district level", isActive: true },
  { name: "Haryana Level", nameHindi: "हरियाणा स्तर", level: "haryana" as const, amount: 399, description: "For students at Haryana level", isActive: true },
];

const defaultContentSections = [
  { sectionKey: "about" as const, title: "About Us", titleHindi: "हमारे बारे में", content: "Manav Welfare Seva Society is dedicated to providing free education to underprivileged children.", contentHindi: "मानव वेलफेयर सेवा सोसाइटी वंचित बच्चों को मुफ्त शिक्षा प्रदान करने के लिए समर्पित है।", isActive: true, order: 1 },
  { sectionKey: "services" as const, title: "Our Services", titleHindi: "हमारी सेवाएं", content: "We provide quality education, study materials, and support to students.", contentHindi: "हम छात्रों को गुणवत्तापूर्ण शिक्षा, अध्ययन सामग्री और सहायता प्रदान करते हैं।", isActive: true, order: 1 },
  { sectionKey: "contact" as const, title: "Contact Us", titleHindi: "संपर्क करें", content: "Reach out to us for any queries or support.", contentHindi: "किसी भी प्रश्न या सहायता के लिए हमसे संपर्क करें।", isActive: true, order: 1 },
  { sectionKey: "joinUs" as const, title: "Join Us", titleHindi: "हमसे जुड़ें", content: "Become a part of our mission to educate children.", contentHindi: "बच्चों को शिक्षित करने के हमारे मिशन का हिस्सा बनें।", isActive: true, order: 1 },
  { sectionKey: "volunteer" as const, title: "Become a Volunteer", titleHindi: "स्वयंसेवक बनें", content: "Join our team of dedicated volunteers.", contentHindi: "हमारे समर्पित स्वयंसेवकों की टीम में शामिल हों।", isActive: true, order: 1 },
];

const defaultPaymentConfig = [
  { type: "donation" as const, name: "Donation", nameHindi: "दान", upiId: "manavwelfare@upi", isActive: true, order: 1 },
  { type: "fee" as const, name: "Fee Payment", nameHindi: "शुल्क भुगतान", upiId: "manavwelfare@upi", isActive: true, order: 1 },
  { type: "membership" as const, name: "Membership", nameHindi: "सदस्यता", upiId: "manavwelfare@upi", isActive: true, order: 1 },
];

const defaultSettings = [
  { key: "enableRegistration", value: "true", label: "Enable Registration", labelHindi: "रजिस्ट्रेशन सक्षम", description: "Allow new student registrations", type: "boolean" as const, category: "registration" },
  { key: "enableFeePayment", value: "true", label: "Enable Fee Payment", labelHindi: "शुल्क भुगतान सक्षम", description: "Allow fee payments", type: "boolean" as const, category: "fees" },
  { key: "enableResults", value: "true", label: "Enable Results", labelHindi: "परिणाम सक्षम", description: "Show results to students", type: "boolean" as const, category: "results" },
  { key: "enableAdmitCards", value: "true", label: "Enable Admit Cards", labelHindi: "प्रवेश पत्र सक्षम", description: "Allow admit card downloads", type: "boolean" as const, category: "admitCards" },
  { key: "enableMemberships", value: "true", label: "Enable Memberships", labelHindi: "सदस्यता सक्षम", description: "Allow membership registrations", type: "boolean" as const, category: "memberships" },
  { key: "admit_card_download", value: "disabled", label: "Admit Card Download Button", labelHindi: "एडमिट कार्ड डाउनलोड बटन", description: "Show admit card download button in header (enabled/disabled)", type: "string" as const, category: "admitCards" },
  { key: "siteName", value: "Manav Welfare Seva Society", label: "Site Name", labelHindi: "साइट का नाम", description: "Organization name", type: "string" as const, category: "general" },
  { key: "siteNameHindi", value: "मानव वेलफेयर सेवा सोसाइटी", label: "Site Name (Hindi)", labelHindi: "साइट का नाम (हिंदी)", description: "Organization name in Hindi", type: "string" as const, category: "general" },
  { key: "contactPhone", value: "+91 98126 76818", label: "Contact Phone", labelHindi: "संपर्क फ़ोन", description: "Contact phone number", type: "string" as const, category: "contact" },
  { key: "contactEmail", value: "mwssbhuna@gmail.com", label: "Contact Email", labelHindi: "संपर्क ईमेल", description: "Contact email address", type: "string" as const, category: "contact" },
  { key: "upiId", value: "manavwelfare@upi", label: "UPI ID", labelHindi: "UPI आईडी", description: "UPI ID for payments", type: "string" as const, category: "payments" },
  { key: "villageFee", value: "99", label: "Village Fee", labelHindi: "ग्राम शुल्क", description: "Village level fee amount", type: "number" as const, category: "fees" },
  { key: "blockFee", value: "199", label: "Block Fee", labelHindi: "ब्लॉक शुल्क", description: "Block level fee amount", type: "number" as const, category: "fees" },
  { key: "districtFee", value: "299", label: "District Fee", labelHindi: "जिला शुल्क", description: "District level fee amount", type: "number" as const, category: "fees" },
  { key: "haryanaFee", value: "399", label: "Haryana Fee", labelHindi: "हरियाणा शुल्क", description: "Haryana level fee amount", type: "number" as const, category: "fees" },
];

const defaultTermsAndConditions = [
  {
    type: "student" as const,
    titleEnglish: "Student Registration Terms and Conditions",
    titleHindi: "छात्र पंजीकरण नियम और शर्तें",
    contentEnglish: `<div class="terms-content">
<h2>Student Registration Terms and Conditions</h2>

<h3>1. Registration and Eligibility</h3>
<p>By registering with Manav Welfare Seva Society (MWSS), you acknowledge that you are eligible to participate in our educational programs. Students must provide accurate and complete information during registration.</p>

<h3>2. Fee Payment Policy</h3>
<p><strong>IMPORTANT:</strong> Once payment is made, it is non-refundable under any circumstances. The registration fee helps us maintain our services and provide quality education to underprivileged students.</p>
<ul>
<li>Registration fees vary based on level (Village: Rs. 99, Block: Rs. 199, District: Rs. 299, Haryana: Rs. 399)</li>
<li>Payment must be made through the authorized payment channels provided by MWSS</li>
<li>After successful payment, your account will be activated pending admin approval</li>
<li>No refunds will be issued for any reason after payment is made</li>
</ul>

<h3>3. Account Responsibility</h3>
<p>You are responsible for maintaining the confidentiality of your account credentials. Any activities under your account are your responsibility. Do not share your password or login information with anyone.</p>

<h3>4. Code of Conduct</h3>
<p>Students must maintain discipline and integrity in all interactions with MWSS. Violation of code of conduct may result in account suspension or termination.</p>

<h3>5. Data Privacy</h3>
<p>Your personal information will be used only for educational purposes and account management. We are committed to protecting your privacy and will not share your data with third parties without consent.</p>

<h3>6. Content and Intellectual Property</h3>
<p>All educational content, study materials, and resources provided by MWSS are the intellectual property of the organization. Unauthorized distribution or copying is strictly prohibited.</p>

<h3>7. Limitation of Liability</h3>
<p>MWSS is not liable for any technical issues, service interruptions, or loss of data. The organization reserves the right to modify or discontinue services at any time.</p>

<h3>8. Amendment of Terms</h3>
<p>MWSS reserves the right to modify these terms and conditions at any time. Continued use of the platform constitutes acceptance of modified terms.</p>

<h3>9. Governing Law</h3>
<p>These terms and conditions are governed by the laws of India. Any disputes shall be resolved under Indian jurisdiction.</p>

<h3>10. Contact Information</h3>
<p>For any queries regarding these terms and conditions, please contact us at info@manavwelfare.org or call +91 98126 76818.</p>

<p><strong>By clicking "Accept", you agree to all the above terms and conditions.</strong></p>
</div>`,
    contentHindi: `<div class="terms-content">
<h2>छात्र पंजीकरण नियम और शर्तें</h2>

<h3>1. पंजीकरण और पात्रता</h3>
<p>मानव कल्याण सेवा सोसाइटी (एमडब्ल्यूएसएस) के साथ पंजीकरण करके, आप स्वीकार करते हैं कि आप हमारे शैक्षणिक कार्यक्रमों में भाग लेने के लिए पात्र हैं। छात्रों को पंजीकरण के दौरान सटीक और पूर्ण जानकारी प्रदान करनी चाहिए।</p>

<h3>2. शुल्क भुगतान नीति</h3>
<p><strong>महत्वपूर्ण:</strong> एक बार भुगतान करने के बाद, किसी भी परिस्थिति में धनवापसी नहीं की जाएगी। पंजीकरण शुल्क हमारी सेवाओं को बनाए रखने और वंचित छात्रों को गुणवत्तापूर्ण शिक्षा प्रदान करने में मदद करता है।</p>
<ul>
<li>पंजीकरण शुल्क स्तर के आधार पर भिन्न होता है (ग्राम: रु. 99, ब्लॉक: रु. 199, जिला: रु. 299, हरियाणा: रु. 399)</li>
<li>भुगतान एमडब्ल्यूएसएस द्वारा प्रदान किए गए अधिकृत भुगतान चैनलों के माध्यम से किया जाना चाहिए</li>
<li>सफल भुगतान के बाद, आपका खाता व्यवस्थापक की मंजूरी लंबित रहते हुए सक्रिय हो जाएगा</li>
<li>भुगतान के बाद किसी भी कारण से धनवापसी नहीं की जाएगी</li>
</ul>

<h3>3. खाता जिम्मेदारी</h3>
<p>आप अपने खाते की साख-पत्र की गोपनीयता बनाए रखने के लिए जिम्मेदार हैं। आपके खाते के तहत कोई भी गतिविधि आपकी जिम्मेदारी है। अपना पासवर्ड या लॉगिन जानकारी किसी के साथ साझा न करें।</p>

<h3>4. आचरण संहिता</h3>
<p>छात्रों को एमडब्ल्यूएसएस के साथ सभी बातचीत में अनुशासन और ईमानदारी बनाए रखनी चाहिए। आचरण संहिता का उल्लंघन खाता निलंबन या समाप्ति का कारण बन सकता है।</p>

<h3>5. डेटा गोपनीयता</h3>
<p>आपकी व्यक्तिगत जानकारी का उपयोग केवल शैक्षणिक उद्देश्यों और खाता प्रबंधन के लिए किया जाएगा। हम आपकी गोपनीयता की रक्षा के लिए प्रतिबद्ध हैं और सहमति के बिना आपके डेटा को तीसरे पक्ष के साथ साझा नहीं करेंगे।</p>

<h3>6. सामग्री और बौद्धिक संपत्ति</h3>
<p>एमडब्ल्यूएसएस द्वारा प्रदान की गई सभी शैक्षणिक सामग्री, अध्ययन सामग्री और संसाधन संगठन की बौद्धिक संपत्ति हैं। अनुमति के बिना वितरण या नकल कड़ाई से प्रतिबंधित है।</p>

<h3>7. दायित्व की सीमा</h3>
<p>एमडब्ल्यूएसएस किसी भी तकनीकी समस्याओं, सेवा व्यवधानों या डेटा हानि के लिए जिम्मेदार नहीं है। संगठन किसी भी समय सेवाओं को संशोधित या बंद करने का अधिकार सुरक्षित रखता है।</p>

<h3>8. शर्तों में संशोधन</h3>
<p>एमडब्ल्यूएसएस किसी भी समय इन नियम और शर्तों को संशोधित करने का अधिकार सुरक्षित रखता है। मंच का निरंतर उपयोग संशोधित शर्तों की स्वीकृति का गठन करता है।</p>

<h3>9. शासन कानून</h3>
<p>ये नियम और शर्तें भारतीय कानूनों द्वारा संचालित होती हैं। किसी भी विवाद का समाधान भारतीय अधिक्षेत्र के तहत किया जाएगा।</p>

<h3>10. संपर्क जानकारी</h3>
<p>इन नियम और शर्तों के संबंध में किसी भी प्रश्न के लिए, कृपया हमसे info@manavwelfare.org पर संपर्क करें या +91 98126 76818 पर कॉल करें।</p>

<p><strong>"स्वीकार करें" पर क्लिक करके, आप उपरोक्त सभी नियम और शर्तों से सहमत होते हैं।</strong></p>
</div>`,
    version: 1,
    isActive: true,
  },
  {
    type: "membership" as const,
    titleEnglish: "Membership Terms and Conditions",
    titleHindi: "सदस्यता नियम और शर्तें",
    contentEnglish: `<div class="terms-content">
<h2>Membership Terms and Conditions</h2>

<h3>1. Membership Program</h3>
<p>Membership with Manav Welfare Seva Society provides access to exclusive benefits and educational resources.</p>

<h3>2. Membership Fee and Validity</h3>
<p>Membership fees are non-refundable and valid for one year from the date of payment.</p>

<h3>3. Benefits</h3>
<p>Members are entitled to participate in MWSS programs and access educational materials as per membership level.</p>

<h3>4. Renewal</h3>
<p>Membership must be renewed annually to maintain eligibility for benefits.</p>

<h3>5. Termination</h3>
<p>MWSS reserves the right to terminate membership for violation of code of conduct or terms.</p>

<p><strong>By accepting, you agree to the membership terms.</strong></p>
</div>`,
    contentHindi: `<div class="terms-content">
<h2>सदस्यता नियम और शर्तें</h2>

<h3>1. सदस्यता कार्यक्रम</h3>
<p>मानव कल्याण सेवा सोसाइटी के साथ सदस्यता विशेष लाभ और शैक्षणिक संसाधनों तक पहुंच प्रदान करती है।</p>

<h3>2. सदस्यता शुल्क और वैधता</h3>
<p>सदस्यता शुल्क गैर-वापसी योग्य है और भुगतान की तारीख से एक वर्ष के लिए वैध है।</p>

<h3>3. लाभ</h3>
<p>सदस्य एमडब्ल्यूएसएस कार्यक्रमों में भाग लेने और सदस्यता स्तर के अनुसार शैक्षणिक सामग्री तक पहुंचने के लिए योग्य हैं।</p>

<h3>4. नवीकरण</h3>
<p>लाभों की पात्रता बनाए रखने के लिए सदस्यता का वार्षिक नवीकरण आवश्यक है।</p>

<h3>5. समाप्ति</h3>
<p>एमडब्ल्यूएसएस आचरण संहिता या शर्तों के उल्लंघन के लिए सदस्यता समाप्त करने का अधिकार सुरक्षित रखता है।</p>

<p><strong>स्वीकार करके, आप सदस्यता शर्तों से सहमत होते हैं।</strong></p>
</div>`,
    version: 1,
    isActive: true,
  },
  {
    type: "donation" as const,
    titleEnglish: "Donation Terms and Conditions",
    titleHindi: "दान नियम और शर्तें",
    contentEnglish: `<div class="terms-content">
<h2>Donation Terms and Conditions</h2>

<h3>1. Donation Policy</h3>
<p>Donations to Manav Welfare Seva Society are non-refundable and used to support our educational mission.</p>

<h3>2. Tax Information</h3>
<p>MWSS is a registered non-profit organization. Donors may be eligible for tax deductions as per applicable laws.</p>

<h3>3. Use of Funds</h3>
<p>Your donation will be used to provide education and support to underprivileged children in Haryana.</p>

<h3>4. Acknowledgment</h3>
<p>All donors will receive acknowledgment of their contribution.</p>

<p><strong>Thank you for your generous support!</strong></p>
</div>`,
    contentHindi: `<div class="terms-content">
<h2>दान नियम और शर्तें</h2>

<h3>1. दान नीति</h3>
<p>मानव कल्याण सेवा सोसाइटी को दान गैर-वापसी योग्य है और हमारे शैक्षणिक मिशन को समर्थन करने के लिए उपयोग किया जाता है।</p>

<h3>2. कर जानकारी</h3>
<p>एमडब्ल्यूएसएस एक पंजीकृत गैर-लाभ संगठन है। दाता लागू कानूनों के अनुसार कर कटौती के लिए पात्र हो सकते हैं।</p>

<h3>3. धन का उपयोग</h3>
<p>आपका दान हरियाणा में वंचित बच्चों को शिक्षा और समर्थन प्रदान करने के लिए उपयोग किया जाएगा।</p>

<h3>4. स्वीकृति</h3>
<p>सभी दाताओं को उनके योगदान की स्वीकृति प्राप्त होगी।</p>

<p><strong>आपके उदार समर्थन के लिए धन्यवाद!</strong></p>
</div>`,
    version: 1,
    isActive: true,
  },
];

export async function seedDatabase() {
  try {
    const adminExists = await storage.getAdminByEmail("admin@mwss.org");
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      await storage.createAdmin({
        email: "admin@mwss.org",
        password: hashedPassword,
        name: "Super Admin",
      });
      console.log("Default admin created: admin@mwss.org / Admin@123");
    }

    const studentExists = await storage.getStudentByEmail("student@mwss.org");
    if (!studentExists) {
      const hashedPassword = await bcrypt.hash("Student@123", 10);
      const year = new Date().getFullYear();
      await storage.createStudent({
        email: "student@mwss.org",
        password: hashedPassword,
        fullName: "Demo Student",
        fatherName: "Demo Father",
        phone: "9876543210",
        class: "10",
        registrationNumber: `MWSS${year}0001`,
        rollNumber: "900001",
        feeLevel: "village",
        feeAmount: 99,
        feePaid: true,
        isActive: true,
      });
      console.log("Demo student created: student@mwss.org / Student@123");
    }

    const existingMenuItems = await storage.getAllMenuItems();
    for (const item of defaultMenuItems) {
      const exists = existingMenuItems.find(m => m.path === item.path);
      if (!exists) {
        await storage.createMenuItem({
          ...item,
          isActive: true,
        });
        console.log(`Menu item created: ${item.title}`);
      }
    }

    for (const setting of defaultSettings) {
      const exists = await storage.getAdminSettingByKey(setting.key);
      if (!exists) {
        await storage.createAdminSetting(setting);
        console.log(`Setting created: ${setting.key}`);
      }
    }

    const existingFeeStructures = await storage.getAllFeeStructures();
    if (existingFeeStructures.length === 0) {
      for (const fee of defaultFeeStructures) {
        await storage.createFeeStructure(fee);
      }
      console.log("Default fee structures created");
    }

    const existingContentSections = await storage.getAllContentSections();
    if (existingContentSections.length === 0) {
      for (const content of defaultContentSections) {
        await storage.createContentSection(content);
      }
      console.log("Default content sections created");
    }

    const existingPaymentConfigs = await storage.getAllPaymentConfigs();
    if (existingPaymentConfigs.length === 0) {
      for (const payment of defaultPaymentConfig) {
        await storage.createPaymentConfig(payment);
      }
      console.log("Default payment configs created");
    }

    const existingTermsAndConditions = await storage.getAllTermsAndConditions();
    for (const tac of defaultTermsAndConditions) {
      const exists = existingTermsAndConditions.find(t => t.type === tac.type);
      if (!exists) {
        await storage.createTermsAndConditions(tac);
        console.log(`Terms and conditions created: ${tac.type}`);
      }
    }

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
