-- DropForeignKey
ALTER TABLE "AdminActivityLog" DROP CONSTRAINT "AdminActivityLog_adminId_fkey";

-- AddForeignKey
ALTER TABLE "AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
