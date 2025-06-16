import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import {Link, usePage} from '@inertiajs/react';
import {useState} from 'react';
import icon from '../assets/images/logo.png'
import {Avatar, Button, Typography} from "@mui/material";
import watermark from '../assets/images/coverMini.jpg'
import HeaderImage from '../assets/images/cover.png'
import NavBar from "@/Layouts/NavBar.jsx";
import {ArrowDownward, ArrowUpward, Menu} from "@mui/icons-material";

const HeaderImageStyle = {
    backgroundImage: `url(${HeaderImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% auto',
    backgroundPosition: 'top'
}

const WatermarkStyle = {
    backgroundImage: `url(${watermark})`,
    backgroundRepeat: 'repeat',
    backgroundSize: '300px auto',
    backgroundPosition: 'center',
    // opacity: 0.1,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    pointerEvents: 'none'
}


export default function AuthenticatedLayout({header, children}) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    return (
        <div className="min-h-screen relative" style={HeaderImageStyle}>
            {/* Watermark Layer */}
            <div style={WatermarkStyle}></div>

            <nav className="fixed w-full z-50 border-b border-gray-100 bg-orange/75 backdrop-blur-sm">
                <div className="px-3 bg-black/75">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center gap-2 text-white font-bold">
                                <Avatar src={icon || ''}/>
                                <Typography>SERVICE CENTER PK</Typography>
                            </div>
                            {/*<div className="hidden space-x-8 md:-my-px md:ms-10 md:flex">*/}
                            <div className="hidden space-x-8 lg:-my-px lg:ms-10 lg:flex">
                                <NavBar user={user}/>
                            </div>
                        </div>

                        {/*<div className="hidden md:ms-6 md:flex md:items-center">*/}
                        <div className="hidden lg:ms-6 lg:flex lg:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <Button size='small' variant='contained' color='primary' endIcon={<Menu/>}>
                                            <Avatar sx={{color : 'gray' ,width: 28, height: 28,bgcolor : 'white'}}>
                                                {user.name.split('',1)}
                                            </Avatar>
                                        </Button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            ข้อมูลส่วนตัว
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            ออกจากระบบ
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/*<div className="-me-2 flex items-center md:hidden">*/}
                        <div className="-me-2 flex items-center lg:hidden">
                            <Button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState,)}
                                variant={!showingNavigationDropdown ? 'contained' : 'outlined'} color='primary'
                                startIcon={showingNavigationDropdown ? <ArrowUpward/> : <ArrowDownward/>}
                            >
                                ดูเมนู
                            </Button>
                        </div>
                    </div>
                </div>

                <div
                    style={{backgroundColor: '#404040', color: '#fff'}}
                    // className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden'}
                    className={(showingNavigationDropdown ? 'block' : 'hidden') + ' lg:hidden'}
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('repair.index')} active={route().current('repair.index')}>
                            แจ้งซ่อม
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('history.index')} active={route().current('history.index')}>
                            ประวัติซ่อม
                        </ResponsiveNavLink>
                        <ResponsiveNavLink component={Link} href={route('sendJobs.list')}>
                            ส่งซ่อมพิมคินฯ
                        </ResponsiveNavLink>
                        <ResponsiveNavLink component={Link} href={route('sendJobs.docJobList')}>
                            ออกเอกสารส่งกลับ
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('warranty.index')} active={route().current('warranty.index')}>
                            ลงทะเบียนรับประกัน
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('spareClaim.index')}
                                           active={route().current('spareClaim.index')}>
                            แจ้งเคลมอะไหล่
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('orders.list')} active={route().current('orders.list')}>
                            สั่งซื้ออะไหล่
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('profile.edit')}>ข้อมูลส่วนตัว</ResponsiveNavLink>
                        {user.admin_that_branch && (
                            <>
                                <ResponsiveNavLink
                                    href={route('stockSp.list', {is_code_cust_id: user.is_code_cust_id})}>
                                    จัดการสต็อกอะไหล่
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('storeUsers.index')}>
                                    ข้อมูลผู้ใช้
                                </ResponsiveNavLink>
                            </>
                        )}
                        {user.role === 'admin' && (
                            <ResponsiveNavLink href={route('admin.show')}>ผู้ดูแลระบบ</ResponsiveNavLink>
                        )}
                    </div>
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="mt-3 space-y-1">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                ออกจากระบบ
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow pt-16">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
}
