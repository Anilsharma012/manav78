import { Student, Member, VolunteerAccount } from "../models";
import { log } from "../vite";

export async function startAccountDeletionJob() {
  // Run cleanup every hour (3600000ms)
  const CLEANUP_INTERVAL = process.env.CLEANUP_INTERVAL ? parseInt(process.env.CLEANUP_INTERVAL) : 3600000;
  
  async function cleanupExpiredAccounts() {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Delete expired student accounts
      const expiredStudents = await Student.deleteMany({
        registrationDate: { $lt: oneMonthAgo },
        isActive: true
      });
      
      if (expiredStudents.deletedCount > 0) {
        log(`Deleted ${expiredStudents.deletedCount} expired student account(s)`);
      }

      // Delete expired member accounts
      const expiredMembers = await Member.deleteMany({
        createdAt: { $lt: oneMonthAgo },
        isActive: true
      });
      
      if (expiredMembers.deletedCount > 0) {
        log(`Deleted ${expiredMembers.deletedCount} expired member account(s)`);
      }

      // Delete expired volunteer accounts
      const expiredVolunteers = await VolunteerAccount.deleteMany({
        createdAt: { $lt: oneMonthAgo },
        isActive: true
      });
      
      if (expiredVolunteers.deletedCount > 0) {
        log(`Deleted ${expiredVolunteers.deletedCount} expired volunteer account(s)`);
      }
    } catch (error) {
      console.error("Account deletion job error:", error);
    }
  }

  // Run cleanup immediately on startup
  await cleanupExpiredAccounts();

  // Schedule recurring cleanup
  setInterval(cleanupExpiredAccounts, CLEANUP_INTERVAL);
  log(`Account deletion job started (runs every ${CLEANUP_INTERVAL / 60000} minutes)`);
}
