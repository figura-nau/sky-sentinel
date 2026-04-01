/*
  Warnings:

  - The `vibration` column on the `UAVdata` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `rssi` on table `UAVdata` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UAVdata" DROP COLUMN "vibration",
ADD COLUMN     "vibration" DOUBLE PRECISION[],
ALTER COLUMN "rssi" SET NOT NULL;
