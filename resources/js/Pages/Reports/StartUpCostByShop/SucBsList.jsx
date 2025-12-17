import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Container, Grid2, Table, TableCell, TableHead, TableRow,
    TableBody, Typography, useMediaQuery, Stack, Button, Card, CardContent,
    Box, Avatar, Chip, Divider, Paper,
    Autocomplete,
    TextField
} from "@mui/material";
import { TableStyle } from "../../../../css/TableStyle.js";
import React, { use } from "react";

export default function SucBsList({ jobs, total_start_up_cost, shops, selected_shop, current_shop_name, is_admin, is_acc }) {
    const isMobile = useMediaQuery('(max-width:600px)');

    const TableComponent = () => (
        <Paper elevation={1}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={TableStyle.TableHead}>ลำดับ</TableCell>
                        <TableCell sx={TableStyle.TableHead}>หมายเลข job</TableCell>
                        <TableCell sx={TableStyle.TableHead}>ข้อมูลสินค้า</TableCell>
                        <TableCell sx={TableStyle.TableHead} align="center">ค่าเปิดเครื่อง</TableCell>
                        <TableCell sx={TableStyle.TableHead} align="center">#</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {jobs.data.map((job, index) => (
                        <TableRow key={index} hover>
                            <TableCell>
                                <Chip label={index+1} variant="outlined" size="small" />
                            </TableCell>
                            <TableCell>

                                <Typography variant="body2" fontWeight="medium" mb={1}>
                                    {job.job_id}
                                </Typography>
                                <Chip label='ปิดงานซ่อมแล้ว' color="success" size="small" />

                            </TableCell>
                            <TableCell>
                                <Stack direction='row' spacing={2} alignItems='center'>
                                    <Avatar
                                        src={job.image_sku}
                                        variant="rounded"
                                        sx={{ width: 60, height: 60 }}
                                        onError={(e) => e.target.src = import.meta.env.VITE_IMAGE_DEFAULT}
                                    />
                                    <Stack spacing={0.5}>
                                        <Typography variant="body2" fontWeight="medium">
                                            {job.p_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            PID: {job.pid}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Serial: {job.serial_id}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2" fontWeight="bold" color="primary">
                                    ฿{job.start_up_cost?.toLocaleString()}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Button variant="outlined" size="small">
                                    รายละเอียด
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );

    const MobileComponent = ({ job, index }) => (
        <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction='row' spacing={1}>
                            <Chip label={`#${index+1}`} color="primary" variant="outlined" size="small" />
                            <Chip label='ปิดงานซ่อมแล้ว' color="success" variant="outlined" size="small" />
                        </Stack>
                            <Typography variant="caption" color="text.secondary">
                                Job: {job.job_id}
                            </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar
                            src={job.image_sku} variant="rounded" sx={{ width: 80, height: 80 }}
                            onError={(e) => e.target.src = import.meta.env.VITE_IMAGE_DEFAULT}
                        />
                        <Stack spacing={1} flex={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {job.p_name}
                            </Typography>
                            <Stack spacing={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>PID:</strong> {job.pid}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Serial:</strong> {job.serial_id}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack>
                            <Typography variant="caption" color="text.secondary">
                                ค่าเปิดเครื่อง
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                                ฿{job.start_up_cost?.toLocaleString()}
                            </Typography>
                        </Stack>
                        <Button variant="contained" size="small" color="primary">
                            รายละเอียด
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    )

    return (
        <AuthenticatedLayout>
            <Head title={'รายงานค่าตอบแทน (ค่าเปิดเครื่องในประกัน)'} />
            <Container maxWidth={false} sx={{ bgcolor: 'grey.50', py: 3 }}>
                <Grid2 container spacing={3}>
                    {/* <Grid2 size={12}>
                        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    ตัวกรอง:
                                </Typography>
                                <Chip label="ทั้งหมด" variant="outlined" size="small" />
                                <Chip label="รอดำเนินการ" variant="outlined" size="small" />
                                <Chip label="เสร็จสิ้น" variant="outlined" size="small" />
                            </Stack>
                        </Paper>
                    </Grid2> */}

                    <Grid2 size={12}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                            <Typography fontSize={20} fontWeight='bold'>
                                รายงานค่าตอบแทน (ค่าเปิดเครื่องในประกัน) ร้าน {current_shop_name}
                            </Typography>
                            {/* <Chip color="info" label={` รวมค่าเปิดเครื่อง: ฿ ${total_start_up_cost?.toLocaleString() || 0}`} /> */}
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                justifyContent: isMobile ? "flex-start" : "space-between",
                                alignItems: isMobile ? "stretch" : "center",
                                gap: 2,
                                // mb: 1,
                            }}
                        >
                            {/* ซ้าย: Autocomplete (Mobile = full width) */}
                            <Box sx={{ width: isMobile ? "100%" : "260px" }}>

                                {/* ให้สิทธิ์ admin และ acc */}
                                {/* {is_admin || is_acc && ( */}
                                {is_admin && (
                                    <Autocomplete
                                        sx={{ width: "100%" }}
                                        options={shops}
                                        getOptionLabel={(option) => option.shop_name}
                                        value={shops.find((s) => s.is_code_cust_id == selected_shop) || null}
                                        onChange={(_, newValue) =>
                                            router.get(route('report.start-up-cost-shop2.index'), {
                                                shop: newValue?.is_code_cust_id || '',
                                            })
                                        }
                                        renderInput={(params) => (
                                            <TextField {...params} label="กรองร้านค้า สำหรับ Admin" size="small" />
                                        )}
                                    />
                                )}
                            </Box>

                            {/* ขวา (Mobile: กลายเป็น Stack แนวตั้ง) */}
                            <Stack
                                direction={isMobile ? "column" : "row"}
                                spacing={2}
                                alignItems={isMobile ? "stretch" : "center"}
                                sx={{ 
                                    width: isMobile ? "100%" : "auto" ,
                                    mr: isMobile ? 0 : 3,
                                
                                }}
                            >
                                <Button
                                    fullWidth={isMobile}
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                        window.open(
                                            route('report.start-up-cost-shop2.export', { shop: selected_shop }),
                                            "_blank"
                                        );
                                    }}
                                >
                                    ส่งออก Excel
                                </Button>

                                <Chip
                                    sx={{
                                        width: isMobile ? "100%" : "auto",
                                        textAlign: "center",
                                        fontSize: isMobile ? 14 : "inherit",
                                        py: isMobile ? 1 : 0,
                                    }}
                                    color="info"
                                    label={`รวมค่าเปิดเครื่อง: ฿ ${total_start_up_cost?.toLocaleString() || 0}`}
                                />
                            </Stack>
                        </Box>
                    </Grid2>

                    <Grid2 size={12}>
                        {isMobile ? (
                            <Box>
                                {jobs.data.map((job, index) => (
                                    <MobileComponent key={index} job={job} index={index} />
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                                <TableComponent />
                            </Box>
                        )}
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}