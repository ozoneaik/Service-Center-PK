import NavLink from "@/Components/NavLink.jsx";

export default function NavBar({user}) {
    return (
        <>
            <NavLink href={route('dashboard')} active={route().current('dashboard')}>แจ้งซ่อม</NavLink>
            <NavLink href={route('history.index')} active={route().current('history.index')}>ประวัติซ่อม</NavLink>
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
            {user.role === 'admin' && (
                <>
                    <NavLink href={route('admin.show')} active={route().current('admin.show')}>ผู้ดูแลระบบ</NavLink>
                    <NavLink href={route('approvalSp.index')} active={route().current('approvalSp.index')}>อนุมัติอะไหล่</NavLink>
                </>
            )}
            {user.role === 'service' && user.admin_that_branch === true && (
                <>
                    <NavLink href={route('Manage.index')} active={route().current('Manage.index')}>จัดการบริการของตัวเอง</NavLink>
                </>
            )}
        </>
    )
}
