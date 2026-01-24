import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Manav Welfare Seva Society" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

export async function sendStudentRegistrationEmail(data: {
  email: string;
  fullName: string;
  registrationNumber: string;
  fatherName: string;
  phone: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Manav Welfare Seva Society</h2>
      <h3>Student Registration Successful / छात्र पंजीकरण सफल</h3>
      <p>Dear <strong>${data.fullName}</strong>,</p>
      <p>Thank you for registering with Manav Welfare Seva Society. Your registration details are:</p>
      <p>मानव वेलफेयर सेवा सोसाइटी में पंजीकरण के लिए धन्यवाद। आपके पंजीकरण का विवरण:</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Registration No. / पंजीकरण संख्या:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.registrationNumber}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name / नाम:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.fullName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Father's Name / पिता का नाम:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.fatherName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone / फोन:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone}</td></tr>
      </table>
      <p style="color: #dc2626;"><strong>Note:</strong> Your account is pending fee payment approval. You will receive another email once approved.</p>
      <p style="color: #dc2626;"><strong>नोट:</strong> आपका खाता शुल्क भुगतान अनुमोदन की प्रतीक्षा में है। अनुमोदित होने पर आपको एक और ईमेल प्राप्त होगा।</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Manav Welfare Seva Society, Haryana, India</p>
    </div>
  `;
  return sendEmail({ to: data.email, subject: "Registration Successful - Manav Welfare Seva Society / पंजीकरण सफल", html });
}

export async function sendVolunteerRegistrationEmail(data: {
  email: string;
  fullName: string;
  phone: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Manav Welfare Seva Society</h2>
      <h3>Volunteer Registration Received / स्वयंसेवक पंजीकरण प्राप्त</h3>
      <p>Dear <strong>${data.fullName}</strong>,</p>
      <p>Thank you for your interest in volunteering with Manav Welfare Seva Society!</p>
      <p>मानव वेलफेयर सेवा सोसाइटी के साथ स्वयंसेवा में रुचि के लिए धन्यवाद!</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name / नाम:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.fullName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email / ईमेल:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone / फोन:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone}</td></tr>
      </table>
      <p style="color: #f59e0b;"><strong>Status:</strong> Your registration is pending admin approval. You will be notified once approved.</p>
      <p style="color: #f59e0b;"><strong>स्थिति:</strong> आपका पंजीकरण व्यवस्थापक की मंजूरी की प्रतीक्षा में है। अनुमोदित होने पर आपको सूचित किया जाएगा।</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Manav Welfare Seva Society, Haryana, India</p>
    </div>
  `;
  return sendEmail({ to: data.email, subject: "Volunteer Registration Received - Manav Welfare Seva Society / स्वयंसेवक पंजीकरण प्राप्त", html });
}

export async function sendPaymentConfirmationEmail(data: {
  email: string;
  name: string;
  amount: number;
  transactionId: string;
  type: string;
  purpose?: string;
}) {
  const typeLabels: Record<string, string> = {
    donation: "Donation / दान",
    fee: "Fee Payment / शुल्क भुगतान",
    membership: "Membership / सदस्यता",
  };
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Manav Welfare Seva Society</h2>
      <h3>Payment Received / भुगतान प्राप्त</h3>
      <p>Dear <strong>${data.name}</strong>,</p>
      <p>Thank you for your payment. Here are the details:</p>
      <p>आपके भुगतान के लिए धन्यवाद। विवरण इस प्रकार है:</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Type / प्रकार:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${typeLabels[data.type] || data.type}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount / राशि:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">Rs. ${data.amount}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>UTR / Transaction ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${data.transactionId}</td></tr>
        ${data.purpose ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Purpose / उद्देश्य:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.purpose}</td></tr>` : ''}
      </table>
      <p style="color: #f59e0b;"><strong>Status:</strong> Your payment is pending admin verification. You will receive a confirmation email once approved.</p>
      <p style="color: #f59e0b;"><strong>स्थिति:</strong> आपका भुगतान व्यवस्थापक सत्यापन की प्रतीक्षा में है। अनुमोदित होने पर आपको पुष्टि ईमेल प्राप्त होगा।</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Manav Welfare Seva Society, Haryana, India</p>
    </div>
  `;
  return sendEmail({ to: data.email, subject: `Payment Received - ${typeLabels[data.type] || data.type} - Manav Welfare Seva Society`, html });
}

