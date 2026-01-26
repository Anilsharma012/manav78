import type { Express } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import { storage } from "./storage";
import { authMiddleware, adminOnly, generateToken, AuthRequest } from "./middleware/auth";
import { insertGalleryImageSchema, insertTermsAndConditionsSchema, insertEventSchema, insertNewsSchema } from "@shared/schema";
import {
  sendStudentRegistrationEmail,
  sendVolunteerRegistrationEmail,
  sendPaymentConfirmationEmail,
  sendApprovalEmail,
  sendAdminNotificationEmail,
  sendResultNotificationEmail,
  sendAdmitCardNotificationEmail,
  sendRollNumberNotificationEmail,
  sendPasswordResetEmail,
  sendContactFormEmail
} from "./email";
import { Member, PasswordResetToken, MemberCard } from "./models";

export async function registerRoutes(app: Express): Promise<void> {
  
  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.getAdminByEmail(email);
      
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const token = generateToken({ id: admin.id.toString(), email: admin.email, role: "admin", name: admin.name });
      res.json({ token, user: { id: admin.id, email: admin.email, role: "admin", name: admin.name } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/admin/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const existing = await storage.getAdminByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Admin already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await storage.createAdmin({ email, password: hashedPassword, name });
      
      const token = generateToken({ id: admin.id.toString(), email: admin.email, role: "admin", name: admin.name });
      res.status(201).json({ token, user: { id: admin.id, email: admin.email, role: "admin", name: admin.name } });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/student/login", async (req, res) => {
    try {
      const { password, registrationNumber } = req.body;
      
      // Login by registration number only (multiple students can have same email)
      if (!registrationNumber) {
        return res.status(400).json({ error: "Registration number is required" });
      }
      
      const student = await storage.getStudentByRegistrationNumber(registrationNumber);
      
      if (!student) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (!student.isActive) {
        return res.status(403).json({ error: "Account is deactivated" });
      }
      
      const isValid = await bcrypt.compare(password, student.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check if student has approved payment (either feePaid flag or approved transaction)
      if (!student.feePaid) {
        const transactions = await storage.getPaymentTransactionsByEmail(student.email);
        const hasApprovedPayment = transactions.some(t => t.status === "approved" && (t.type === "fee" || t.type === "membership"));
        
        if (!hasApprovedPayment) {
          return res.status(403).json({ error: "Payment pending approval. Please wait for admin approval. / भुगतान स्वीकृति लंबित है।" });
        }
      }
      
      const token = generateToken({ id: student.id.toString(), email: student.email, role: "student", name: student.fullName });
      res.json({ token, user: { id: student.id, email: student.email, role: "student", name: student.fullName } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/student/register", async (req, res) => {
    let responseSent = false;
    console.log("[REGISTER] Request received:", { email: req.body.email, class: req.body.class });

    try {
      const { email, password, fullName, phone, fatherName, motherName, address, city, pincode, dateOfBirth, gender, class: studentClass, feeLevel, photoUrl } = req.body;

      // Validation
      if (!email || !password || !fullName || !studentClass) {
        console.log("[REGISTER] Validation failed - missing fields");
        responseSent = true;
        return res.status(400).json({ error: "Missing required fields: email, password, fullName, class" });
      }

      // Multiple accounts with same email are now allowed
      // Each student gets a unique registration number for login

      const year = new Date().getFullYear();
      const count = await storage.countStudentsWithRegPrefix(`MWSS${year}`);
      const registrationNumber = `MWSS${year}${String(count + 1).padStart(4, "0")}`;

      const feeAmounts: Record<string, number> = { village: 99, block: 199, district: 299, haryana: 399 };
      const feeAmount = feeAmounts[feeLevel] || 99;

      console.log("[REGISTER] Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log("[REGISTER] Creating student in database...");
      const student = await storage.createStudent({
        email,
        password: hashedPassword,
        fullName,
        phone,
        fatherName,
        motherName,
        address,
        city,
        pincode,
        dateOfBirth,
        gender,
        class: studentClass,
        registrationNumber,
        feeLevel: feeLevel || "village",
        feeAmount,
        photoUrl,
      });

      console.log("[REGISTER] Student created:", { id: student?.id, email: student?.email });

      if (!student || !student.id) {
        throw new Error("Failed to create student record - no student ID returned");
      }

      console.log("[REGISTER] Generating token...");
      const token = generateToken({ id: student.id.toString(), email: student.email, role: "student", name: student.fullName });
      console.log("[REGISTER] Token generated successfully");

      const responseData = {
        token,
        user: { id: student.id, email: student.email, role: "student", name: student.fullName },
        registrationNumber
      };

      // Send email notifications (non-blocking)
      sendStudentRegistrationEmail({
        email: student.email,
        fullName: student.fullName,
        registrationNumber,
        fatherName: fatherName || "",
        phone: student.phone || "",
      }).catch(err => console.error("Student registration email error:", err));

      sendAdminNotificationEmail({
        type: "Student Registration",
        name: student.fullName,
        email: student.email,
        details: {
          "Registration Number": registrationNumber,
          "Class": studentClass || "N/A",
          "Fee Level": feeLevel || "village",
          "Amount": `Rs. ${feeAmount}`,
        },
      }).catch(err => console.error("Admin notification email error:", err));

      console.log("[REGISTER] Sending success response...");
      responseSent = true;
      res.status(201).json(responseData);
      console.log("[REGISTER] Response sent successfully");
    } catch (error: any) {
      console.error("Registration error details:", error);
      if (!responseSent) {
        responseSent = true;
        const errorMessage = error?.message || "Registration failed";
        try {
          res.status(500).json({ error: errorMessage });
        } catch (sendErr) {
          console.error("Failed to send error response:", sendErr);
          res.status(500).end();
        }
      }
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role === "admin") {
        const admin = await storage.getAdminById(req.user.id);
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        const { password, ...adminData } = admin;
        res.json({ ...adminData, role: "admin" });
      } else if (req.user?.role === "volunteer") {
        const volunteer = await storage.getVolunteerAccountById(req.user.id);
        if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
        const { password, ...volunteerData } = volunteer;
        res.json({ ...volunteerData, role: "volunteer" });
      } else {
        const student = await storage.getStudentById(req.user?.id || "");
        if (!student) return res.status(404).json({ error: "Student not found" });
        const { password, ...studentData } = student;
        res.json({ ...studentData, role: "student" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/students", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students.map(({ password, ...s }) => s));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const student = await storage.getStudentById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      if (req.user?.role !== "admin" && req.user?.id !== student.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const { password, ...studentData } = student;
      res.json(studentData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  app.patch("/api/students/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const student = await storage.updateStudent(req.params.id, req.body);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      const { password, ...studentData } = student;
      res.json(studentData);
    } catch (error) {
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  // Bulk delete students
  app.post("/api/students/bulk-delete", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
      }
      await storage.bulkDeleteStudents(ids);
      res.json({ success: true, deleted: ids.length });
    } catch (error) {
      console.error("Bulk delete students error:", error);
      res.status(500).json({ error: "Failed to delete students" });
    }
  });

  app.post("/api/students", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { email, password, fullName, phone, fatherName, motherName, address, city, pincode, dateOfBirth, gender, class: studentClass, feeLevel } = req.body;
      
      const year = new Date().getFullYear();
      const count = await storage.countStudentsWithRegPrefix(`MWSS${year}`);
      const registrationNumber = `MWSS${year}${String(count + 1).padStart(4, "0")}`;
      
      const feeAmounts: Record<string, number> = { village: 99, block: 199, district: 299, haryana: 399 };
      const feeAmount = feeAmounts[feeLevel] || 99;
      
      const hashedPassword = await bcrypt.hash(password || "password123", 10);
      const student = await storage.createStudent({
        email,
        password: hashedPassword,
        fullName,
        phone,
        fatherName,
        motherName,
        address,
        city,
        pincode,
        dateOfBirth,
        gender,
        class: studentClass,
        registrationNumber,
        feeLevel: feeLevel || "village",
        feeAmount,
      });
      
      const { password: _, ...studentData } = student;
      res.status(201).json(studentData);
    } catch (error) {
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.get("/api/dashboard/stats", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const students = await storage.getAllStudents();
      const todayRegistrations = await storage.countStudentsToday();
      const feesPaid = await storage.countStudentsFeePaid();
      const activeStudents = await storage.countActiveStudents();
      
      res.json({ totalStudents: students.length, todayRegistrations, feesPaid, activeStudents });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/results", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role === "admin") {
        const results = await storage.getAllResults();
        res.json(results);
      } else {
        const results = await storage.getResultsByStudentId(req.user?.id || "", true);
        res.json(results);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  app.get("/api/results/student/:studentId", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const publishedOnly = req.user?.role !== "admin";
      const results = await storage.getResultsByStudentId(req.params.studentId, publishedOnly);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  app.post("/api/results", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const result = await storage.createResult(req.body);
      
      // Send email notification to student
      if (req.body.studentId) {
        const student = await storage.getStudentById(req.body.studentId);
        if (student?.email) {
          sendResultNotificationEmail({
            email: student.email,
            studentName: student.fullName,
            examName: req.body.examName || "Exam",
            totalMarks: req.body.totalMarks || 0,
            marksObtained: req.body.marksObtained || 0,
            grade: req.body.grade,
            rank: req.body.rank,
          }).catch(err => console.error("Result notification email error:", err));
        }
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create result" });
    }
  });

  app.patch("/api/results/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const result = await storage.updateResult(req.params.id, req.body);
      if (!result) {
        return res.status(404).json({ error: "Result not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update result" });
    }
  });

  app.get("/api/admit-cards", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role === "admin") {
        const admitCards = await storage.getAllAdmitCards();
        res.json(admitCards);
      } else {
        const admitCards = await storage.getAdmitCardsByStudentId(req.user?.id || "");
        res.json(admitCards);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admit cards" });
    }
  });

  app.get("/api/admit-cards/student/:studentId", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const admitCards = await storage.getAdmitCardsByStudentId(req.params.studentId);
      res.json(admitCards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admit cards" });
    }
  });

  app.post("/api/admit-cards", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      console.log("[ADMIT CARD] Creating admit card with data:", JSON.stringify(req.body));
      const admitCard = await storage.createAdmitCard(req.body);
      console.log("[ADMIT CARD] Created successfully:", admitCard?.id);
      
      // Send email notification to student (non-blocking)
      if (req.body.studentId) {
        const student = await storage.getStudentById(req.body.studentId);
        if (student?.email) {
          sendAdmitCardNotificationEmail({
            email: student.email,
            studentName: student.fullName,
            examName: req.body.examName || "Examination",
            rollNumber: student.rollNumber || undefined,
          }).catch(err => console.error("Admit card notification email error:", err));
        }
      }
      
      res.status(201).json(admitCard);
    } catch (error: any) {
      console.error("[ADMIT CARD] Error creating admit card:", error?.message || error);
      res.status(500).json({ error: "Failed to create admit card" });
    }
  });

  app.delete("/api/admit-cards/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteAdmitCard(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete admit card" });
    }
  });

  // Bulk delete admit cards
  app.post("/api/admit-cards/bulk-delete", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
      }
      await storage.bulkDeleteAdmitCards(ids);
      res.json({ success: true, deleted: ids.length });
    } catch (error) {
      console.error("Bulk delete admit cards error:", error);
      res.status(500).json({ error: "Failed to delete admit cards" });
    }
  });

  app.get("/api/memberships", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const memberships = await storage.getAllMemberships();
      res.json(memberships);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch memberships" });
    }
  });

  app.post("/api/memberships", async (req, res) => {
    try {
      const count = await storage.countMemberships();
      const membershipNumber = `MWSS-M${String(count + 1).padStart(4, "0")}`;
      const membership = await storage.createMembership({ ...req.body, membershipNumber });
      res.status(201).json(membership);
    } catch (error) {
      res.status(500).json({ error: "Failed to create membership" });
    }
  });

  app.patch("/api/memberships/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const membership = await storage.updateMembership(req.params.id, req.body);
      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }
      res.json(membership);
    } catch (error) {
      res.status(500).json({ error: "Failed to update membership" });
    }
  });

  app.get("/api/my-profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role === "student") {
        const student = await storage.getStudentById(req.user.id);
        if (!student) return res.status(404).json({ error: "Student not found" });
        
        const results = await storage.getResultsByStudentId(student.id, true);
        const admitCards = await storage.getAdmitCardsByStudentId(student.id);
        
        const { password, ...studentData } = student;
        res.json({ student: studentData, results, admitCards });
      } else {
        res.status(403).json({ error: "Students only" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.get("/api/my-transactions", authMiddleware, async (req: AuthRequest, res) => {
    try {
      let email = "";

      if (req.user?.role === "student") {
        const student = await storage.getStudentById(req.user.id);
        if (student) email = student.email;
      } else if (req.user?.role === "volunteer") {
        const volunteer = await storage.getVolunteerAccountById(req.user.id);
        if (volunteer) email = volunteer.email;
      }

      if (!email) return res.json([]);

      const transactions = await storage.getPaymentTransactionsByEmail(email);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/menu", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const menuItems = await storage.getActiveMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.get("/api/admin/menu/all", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.post("/api/admin/menu", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });

  app.patch("/api/admin/menu/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const menuItem = await storage.updateMenuItem(req.params.id, req.body);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteMenuItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  });

  app.get("/api/admin/settings", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const settings = await storage.getAllAdminSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/admin/settings/:key", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const setting = await storage.getAdminSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.patch("/api/admin/settings/:key", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const setting = await storage.updateAdminSettingByKey(req.params.key, req.body);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  app.post("/api/admin/settings", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const setting = await storage.createAdminSetting(req.body);
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to create setting" });
    }
  });

  app.get("/api/public/settings", async (req, res) => {
    try {
      const settings = await storage.getAllAdminSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/public/admit-card/:rollNumber", async (req, res) => {
    try {
      const { rollNumber } = req.params;
      const student = await storage.getStudentByRollNumber(rollNumber);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found with this roll number" });
      }
      
      const admitCards = await storage.getAdmitCardsByStudentId(student.id);
      const admitCard = admitCards[0];
      
      if (!admitCard) {
        return res.status(404).json({ message: "Admit card not available for this student" });
      }
      
      let admitData = null;
      try {
        admitData = JSON.parse(admitCard.fileUrl);
      } catch (e) {
        admitData = null;
      }
      
      res.json({
        student: {
          fullName: student.fullName,
          fatherName: student.fatherName,
          rollNumber: student.rollNumber,
          registrationNumber: student.registrationNumber,
          class: student.class,
        },
        examName: admitCard.examName,
        admitData,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admit card" });
    }
  });

  app.get("/api/admin/payment-config", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const configs = await storage.getAllPaymentConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment configs" });
    }
  });

  app.get("/api/public/payment-config/:type", async (req, res) => {
    try {
      const configs = await storage.getPaymentConfigsByType(req.params.type);
      res.json(configs || []);
    } catch (error: any) {
      console.error("Payment config fetch error:", error);
      res.status(500).json({ error: error?.message || "Failed to fetch payment config" });
    }
  });

  app.post("/api/admin/payment-config", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const config = await storage.createPaymentConfig(req.body);
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment config" });
    }
  });

  app.patch("/api/admin/payment-config/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const config = await storage.updatePaymentConfig(req.params.id, req.body);
      if (!config) return res.status(404).json({ error: "Payment config not found" });
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment config" });
    }
  });

  app.delete("/api/admin/payment-config/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deletePaymentConfig(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment config" });
    }
  });

  app.get("/api/admin/content-sections", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const sections = await storage.getAllContentSections();
      res.json(sections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content sections" });
    }
  });

  app.get("/api/public/content/:sectionKey", async (req, res) => {
    try {
      const sections = await storage.getContentSectionsByKey(req.params.sectionKey);
      res.json(sections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/admin/content-sections", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const section = await storage.createContentSection(req.body);
      res.status(201).json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content section" });
    }
  });

  app.patch("/api/admin/content-sections/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const section = await storage.updateContentSection(req.params.id, req.body);
      if (!section) return res.status(404).json({ error: "Content section not found" });
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content section" });
    }
  });

  app.delete("/api/admin/content-sections/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteContentSection(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content section" });
    }
  });

  app.get("/api/admin/volunteers", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const volunteers = await storage.getAllVolunteerApplications();
      res.json(volunteers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch volunteers" });
    }
  });

  app.post("/api/public/volunteer-apply", async (req, res) => {
    try {
      await storage.createVolunteerApplication(req.body);
      res.status(201).json({ success: true, message: "Application submitted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  app.patch("/api/admin/volunteers/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const volunteer = await storage.updateVolunteerApplication(parseInt(req.params.id), req.body);
      if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
      res.json(volunteer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update volunteer" });
    }
  });

  app.delete("/api/admin/volunteers/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteVolunteerApplication(req.params.id);
      res.json({ success: true, message: "Volunteer application deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete volunteer application" });
    }
  });

  app.post("/api/admin/volunteers/bulk-delete", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
      }
      await storage.bulkDeleteVolunteerApplications(ids);
      res.json({ success: true, deleted: ids.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete volunteer applications" });
    }
  });

  app.get("/api/admin/fee-structures", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const structures = await storage.getAllFeeStructures();
      res.json(structures);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fee structures" });
    }
  });

  app.get("/api/public/fee-structures", async (req, res) => {
    try {
      const structures = await storage.getAllFeeStructures();
      res.json(structures.filter(s => s.isActive));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fee structures" });
    }
  });

  app.post("/api/admin/fee-structures", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const structure = await storage.createFeeStructure(req.body);
      res.status(201).json(structure);
    } catch (error) {
      res.status(500).json({ error: "Failed to create fee structure" });
    }
  });

  app.patch("/api/admin/fee-structures/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const structure = await storage.updateFeeStructure(req.params.id, req.body);
      if (!structure) return res.status(404).json({ error: "Fee structure not found" });
      res.json(structure);
    } catch (error) {
      res.status(500).json({ error: "Failed to update fee structure" });
    }
  });

  app.get("/api/admin/membership-cards", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const cards = await storage.getAllMembershipCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch membership cards" });
    }
  });

  app.post("/api/admin/membership-cards", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const year = new Date().getFullYear();
      const cards = await storage.getAllMembershipCards();
      const count = cards.filter(c => c.cardNumber.startsWith(`MC${year}`)).length;
      const cardNumber = `MC${year}${String(count + 1).padStart(4, "0")}`;
      
      const card = await storage.createMembershipCard({ ...req.body, cardNumber });
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to create membership card" });
    }
  });

  app.patch("/api/admin/membership-cards/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const updates: any = { ...req.body };
      if (req.body.paymentStatus === "approved" && req.user?.id) {
        updates.approvedBy = req.user.id;
        updates.approvedAt = new Date();
        updates.isGenerated = true;
      }
      const card = await storage.updateMembershipCard(req.params.id, updates);
      if (!card) return res.status(404).json({ error: "Membership card not found" });
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to update membership card" });
    }
  });

  app.get("/api/my-membership-card", authMiddleware, async (req: AuthRequest, res) => {
    try {
      // First try to get the student to get their email
      const student = await storage.getStudentById(req.user?.id || "");
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Look for a Member record by email (new membership system)
      const member = await Member.findOne({ email: student.email });
      if (!member) {
        return res.status(404).json({ error: "Membership not found" });
      }

      // Get the I-Card for this member
      const card = await storage.getMemberCardByMemberId(member._id.toString());
      if (!card) {
        return res.status(404).json({ error: "Membership card not generated yet" });
      }

      res.json(card);
    } catch (error) {
      console.error("Error fetching membership card:", error);
      res.status(500).json({ error: "Failed to fetch membership card" });
    }
  });

  app.get("/api/admin/contact-inquiries", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const inquiries = await storage.getAllContactInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.post("/api/public/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      await storage.createContactInquiry(req.body);
      
      // Send email notification to mwssbhuna@gmail.com
      try {
        await sendContactFormEmail({ name, email, phone, subject, message });
      } catch (emailError) {
        console.error("Failed to send contact form email:", emailError);
        // Don't fail the request if email fails
      }
      
      res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.patch("/api/admin/contact-inquiries/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const inquiry = await storage.updateContactInquiry(req.params.id, req.body);
      if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inquiry" });
    }
  });

  app.get("/api/public/contact-info", async (req, res) => {
    try {
      const contactInfo = await storage.getContactInfo();
      res.json(contactInfo || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact info" });
    }
  });

  app.get("/api/admin/contact-info", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const contactInfo = await storage.getContactInfo();
      res.json(contactInfo || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact info" });
    }
  });

  app.patch("/api/admin/contact-info", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const contactInfo = await storage.updateContactInfo(req.body);
      res.json(contactInfo || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact info" });
    }
  });

  // Terms & Conditions API
  app.get("/api/public/terms-and-conditions", async (req, res) => {
    try {
      const tac = await storage.getAllTermsAndConditions();
      res.json(tac);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch terms and conditions" });
    }
  });

  app.get("/api/public/terms-and-conditions/:type", async (req, res) => {
    try {
      const tac = await storage.getTermsAndConditionsByType(req.params.type);
      if (!tac) return res.status(404).json({ error: "Terms and conditions not found" });
      res.json(tac);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch terms and conditions" });
    }
  });

  app.get("/api/admin/terms-and-conditions", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const tac = await storage.getAllTermsAndConditions();
      res.json(tac);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch terms and conditions" });
    }
  });

  app.post("/api/admin/terms-and-conditions", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const validated = insertTermsAndConditionsSchema.parse(req.body);
      const tac = await storage.createTermsAndConditions(validated);
      res.status(201).json(tac);
    } catch (error) {
      res.status(400).json({ error: "Invalid terms and conditions data" });
    }
  });

  app.patch("/api/admin/terms-and-conditions/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const tac = await storage.updateTermsAndConditions(req.params.id, req.body);
      res.json(tac || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to update terms and conditions" });
    }
  });

  app.get("/api/admin/pages", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const pages = await storage.getAllPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.get("/api/public/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page || !page.isPublished) return res.status(404).json({ error: "Page not found" });
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  app.post("/api/admin/pages", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const page = await storage.createPage(req.body);
      res.status(201).json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to create page" });
    }
  });

  app.patch("/api/admin/pages/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const page = await storage.updatePage(req.params.id, req.body);
      if (!page) return res.status(404).json({ error: "Page not found" });
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.delete("/api/admin/pages/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deletePage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  app.post("/api/admin/students/:id/payment", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { amount, paymentDate } = req.body;
      const student = await storage.updateStudent(req.params.id, { 
        feePaid: true, 
        feeAmount: amount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      });
      if (!student) return res.status(404).json({ error: "Student not found" });
      const { password, ...studentData } = student;
      res.json(studentData);
    } catch (error) {
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  app.get("/api/admin/fee-records", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const students = await storage.getAllStudents();
      const feeRecords = students
        .filter(s => s.feePaid)
        .map(({ password, ...s }) => ({
          fullName: s.fullName,
          registrationNumber: s.registrationNumber,
          rollNumber: s.rollNumber,
          class: s.class,
          feeLevel: s.feeLevel,
          feeAmount: s.feeAmount,
          paymentDate: s.paymentDate
        }));
      res.json(feeRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fee records" });
    }
  });

  app.post("/api/auth/volunteer/register", async (req, res) => {
    try {
      const { email, password, confirmPassword, fullName, phone, address, city, occupation, skills, availability, photoUrl } = req.body;
      
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      
      const existing = await storage.getVolunteerAccountByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const volunteer = await storage.createVolunteerAccount({
        email,
        password: hashedPassword,
        fullName,
        phone,
        address,
        city,
        occupation,
        skills,
        availability,
        photoUrl,
      });
      
      const token = generateToken({ id: volunteer.id.toString(), email: volunteer.email, role: "volunteer", name: volunteer.fullName });
      
      // Send email notifications
      sendVolunteerRegistrationEmail({
        email: volunteer.email,
        fullName: volunteer.fullName,
        phone: volunteer.phone || "",
      }).catch(err => console.error("Volunteer registration email error:", err));
      
      sendAdminNotificationEmail({
        type: "Volunteer Registration",
        name: volunteer.fullName,
        email: volunteer.email,
        details: {
          "Phone": volunteer.phone || "N/A",
          "City": city || "N/A",
          "Occupation": occupation || "N/A",
          "Skills": skills || "N/A",
        },
      }).catch(err => console.error("Admin notification email error:", err));
      
      res.status(201).json({ 
        success: true, 
        message: "Registration successful! Your account is pending admin approval. / पंजीकरण सफल! आपका खाता व्यवस्थापक की मंजूरी की प्रतीक्षा में है।",
        token,
        user: { id: volunteer.id, email: volunteer.email, role: "volunteer", name: volunteer.fullName, isApproved: volunteer.isApproved }
      });
    } catch (error) {
      console.error("Volunteer registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/volunteer/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const volunteer = await storage.getVolunteerAccountByEmail(email);
      
      if (!volunteer) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (!volunteer.isActive) {
        return res.status(403).json({ error: "Account is deactivated" });
      }
      
      const isValid = await bcrypt.compare(password, volunteer.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check if volunteer is approved by admin
      if (!volunteer.isApproved) {
        return res.status(403).json({ error: "Account pending admin approval. Please wait. / खाता व्यवस्थापक स्वीकृति की प्रतीक्षा में है।" });
      }
      
      const token = generateToken({ id: volunteer.id.toString(), email: volunteer.email, role: "volunteer", name: volunteer.fullName });
      res.json({ 
        token, 
        user: { id: volunteer.id, email: volunteer.email, role: "volunteer", name: volunteer.fullName, isApproved: volunteer.isApproved }
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/admin/volunteer-accounts", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const accounts = await storage.getAllVolunteerAccounts();
      res.json(accounts.map(({ password, ...a }) => a));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch volunteer accounts" });
    }
  });

  app.patch("/api/admin/volunteer-accounts/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const updates: any = { ...req.body };
      if (req.body.isApproved === true && req.user?.id) {
        updates.approvedBy = req.user.id;
        updates.approvedAt = new Date();
      }
      const account = await storage.updateVolunteerAccount(req.params.id, updates);
      if (!account) return res.status(404).json({ error: "Volunteer account not found" });

      // Send approval email if volunteer is approved
      if (req.body.isApproved === true && account.email) {
        sendApprovalEmail({
          email: account.email,
          name: account.fullName,
          type: "volunteer",
          details: {
            "Email / ईमेल": account.email,
            "Phone / फोन": account.phone || "N/A",
          },
        }).catch(err => console.error("Volunteer approval email error:", err));
      }

      const { password, ...accountData } = account;
      res.json(accountData);
    } catch (error) {
      res.status(500).json({ error: "Failed to update volunteer account" });
    }
  });

  app.delete("/api/admin/volunteer-accounts/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const account = await storage.getVolunteerAccountById(req.params.id);
      if (!account) return res.status(404).json({ error: "Volunteer account not found" });

      await storage.deleteVolunteerAccount(req.params.id);
      res.json({ success: true, message: "Volunteer account deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete volunteer account" });
    }
  });

  // Bulk delete volunteer accounts
  app.post("/api/admin/volunteer-accounts/bulk-delete", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
      }
      await storage.bulkDeleteVolunteerAccounts(ids);
      res.json({ success: true, deleted: ids.length });
    } catch (error) {
      console.error("Bulk delete volunteer accounts error:", error);
      res.status(500).json({ error: "Failed to delete volunteer accounts" });
    }
  });

  app.post("/api/public/payment-transaction", async (req, res) => {
    try {
      const { type, name, email, phone, amount, transactionId, paymentMethod, purpose, fatherName, address, city, state, pincode, membershipLevel, photoUrl } = req.body;

      // Validation
      if (!type || !name || !phone || !amount || !transactionId) {
        return res.status(400).json({ error: "Missing required fields: type, name, phone, amount, transactionId" });
      }

      const existingTransaction = await storage.getPaymentTransactionByTransactionId(transactionId);
      if (existingTransaction) {
        return res.status(400).json({ error: "Transaction ID already exists" });
      }

      const transaction = await storage.createPaymentTransaction({
        type,
        name,
        email,
        phone,
        amount,
        transactionId,
        paymentMethod,
        purpose,
        fatherName,
        address,
        city,
        state,
        pincode,
        membershipLevel,
        photoUrl,
      });

      // Send email notifications (non-blocking)
      if (email) {
        sendPaymentConfirmationEmail({
          email,
          name: name || "User",
          amount: amount || 0,
          transactionId: transactionId || "",
          type: type || "payment",
          purpose,
        }).catch(err => console.error("Payment confirmation email error:", err));
      }

      sendAdminNotificationEmail({
        type: `Payment (${type || "Unknown"})`,
        name: name || "Unknown",
        email: email || "N/A",
        details: {
          "Type": type || "N/A",
          "Amount": `Rs. ${amount || 0}`,
          "UTR/Transaction ID": transactionId || "N/A",
          "Payment Method": paymentMethod || "N/A",
          "Purpose": purpose || "N/A",
        },
      }).catch(err => console.error("Admin payment notification error:", err));

      res.status(201).json({
        success: true,
        message: "Payment submitted successfully! Please wait for admin approval. / भुगतान सफलतापूर्वक जमा हुआ! कृपया व्यवस्थापक की मंजूरी की प्रतीक्षा करें।",
        transaction: { id: transaction.id, status: transaction.status }
      });
    } catch (error: any) {
      console.error("Payment transaction error:", error);
      const errorMessage = error?.message || "Failed to submit payment";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/admin/payment-transactions", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const transactions = await storage.getAllPaymentTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/payment-transactions/pending", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const transactions = await storage.getPendingPaymentTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending transactions" });
    }
  });

  // Bulk delete payment transactions
  app.post("/api/admin/payment-transactions/bulk-delete", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
      }
      await storage.bulkDeletePaymentTransactions(ids);
      res.json({ success: true, deleted: ids.length });
    } catch (error) {
      console.error("Bulk delete payment transactions error:", error);
      res.status(500).json({ error: "Failed to delete transactions" });
    }
  });

  app.patch("/api/admin/payment-transactions/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const updates: any = { ...req.body };
      if (req.body.status === "approved" && req.user?.id) {
        updates.approvedBy = req.user.id;
        updates.approvedAt = new Date();
      }
      const transaction = await storage.updatePaymentTransaction(req.params.id, updates);
      if (!transaction) return res.status(404).json({ error: "Transaction not found" });

      // Send approval email if status changed to approved
      if (req.body.status === "approved" && transaction.email) {
        // Generate I-Card for member if this is a membership payment
        if (transaction.type === "membership") {
          let member = await Member.findOne({ email: transaction.email });

          // Create member if doesn't exist
          if (!member) {
            // Generate membership number
            const count = await Member.countDocuments();
            const membershipNumber = `MWSS-M${String(count + 1).padStart(4, "0")}`;

            // Hash a default password (user should reset it)
            const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

            member = await Member.create({
              email: transaction.email,
              password: hashedPassword,
              fullName: transaction.name || "Member",
              phone: transaction.phone || "",
              address: transaction.address || "",
              city: transaction.city || "",
              membershipType: transaction.membershipLevel || "regular",
              membershipNumber: membershipNumber,
              status: "approved",
              approvalStatus: "approved",
              isVerified: true,
              isActive: true,
              membershipStartDate: new Date(),
              membershipExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
              termsAccepted: true,
              termsAcceptedAt: new Date(),
              approvedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
              approvedAt: new Date(),
            });
            console.log(`Member created from payment transaction: ${transaction.email}`);
          }

          // Check if I-Card already exists
          let iCard = await storage.getMemberCardByMemberId(member._id.toString());

          if (!iCard) {
            // Generate card number
            const count = await MemberCard.countDocuments();
            const cardNumber = `MWSS-CARD-${String(count + 1).padStart(6, "0")}`;

            // Create I-Card
            iCard = await storage.createMemberCard({
              memberId: member._id.toString(),
              membershipNumber: member.membershipNumber || "",
              memberName: member.fullName,
              memberEmail: member.email,
              memberPhone: member.phone,
              memberCity: member.city,
              memberAddress: member.address,
              cardNumber: cardNumber,
              isGenerated: true,
              validFrom: new Date().toISOString().split('T')[0],
              validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            });

            // Update member with iCard reference
            await Member.findByIdAndUpdate(member._id, { iCardId: iCard.id });
          }
        }

        sendApprovalEmail({
          email: transaction.email,
          name: transaction.name || "User",
          type: "payment",
          details: {
            "Type / प्रकार": transaction.type || "Payment",
            "Amount / राशि": `Rs. ${transaction.amount || 0}`,
            "Transaction ID": transaction.transactionId || "N/A",
          },
        }).catch(err => console.error("Payment approval email error:", err));
      }

      res.json(transaction);
    } catch (error) {
      console.error("Payment update error:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.get("/api/admin/team-members", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const members = await storage.getAllTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/public/team-members", async (req, res) => {
    try {
      const members = await storage.getActiveTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.post("/api/admin/team-members", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const member = await storage.createTeamMember(req.body);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  app.patch("/api/admin/team-members/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const member = await storage.updateTeamMember(req.params.id, req.body);
      if (!member) return res.status(404).json({ error: "Team member not found" });
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/admin/team-members/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteTeamMember(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  app.get("/api/admin/services", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/public/services", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.patch("/api/admin/services/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const service = await storage.updateService(req.params.id, req.body);
      if (!service) return res.status(404).json({ error: "Service not found" });
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  app.get("/api/public/payment-transaction/check/:transactionId", async (req, res) => {
    try {
      const transaction = await storage.getPaymentTransactionByTransactionId(req.params.transactionId);
      if (!transaction) return res.status(404).json({ error: "Transaction not found" });
      res.json({ status: transaction.status, type: transaction.type, amount: transaction.amount });
    } catch (error) {
      res.status(500).json({ error: "Failed to check transaction" });
    }
  });

  // Gallery Images API
  app.get("/api/public/gallery", async (req, res) => {
    try {
      const images = await storage.getActiveGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery images" });
    }
  });

  app.get("/api/public/gallery/:category", async (req, res) => {
    try {
      const images = await storage.getGalleryImagesByCategory(req.params.category);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery images" });
    }
  });

  app.get("/api/admin/gallery", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery images" });
    }
  });

  app.post("/api/admin/gallery", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const validated = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(validated);
      res.status(201).json(image);
    } catch (error) {
      console.error("Gallery image creation error:", error);
      res.status(400).json({ error: "Invalid gallery image data" });
    }
  });

  app.patch("/api/admin/gallery/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const image = await storage.updateGalleryImage(req.params.id, req.body);
      res.json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to update gallery image" });
    }
  });

  app.delete("/api/admin/gallery/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteGalleryImage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete gallery image" });
    }
  });

  // ============ EVENTS ROUTES ============
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.get("/api/admin/events", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/admin/events", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const validated = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validated);
      res.status(201).json(event);
    } catch (error: any) {
      console.error("Event creation error:", error);
      res.status(400).json({ error: error.message || "Invalid event data" });
    }
  });

  app.patch("/api/admin/events/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/admin/events/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // ============ NEWS ROUTES ============
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getActiveNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const news = await storage.getNewsById(req.params.id);
      if (!news) return res.status(404).json({ error: "News not found" });
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/admin/news", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/admin/news", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const validated = insertNewsSchema.parse({
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : new Date(),
      });
      const news = await storage.createNews(validated);
      res.status(201).json(news);
    } catch (error: any) {
      console.error("News creation error:", error);
      res.status(400).json({ error: error.message || "Invalid news data" });
    }
  });

  app.patch("/api/admin/news/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const updateData = {
        ...req.body,
        ...(req.body.date && { date: new Date(req.body.date) }),
      };
      const news = await storage.updateNews(req.params.id, updateData);
      if (!news) return res.status(404).json({ error: "News not found" });
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to update news" });
    }
  });

  app.delete("/api/admin/news/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      await storage.deleteNews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete news" });
    }
  });

  // ============ PASSWORD RESET ROUTES ============
  app.post("/api/auth/student/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const student = await storage.getStudentByEmail(email);

      if (!student) {
        // Don't reveal if email exists or not for security
        return res.json({ success: true, message: "If this email exists, you will receive a password reset link." });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save reset token to database
      await PasswordResetToken.create({
        userId: student.id,
        userType: 'student',
        token: resetToken,
        email: email,
        expiresAt: expiresAt,
        used: false
      });

      const resetLink = `${process.env.PUBLIC_BASE_URL}/student/reset-password?token=${resetToken}`;

      // Send email
      await sendPasswordResetEmail({
        email: student.email,
        name: student.fullName,
        resetLink: resetLink,
        type: 'student'
      });

      res.json({ success: true, message: "Password reset link sent to your email." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/student/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      const resetTokenDoc = await PasswordResetToken.findOne({ token, used: false });

      if (!resetTokenDoc) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      if (new Date() > resetTokenDoc.expiresAt) {
        return res.status(400).json({ error: "Password reset token has expired" });
      }

      // Get student and update password
      const student = await storage.getStudentById(resetTokenDoc.userId.toString());
      if (!student) {
        return res.status(400).json({ error: "Student not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateStudent(student.id.toString(), { password: hashedPassword });

      // Mark token as used
      await PasswordResetToken.findByIdAndUpdate(resetTokenDoc._id, { used: true });

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // ============ MEMBER ROUTES ============
  app.post("/api/auth/member/register", async (req, res) => {
    try {
      const { email, password, fullName, phone, city, address } = req.body;

      const existing = await Member.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const count = await Member.countDocuments();
      const membershipNumber = `MWSS-MB${String(count + 1).padStart(5, "0")}`;

      const member = await Member.create({
        email,
        password: hashedPassword,
        fullName,
        phone,
        city: city || 'Haryana',
        address: address || '',
        membershipNumber,
        membershipType: 'regular',
        isActive: true
      });

      const token = generateToken({ id: member._id.toString(), email: member.email, role: "member", name: member.fullName });

      await sendApprovalEmail({
        email: member.email,
        name: member.fullName,
        type: 'membership',
        details: {
          'Email / ईमेल': member.email,
          'Membership Number': membershipNumber,
          'Phone / फोन': phone || 'N/A'
        }
      }).catch((err: any) => console.error("Member registration email error:", err));

      const { password: _, ...memberData } = member.toObject();
      res.status(201).json({
        success: true,
        token,
        user: {
          id: member._id,
          email: member.email,
          role: "member",
          name: member.fullName,
          membershipNumber
        },
        registrationNumber: membershipNumber
      });
    } catch (error) {
      console.error("Member registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/member/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const member = await Member.findOne({ email });

      if (!member) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!member.isActive) {
        return res.status(403).json({ error: "Account is deactivated" });
      }

      // Check if member is verified by admin
      if (!member.isVerified) {
        return res.status(403).json({ error: "Account pending admin verification. Please wait for approval. / खाता व्यवस्थापक सत्यापन की प्रतीक्षा में है।" });
      }

      const isValid = await bcrypt.compare(password, member.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if member has approved payment transaction
      const transactions = await storage.getPaymentTransactionsByEmail(email);
      const hasApprovedPayment = transactions.some(t => t.status === "approved" && t.type === "membership");

      if (!hasApprovedPayment) {
        return res.status(403).json({ error: "Payment pending approval. Please wait for admin approval. / भुगतान स्वीकृति लंबित है।" });
      }

      const token = generateToken({ id: member._id.toString(), email: member.email, role: "member", name: member.fullName });
      const { password: _, ...memberData } = member.toObject();

      res.json({
        token,
        user: {
          id: member._id,
          email: member.email,
          role: "member",
          name: member.fullName,
          membershipNumber: member.membershipNumber
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/member/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const member = await Member.findOne({ email });

      if (!member) {
        return res.json({ success: true, message: "If this email exists, you will receive a password reset link." });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await PasswordResetToken.create({
        userId: member._id,
        userType: 'member',
        token: resetToken,
        email: email,
        expiresAt: expiresAt,
        used: false
      });

      const resetLink = `${process.env.PUBLIC_BASE_URL}/member/reset-password?token=${resetToken}`;

      await sendPasswordResetEmail({
        email: member.email,
        name: member.fullName,
        resetLink: resetLink,
        type: 'member'
      });

      res.json({ success: true, message: "Password reset link sent to your email." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/member/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      const resetTokenDoc = await PasswordResetToken.findOne({ token, used: false });

      if (!resetTokenDoc) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      if (new Date() > resetTokenDoc.expiresAt) {
        return res.status(400).json({ error: "Password reset token has expired" });
      }

      const member = await Member.findById(resetTokenDoc.userId);
      if (!member) {
        return res.status(400).json({ error: "Member not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await Member.findByIdAndUpdate(member._id, { password: hashedPassword });

      await PasswordResetToken.findByIdAndUpdate(resetTokenDoc._id, { used: true });

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/auth/member/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "member") {
        return res.status(403).json({ error: "Only members can access this endpoint" });
      }

      const member = await Member.findById(req.user.id);

      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      const { password, ...memberData } = member.toObject();
      res.json({ ...memberData, role: "member" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member data" });
    }
  });

  app.get("/api/auth/member/transactions", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "member") {
        return res.status(403).json({ error: "Only members can access this endpoint" });
      }

      const member = await Member.findById(req.user.id);

      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Get payment transactions for this member by email
      const transactions = await storage.getPaymentTransactionsByEmail(member.email);

      // Filter to only membership transactions
      const membershipTransactions = transactions.filter(t => t.type === "membership");

      res.json(membershipTransactions);
    } catch (error) {
      console.error("Error fetching member transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/auth/member/icard", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "member") {
        return res.status(403).json({ error: "Only members can access this endpoint" });
      }

      const member = await Member.findById(req.user.id);

      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Get I-Card for this member
      const iCard = await storage.getMemberCardByMemberId(member._id.toString());

      if (!iCard) {
        return res.status(404).json({ error: "I-Card not generated yet. Please wait for admin to verify your membership." });
      }

      res.json(iCard);
    } catch (error) {
      console.error("Error fetching member I-Card:", error);
      res.status(500).json({ error: "Failed to fetch I-Card" });
    }
  });

  // ============ ADMIN MEMBER MANAGEMENT ROUTES ============
  app.post("/api/admin/members/:id/generate-icard", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const member = await Member.findById(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Check if I-Card already exists
      let iCard = await storage.getMemberCardByMemberId(member._id.toString());

      if (iCard) {
        return res.json({ success: true, message: "I-Card already exists", iCard });
      }

      // Generate card number
      const count = await MemberCard.countDocuments();
      const cardNumber = `MWSS-CARD-${String(count + 1).padStart(6, "0")}`;

      // Create I-Card
      iCard = await storage.createMemberCard({
        memberId: member._id.toString(),
        membershipNumber: member.membershipNumber || "",
        memberName: member.fullName,
        memberEmail: member.email,
        memberPhone: member.phone,
        memberCity: member.city,
        memberAddress: member.address,
        cardNumber: cardNumber,
        isGenerated: true,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      });

      // Update member with iCard reference
      await Member.findByIdAndUpdate(member._id, { iCardId: iCard.id });

      res.json({
        success: true,
        message: "I-Card generated successfully",
        iCard
      });
    } catch (error) {
      console.error("Generate I-Card error:", error);
      res.status(500).json({ error: "Failed to generate I-Card" });
    }
  });

  app.get("/api/admin/members", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const members = await Member.find().sort({ createdAt: -1 });
      const membersWithoutPassword = members.map(m => {
        const obj = m.toObject();
        delete obj.password;
        return obj;
      });
      res.json(membersWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/admin/members/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const member = await Member.findById(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Get payment transactions for this member
      const transactions = await storage.getPaymentTransactionsByEmail(member.email);

      const memberObj = member.toObject();
      delete memberObj.password;

      res.json({
        member: memberObj,
        transactions: transactions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member details" });
    }
  });

  // Bulk delete members
  app.post("/api/admin/members/bulk-delete", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided" });
      }
      await Member.deleteMany({ _id: { $in: ids } });
      res.json({ success: true, deleted: ids.length });
    } catch (error) {
      console.error("Bulk delete members error:", error);
      res.status(500).json({ error: "Failed to delete members" });
    }
  });

  app.patch("/api/admin/members/:id", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
    try {
      const { isVerified, adminNotes } = req.body;

      const member = await Member.findByIdAndUpdate(
        req.params.id,
        {
          ...(isVerified !== undefined && { isVerified }),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Send approval email if verified
      if (isVerified === true && member.email) {
        sendApprovalEmail({
          email: member.email,
          name: member.fullName,
          type: "member",
          details: {
            "Membership Number": member.membershipNumber || "N/A",
            "Email / ईमेल": member.email,
            "Phone / फोन": member.phone || "N/A"
          }
        }).catch(err => console.error("Member approval email error:", err));
      }

      const memberObj = member.toObject();
      delete memberObj.password;

      res.json(memberObj);
    } catch (error) {
      res.status(500).json({ error: "Failed to update member" });
    }
  });
}
