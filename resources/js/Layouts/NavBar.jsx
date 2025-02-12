import NavLink from "@/Components/NavLink.jsx";

export default function NavBar({user}) {
    return (
        <>
            <NavLink href={route('dashboard')} active={route().current('dashboard')}>แจ้งซ่อม</NavLink>
            <NavLink href={route('dashboard')} active={route().current('dashboard')}>ประวัติซ่อม</NavLink>
            <NavLink href={route('warranty.index')} active={route().current('warranty.index')}>ลงทะเบียนรับประกัน</NavLink>
            <NavLink href={route('spareClaim.index')} active={route().current('spareClaim.index') || route().current('spareClaim.history')}>แจ้งเคลมอะไหล่</NavLink>
            <NavLink href={route('dashboard')} active={route().current('dashboard')}>สั่งซื้ออะไหล่</NavLink>
            {user.role === 'admin' && (
                <>
                <NavLink href={route('admin.show')} active={route().current('admin.show')}>ผู้ดูแลระบบ</NavLink>
                </>
            )}
        </>
    )
}