export async function sendApprovalEmail(data: {
  email: string;
  name: string;
  type: "student" | "volunteer" | "payment" | "membership";
  details?: Record<string, string>;
}) {
  const typeLabels: Record<string, { en: string; hi: string }> = {
    student: { en: "Student Fee Payment", hi: "छात्र शुल्क भुगतान" },
    volunteer: { en: "Volunteer Registration", hi: "स्वयंसेवक पंजीकरण" },
    payment: { en: "Payment Transaction", hi: "भुगतान लेनदेन" },
    membership: { en: "Membership", hi: "सदस्यता" },
  };
  
  let detailsHtml = "";
  if (data.details) {
    detailsHtml = `<table style="border-collapse: collapse; width: 100%; margin: 20px 0;">`;
    for (const [key, value] of Object.entries(data.details)) {
      detailsHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${key}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`;
    }
    detailsHtml += `</table>`;
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Manav Welfare Seva Society</h2>
      <h3 style="color: #16a34a;">Approved! / स्वीकृत!</h3>
      <p>Dear <strong>${data.name}</strong>,</p>
      <p>Great news! Your <strong>${typeLabels[data.type].en}</strong> has been approved.</p>
      <p>बधाई हो! आपका <strong>${typeLabels[data.type].hi}</strong> स्वीकृत हो गया है।</p>
      ${detailsHtml}
      <p style="color: #16a34a;"><strong>You can now login to your account to access all features.</strong></p>
      <p style="color: #16a34a;"><strong>अब आप सभी सुविधाओं तक पहुँचने के लिए अपने खाते में लॉगिन कर सकते हैं।</strong></p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Manav Welfare Seva Society, Haryana, India</p>
    </div>
  `;
  return sendEmail({ to: data.email, subject: `Approved: ${typeLabels[data.type].en} - Manav Welfare Seva Society / ${typeLabels[data.type].hi} स्वीकृत`, html });
}

export async function sendAdminNotificationEmail(data: {
  type: string;
  name: string;
  email: string;
  details?: Record<string, string>;
}) {
  const adminEmail = process.env.EMAIL_USER;
  if (!adminEmail) {
    console.warn("No EMAIL_USER configured for admin notifications");
    return false;
  }
  
  let detailsHtml = "";
  if (data.details) {
    detailsHtml = `<table style="border-collapse: collapse; width: 100%; margin: 20px 0;">`;
    for (const [key, value] of Object.entries(data.details)) {
      detailsHtml += `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${key}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`;
    }
    detailsHtml += `</table>`;
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Admin Notification - Manav Welfare Seva Society</h2>
      <h3>New ${data.type} Requires Attention</h3>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      ${detailsHtml}
      <p>Please login to the admin dashboard to review and take action.</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">This is an automated notification.</p>
    </div>
  `;
  return sendEmail({ to: adminEmail, subject: `[Admin] New ${data.type} - ${data.name}`, html });
}

export async function sendResultNotificationEmail(data: {
  email: string;
  studentName: string;
  examName: string;
  totalMarks: number;
  marksObtained: number;
  grade?: string;
  rank?: number;
}) {
  const percentage = ((data.marksObtained / data.totalMarks) * 100).toFixed(1);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Manav Welfare Seva Society</h2>
      <h3>Result Declared / परिणाम घोषित</h3>
      <p>Dear <strong>${data.studentName}</strong>,</p>
      <p>Your result for <strong>${data.examName}</strong> has been declared.</p>
      <p>आपका <strong>${data.examName}</strong> का परिणाम घोषित हो गया है।</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Exam / परीक्षा:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.examName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Marks / कुल अंक:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.totalMarks}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Marks Obtained / प्राप्त अंक:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.marksObtained}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Percentage / प्रतिशत:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${percentage}%</td></tr>
        ${data.grade ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Grade / ग्रेड:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.grade}</td></tr>` : ''}
        ${data.rank ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Rank / रैंक:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.rank}</td></tr>` : ''}
      </table>
      <p>Login to your student dashboard to view and download your detailed result.</p>
      <p>विस्तृत परिणाम देखने और डाउनलोड करने के लिए अपने छात्र डैशबोर्ड में लॉगिन करें।</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Manav Welfare Seva Society, Haryana, India</p>
    </div>
  `;
  return sendEmail({ to: data.email, subject: `Result Declared: ${data.examName} - Manav Welfare Seva Society / परिणाम घोषित`, html });
}

export async function sendAdmitCardNotificationEmail(data: {
  email: string;
  studentName: string;
  examName: string;
  rollNumber?: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Manav Welfare Seva Society</h2>
      <h3>Admit Card Available / प्रवेश पत्र उपलब्ध</h3>
      <p>Dear <strong>${data.studentName}</strong>,</p>
      <p>Your admit card for <strong>${data.examName}</strong> is now available.</p>
      <p>आपका <strong>${data.examName}</strong> का प्रवेश पत्र अब उपलब्ध है।</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Exam / परीक्षा:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.examName}</td></tr>
        ${data.rollNumber ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Roll Number / रोल नंबर:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.rollNumber}</td></tr>` : ''}
      </table>
      <p>Login to your student dashboard to view and download your admit card.</p>
      <p>अपना प्रवेश पत्र देखने और डाउनलोड करने के लिए अपने छात्र डैशबोर्ड में लॉगिन करें।</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Manav Welfare Seva Society, Haryana, India</p>
    </div>
  `;
  return sendEmail({ to: data.email, subject: `Admit Card Available: ${data.examName} - Manav Welfare Seva Society / प्रवेश पत्र उपलब्ध`, html });
}

export async function sendRollNumberNotificationEmail(data: {
  email: string;
  studentName: string;
  rollNumber: string;
  className: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Manav Welfare Seva Society</h2>
      <h3>Roll Number Assigned / रोल नंबर आवंटित</h3>
      <p>Dear <strong>${data.studentName}</strong>,</p>
      <p>Your roll number has been assigned.</p>
      <p>आपका रोल नंबर आवंटित कर दिया गया है।</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Roll Number / रोल नंबर:</strong></td><td style="padding: 8px; border: 1px solid #ddd; font-size: 18px; font-weight: bold;">${data.rollNumber}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Class / कक्षा:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.className}</td></tr>
      </table>
      <p>Please remember your roll number for future examinations.</p>
      <p>कृपया भविष्य की परीक्षाओं के लिए अपना रोल नंबर याद रखें।</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Manav Welfare Seva Society, Haryana, India</p>
    </div>
  `;
  return sendEmail({ to: data.email, subject: `Roll Number Assigned: ${data.rollNumber} - Manav Welfare Seva Society / रोल नंबर आवंटित`, html });
}

export async function sendPasswordResetEmail(data: {
  email: string;
  name: string;
  resetLink: string;
  type: "student" | "member";
}) {
  const typeLabel = data.type === "student" ? "Student" : "Member";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Manav Welfare Seva Society</h2>
      <h3>Password Reset Request / पासवर्ड रीसेट अनुरोध</h3>
      <p>Dear <strong>${data.name}</strong>,</p>
      <p>We received a request to reset your password for your ${typeLabel} account. If you did not make this request, you can ignore this email.</p>
      <p>हमने आपके ${typeLabel} खाते के लिए पासवर्ड रीसेट करने के लिए एक अनुरोध प्राप्त किया। यदि आपने यह अनुरोध नहीं किया, तो आप इस ईमेल को अनदेखा कर सकते हैं।</p>
      <p style="margin: 30px 0;">
        <a href="${data.resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password / पासवर्ड रीसेट करें</a>
      </p>
      <p style="color: #666; font-size: 12px;">Or copy and paste this link in your browser:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${data.resetLink}</p>
      <p style="color: #dc2626; margin-top: 20px;"><strong>Note:</strong> This link will expire in 24 hours. / यह लिंक 24 घंटे में समाप्त हो जाएगा।</p>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Manav Welfare Seva Society, Haryana, India</p>
    </div>
  `;
  return sendEmail({ to: data.email, subject: `Password Reset Request - Manav Welfare Seva Society / पासवर्ड रीसेट अनुरोध`, html });
}

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const contactEmail = "mwssbhuna@gmail.com";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Contact Form Submission</h2>
      <h3>Manav Welfare Seva Society - Website Inquiry</h3>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>` : ''}
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Subject:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.subject}</td></tr>
      </table>
      <h3>Message:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>
      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">This message was sent from the Manav Welfare Seva Society website contact form.</p>
    </div>
  `;
  return sendEmail({ to: contactEmail, subject: `[Contact Form] ${data.subject} - from ${data.name}`, html });
}
