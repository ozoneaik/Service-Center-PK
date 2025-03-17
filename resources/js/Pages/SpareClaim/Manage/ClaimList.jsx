import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Button, Chip, Container, Grid2, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const CustomerDetail = ({ detail }) => {
    const theme = useTheme();
    const pumpkinColor = theme.palette.pumpkinColor.main;
    return (
        <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight="bold">
                ชื่อร้าน : <Typography component="span" sx={{ color: pumpkinColor }}>{detail.shop_name}</Typography>
            </Typography>
            <Typography variant="body2">
                รหัสร้านค้า : <Typography component="span" sx={{ color: pumpkinColor }}>{detail.is_code_cust_id}</Typography>
            </Typography>
            <Typography variant="body2">
                ที่อยู่ : <Typography component="span" sx={{ color: pumpkinColor }}>{detail.address}</Typography>
            </Typography>

        </Stack>
    )
}

const TableDetail = ({ claims }) => {
    const statusLabels = { pending: 'กำลังรออนุมัติ', approved: 'อนุมัติแล้ว', canceled: 'ไม่อนุมัติ' };
    const statusColors = { pending: 'secondary', approved: 'success', canceled: 'error' };
    return (
        <Table>
            <TableHead >
                <TableRow sx={TABLE_HEADER_STYLE}>
                    <TableCell>ลำดับ</TableCell>
                    <TableCell>รหัสเอกสารการเคลม</TableCell>
                    <TableCell>ข้อมูลศูนย์ซ่อมที่แจ้งเคลมเบื้องต้น</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>จัดการ</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {claims.map((claim, index) => {
                    const path = route('claimSP.detail', { claim_id: claim.claim_id });
                    return (
                        <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{claim.claim_id}</TableCell>
                            <TableCell>
                                <CustomerDetail detail={claim} />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={statusLabels[claim.status] || 'ไม่สามารถระบุสถานะได้'}
                                    color={statusColors[claim.status] || 'info'}
                                />
                            </TableCell>
                            <TableCell>
                                <Button variant="contained" component={Link} href={path}>
                                    รายละเอียด
                                </Button>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}


export default function ClaimList({ claimList, statusClaim }) {
    const [claims, setClaims] = useState(claimList.data);

    const statusList = [
        {
            status: 'approved', color: 'success', text: 'อนุมัติแล้ว',
            path: route("claimSP.index", { status: 'approved' }),
            icon: <AssignmentTurnedInIcon />
        },
        {
            status: 'pending', color: 'secondary', text: 'กำลังรออนุมัติ',
            path: route("claimSP.index", { status: 'pending' }),
            icon: <PendingActionsIcon />
        },
        {
            status: 'rejected', color: 'error', text: 'ไม่อนุมัติ',
            path: route("claimSP.index", { status: 'rejected' }),
            icon: <CancelIcon />
        },
    ]
    return (
        <AuthenticatedLayout>
            <Head title="เอกสารรอเคลม" />
            <Container maxWidth='false' sx={{ mt: 3 }}>
                <Paper sx={{ p: 3 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                <Typography variant="h5" fontWeight='bold'>
                                    รายการเอกสารรอเคลม
                                </Typography>
                                <Stack direction='row' spacing={2} alignItems='center'>
                                    <Typography>
                                        รายการทั้งหมด {claims.length} รายการ
                                    </Typography>
                                    {statusList.map(({ status, color, text, path, icon }) => (
                                        <Button
                                            startIcon={icon}
                                            component={Link}
                                            href={path}
                                            key={status}
                                            variant={statusClaim === status ? 'contained' : 'outlined'}
                                            color={color}
                                        >
                                            {text}
                                        </Button>
                                    ))}
                                </Stack>
                            </Stack>
                        </Grid2>
                        <Grid2 size={12}>
                            <Paper variant="outlined" sx={{ p: 2, overflowX: 'auto' }}>
                                <TableDetail claims={claims} />
                            </Paper>
                        </Grid2>
                    </Grid2>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    )
}
const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};