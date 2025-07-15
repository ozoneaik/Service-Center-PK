
import {router} from "@inertiajs/react";
import {
    Breadcrumbs, Button, Card, CardContent, Chip, Grid2, Table, TableBody, TableCell, TableHead, TableRow,
    Typography, useMediaQuery, Box, Divider, Stack,
} from "@mui/material";
import {RemoveRedEye} from "@mui/icons-material";
import {DateFormatTh} from "@/Components/DateFormat.jsx";
import React from "react";
import LayoutClaim from "@/Pages/SpareClaim/LayoutClaim.jsx";

export default function HistoryClaimNew({history}) {
    const isMobile = useMediaQuery('(max-width:600px)');

    const redirectToDetail = (claim_id) => {
        router.get(route('spareClaim.historyDetail', {claim_id}));
    }

    function TableData() {
        return (
            <Table>
                <TableHead sx={TABLE_HEADER_STYLE}>
                    <TableRow>
                        <TableCell>เลขที่เอกสารเคลม</TableCell>
                        <TableCell>วันที่แจ้งเคลม</TableCell>
                        <TableCell>วันที่รับ</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell align='center'>#</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((item) => {
                        return (
                            <TableRow key={item.id}>
                                <TableCell>{item.claim_id}</TableCell>
                                <TableCell>
                                    {DateFormatTh({date: item.created_at})}
                                </TableCell>
                                <TableCell>
                                    {DateFormatTh({date: item.updated_at})}
                                </TableCell>
                                <TableCell>
                                    <StatusClaim status={item.status}/>
                                </TableCell>
                                <TableCell align='center'>
                                    <Button
                                        onClick={() => redirectToDetail(item.claim_id)}
                                        variant='contained' size='small' startIcon={<RemoveRedEye/>}
                                    >
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


    function MobileData() {
        function BoxComponent({children}) {
            return (
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    {children}
                </Box>
            )
        }

        return (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                {history.map((item) => {
                    return (
                        <Card key={item.id} variant='outlined'>
                            <CardContent>
                                <Stack spacing={1}>
                                    {/* เลขที่เอกสารเคลม */}
                                    <BoxComponent>
                                        <Typography variant="subtitle2"
                                                    sx={{fontWeight: 'bold', color: 'text.secondary'}}>
                                            เลขที่เอกสารเคลม
                                        </Typography>
                                        <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                                            {item.claim_id}
                                        </Typography>
                                    </BoxComponent>

                                    <Divider sx={{my: 1}}/>

                                    {/* วันที่แจ้งเคลม */}
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                            วันที่แจ้งเคลม
                                        </Typography>
                                        <Typography variant="body2">
                                            {DateFormatTh({date: item.created_at})}
                                        </Typography>
                                    </BoxComponent>

                                    {/* วันที่รับ */}
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                            วันที่รับ
                                        </Typography>
                                        <Typography variant="body2">
                                            {DateFormatTh({date: item.updated_at})}
                                        </Typography>
                                    </BoxComponent>

                                    {/* สถานะ */}
                                    <BoxComponent>
                                        <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                            สถานะ
                                        </Typography>
                                        <StatusClaim status={item.status}/>
                                    </BoxComponent>

                                    {/* ปุ่มรายละเอียด */}
                                    <Button
                                        onClick={() => redirectToDetail(item.claim_id)}
                                        variant='contained'
                                        size='small'
                                        startIcon={<RemoveRedEye/>}
                                        fullWidth
                                    >
                                        รายละเอียด
                                    </Button>
                                </Stack>

                            </CardContent>
                        </Card>
                    )
                })}
            </Box>
        )
    }


    return (
        <LayoutClaim headTitle={'ประวัติเคลม'}>
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Breadcrumbs>
                        <Typography sx={{color: 'text.primary'}}>แจ้งเคลมอะไหล่</Typography>
                        <Typography sx={{color: 'text.primary'}}>ประวัติเคลม</Typography>
                    </Breadcrumbs>
                </Grid2>
                <Grid2 size={12} overflow='auto'>
                    {isMobile ? <MobileData/> : <TableData/>}
                </Grid2>
            </Grid2>
        </LayoutClaim>
    )
}

const TABLE_HEADER_STYLE = {
    backgroundColor: '#c7c7c7',
    fontWeight: 'bold',
    fontSize: 16
};

const StatusClaim = ({status}) => {
    const status_formated = {
        'pending': {status: 'secondary', label: 'กำลังตรวจสอบคำขอเคลม'},
        'approved': {status: 'success', label: 'เสร็จสิ้น'},
        'rejected': {status: 'error', label: 'ไม่อนุมัติ'},
    }[status] || {status: 'info', label: 'ไม่สามารถระบุได้'};
    return (
        <Chip
            size='small'
            color={status_formated.status}
            label={status_formated.label}
        />
    )
}
