/*
  Warnings:

  - You are about to drop the column `batt_rem` on the `UAVdata` table. All the data in the column will be lost.
  - You are about to drop the column `cam_status` on the `UAVdata` table. All the data in the column will be lost.
  - You are about to drop the column `fix_type` on the `UAVdata` table. All the data in the column will be lost.
  - You are about to drop the column `loiter_radius` on the `UAVdata` table. All the data in the column will be lost.
  - You are about to drop the column `servo_current` on the `UAVdata` table. All the data in the column will be lost.
  - You are about to drop the column `signal_quality` on the `UAVdata` table. All the data in the column will be lost.
  - Added the required column `battRem` to the `UAVdata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `camStatus` to the `UAVdata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixType` to the `UAVdata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loiterRadius` to the `UAVdata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servoCurrent` to the `UAVdata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signalQuality` to the `UAVdata` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "camStatus" AS ENUM ('ACTIVE', 'DEGRADED');

-- AlterTable
ALTER TABLE "UAVdata" DROP COLUMN "batt_rem",
DROP COLUMN "cam_status",
DROP COLUMN "fix_type",
DROP COLUMN "loiter_radius",
DROP COLUMN "servo_current",
DROP COLUMN "signal_quality",
ADD COLUMN     "battRem" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "camStatus" "camStatus" NOT NULL,
ADD COLUMN     "fixType" INTEGER NOT NULL,
ADD COLUMN     "loiterRadius" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "servoCurrent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "signalQuality" DOUBLE PRECISION NOT NULL;

-- DropEnum
DROP TYPE "CAM_STATUS";
