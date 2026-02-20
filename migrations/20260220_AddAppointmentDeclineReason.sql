-- Migration: Add DeclineReason to Appointments Table
-- Date: 2026-02-20

ALTER TABLE petcare.appointments 
ADD COLUMN IF NOT EXISTS decline_reason TEXT;
