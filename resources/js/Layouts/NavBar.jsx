import NavLink from "@/Components/NavLink.jsx";

const list = [
    {title: 'แจ้งซ่อม', url: 'dashboard'},
    {title: 'ประวัติซ่อม', url: 'dashboard'},
    {title: 'ลงทะเบียนรับประกัน', url: 'dashboard'},
    {title: 'แจ้งเคลมอะไหล่', url: 'dashboard'},
    {title: 'สั่งซื้ออะไหล่', url: 'dashboard'},
]


export default function NavBar() {
    return (
        <>
            {list.map((item, index) => (
                <NavLink key={index} href={route(item.url)} active={route().current(item.url)}>
                    {item.title}
                </NavLink>
            ))}
        </>
    )
}
