const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('./config/database');

// Ensure signature upload folder exists
const uploadDir = path.join(__dirname, 'uploads', 'signatures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Create sample digital signature SVGs
const createSampleSignatureSvg = (name, filename) => {
    const filePath = path.join(uploadDir, filename);
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">
        <rect width="100%" height="100%" fill="transparent"/>
        <path d="M 20 60 Q 60 20 100 55 T 180 40 T 260 50 M 50 75 Q 120 85 240 65" 
              fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <text x="30" y="88" font-family="'Brush Script MT', 'Dancing Script', cursive, sans-serif" font-size="22" fill="#334155">${name}</text>
    </svg>`;
    fs.writeFileSync(filePath, svgContent);
    return `/uploads/signatures/${filename}`;
};

const employeeSigUrl = createSampleSignatureSvg('Rahul Sharma', 'sample-employee-sig.svg');
const ananyaSigUrl = createSampleSignatureSvg('Ananya Iyer', 'sample-ananya-sig.svg');
const directorSigUrl = createSampleSignatureSvg('Vikram Malhotra', 'sample-director-sig.svg');

const seed = () => {
    console.log('🌱 Seeding database...');

    // Clear existing data for fresh seed
    db.prepare('DELETE FROM vouchers').run();
    db.prepare('DELETE FROM users').run();

    const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

    // 1. Insert Users
    const insertUser = db.prepare(`
        INSERT INTO users (name, email, password_hash, role, employee_code, department, signature_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const emp1 = insertUser.run(
        'Rahul Sharma',
        'employee@abc.com',
        hashPassword('employee123'),
        'employee',
        'EMP-1042',
        'Engineering',
        employeeSigUrl
    );

    const emp2 = insertUser.run(
        'Ananya Iyer',
        'ananya@abc.com',
        hashPassword('employee123'),
        'employee',
        'EMP-1088',
        'Marketing',
        ananyaSigUrl
    );

    const director = insertUser.run(
        'Dr. Vikram Malhotra',
        'director@abc.com',
        hashPassword('director123'),
        'director',
        'DIR-0001',
        'Executive Management',
        directorSigUrl
    );

    const accounts = insertUser.run(
        'Priya Sundaram',
        'accounts@abc.com',
        hashPassword('accounts123'),
        'accounts',
        'ACC-2005',
        'Finance & Accounts',
        null
    );

    console.log('✅ Users seeded:');
    console.log('   - Employee 1: employee@abc.com / employee123');
    console.log('   - Employee 2: ananya@abc.com / employee123');
    console.log('   - Director:   director@abc.com / director123');
    console.log('   - Accounts:   accounts@abc.com / accounts123');

    // 2. Insert Vouchers
    const insertVoucher = db.prepare(`
        INSERT INTO vouchers (
            voucher_number, voucher_date, expense_date, department,
            expense_title, expense_category, expense_description, amount,
            employee_id, employee_name, employee_code, employee_signature,
            status, director_id, director_name, director_signature,
            approval_date, rejection_reason, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?
        )
    `);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];
    const fourDaysAgo = new Date(Date.now() - 345600000).toISOString().split('T')[0];

    // Voucher 1: Draft (Rahul)
    insertVoucher.run(
        'EV-2026-0001',
        today,
        today,
        'Engineering',
        'Annual Cloud Infrastructure Subscription',
        'Software & Tools',
        'AWS & DigitalOcean monthly server hosting and database cluster costs for production deployment.',
        14500.00,
        emp1.lastInsertRowid,
        'Rahul Sharma',
        'EMP-1042',
        null,
        'Draft',
        null,
        null,
        null,
        null,
        null,
        new Date().toISOString(),
        new Date().toISOString()
    );

    // Voucher 2: Pending Approval (Rahul)
    insertVoucher.run(
        'EV-2026-0002',
        yesterday,
        yesterday,
        'Engineering',
        'Client Technical Conference Travel & Accommodation',
        'Travel & Commute',
        'Round-trip flight tickets and 2 nights hotel stay for representing ABC Company at TechSummit Bangalore.',
        28750.50,
        emp1.lastInsertRowid,
        'Rahul Sharma',
        'EMP-1042',
        employeeSigUrl,
        'Pending Approval',
        null,
        null,
        null,
        null,
        null,
        new Date(Date.now() - 86400000).toISOString(),
        new Date(Date.now() - 86400000).toISOString()
    );

    // Voucher 3: Pending Approval (Ananya)
    insertVoucher.run(
        'EV-2026-0003',
        yesterday,
        yesterday,
        'Marketing',
        'Social Media Campaign Graphics & Video Freelancer',
        'Marketing & Ads',
        'Payment to freelance animator for Q4 promotional product reel and brand asset kit.',
        12000.00,
        emp2.lastInsertRowid,
        'Ananya Iyer',
        'EMP-1088',
        ananyaSigUrl,
        'Pending Approval',
        null,
        null,
        null,
        null,
        null,
        new Date(Date.now() - 72000000).toISOString(),
        new Date(Date.now() - 72000000).toISOString()
    );

    // Voucher 4: Approved (Rahul)
    insertVoucher.run(
        'EV-2026-0004',
        twoDaysAgo,
        threeDaysAgo,
        'Engineering',
        'Ergonomic Dual Monitors & Standing Desk Converter',
        'Hardware & Equipment',
        'Purchase of Dell 27-inch 4K monitors and ergonomic desk mounts for frontend development workstation.',
        34200.00,
        emp1.lastInsertRowid,
        'Rahul Sharma',
        'EMP-1042',
        employeeSigUrl,
        'Approved',
        director.lastInsertRowid,
        'Dr. Vikram Malhotra',
        directorSigUrl,
        new Date().toISOString(),
        null,
        new Date(Date.now() - 172800000).toISOString(),
        new Date().toISOString()
    );

    // Voucher 5: Approved (Ananya)
    insertVoucher.run(
        'EV-2026-0005',
        threeDaysAgo,
        fourDaysAgo,
        'Marketing',
        'Client Luncheon & Quarterly Strategy Review',
        'Meals & Entertainment',
        'Business lunch meeting with enterprise partnership leads at Hyatt Regency.',
        8950.00,
        emp2.lastInsertRowid,
        'Ananya Iyer',
        'EMP-1088',
        ananyaSigUrl,
        'Approved',
        director.lastInsertRowid,
        'Dr. Vikram Malhotra',
        directorSigUrl,
        new Date(Date.now() - 86400000).toISOString(),
        null,
        new Date(Date.now() - 259200000).toISOString(),
        new Date(Date.now() - 86400000).toISOString()
    );

    // Voucher 6: Rejected (Rahul)
    insertVoucher.run(
        'EV-2026-0006',
        fourDaysAgo,
        fourDaysAgo,
        'Engineering',
        'Personal Noise Cancelling Headphones',
        'Hardware & Equipment',
        'High-end wireless headphones requested for remote work focus.',
        22990.00,
        emp1.lastInsertRowid,
        'Rahul Sharma',
        'EMP-1042',
        employeeSigUrl,
        'Rejected',
        director.lastInsertRowid,
        'Dr. Vikram Malhotra',
        null,
        null,
        'Personal audio accessories are not covered under company equipment policy without prior executive pre-clearance. Please resubmit under general office supplies with standard company-approved vendor items.',
        new Date(Date.now() - 345600000).toISOString(),
        new Date(Date.now() - 172800000).toISOString()
    );

    console.log('✅ Demo vouchers seeded (Draft, Pending Approval, Approved, Rejected).');
    console.log('🎉 Database seeding complete!');
};

seed();
