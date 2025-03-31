import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Container, Grid2, CardHeader, Card, Avatar, CardActionArea, } from "@mui/material";
import { Link } from "@inertiajs/react";
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';
import StoreIcon from '@mui/icons-material/Store';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
export default function AdminMainPage() {
    const menuItems = [
        {
            text: "เอกสารรอเคลม",
            icon: <AssignmentIcon />,
            path: route("claimSP.index", { status: 'pending' }),
            color: 'gray'
        },
        {
            text: "อนุมัติอะไหล่",
            icon: <AssignmentTurnedInIcon />,
            path: route("approvalSp.index"),
            color: 'green'
        },
        {
            text: "จัดการผู้ใช้",
            icon: <GroupIcon />,
            path: route("userManage.list"),
            color: '#009dfe'
        },
        {
            text: "รายการคำสั่งซื้อ",
            icon: <ShoppingCartIcon />,
            path: route("admin.orders.list"),
            color: '#f15922'
        },
        {
            text : "ประวัติซ่อมทุกศูนย์ซ่อม",
            icon : <HistoryIcon/>,
            path : route('admin.history-job'),
            color : '#25347a'
        },
        {
            text : "จัดการศูนย์ซ่อม (สต็อกอะไหล่,GP)",
            icon : <StoreIcon/>,
            path : route('stockSp.shopList'),
            color : 'pink'
        },
        {
            text : "จัดการเซลล์",
            icon : <RecordVoiceOverIcon/>,
            path : route('Sales.index'),
            color : '#ffdf33'
        }
    ];


    return (
        <AuthenticatedLayout>
            <Container >
                <Grid2 container mt={2} spacing={2}>
                    {menuItems.map((menu, index) => (
                        <Grid2 size={{xs :12, md : 6,lg : 4}} key={index}>
                            <Card variant='outlined'>
                                <CardActionArea component={Link} href={menu.path}>
                                    <CardHeader
                                        avatar={
                                            <Avatar sx={{ bgcolor: menu.color }} aria-label="recipe">
                                                {menu.icon}
                                            </Avatar>
                                        }
                                        title={menu.text}
                                        subheader={`รายการที่ ${index + 1}`}
                                    />
                                </CardActionArea>
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}
