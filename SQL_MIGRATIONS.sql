-- SQL Migration Queries for Train Number Feature
-- Run these queries on your PostgreSQL database

-- Add new columns to ride_intents table
ALTER TABLE ride_intents
ADD COLUMN IF NOT EXISTS train_number VARCHAR(10);

ALTER TABLE ride_intents
ADD COLUMN IF NOT EXISTS train_name VARCHAR(255);

-- Drop the old arrival_time column and add arrival_date
-- Note: If there is existing data in arrival_time, you may want to migrate it first
ALTER TABLE ride_intents
DROP COLUMN IF EXISTS arrival_time CASCADE;

ALTER TABLE ride_intents
ADD COLUMN IF NOT EXISTS arrival_date DATE NOT NULL;

-- Create index on the new arrival_date column for faster queries
CREATE INDEX IF NOT EXISTS idx_ride_intents_arrival_date 
ON ride_intents(arrival_date);

-- Create index on train_number for filtering
CREATE INDEX IF NOT EXISTS idx_ride_intents_train_number 
ON ride_intents(train_number);

-- Alternative: If you want to preserve arrival_time and add arrival_date alongside it:
-- (Use this if you have existing data you want to preserve)
-- ALTER TABLE ride_intents
-- ADD COLUMN IF NOT EXISTS arrival_date DATE;
-- UPDATE ride_intents SET arrival_date = DATE(arrival_time) WHERE arrival_date IS NULL;
-- ALTER TABLE ride_intents ALTER COLUMN arrival_date SET NOT NULL;
-- Then drop arrival_time if desired:
-- ALTER TABLE ride_intents DROP COLUMN arrival_time CASCADE;
