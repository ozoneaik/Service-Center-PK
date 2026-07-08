import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, usePage } from "@inertiajs/react";
import {
    Alert, Box, Button, Card, CardContent, Chip, Divider,
    Grid2, Paper, Stack, Table, TableBody, TableCell,
    TableHead, TableRow, Typography, useMediaQuery,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import { useState } from "react";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import DealerModalDetail from "@/Pages/DealerRepair/SendJob/DealerModalDetail.jsx";

export default function DealerDocSendJob({ groups, is_sale }) {
    const isMobile = useMediaQuery("(max-width:600px)");
    const { flash } = usePage().props;
    const [open, setOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    return (
        <>
            {open && <DealerModalDetail open={open} setOpen={setOpen} job_group={selectedGroup} />}
            <AuthenticatedLayout>
                <Head title="เอกสารส่งซ่อม (ร้านค้า)" />
                <Paper sx={{ bgcolor: "white", p: 3 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" fontWeight="bold">
                                    ออกเอกสารส่งซ่อม (ร้านค้า)
                                </Typography>
                                <Typography variant="body1">รายการทั้งหมด {groups.length} รายการ</Typography>
                            </Stack>
                        </Grid2>

                        {flash?.success && (
                            <Grid2 size={12}>
                                <Alert variant="filled" severity="success">{flash.success}</Alert>
                            </Grid2>
                        )}

                        {isMobile ? (
                            <Grid2 size={12}>
                                <Stack spacing={2}>
                                    {groups.map((group, i) => (
                                        <Card key={i} variant="outlined">
                                            <CardContent>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="h6" color="text.secondary">#{i + 1}</Typography>
                                                        <Chip variant="filled" label={group.group_job} color="secondary" />
                                                    </Stack>
                                                    {is_sale && (
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">ร้านค้า</Typography>
                                                            <Typography fontWeight="medium">{group.dealer_shop_name} <Typography component="span" variant="caption" color="text.secondary">({group.dealer_code})</Typography></Typography>
                                                        </Box>
                                                    )}
                                                    <Divider />
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">วันที่สร้าง</Typography>
                                                        <Typography fontWeight="medium"><DateFormatTh date={group.created_at} /></Typography>
                                                    </Box>
                                                    <Stack direction="row" spacing={2}>
                                                        <Box flex={1}>
                                                            <Typography variant="body2" color="text.secondary">พิมพ์ครั้งแรก</Typography>
                                                            <Typography fontWeight="medium"><DateFormatTh date={group.print_at} /></Typography>
                                                        </Box>
                                                        <Box flex={1}>
                                                            <Typography variant="body2" color="text.secondary">พิมพ์ล่าสุด</Typography>
                                                            <Typography fontWeight="medium"><DateFormatTh date={group.print_updated_at} /></Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Chip label={`${group.counter_print} ครั้ง`} color="primary" variant="outlined" size="small" sx={{ width: "fit-content" }} />
                                                    <Divider />
                                                    <Stack direction="row" spacing={1}>
                                                        <Button size="small" variant="contained" startIcon={<DescriptionIcon />} sx={{ flex: 1 }}
                                                            onClick={() => { setSelectedGroup(group.group_job); setOpen(true); }}
                                                        >
                                                            รายละเอียด
                                                        </Button>
                                                        <Button size="small" color="secondary" variant="contained" startIcon={<LocalPrintshopIcon />}
                                                            component="a" target="_blank" rel="noopener noreferrer"
                                                            href={route("dom-pdf.index", { group_job_id: group.group_job || "" })}
                                                            sx={{ flex: 1 }}
                                                        >
                                                            พิมพ์
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            </Grid2>
                        ) : (
                            <Grid2 size={12}>
                                <Card variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={HEADER_STYLE}>
                                                <TableCell>ลำดับ</TableCell>
                                                <TableCell>เลขที่ JOB (PK)</TableCell>
                                                {is_sale && <TableCell>ร้านค้า</TableCell>}
                                                <TableCell>วันที่สร้าง</TableCell>
                                                <TableCell>พิมพ์ครั้งแรก</TableCell>
                                                <TableCell>พิมพ์ล่าสุด</TableCell>
                                                <TableCell>จำนวนครั้งที่พิมพ์</TableCell>
                                                <TableCell>จัดการ</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {groups.map((group, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{i + 1}</TableCell>
                                                    <TableCell>
                                                        <Chip variant="filled" label={group.group_job} color="secondary" />
                                                    </TableCell>
                                                    {is_sale && (
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="medium">{group.dealer_shop_name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{group.dealer_code}</Typography>
                                                        </TableCell>
                                                    )}
                                                    <TableCell><DateFormatTh date={group.created_at} /></TableCell>
                                                    <TableCell><DateFormatTh date={group.print_at} /></TableCell>
                                                    <TableCell><DateFormatTh date={group.print_updated_at} /></TableCell>
                                                    <TableCell>{group.counter_print}</TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1}>
                                                            <Button size="small" variant="contained" startIcon={<DescriptionIcon />}
                                                                onClick={() => { setSelectedGroup(group.group_job); setOpen(true); }}
                                                            >
                                                                รายละเอียด
                                                            </Button>
                                                            <Button size="small" color="secondary" variant="contained" startIcon={<LocalPrintshopIcon />}
                                                                component="a" target="_blank" rel="noopener noreferrer"
                                                                href={route("dom-pdf.index", { group_job_id: group.group_job || "" })}
                                                            >
                                                                พิมพ์
                                                            </Button>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </Grid2>
                        )}
                    </Grid2>
                </Paper>
            </AuthenticatedLayout>
        </>
    );
}

const HEADER_STYLE = { backgroundColor: "#c7c7c7", fontWeight: "bold", fontSize: 16 };
