/**
 * ============================================================================
 * MOCK DATA ENGINE - FOR PRESENTATION PURPOSES
 * ============================================================================
 * 
 * This script intercepts all fetch() calls and returns hardcoded mock data.
 * It ensures the frontend works without a running backend.
 * 
 * CONSISTENT DATA:
 * - Aggregator ID: AGG-2619283
 * - Aggregator Name: Green Earth Aggregators
 * - Username: greenearth
 * 
 * TO DISABLE: Simply remove this script from HTML files.
 * ============================================================================
 */

(function () {
    'use strict';

    console.log('🎭 MOCK DATA ENGINE ACTIVATED - Frontend is running in demo mode');

    // =========================================================================
    // MASTER MOCK DATA - Single source of truth
    // =========================================================================

    const MOCK_USER = {
        user_id: 'AGG-2619283',
        username: 'greenearth',
        org_name: 'Green Earth Aggregators',
        role: 'aggregator',
        user_role: 2,  // 1=Admin, 2=Aggregator, 3=Buyer
        email: 'contact@greenearthfpo.org',
        phone: '9876543210',
        status: 1  // Approved
    };

    const MOCK_CATCHMENTS = [
        {
            aggregator_id: 'AGG-2619283',
            district_name: 'Anantapur',
            mandal_name: 'Hindupur',
            panchayat_name: 'Lepakshi',
            village_name: 'Lepakshi Village',
            crop_name: 'Groundnut',
            status: 1
        },
        {
            aggregator_id: 'AGG-2619283',
            district_name: 'Anantapur',
            mandal_name: 'Penukonda',
            panchayat_name: 'Roddam',
            village_name: 'Roddam Village',
            crop_name: 'Red Gram',
            status: 1
        },
        {
            aggregator_id: 'AGG-2619283',
            district_name: 'Kurnool',
            mandal_name: 'Adoni',
            panchayat_name: 'Kosigi',
            village_name: 'Kosigi Village',
            crop_name: 'Cotton',
            status: 0  // Pending
        }
    ];

    const MOCK_FARMERS = [
        {
            farmer_id: '103220624555172847',
            farmer_name: 'Nirmala Nara',
            farmer_category: 'S2S',
            district_name: 'TIRUPATI',
            mandal_name: 'CHANDRAGIRI',
            panchayat_name: 'SESHA PURAM',
            village_name: 'SESHA PURAM',
            crop_name: 'PADDY',
            acreage: 1.0,
            status: 1
        },
        {
            farmer_id: '103220624555311824',
            farmer_name: 'K.Ellama Konamgi',
            farmer_category: 'S2S',
            district_name: 'TIRUPATI',
            mandal_name: 'CHANDRAGIRI',
            panchayat_name: 'SESHA PURAM',
            village_name: 'SESHA PURAM',
            crop_name: 'PADDY',
            acreage: 1.0,
            status: 1
        },
        {
            farmer_id: '103220624560122311',
            farmer_name: 'K.Gangulamma Konamgi',
            farmer_category: 'S2S',
            district_name: 'TIRUPATI',
            mandal_name: 'CHANDRAGIRI',
            panchayat_name: 'SESHA PURAM',
            village_name: 'SESHA PURAM',
            crop_name: 'MANGO',
            acreage: 1.0,
            status: 1
        },
        {
            farmer_id: '103220624570476915',
            farmer_name: 'Bobba Chaitanya',
            farmer_category: 'S2S',
            district_name: 'TIRUPATI',
            mandal_name: 'CHANDRAGIRI',
            panchayat_name: 'BHEEMAVARAM',
            village_name: 'BHEEMAVARAM',
            crop_name: 'PADDY',
            acreage: 2.0,
            status: 1
        },
        {
            farmer_id: '103220624572978160',
            farmer_name: 'Indravathi Palem',
            farmer_category: 'S2SW',
            district_name: 'TIRUPATI',
            mandal_name: 'CHANDRAGIRI',
            panchayat_name: 'SESHA PURAM',
            village_name: 'SESHA PURAM',
            crop_name: 'PADDY',
            acreage: 1.15,
            status: 1
        }
    ];

    const MOCK_DISTRICTS = [
        { id: 'D001', name: 'Anantapur' },
        { id: 'D002', name: 'Kurnool' },
        { id: 'D003', name: 'Kadapa' },
        { id: 'D004', name: 'Chittoor' },
        { id: 'D005', name: 'Nellore' }
    ];

    const MOCK_MANDALS = {
        'D001': [
            { id: 'M001', name: 'Hindupur' },
            { id: 'M002', name: 'Penukonda' },
            { id: 'M003', name: 'Dharmavaram' }
        ],
        'D002': [
            { id: 'M004', name: 'Adoni' },
            { id: 'M005', name: 'Yemmiganur' },
            { id: 'M006', name: 'Mantralayam' }
        ],
        'D003': [
            { id: 'M007', name: 'Kadapa' },
            { id: 'M008', name: 'Proddatur' }
        ],
        'D004': [
            { id: 'M009', name: 'Tirupati' },
            { id: 'M010', name: 'Madanapalle' }
        ],
        'D005': [
            { id: 'M011', name: 'Nellore' },
            { id: 'M012', name: 'Kavali' }
        ]
    };

    const MOCK_PANCHAYATS = {
        'M001': [{ id: 'P001', name: 'Lepakshi' }, { id: 'P002', name: 'Bukkapatnam' }],
        'M002': [{ id: 'P003', name: 'Roddam' }, { id: 'P004', name: 'Somandepalli' }],
        'M003': [{ id: 'P005', name: 'Mudigubba' }],
        'M004': [{ id: 'P006', name: 'Kosigi' }, { id: 'P007', name: 'Holagunda' }],
        'M005': [{ id: 'P008', name: 'Gonegandla' }],
        'M006': [{ id: 'P009', name: 'Mantralayam' }],
        'M007': [{ id: 'P010', name: 'Kadapa Town' }],
        'M008': [{ id: 'P011', name: 'Proddatur Town' }],
        'M009': [{ id: 'P012', name: 'Tirupati Urban' }],
        'M010': [{ id: 'P013', name: 'Madanapalle Town' }],
        'M011': [{ id: 'P014', name: 'Nellore Urban' }],
        'M012': [{ id: 'P015', name: 'Kavali Town' }]
    };

    const MOCK_VILLAGES = {
        'P001': [{ id: 'V001', name: 'Lepakshi Village' }],
        'P002': [{ id: 'V002', name: 'Bukkapatnam Village' }],
        'P003': [{ id: 'V003', name: 'Roddam Village' }],
        'P004': [{ id: 'V004', name: 'Somandepalli Village' }],
        'P005': [{ id: 'V005', name: 'Mudigubba Village' }],
        'P006': [{ id: 'V006', name: 'Kosigi Village' }],
        'P007': [{ id: 'V007', name: 'Holagunda Village' }],
        'P008': [{ id: 'V008', name: 'Gonegandla Village' }],
        'P009': [{ id: 'V009', name: 'Mantralayam Village' }],
        'P010': [{ id: 'V010', name: 'Kadapa Town' }],
        'P011': [{ id: 'V011', name: 'Proddatur Town' }],
        'P012': [{ id: 'V012', name: 'Tirupati Urban' }],
        'P013': [{ id: 'V013', name: 'Madanapalle Town' }],
        'P014': [{ id: 'V014', name: 'Nellore Urban' }],
        'P015': [{ id: 'V015', name: 'Kavali Town' }]
    };

    const MOCK_CROPS = [
        { crop_id: 'C001', crop_name: 'Groundnut', crop_variety_id: 'CV001', crop_variety_name: 'TMV-2' },
        { crop_id: 'C002', crop_name: 'Red Gram', crop_variety_id: 'CV002', crop_variety_name: 'LRG-41' },
        { crop_id: 'C003', crop_name: 'Cotton', crop_variety_id: 'CV003', crop_variety_name: 'Bt Cotton' },
        { crop_id: 'C004', crop_name: 'Paddy', crop_variety_id: 'CV004', crop_variety_name: 'BPT-5204' },
        { crop_id: 'C005', crop_name: 'Maize', crop_variety_id: 'CV005', crop_variety_name: 'DHM-117' }
    ];

    const MOCK_SEASONS = [
        { season: 'Kharif', period: '2025-26' },
        { season: 'Rabi', period: '2025-26' },
        { season: 'Kharif', period: '2024-25' },
        { season: 'Rabi', period: '2024-25' }
    ];

    const MOCK_BATCHES = [
        {
            batchId: 'BATCH-2619283-001',
            batchName: 'Groundnut Batch 1',
            cropName: 'Groundnut',
            cropVariety: 'TMV-2',
            procurementDate: '2026-01-05',
            aggregatorName: 'Green Earth Aggregators',
            farmerSources: [
                { farmerId: 'FRM-100201', quantity: 150.5, consent: true },
                { farmerId: 'FRM-100202', quantity: 85.0, consent: true }
            ]
        },
        {
            batchId: 'BATCH-2619283-002',
            batchName: 'Red Gram Batch 1',
            cropName: 'Red Gram',
            cropVariety: 'LRG-41',
            procurementDate: '2026-01-06',
            aggregatorName: 'Green Earth Aggregators',
            farmerSources: [
                { farmerId: 'FRM-100203', quantity: 200.0, consent: true },
                { farmerId: 'FRM-100204', quantity: 120.0, consent: true }
            ]
        }
    ];

    // =========================================================================
    // AUTO-LOGIN: Populate localStorage so dashboard works immediately
    // =========================================================================

    if (!localStorage.getItem('user')) {
        console.log('🔑 Auto-populating localStorage with mock user data');
        localStorage.setItem('access_token', 'mock-token-xyz-123');
        localStorage.setItem('user_id', MOCK_USER.user_id);
        localStorage.setItem('username', MOCK_USER.username);
        localStorage.setItem('user_role', MOCK_USER.user_role);
        localStorage.setItem('role', MOCK_USER.role);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
    }

    // Also populate sessionStorage with batches for mybatch.html
    if (!sessionStorage.getItem('myBatches')) {
        console.log('📦 Auto-populating sessionStorage with mock batch data');
        sessionStorage.setItem('myBatches', JSON.stringify(MOCK_BATCHES));
    }

    // =========================================================================
    // FETCH INTERCEPTOR
    // =========================================================================

    const originalFetch = window.fetch;

    window.fetch = async function (url, options = {}) {
        const urlStr = typeof url === 'string' ? url : url.toString();

        console.log(`🔄 [MOCK] Intercepted: ${urlStr}`);

        // --- AUTH: Login (Role-Based) ---
        if (urlStr.includes('/auth/login')) {
            // Parse form data to get username
            let username = 'aggregator';
            if (options.body instanceof FormData) {
                username = options.body.get('username') || 'aggregator';
            }

            const isAdmin = username.toLowerCase() === 'admin';

            const user = isAdmin ? {
                user_id: 'ADMIN-001',
                username: 'admin',
                org_name: 'APCNF Administrator',
                role: 'admin',
                user_role: 1,
                email: 'admin@apcnf.gov.in',
                phone: '9000000001',
                status: 1
            } : MOCK_USER;

            console.log(`✅ [MOCK] Login as ${isAdmin ? 'ADMIN' : 'AGGREGATOR'}`);

            // Update localStorage with correct user
            localStorage.setItem('access_token', 'mock-token-xyz-123');
            localStorage.setItem('user_id', user.user_id);
            localStorage.setItem('username', user.username);
            localStorage.setItem('user_role', user.user_role);
            localStorage.setItem('role', user.role);
            localStorage.setItem('user', JSON.stringify(user));

            return mockResponse({
                success: true,
                access_token: 'mock-token-xyz-123',
                user: user,
                redirect_url: isAdmin ? 'admin-approvals.html' : 'dashboard.html'
            });
        }

        // --- DASHBOARD: Summary Stats ---
        if (urlStr.includes('/dashboard/summary/')) {
            console.log('✅ [MOCK] Returning dashboard summary');
            return mockResponse({
                success: true,
                approved_catchments: MOCK_CATCHMENTS.filter(c => c.status === 1).length,
                approved_farmers: MOCK_FARMERS.length,
                total_batches: MOCK_BATCHES.length
            });
        }

        // --- CATCHMENT: My Requests ---
        if (urlStr.includes('/my-requests/')) {
            console.log('✅ [MOCK] Returning catchment requests');
            return mockResponse({
                success: true,
                count: MOCK_CATCHMENTS.length,
                requests: MOCK_CATCHMENTS
            });
        }

        // --- CATCHMENT: Farmers List ---
        if (urlStr.includes('/farmers/')) {
            console.log('✅ [MOCK] Returning farmers list');
            return mockResponse({
                success: true,
                count: MOCK_FARMERS.length,
                farmers: MOCK_FARMERS
            });
        }

        // --- DEMOGRAPHICS: Districts ---
        if (urlStr.includes('/demographics/districts')) {
            console.log('✅ [MOCK] Returning districts');
            return mockResponse({
                success: true,
                districts: MOCK_DISTRICTS
            });
        }

        // --- DEMOGRAPHICS: Mandals ---
        if (urlStr.includes('/demographics/mandals/')) {
            const districtId = urlStr.split('/mandals/')[1].split('?')[0];
            console.log(`✅ [MOCK] Returning mandals for district: ${districtId}`);
            return mockResponse({
                success: true,
                mandals: MOCK_MANDALS[districtId] || []
            });
        }

        // --- DEMOGRAPHICS: Panchayats ---
        if (urlStr.includes('/demographics/panchayats/')) {
            const mandalId = urlStr.split('/panchayats/')[1].split('?')[0];
            console.log(`✅ [MOCK] Returning panchayats for mandal: ${mandalId}`);
            return mockResponse({
                success: true,
                panchayats: MOCK_PANCHAYATS[mandalId] || []
            });
        }

        // --- DEMOGRAPHICS: Villages ---
        if (urlStr.includes('/demographics/villages/')) {
            const panchayatId = urlStr.split('/villages/')[1].split('?')[0];
            console.log(`✅ [MOCK] Returning villages for panchayat: ${panchayatId}`);
            return mockResponse({
                success: true,
                villages: MOCK_VILLAGES[panchayatId] || []
            });
        }

        // --- DEMOGRAPHICS: Crops ---
        if (urlStr.includes('/demographics/crops')) {
            console.log('✅ [MOCK] Returning crops');
            return mockResponse({
                success: true,
                crops: MOCK_CROPS
            });
        }

        // --- DEMOGRAPHICS: Seasons ---
        if (urlStr.includes('/demographics/seasons')) {
            console.log('✅ [MOCK] Returning seasons');
            return mockResponse({
                success: true,
                seasons: MOCK_SEASONS
            });
        }

        // --- DEMOGRAPHICS: VO (Village Organizations) ---
        if (urlStr.includes('/demographics/vo/')) {
            console.log('✅ [MOCK] Returning VOs (empty - using NA fallback)');
            return mockResponse({
                success: true,
                vos: []
            });
        }

        // --- DEMOGRAPHICS: SHG (Self Help Groups) ---
        if (urlStr.includes('/demographics/shg/')) {
            console.log('✅ [MOCK] Returning SHGs (empty - using NA fallback)');
            return mockResponse({
                success: true,
                shgs: []
            });
        }

        // --- CATCHMENT: Submit Request (POST) ---
        if (urlStr.includes('/catchment/request') && options.method === 'POST') {
            console.log('✅ [MOCK] Catchment request submitted successfully');
            return mockResponse({
                success: true,
                message: 'Catchment area request submitted successfully!',
                request_id: 'REQ-' + Date.now()
            });
        }

        // =====================================================================
        // ADMIN ENDPOINTS
        // =====================================================================

        // --- ADMIN: Pending Aggregators ---
        if (urlStr.includes('/admin/pending_aggregators')) {
            console.log('✅ [MOCK] Returning pending aggregators');
            return mockResponse({
                count: 2,
                aggregators: [
                    {
                        user_id: 'AGG-2619284',
                        org_name: 'Sunrise FPO',
                        type: 'FPO',
                        email: 'sunrise@fpo.org',
                        mobile: '9876543211',
                        documents: { registration: null, pan: 'pan_sunrise.pdf', aadhar: null }
                    },
                    {
                        user_id: 'AGG-2619285',
                        org_name: 'Kisan Collective',
                        type: 'Cooperative',
                        email: 'kisan@collective.in',
                        mobile: '9876543212',
                        documents: { registration: 'reg_kisan.pdf', pan: 'pan_kisan.pdf', aadhar: null }
                    }
                ]
            });
        }

        // --- ADMIN: Pending Buyers ---
        if (urlStr.includes('/admin/pending_buyers')) {
            console.log('✅ [MOCK] Returning pending buyers');
            return mockResponse({
                count: 1,
                buyers: [
                    {
                        user_id: 'BUY-3719001',
                        org_name: 'Metro Mart',
                        type: 'Retailer',
                        email: 'metro@mart.com',
                        mobile: '9876543220',
                        documents: { registration: 'reg_metro.pdf', pan: 'pan_metro.pdf', aadhar: null }
                    }
                ]
            });
        }

        // --- ADMIN: Application History ---
        if (urlStr.includes('/admin/application_history')) {
            console.log('✅ [MOCK] Returning application history');
            return mockResponse({
                count: 3,
                history: [
                    {
                        type: 'Aggregator',
                        user_id: 'AGG-2619283',
                        org_name: 'Green Earth Aggregators',
                        org_type: 'FPO',
                        email: 'contact@greenearthfpo.org',
                        mobile: '9876543210',
                        status: 'Approved',
                        documents: { registration: 'reg_greenearth.pdf', pan: 'pan_greenearth.pdf', aadhar: null }
                    },
                    {
                        type: 'Aggregator',
                        user_id: 'AGG-2619280',
                        org_name: 'Rejected FPO',
                        org_type: 'FPO',
                        email: 'rejected@fpo.org',
                        mobile: '9876543200',
                        status: 'Rejected',
                        documents: { registration: null, pan: null, aadhar: null }
                    },
                    {
                        type: 'Buyer',
                        user_id: 'BUY-3719000',
                        org_name: 'Approved Retail Store',
                        org_type: 'Retailer',
                        email: 'approved@retail.com',
                        mobile: '9876543230',
                        status: 'Approved',
                        documents: { registration: 'reg_retail.pdf', pan: 'pan_retail.pdf', aadhar: null }
                    }
                ]
            });
        }

        // --- ADMIN: Approve/Reject Aggregator ---
        if (urlStr.includes('/admin/approve_aggregator/') || urlStr.includes('/admin/reject_aggregator/')) {
            const action = urlStr.includes('approve') ? 'approved' : 'rejected';
            console.log(`✅ [MOCK] Aggregator ${action}`);
            return mockResponse({
                success: true,
                message: `Aggregator has been ${action} successfully!`
            });
        }

        // --- ADMIN: Approve/Reject Buyer ---
        if (urlStr.includes('/admin/approve_buyer/') || urlStr.includes('/admin/reject_buyer/')) {
            const action = urlStr.includes('approve') ? 'approved' : 'rejected';
            console.log(`✅ [MOCK] Buyer ${action}`);
            return mockResponse({
                success: true,
                message: `Buyer has been ${action} successfully!`
            });
        }

        // --- DEFAULT: Pass through to real fetch ---
        console.log(`⚠️ [MOCK] No mock found, passing through: ${urlStr}`);
        return originalFetch(url, options);
    };

    // =========================================================================
    // HELPER: Create mock Response object
    // =========================================================================

    function mockResponse(data, status = 200) {
        return Promise.resolve(new Response(JSON.stringify(data), {
            status: status,
            headers: { 'Content-Type': 'application/json' }
        }));
    }

    console.log('🎭 Mock data engine ready. All API calls will return demo data.');

})();
