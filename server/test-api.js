// Comprehensive Automated Test Suite for Expense Voucher Management System
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('🧪 Starting API Verification Test Suite...\n');
    let passed = 0;
    let failed = 0;

    const assert = (condition, desc) => {
        if (condition) {
            console.log(`  ✅ PASS: ${desc}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${desc}`);
            failed++;
        }
    };

    try {
        // 1. Health check
        const healthRes = await fetch(`${BASE_URL}/health`);
        const health = await healthRes.json();
        assert(health.status === 'ok', 'Health Check endpoint responds ok');

        // 2. Authentication: Employee Login
        const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'employee@abc.com', password: 'employee123' })
        });
        const empLogin = await empLoginRes.json();
        assert(empLogin.success === true && empLogin.token, 'Employee login succeeds with JWT token');
        const empToken = empLogin.token;

        // 3. Employee Dashboard Stats
        const empStatsRes = await fetch(`${BASE_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${empToken}` }
        });
        const empStats = await empStatsRes.json();
        assert(empStats.role === 'employee' && empStats.stats.totalVouchers >= 4, 'Employee stats returned properly');

        // 4. Employee Voucher Creation (Draft)
        const createDraftRes = await fetch(`${BASE_URL}/vouchers`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${empToken}`
            },
            body: JSON.stringify({
                expense_date: '2026-10-12',
                department: 'Engineering',
                expense_title: 'Automated Test API Voucher - Office Supplies',
                expense_category: 'Office Supplies',
                expense_description: 'Test purchase of highlighters and notebooks',
                amount: 1250.00,
                status: 'Draft'
            })
        });
        const createDraft = await createDraftRes.json();
        assert(createDraft.success === true && createDraft.voucher.status === 'Draft', 'Voucher draft created successfully');
        const testVoucherId = createDraft.voucher.id;

        // 5. Submit Voucher without signature should fail
        const submitNoSigRes = await fetch(`${BASE_URL}/vouchers/${testVoucherId}/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${empToken}`
            },
            body: JSON.stringify({})
        });
        const submitNoSig = await submitNoSigRes.json();
        assert(submitNoSig.success === false, 'Submitting without employee signature properly rejected');

        // 6. Submit Voucher with signature succeeds
        const submitSigRes = await fetch(`${BASE_URL}/vouchers/${testVoucherId}/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${empToken}`
            },
            body: JSON.stringify({
                signature: '/uploads/signatures/sample-employee-sig.svg'
            })
        });
        const submitSig = await submitSigRes.json();
        assert(submitSig.success === true && submitSig.voucher.status === 'Pending Approval', 'Submitting with signature sets status to Pending Approval');

        // 7. Employee cannot edit submitted voucher
        const editSubmittedRes = await fetch(`${BASE_URL}/vouchers/${testVoucherId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${empToken}`
            },
            body: JSON.stringify({ amount: 9999 })
        });
        const editSubmitted = await editSubmittedRes.json();
        assert(editSubmitted.success === false, 'Business Rule: Editing submitted voucher rejected (read-only for employee)');

        // 8. Director Login
        const dirLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'director@abc.com', password: 'director123' })
        });
        const dirLogin = await dirLoginRes.json();
        assert(dirLogin.success === true && dirLogin.user.role === 'director', 'Director login succeeds');
        const dirToken = dirLogin.token;

        // 9. Director Approval without signature should fail
        const approveNoSigRes = await fetch(`${BASE_URL}/vouchers/${testVoucherId}/approve`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${dirToken}`
            },
            body: JSON.stringify({})
        });
        const approveNoSig = await approveNoSigRes.json();
        assert(approveNoSig.success === false, 'Director approval without signature rejected');

        // 10. Director Approval with signature succeeds
        const approveSigRes = await fetch(`${BASE_URL}/vouchers/${testVoucherId}/approve`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${dirToken}`
            },
            body: JSON.stringify({
                director_signature: '/uploads/signatures/sample-director-sig.svg'
            })
        });
        const approveSig = await approveSigRes.json();
        assert(approveSig.success === true && approveSig.voucher.status === 'Approved', 'Director approval with signature succeeds');

        // 11. Accounts Login
        const accLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'accounts@abc.com', password: 'accounts123' })
        });
        const accLogin = await accLoginRes.json();
        assert(accLogin.success === true && accLogin.user.role === 'accounts', 'Accounts login succeeds');
        const accToken = accLogin.token;

        // 12. Accounts Team can view approved voucher
        const accVoucherRes = await fetch(`${BASE_URL}/vouchers/${testVoucherId}`, {
            headers: { Authorization: `Bearer ${accToken}` }
        });
        const accVoucher = await accVoucherRes.json();
        assert(accVoucher.voucher && accVoucher.voucher.status === 'Approved', 'Accounts team can view approved voucher for disbursement');

        // 13. Accounts Team CANNOT approve or reject (Role enforcement)
        const accApproveRes = await fetch(`${BASE_URL}/vouchers/${testVoucherId}/approve`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accToken}`
            },
            body: JSON.stringify({ director_signature: 'test' })
        });
        const accApprove = await accApproveRes.json();
        assert(accApprove.success === false, 'Role Authorization: Accounts cannot approve vouchers (403 Forbidden)');

        // 14. Multi-Criteria Filter Test (Bonus Point)
        const filterRes = await fetch(`${BASE_URL}/vouchers?status=Approved&department=Engineering`, {
            headers: { Authorization: `Bearer ${accToken}` }
        });
        const filterData = await filterRes.json();
        assert(filterData.success === true && filterData.data.length > 0, 'Multi-criteria search & filter succeeds');

        console.log(`\n🏁 Test Results: ${passed} Passed, ${failed} Failed`);
    } catch (err) {
        console.error('Test execution failed with error:', err);
    }
}

runTests();
