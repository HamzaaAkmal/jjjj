-- Create database (run this manually in cPanel)
-- CREATE DATABASE cpanelusername_apartmentpro;

-- Users table for authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  last_login DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Buildings table
CREATE TABLE buildings (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  floors INT NOT NULL,
  units INT NOT NULL,
  status ENUM('active', 'construction', 'planned') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Apartments table
CREATE TABLE apartments (
  id VARCHAR(36) PRIMARY KEY,
  building_id VARCHAR(36) NOT NULL,
  number VARCHAR(50) NOT NULL,
  floor INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  size DECIMAL(10,2) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  status ENUM('available', 'reserved', 'sold', 'maintenance') NOT NULL DEFAULT 'available',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
);

-- Clients table
CREATE TABLE clients (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  type ENUM('investor', 'buyer', 'tenant') NOT NULL,
  status ENUM('active', 'pending', 'inactive') NOT NULL DEFAULT 'active',
  apartment_id VARCHAR(36),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE SET NULL
);

-- Payments table
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  apartment_id VARCHAR(36) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency ENUM('USD', 'PKR') NOT NULL DEFAULT 'USD',
  status ENUM('paid', 'pending', 'overdue') NOT NULL DEFAULT 'pending',
  method ENUM('bank_transfer', 'cash', 'check', 'credit_card') NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
);

-- Leads table
CREATE TABLE leads (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  interest VARCHAR(255) NOT NULL,
  source ENUM('website', 'referral', 'social_media', 'property_portal', 'walk_in', 'other') NOT NULL,
  status ENUM('new', 'contacted', 'qualified', 'unqualified', 'converted') NOT NULL DEFAULT 'new',
  notes TEXT,
  last_contact DATE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Ad Banners table
CREATE TABLE ad_banners (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) NOT NULL,
  link_url VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- System Settings table
CREATE TABLE system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  company_name VARCHAR(255) NOT NULL,
  company_email VARCHAR(255) NOT NULL,
  company_phone VARCHAR(50) NOT NULL,
  company_address TEXT NOT NULL,
  default_currency ENUM('USD', 'PKR') NOT NULL DEFAULT 'USD',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  date_format VARCHAR(20) NOT NULL DEFAULT 'mdy',
  logo_url VARCHAR(255),
  updated_at DATETIME NOT NULL
);

-- Transactions table for financial accounts
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  account_type ENUM('construction', 'finance') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency ENUM('USD', 'PKR') NOT NULL DEFAULT 'USD',
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME NOT NULL
);

-- Insert initial admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
VALUES ('Admin User', 'admin@example.com', '$2b$10$XFE/UzEy.ZZhW0XrS0OYj.T.qfT5yxcZvPRTa.ZZhW0XrS0OYj', 'admin', 'active', NOW(), NOW());

-- Insert sample buildings
INSERT INTO buildings (id, name, address, floors, units, status, created_at, updated_at)
VALUES 
('A', 'Building A', '123 Main Street, City', 5, 12, 'active', NOW(), NOW()),
('B', 'Building B', '456 Park Avenue, City', 8, 18, 'active', NOW(), NOW()),
('C', 'Building C', '789 Ocean Drive, City', 10, 24, 'construction', NOW(), NOW()),
('D', 'Building D', '321 Mountain View, City', 12, 30, 'planned', NOW(), NOW());

-- Insert system settings
INSERT INTO system_settings (company_name, company_email, company_phone, company_address, default_currency, language, timezone, date_format, updated_at)
VALUES ('ApartmentPro Inc.', 'info@apartmentpro.com', '+1 (555) 123-4567', '123 Business Street, Suite 100, City, State, 12345', 'USD', 'en', 'UTC', 'mdy', NOW());
