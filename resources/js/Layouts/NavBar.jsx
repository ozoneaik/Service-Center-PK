import NavLink from "@/Components/NavLink.jsx";
import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { Link } from "@inertiajs/react";

export default function NavBar({ user }) {
    // แยก state สำหรับแต่ละเมนู
    const [anchorEl1, setAnchorEl1] = useState(null);
    const [anchorEl2, setAnchorEl2] = useState(null);

    // สถานะเปิด/ปิดของแต่ละเมนู
    const openMenu1 = Boolean(anchorEl1);
    const openMenu2 = Boolean(anchorEl2);

    // จัดการคลิกเมนูที่ 1
    const handleClick1 = (event) => {
        setAnchorEl1(event.currentTarget);
    };

    // จัดการคลิกเมนูที่ 2
    const handleClick2 = (event) => {
        setAnchorEl2(event.currentTarget);
    };

    // จัดการปิดเมนูที่ 1
    const handleClose1 = () => {
        setAnchorEl1(null);
    };

    // จัดการปิดเมนูที่ 2
    const handleClose2 = () => {
        setAnchorEl2(null);
    };

    return (
        <>
            <NavLink href={route('dashboard')} active={route().current('dashboard')}>แจ้งซ่อม</NavLink>
            <NavLink href={route('history.index')} active={route().current('history.index')}>ประวัติซ่อม</NavLink>
            <div
                className={'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none '}
            >
                <Button
                    id="menu-button-1"
                    sx={{ color: route().current('sendJobs.list') || route().current('sendJobs.docJobList') ? 'white' : '#6b7280' }}
                    aria-controls={openMenu1 ? 'menu-1' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu1 ? 'true' : undefined}
                    onClick={handleClick1}
                >
                    ส่งซ่อมไปยังพัมคินฯ
                </Button>
                <Menu
                    id="menu-1"
                    anchorEl={anchorEl1}
                    open={openMenu1}
                    onClose={handleClose1}
                    MenuListProps={{
                        'aria-labelledby': 'menu-button-1',
                    }}
                >
                    <MenuItem component={Link} href={route('sendJobs.list')} onClick={handleClose1}>ส่งซ่อมพัมคินฯ</MenuItem>
                    <MenuItem component={Link} href={route('sendJobs.docJobList')} onClick={handleClose1}>ออกเอกสารส่งกลับ</MenuItem>
                </Menu>
            </div>
            <NavLink
                href={route('warranty.index')}
                active={route().current('warranty.index')}
            >
                ลงทะเบียนรับประกัน
            </NavLink>
            <NavLink
                href={route('spareClaim.index')}
                active={route().current('spareClaim.index') || route().current('spareClaim.history') || route().current('spareClaim.pending')}
            >
                แจ้งเคลมอะไหล่
            </NavLink>
            <NavLink href={route('orders.list')} active={route().current('orders.list')}>สั่งซื้ออะไหล่</NavLink>
            {user.admin_that_branch && (

                <div
                    className={'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none '}>
                    <Button
                        id="menu-button-2"
                        sx={{ color: route().current('stockSp.list') || route().current('storeUsers.index') ? 'white' : '#6b7280' }}
                        aria-controls={openMenu2 ? 'menu-2' : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu2 ? 'true' : undefined}
                        onClick={handleClick2}
                    >
                        จัดการร้านค้า
                    </Button>
                    <Menu
                        id="menu-2"
                        anchorEl={anchorEl2}
                        open={openMenu2}
                        onClose={handleClose2}
                        MenuListProps={{
                            'aria-labelledby': 'menu-button-2',
                        }}
                    >
                        <MenuItem component={Link} href={route('stockSp.list', { is_code_cust_id: user.is_code_cust_id })} onClick={handleClose2}>จัดการสต็อกอะไหล่</MenuItem>
                        <MenuItem component={Link} href={route('storeUsers.index')} onClick={handleClose2}>ข้อมูลผู้ใช้</MenuItem>
                    </Menu>
                </div>
            )}
            {user.role === 'admin' && (
                <NavLink href={route('admin.show')} active={route().current('admin.show')}>ผู้ดูแลระบบ</NavLink>
            )}
        </>
    )
}
