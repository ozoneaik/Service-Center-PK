import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, Link, usePage} from "@inertiajs/react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import {Add, Edit, Person} from "@mui/icons-material";

export default function DealerShopList({shops}) {
    const {flash} = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="ร้านค้าตัวแทน (Dealer)"/>
            <Container maxWidth="lg" sx={{py: 3}}>
                <Paper elevation={3} sx={{p: 3}}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                        <Typography variant="h5" fontWeight="bold">
                            ร้านค้าตัวแทน (ไม่ใช่ศูนย์ซ่อม)
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add/>}
                            component={Link}
                            href={route('admin.dealer-shops.create')}
                        >
                            เพิ่มร้านค้า
                        </Button>
                    </Stack>

                    <Divider sx={{mb: 2}}/>

                    {flash?.success && (
                        <Alert severity="success" sx={{mb: 2}}>{flash.success}</Alert>
                    )}
                    {flash?.error && (
                        <Alert severity="error" sx={{mb: 2}}>{flash.error}</Alert>
                    )}

                    <Box sx={{overflowX: 'auto'}}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{backgroundColor: '#f5f5f5'}}>
                                    <TableCell>รหัสร้านค้า</TableCell>
                                    <TableCell>ชื่อร้านค้า</TableCell>
                                    <TableCell>เบอร์โทรศัพท์</TableCell>
                                    <TableCell>ที่อยู่</TableCell>
                                    <TableCell>ผู้ใช้งาน</TableCell>
                                    <TableCell>จัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {shops.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{py: 4}}>
                                            <Typography color="text.secondary">
                                                ยังไม่มีร้านค้าตัวแทน
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    shops.map((shop, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                <Typography fontFamily="monospace" fontSize={13}>
                                                    {shop.is_code_cust_id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight="medium">{shop.shop_name}</Typography>
                                            </TableCell>
                                            <TableCell>{shop.phone}</TableCell>
                                            <TableCell sx={{maxWidth: 220}}>
                                                <Typography variant="body2" noWrap title={shop.address}>
                                                    {shop.address}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                                                    {shop.dealer_users?.map((u, i) => (
                                                        <Chip
                                                            key={i}
                                                            icon={<Person/>}
                                                            label={u.name}
                                                            size="small"
                                                            variant="outlined"
                                                            color="primary"
                                                        />
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<Edit/>}
                                                    component={Link}
                                                    href={route('userManage.list')}
                                                >
                                                    จัดการผู้ใช้
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}
