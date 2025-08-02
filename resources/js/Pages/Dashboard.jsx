import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Box, Container, Typography, Grid2, Card, CardContent, Chip, Paper, Avatar} from '@mui/material';
import {
    Build as BuildIcon, ShoppingCart as ShoppingCartIcon, Inventory as InventoryIcon,
    CheckCircle as CheckCircleIcon, AttachMoney as AttachMoneyIcon, Speed as SpeedIcon, AdsClick,
} from '@mui/icons-material';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title={'Dashboard - Pumpkin Service Center'}/>

            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                    color: 'white', py: 5, textAlign: 'center'
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        ศูนย์บริการซ่อม Pumpkin
                    </Typography>
                    <Typography variant="h5" sx={{opacity: 0.9}}>
                        บริการครบวงจร สำหรับการซ่อมบำรุง สั่งซื้ออะไหล่ และเช็คสต็อก
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="false" sx={{py: 4}}>

                {/* Services Grid2 */}
                <Grid2 container spacing={3} sx={{mb: 4}}>

                    {/* Service 1: แจ้งซ่อม */}
                    <Grid2 size={{xs: 12, md: 4}}>
                        <Card
                            elevation={3}
                            sx={{
                                height: '100%', textAlign: 'center', transition: '0.3s',
                                '&:hover': {transform: 'translateY(-4px)', boxShadow: 6}
                            }}
                        >
                            <CardContent sx={{p: 3}}>
                                <Avatar sx={{bgcolor: 'primary.light', width: 64, height: 64, mx: 'auto', mb: 2}}>
                                    <BuildIcon sx={{fontSize: 32}}/>
                                </Avatar>
                                <Typography variant="h5" component="h3" fontWeight="semibold" gutterBottom>
                                    แจ้งซ่อมสินค้า
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{mb: 2}}>
                                    แจ้งซ่อมสินค้า Pumpkin ได้อย่างง่ายดาย พร้อมรับค่าเปิดเครื่องพิเศษ
                                </Typography>
                                <Chip
                                    icon={<AttachMoneyIcon/>} label="พิเศษ! รับค่าเปิดเครื่องเมื่อแจ้งซ่อม"
                                    color="success" variant="outlined" sx={{fontWeight: 'medium'}}
                                />
                            </CardContent>
                        </Card>
                    </Grid2>

                    {/* Service 2: สั่งซื้ออะไหล่ */}
                    <Grid2 size={{xs: 12, md: 4}}>
                        <Card
                            elevation={3}
                            sx={{
                                height: '100%', textAlign: 'center', transition: '0.3s',
                                '&:hover': {transform: 'translateY(-4px)', boxShadow: 6}
                            }}
                        >
                            <CardContent sx={{p: 3}}>
                                <Avatar sx={{bgcolor: 'success.light', width: 64, height: 64, mx: 'auto', mb: 2}}>
                                    <ShoppingCartIcon sx={{fontSize: 32}}/>
                                </Avatar>
                                <Typography variant="h5" component="h3" fontWeight="semibold" gutterBottom>
                                    สั่งซื้ออะไหล่
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{mb: 2}}>
                                    สั่งซื้ออะไหล่ Pumpkin ต้นฉบับ ได้ราคาพิเศษจากเรา
                                </Typography>
                                <Chip
                                    label="ราคาถูกกว่าข้างนอก!" color="error"
                                    variant="outlined" sx={{fontWeight: 'medium'}}
                                />
                            </CardContent>
                        </Card>
                    </Grid2>

                    {/* Service 3: เคลมอะไหล่ */}
                    <Grid2 size={{xs: 12, md: 4}}>
                        <Card
                            elevation={3}
                            sx={{
                                height: '100%', textAlign: 'center', transition: '0.3s',
                                '&:hover': {transform: 'translateY(-4px)', boxShadow: 6}
                            }}
                        >
                            <CardContent sx={{p: 3}}>
                                <Avatar sx={{bgcolor: 'secondary.light', width: 64, height: 64, mx: 'auto', mb: 2}}>
                                    <InventoryIcon sx={{fontSize: 32}}/>
                                </Avatar>
                                <Typography variant="h5" component="h3" fontWeight="semibold" gutterBottom>
                                    เคลมอะไหล่
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{mb: 2}}>
                                    ตรวจสอบอะไหล่ที่สามารถเคลมกับ Pumpkin ได้ ไม่มีเสียค่าอะไหล่
                                </Typography>
                                <Chip
                                    label="ข้อมูลสต็อกแบบเรียลไทม์" color="info"
                                    variant="outlined" sx={{fontWeight: 'medium'}}
                                />
                            </CardContent>
                        </Card>
                    </Grid2>
                </Grid2>

                {/* Features Section */}
                {/*<Paper elevation={1} sx={{bgcolor: 'grey.50', p: 4, mb: 4}}>*/}
                {/*    <Typography*/}
                {/*        variant="h4" component="h2" fontWeight="semibold"*/}
                {/*        textAlign="center" gutterBottom sx={{mb: 4}}*/}
                {/*    >*/}
                {/*        จุดเด่นของบริการ*/}
                {/*    </Typography>*/}
                {/*    <Grid2 container spacing={3}>*/}
                {/*        <Grid2 size={{xs : 12, md : 6}}>*/}
                {/*            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>*/}
                {/*                <CheckCircleIcon color="success" sx={{fontSize: 32, mt: 0.5}}/>*/}
                {/*                <Box>*/}
                {/*                    <Typography variant="h6" fontWeight="semibold" gutterBottom>*/}
                {/*                        บริการครบวงจร*/}
                {/*                    </Typography>*/}
                {/*                    <Typography variant="body1" color="text.secondary">*/}
                {/*                        ตั้งแต่แจ้งซ่อม สั่งซื้ออะไหล่ ไปจนถึงเช็คสต็อก*/}
                {/*                    </Typography>*/}
                {/*                </Box>*/}
                {/*            </Box>*/}
                {/*        </Grid2>*/}
                {/*        <Grid2 size={{xs : 12, md : 6}}>*/}
                {/*            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>*/}
                {/*                <AttachMoneyIcon color="success" sx={{fontSize: 32, mt: 0.5}}/>*/}
                {/*                <Box>*/}
                {/*                    <Typography variant="h6" fontWeight="semibold" gutterBottom>*/}
                {/*                        ราคาประหยัด*/}
                {/*                    </Typography>*/}
                {/*                    <Typography variant="body1" color="text.secondary">*/}
                {/*                        อะไหล่ราคาถูกกว่าข้างนอก พร้อมค่าเปิดเครื่องพิเศษ*/}
                {/*                    </Typography>*/}
                {/*                </Box>*/}
                {/*            </Box>*/}
                {/*        </Grid2>*/}
                {/*        <Grid2 size={{xs : 12, md : 6}}>*/}
                {/*            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>*/}
                {/*                <SpeedIcon color="primary" sx={{fontSize: 32, mt: 0.5}}/>*/}
                {/*                <Box>*/}
                {/*                    <Typography variant="h6" fontWeight="semibold" gutterBottom>*/}
                {/*                        รวดเร็ว สะดวก*/}
                {/*                    </Typography>*/}
                {/*                    <Typography variant="body1" color="text.secondary">*/}
                {/*                        ระบบใช้งานง่าย ประมวลผลรวดเร็ว*/}
                {/*                    </Typography>*/}
                {/*                </Box>*/}
                {/*            </Box>*/}
                {/*        </Grid2>*/}
                {/*        <Grid2 size={{xs : 12, md : 6}}>*/}
                {/*            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>*/}
                {/*                <AdsClick color="warning" sx={{fontSize: 32, mt: 0.5}}/>*/}
                {/*                <Box>*/}
                {/*                    <Typography variant="h6" fontWeight="semibold" gutterBottom>*/}
                {/*                        เฉพาะสินค้า Pumpkin*/}
                {/*                    </Typography>*/}
                {/*                    <Typography variant="body1" color="text.secondary">*/}
                {/*                        เชี่ยวชาญเฉพาะสินค้า Pumpkin ทุกรุ่น*/}
                {/*                    </Typography>*/}
                {/*                </Box>*/}
                {/*            </Box>*/}
                {/*        </Grid2>*/}
                {/*    </Grid2>*/}
                {/*</Paper>*/}

                {/* About Section */}
                <Paper elevation={2} sx={{p: 4, mb: 4}}>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                        เกี่ยวกับบริการของเรา
                    </Typography>
                    <Typography color="text.secondary" sx={{lineHeight: 1.7}}>
                        ศูนย์บริการซ่อม Pumpkin เป็นแพลตฟอร์มที่ออกแบบมาเพื่อให้บริการศูนย์ซ่อมต่างๆ
                        สามารถใช้งานในการแจ้งซ่อมสินค้า Pumpkin ได้อย่างสะดวกและรวดเร็ว
                        พร้อมด้วยระบบการจัดการที่ครบครันและมีประสิทธิภาพ
                    </Typography>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    )
}
