import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Card,
    CardContent,
    Container,
    Grid2,
    Typography,
    Box,
    IconButton,
    Fade,
    Paper
} from "@mui/material";
import {
    Assessment as AssessmentIcon,
    PieChart as PieChartIcon,
    Inventory as InventoryIcon,
    Dashboard as DashboardIcon,
    BugReport as BugReportIcon,
    Settings as SettingsIcon,
    TrendingUp as TrendingUpIcon
} from "@mui/icons-material";

const listMenu = [
    {
        name: 'รายงานค่าตอบแทน (ค่าเปิดเครื่องในประกัน)',
        icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
        color: '#4CAF50',
        bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
        description: 'ตรวจสอบค่าตอบแทนและค่าเปิดเครื่องในประกัน'
    },
    {
        name: 'รายสรุปยอดรายรับ ศูนย์ซ่อม แยก เป็น ค่าบริการ ค่าอะไหล่ ค่าตอบแทน',
        icon: <PieChartIcon sx={{ fontSize: 40 }} />,
        color: '#2196F3',
        bgGradient: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
        description: 'สรุปรายรับทั้งหมดแยกตามประเภทค่าใช้จ่าย'
    },
    {
        name: 'รายงานสรุปยอดอะไหล่ ที่ใช้ไป',
        icon: <InventoryIcon sx={{ fontSize: 40 }} />,
        color: '#FF9800',
        bgGradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
        description: 'ติดตามการใช้งานอะไหล่และสต็อกคงเหลือ'
    },
    {
        name: 'Dashboard สรุปงานศูนย์ซ่อม',
        icon: <DashboardIcon sx={{ fontSize: 40 }} />,
        color: '#9C27B0',
        bgGradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
        description: 'ภาพรวมการทำงานของศูนย์ซ่อมแบบ Real-time'
    },
    {
        name: 'Dashboard สถานะการเคลมอะไหล่',
        icon: <BugReportIcon sx={{ fontSize: 40 }} />,
        color: '#F44336',
        bgGradient: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
        description: 'ติดตามสถานะการเคลมและการรับประกันอะไหล่'
    },
    {
        name: 'รายการค่าเปิดเครื่อง',
        icon: <SettingsIcon sx={{ fontSize: 40 }} />,
        color: '#607D8B',
        bgGradient: 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)',
        description: 'จัดการและตรวจสอบรายการค่าเปิดเครื่อง'
    }
];

export default function ReportMenu() {
    return (
        <AuthenticatedLayout>
            {/* Header Section */}


            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Grid2 container spacing={3}>
                    {listMenu.map((item, index) => (
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
                            <Fade in={true} timeout={500 + (index * 100)}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        minHeight: 200,
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease-in-out',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: 'none',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                            '& .icon-container': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                            },
                                            '& .gradient-overlay': {
                                                opacity: 0.1
                                            }
                                        }
                                    }}
                                >
                                    {/* Background Gradient Overlay */}
                                    <Box
                                        className="gradient-overlay"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: item.bgGradient,
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    />

                                    <CardContent sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        zIndex: 1,
                                        p: 3
                                    }}>
                                        {/* Icon Container */}
                                        <Box
                                            className="icon-container"
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                mb: 2,
                                                transition: 'transform 0.3s ease',
                                                color: item.color
                                            }}
                                        >
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: '50%',
                                                    backgroundColor: `${item.color}15`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {item.icon}
                                            </Paper>
                                        </Box>

                                        {/* Title */}
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            textAlign="center"
                                            sx={{
                                                mb: 1,
                                                color: '#2c3e50',
                                                lineHeight: 1.3,
                                                minHeight: 48
                                            }}
                                        >
                                            {item.name}
                                        </Typography>

                                        {/* Description */}
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            textAlign="center"
                                            sx={{
                                                flexGrow: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: '0.9rem',
                                                lineHeight: 1.4
                                            }}
                                        >
                                            {item.description}
                                        </Typography>

                                        {/* Action Button */}
                                        <Box display="flex" justifyContent="center" mt={2}>
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    backgroundColor: item.color,
                                                    color: 'white',
                                                    width: 36,
                                                    height: 36,
                                                    '&:hover': {
                                                        backgroundColor: item.color,
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            >
                                                <TrendingUpIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Fade>
                        </Grid2>
                    ))}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}
