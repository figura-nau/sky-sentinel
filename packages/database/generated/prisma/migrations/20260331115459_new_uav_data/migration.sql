-- CreateEnum
CREATE TYPE "FailureType" AS ENUM ('HARDWARE', 'SOFTWARE', 'NETWORK', 'AERODYNAMIC', 'FLIGHT_DYNAMICS', 'OTHER');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "CAM_STATUS" AS ENUM ('ACTIVE', 'DEGRADED');

-- CreateTable
CREATE TABLE "FailureLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "FailureType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "description" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "uavDataId" UUID NOT NULL,

    CONSTRAINT "FailureLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UAVdata" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION NOT NULL,
    "fix_type" INTEGER NOT NULL,
    "airspeed" DOUBLE PRECISION NOT NULL,
    "groundspeed" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION NOT NULL,
    "pitch" DOUBLE PRECISION NOT NULL,
    "roll" DOUBLE PRECISION NOT NULL,
    "throttle" DOUBLE PRECISION NOT NULL,
    "batt_rem" DOUBLE PRECISION NOT NULL,
    "servo_current" DOUBLE PRECISION NOT NULL,
    "vibration" DOUBLE PRECISION NOT NULL,
    "rssi" DOUBLE PRECISION,
    "cam_status" "CAM_STATUS" NOT NULL,
    "signal_quality" DOUBLE PRECISION NOT NULL,
    "loiter_radius" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "UAVdata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UAVdata_timestamp_idx" ON "UAVdata"("timestamp");

-- AddForeignKey
ALTER TABLE "FailureLog" ADD CONSTRAINT "FailureLog_uavDataId_fkey" FOREIGN KEY ("uavDataId") REFERENCES "UAVdata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
