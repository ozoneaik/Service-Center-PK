import {useState} from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, IconButton, useTheme,
} from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayoutMangeAdmin from "@/Pages/Admin/LayoutMangeAdmin.jsx";

export default function AdminMainPage() {
    const theme = useTheme();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        {
            text: "อะไหล่รอเคลม",
            icon: <DashboardIcon/>,
            path: "/dashboard"
        },
        {
            text: "อนุมัติอะไหล่",
            icon: <DashboardIcon/>,
            path: "approvalSp.index"
        },
    ];

    return (
        <AuthenticatedLayout>
            <LayoutMangeAdmin>
            </LayoutMangeAdmin>
        </AuthenticatedLayout>
    );
}
