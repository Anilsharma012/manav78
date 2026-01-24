import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "admin" | "student" | "member";
    name?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

export function generateToken(payload: { id: string; email: string; role: "admin" | "student" | "member"; name?: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string; email: string; role: "admin" | "student" | "member"; name?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: "admin" | "student" | "member"; name?: string };
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }
  
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
  
  req.user = decoded;
  next();
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  next();
}

export function studentOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ error: "Forbidden - Student access required" });
  }
  next();
}
