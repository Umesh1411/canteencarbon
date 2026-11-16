-- ============================================================================
-- CanteenCarbon — Relational Database Schema (MySQL / PostgreSQL Equivalent)
-- ============================================================================

-- 1. Users Table (Role-Based Hierarchy)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY, -- Firebase UID or UUID
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(150),
    role ENUM('manager', 'kitchen_staff', 'sustainability_officer', 'university_admin') NOT NULL DEFAULT 'kitchen_staff',
    canteen_id VARCHAR(64) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Canteens Profile Table
CREATE TABLE IF NOT EXISTS canteens (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    campus VARCHAR(200) NOT NULL,
    daily_average_capacity INT DEFAULT 500,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Waste Entries Table (Scale Weigh-ins)
CREATE TABLE IF NOT EXISTS waste_entries (
    id VARCHAR(64) PRIMARY KEY,
    service_date DATE NOT NULL,
    meal_period ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
    dish_name VARCHAR(255) NOT NULL,
    category ENUM('Vegetables', 'MeAt', 'dairy', 'GRAINS', 'poultry', 'fruits', 'seafood', 'Other') NOT NULL,
    prepared_kg DECIMAL(8, 2) DEFAULT 0.00,
    served_kg DECIMAL(8, 2) DEFAULT 0.00,
    edible_leftover_kg DECIMAL(8, 2) DEFAULT 0.00,
    prep_scraps_kg DECIMAL(8, 2) DEFAULT 0.00,
    spoiled_kg DECIMAL(8, 2) DEFAULT 0.00,
    total_waste_kg DECIMAL(8, 2) NOT NULL,
    meals_served INT DEFAULT 0,
    waste_per_meal_g DECIMAL(8, 2) DEFAULT 0.00,
    notes TEXT,
    recorded_by VARCHAR(128) NOT NULL,
    canteen_id VARCHAR(64) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE SET NULL
);

-- 4. Emission Factors Reference Table (IPCC / FAO Cradle-to-Gate)
CREATE TABLE IF NOT EXISTS emission_factors (
    category VARCHAR(64) PRIMARY KEY,
    factor_kg_co2e_per_kg DECIMAL(6, 2) NOT NULL,
    lifecycle_boundary VARCHAR(100) DEFAULT 'Cradle-to-gate',
    source VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Populate Verified Baseline Emission Factors
INSERT INTO emission_factors (category, factor_kg_co2e_per_kg, source) VALUES
('MeAt', 27.00, 'Poore & Nemecek, Science (2018)'),
('poultry', 6.90, 'Poore & Nemecek, Science (2018)'),
('seafood', 5.40, 'Poore & Nemecek, Science (2018)'),
('dairy', 3.20, 'IPCC AR6 WGIII (2022)'),
('rice', 2.70, 'IPCC 2006 Guidelines'),
('Other', 2.50, 'FAO global food waste estimate'),
('Vegetables', 2.00, 'FAO (2021)'),
('GRAINS', 1.40, 'FAO (2021)'),
('fruits', 1.10, 'FAO (2021)'),
('legumes', 0.90, 'Poore & Nemecek, Science (2018)')
ON DUPLICATE KEY UPDATE factor_kg_co2e_per_kg=VALUES(factor_kg_co2e_per_kg);

-- 5. ML Forecast Audit Log Table
CREATE TABLE IF NOT EXISTS ml_forecast_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    anticipated_meals INT NOT NULL,
    past_waste_kg DECIMAL(8, 2) NOT NULL,
    day_of_week INT NOT NULL,
    temperature_c DECIMAL(5, 2),
    humidity_percent DECIMAL(5, 2),
    kitchen_staff_count INT,
    predicted_waste_kg DECIMAL(8, 2) NOT NULL,
    confidence_interval_low DECIMAL(8, 2),
    confidence_interval_high DECIMAL(8, 2),
    model_version VARCHAR(64) DEFAULT 'RandomForest_v2.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
