import NavLink from "@/Components/NavLink.jsx";
import {Button, Menu, MenuItem} from "@mui/material";
import {useState} from "react";
import {Link} from "@inertiajs/react";

export default function NavBar({user}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (redirect) => {
        setAnchorEl(null);
    };
    return (
        <>
            <NavLink href={route('dashboard')} active={route().current('dashboard')}>แจ้งซ่อม</NavLink>
            <NavLink href={route('history.index')} active={route().current('history.index')}>ประวัติซ่อม</NavLink>
            <div
                className={'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none '}>
                <Button
                    id="basic-button"
                    sx={{color: route().current('sendJobs.list') ? 'white' : '#6b7280'}}
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    ส่งซ่อมไปยัง PK
                </Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem component={Link} href={route('sendJobs.list')}>ส่งซ่อมไปยัง PK</MenuItem>
                    <MenuItem component={Link} href={route('sendJobs.docJobList')}>ทำใบ</MenuItem>
                </Menu>
            </div>
            {/*<NavLink href={route('sendJobs.list')} active={route().current('sendJobs.list')}>ส่งซ่อมไปยัง PK</NavLink>*/}
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
                        id="basic-button"
                        sx={{color: route().current('sendJobs.list') ? 'white' : '#6b7280'}}
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                    >
                        จัดการร้านค้า
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem component={Link} href={route('stockSp.list', { is_code_cust_id: user.is_code_cust_id })}>จัดการสต็อกอะไหล่</MenuItem>
                        <MenuItem component={Link} href={route('sendJobs.docJobList')}>ข้อมูลผู้ใช้</MenuItem>
                    </Menu>
                </div>

                // <NavLink href={route('stockSp.list', { is_code_cust_id: user.is_code_cust_id })} active={route().current('stockSp.list')}>ข้อมูลผู้ใช้</NavLink>
            )}
            {user.role === 'admin' && (
                <>
                    <NavLink href={route('admin.show')} active={route().current('admin.show')}>ผู้ดูแลระบบ</NavLink>
                </>
            )}
        </>
    )
}
