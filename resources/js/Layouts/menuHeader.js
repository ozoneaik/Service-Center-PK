export function getMenuHeaders(user) {
    return [
        {
            name: 'แจ้งซ่อม',
            routeUrl: 'repair.index'
        },
        {
            name: 'ประวัติซ่อม',
            routeUrl: 'history.index'
        },
        {
            name: 'ส่งซ่อมไปยังพัมคินฯ',
            childs: [
                {
                    name: 'ส่งต่อเคสซ่อมไปยังพัมคินฯ',
                    routeUrl: 'sendJobs.list'
                },
                {
                    name: 'ออกเอกสารส่งกลับ พัมคินฯ',
                    routeUrl: 'sendJobs.docJobList'
                }
            ]
        },
        {
            name: 'ลงทะเบียนรับประกันสินค้า',
            routeUrl: 'warranty.index'
        },
        {
            name: 'แจ้งเคลมอะไหล่และตรวจสอบสถานะเคลม',
            routeUrl: 'spareClaim.index'
        },
        {
            name: 'สั่งซื้ออะไหล่และตรวจสอบไดอะแกรม',
            routeUrl: 'orders.list'
        },
        {
            name: 'รายงานศูนย์บริการ',
            routeUrl: 'report.menu',
            target: '_blank'
        }
    ];
}

export function getMenuHeadersAdminBranch(user) {
    if (!user.admin_that_branch) return [];

    return [
        {
            name: 'จัดการร้านค้า',
            childs: [
                {
                    name: 'สต็อกอะไหล่',
                    routeUrl: 'stockSp.list',
                    is_code_cust_id: true
                },
                {
                    name: 'ปรับปรุงสต็อก',
                    routeUrl: 'sfd',
                    is_code_cust_id: true
                },
                {
                    name: 'ข้อมูลผู้ใช้',
                    routeUrl: 'storeUsers.index'
                }
            ]
        }
    ];
}

export function getMenuHeadersAdmin(user) {
    if (user.role !== 'admin') return [];

    return [
        {
            name: 'ผู้ดูแลระบบ',
            routerUrl: 'admin.show',
            childs: []
        }
    ];
}
