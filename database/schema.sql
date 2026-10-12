-- Expense Voucher Management System - Database Schema
-- Compatible with SQLite, PostgreSQL, and MySQL

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK(role IN ('employee', 'director', 'accounts')),
    employee_code VARCHAR(50),
    department VARCHAR(100),
    signature_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number VARCHAR(50) NOT NULL UNIQUE,
    voucher_date DATE NOT NULL,
    expense_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    expense_title VARCHAR(200) NOT NULL,
    expense_category VARCHAR(100) NOT NULL,
    expense_description TEXT,
    amount DECIMAL(12, 2) NOT NULL CHECK(amount > 0),
    
    -- Employee Information
    employee_id INTEGER NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    employee_code VARCHAR(50),
    employee_signature TEXT,
    
    -- Approval Information
    status VARCHAR(30) NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected')),
    director_id INTEGER,
    director_name VARCHAR(100),
    director_signature TEXT,
    approval_date DATETIME,
    rejection_reason TEXT,
    
    -- Audit Information
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (director_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for high-performance filtering, sorting, and reporting
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_employee_id ON vouchers(employee_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_expense_date ON vouchers(expense_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_department ON vouchers(department);
CREATE INDEX IF NOT EXISTS idx_vouchers_category ON vouchers(expense_category);
CREATE INDEX IF NOT EXISTS idx_vouchers_amount ON vouchers(amount);
CREATE INDEX IF NOT EXISTS idx_vouchers_created_at ON vouchers(created_at);
