import {useState} from "react";
import {
    Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, IconButton, useTheme,
} from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {Link} from "@inertiajs/react";

export default function LayoutMangeAdmin({children}) {
    const theme = useTheme();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        {
            text: "เอกสารรอเคลม",
            icon: <DashboardIcon/>,
            path: "claimSP.index"
        },
        {
            text: "อนุมัติอะไหล่",
            icon: <DashboardIcon/>,
            path: "approvalSp.index"
        },
        {
            text: "จัดการผู้ใช้",
            icon: <DashboardIcon/>,
            path: "userManage.list"
        },
        {
            text: "รายการคำสั่งซื้อ",
            icon: <DashboardIcon/>,
            path: "admin.orders.list"
        },
    ];

    return (

        <Box sx={{display: "flex"}}>
            <Box
                component="aside"
                sx={{
                    width: collapsed ? 80 : 280,
                    height: `calc(100vh - 4rem)`,
                    transition: theme.transitions.create("width", {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen
                    }),
                    overflowX: "hidden",
                    backgroundColor: theme.palette.background.paper,
                    borderRight: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "space-between",
                        p: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                >
                    {!collapsed && (
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "medium",
                                color: theme.palette.pumpkinColor.main
                            }}
                        >
                            ระบบจัดการ
                        </Typography>
                    )}
                    <IconButton
                        onClick={() => setCollapsed(!collapsed)}
                        sx={{
                            borderRadius: 1,
                            backgroundColor: theme.palette.background.default,
                            "&:hover": {
                                backgroundColor: theme.palette.action.hover
                            }
                        }}
                    >
                        {collapsed ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                    </IconButton>
                </Box>

                {/* Menu items */}
                <List sx={{flex: 1, overflowY: "auto", overflowX: "hidden", p: 1}}>
                    {menuItems.map((item) => (
                        <Box key={item.text}>
                            <ListItem disablePadding sx={{display: "block", mb: 0.5}}>
                                <ListItemButton
                                    component={Link}
                                    href={route(item.path)}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: collapsed ? "center" : "initial",
                                        px: 2.5,
                                        borderRadius: 1,
                                        "&:hover": {
                                            backgroundColor: theme.palette.action.hover
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: collapsed ? 0 : 3,
                                            justifyContent: "center",
                                            color: theme.palette.pumpkinColor.main
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && <ListItemText primary={item.text}/>}
                                </ListItemButton>
                            </ListItem>
                        </Box>
                    ))}
                </List>

                <Divider/>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    backgroundColor: theme.palette.background.default,
                    minHeight: `calc(100vh - 4rem)`
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
