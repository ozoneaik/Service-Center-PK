import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, IconButton, useTheme,
    Container,
    Grid2,
    CardHeader,
    CardContent,
    Card,
    Avatar,
    CardActionArea,
} from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayoutMangeAdmin from "@/Pages/Admin/LayoutMangeAdmin.jsx";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from "@inertiajs/react";
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
export default function AdminMainPage() {
    const theme = useTheme();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        {
            text: "เอกสารรอเคลม",
            icon: <AssignmentIcon />,
            path: "claimSP.index",
            color : 'gray'
        },
        {
            text: "อนุมัติอะไหล่",
            icon: <AssignmentTurnedInIcon />,
            path: "approvalSp.index",
            color : 'green'
        },
        {
            text: "จัดการผู้ใช้",
            icon: <GroupIcon />,
            path: "userManage.list",
            color : '#009dfe'
        },
        {
            text: "รายการคำสั่งซื้อ",
            icon: <ShoppingCartIcon />,
            path: "admin.orders.list",
            color : '#f15922'
        },
    ];


    return (
        <AuthenticatedLayout>
            <Container >
                <Grid2 container mt={2} spacing={2}>
                    {menuItems.map((menu, index) => (
                        <Grid2 size={3} key={index}>
                            <Card variant='outlined'>
                                <CardActionArea component={Link} href={route(menu.path)}>
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
