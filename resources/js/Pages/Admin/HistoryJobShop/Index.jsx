import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import InputAdornment from "@mui/material/InputAdornment";
import { Head, Link, usePage, router } from "@inertiajs/react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Container,
    Divider,
    Drawer,
    FormControl,
    Grid2,
    InputLabel,
    ListItemText,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Snackbar,
    Alert,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
    ChevronLeft,
    FileUpload,
    FilterList,
    LocalPhone,
    ManageHistory,
    Person,
    Print,
    Search,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { TableStyle } from "../../../../css/TableStyle";
import { showDefaultImage } from "@/utils/showImage.js";
import { ListDetailModal } from "@/Pages/HistoryPage/ListDetailModal.jsx";

const statusLabels = {
    pending: "กำลังดำเนินการซ่อม",
    success: "ปิดการซ่อมแล้ว",
    canceled: "ยกเลิกการซ่อมแล้ว",
    send: "ส่งไปยังศูนย์ซ่อม PK",
};

const statusColors = {
    pending: "secondary",
    success: "success",
    canceled: "error",
    send: "info",
};

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}));

const TableDetail = ({ jobs, handleShowDetail }) => {
    const { palette } = useTheme();
    const pumpkinColor = palette.pumpkinColor.main;

    const handlePrint = (job_id) => {
        window.open(route("genReCieveSpPdf", job_id), "_blank");
    };

    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow>
                    {[
                        "รูปภาพ",
                        "ซีเรียล",
                        "วันที่",
                        "รหัส job",
                        "ร้านค้า Dealer",
                        "ข้อมูลลูกค้า",
                        "ช่างที่ซ่อม",
                        "สถานะ",
                        "Ticket / Status / QU",
                        "รายละเอียด",
                    ].map((head, i) => (
                        <TableCell sx={TableStyle.TableHead} key={i}>
                            {head}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {jobs.map((job, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <img
                                src={job.image_sku}
                                width={50}
                                onError={showDefaultImage}
                            />
                        </TableCell>
                        <TableCell>
                            <Link href={route("dealerRepair.index", { job_id: job.job_id })}>
                                {job.serial_id}
                            </Link>
                        </TableCell>
                        <TableCell>
                            {job.created_at
                                ? new Date(job.created_at).toLocaleString("th-TH")
                                : "-"}
                        </TableCell>
                        <TableCell>{job.job_id}</TableCell>
                        <TableCell>
                            <b>รหัสร้านค้า :</b>{" "}
                            <span style={{ color: pumpkinColor }}>{job.is_code_key}</span>
                            <br />
                            <b>ชื่อร้าน :</b>{" "}
                            <span style={{ color: pumpkinColor }}>{job.shop_name}</span>
                        </TableCell>
                        <TableCell>
                            <b>ชื่อ :</b>{" "}
                            <span style={{ color: pumpkinColor }}>{job.name}</span>
                            <br />
                            <b>เบอร์โทร :</b>{" "}
                            <span style={{ color: pumpkinColor }}>{job.phone}</span>
                        </TableCell>
                        <TableCell>
                            <b>ชื่อ :</b>{" "}
                            <span style={{ color: pumpkinColor }}>{job.technician_name}</span>
                            <br />
                            <b>เบอร์โทร :</b>{" "}
                            <span style={{ color: pumpkinColor }}>{job.technician_phone}</span>
                        </TableCell>
                        <TableCell>
                            <Chip
                                label={statusLabels[job.status] || "ไม่สามารถระบุสถานะได้"}
                                color={statusColors[job.status] || "info"}
                            />
                        </TableCell>
                        <TableCell>
                            <Stack spacing={0.5}>
                                {job.ticket_code
                                    ? <Chip label={job.ticket_code} size="small" color="primary" variant="outlined" />
                                    : <Typography variant="body2" color="text.secondary">-</Typography>
                                }
                                {job.ass_status
                                    ? <Chip label={job.ass_status} size="small" />
                                    : null
                                }
                                {job.ass_qu
                                    ? <a href={job.ass_qu} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>ดูใบประเมิน</a>
                                    : null
                                }
                            </Stack>
                        </TableCell>
                        <TableCell>
                            <Box display="flex" flexWrap="nowrap" gap={2}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="info"
                                    startIcon={<Print />}
                                    onClick={() => handlePrint(job.job_id)}
                                >
                                    พิมพ์ใบรับงานซ่อม
                                </Button>
                                <Button
                                    startIcon={<ManageHistory />}
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleShowDetail(job)}
                                >
                                    ดูรายละเอียด
                                </Button>
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const MobileDetail = ({ jobs, handleShowDetail }) => {
    const { palette } = useTheme();
    const pumpkinColor = palette.pumpkinColor.main;

    const TextDetail = ({ label, value }) => (
        <Stack direction="row" spacing={1}>
            <Typography fontWeight="bold" color={pumpkinColor}>
                {label}
            </Typography>
            <Typography>:</Typography>
            {label === "สถานะ" ? (
                <Chip
                    label={statusLabels[value] || "ไม่สามารถระบุสถานะได้"}
                    color={statusColors[value] || "info"}
                />
            ) : (
                <Typography>{value}</Typography>
            )}
        </Stack>
    );

    const handlePrint = (job_id) => {
        window.open(route("genReCieveSpPdf", job_id), "_blank");
    };

    return (
        <Stack spacing={2}>
            {jobs.map((job, index) => (
                <Card variant="outlined" key={index}>
                    <CardContent>
                        <Stack spacing={1}>
                            <Link href={route("dealerRepair.index", { job_id: job.job_id })}>
                                <TextDetail label="ซีเรียล" value={job.serial_id} />
                            </Link>
                            <TextDetail
                                label="วันที่"
                                value={
                                    job.created_at
                                        ? new Date(job.created_at).toLocaleString("th-TH")
                                        : "-"
                                }
                            />
                            <TextDetail label="รหัส job" value={job.job_id} />
                            <TextDetail
                                label="ร้านค้า"
                                value={`(${job.is_code_key}) ${job.shop_name}`}
                            />
                            <TextDetail
                                label="ชื่อ/เบอร์โทรลูกค้า"
                                value={(job.name ?? "") + " " + (job.phone ?? "")}
                            />
                            <TextDetail label="สถานะ" value={job.status} />
                            {job.ticket_code && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography fontWeight="bold" color={pumpkinColor}>ตั๋ว</Typography>
                                    <Typography>:</Typography>
                                    <Chip label={job.ticket_code} size="small" color="primary" variant="outlined" />
                                </Stack>
                            )}
                            {job.ass_status && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography fontWeight="bold" color={pumpkinColor}>ประเมิน</Typography>
                                    <Typography>:</Typography>
                                    <Chip label={job.ass_status} size="small" />
                                </Stack>
                            )}
                            {job.ass_qu && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography fontWeight="bold" color={pumpkinColor}>ใบประเมิน</Typography>
                                    <Typography>:</Typography>
                                    <a href={job.ass_qu} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>ดูใบประเมิน</a>
                                </Stack>
                            )}
                            <TextDetail
                                label="ช่างที่ซ่อม"
                                value={(job.technician_name ?? "") + (job.technician_phone ? ` (${job.technician_phone})` : "")}
                            />
                            <Divider />
                            <Stack direction="row" justifyContent="space-between">
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="info"
                                    startIcon={<Print />}
                                    onClick={() => handlePrint(job.job_id)}
                                >
                                    พิมพ์ใบรับงานซ่อม
                                </Button>
                                <Button
                                    startIcon={<ManageHistory />}
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleShowDetail(job)}
                                >
                                    ดูรายละเอียด
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
};

const FilterForm = ({ filters, setFilters, handleFilterChange, searchJobs, stores }) => {
    const isMobile = useMediaQuery("(max-width:700px)");

    return (
        <Grid2 container spacing={2}>
            {/* แถว 1: Serial ID | Job ID | Phone */}
            <Grid2 size={{ md: 4, xs: 12 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="ค้นหา Serial ID"
                    name="serial_id"
                    value={filters.serial_id}
                    onChange={handleFilterChange}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">Sn</InputAdornment>
                            ),
                        },
                    }}
                />
            </Grid2>
            <Grid2 size={{ md: 4, xs: 12 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="ค้นหา Job ID"
                    name="job_id"
                    value={filters.job_id}
                    onChange={handleFilterChange}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">Job ID</InputAdornment>
                            ),
                        },
                    }}
                />
            </Grid2>
            <Grid2 size={{ md: 4, xs: 12 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="ค้นหาเบอร์โทรศัพท์"
                    name="phone"
                    value={filters.phone}
                    onChange={handleFilterChange}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LocalPhone />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Grid2>

            {/* แถว 2: ชื่อลูกค้า | สถานะ | วันที่เริ่มต้น | วันที่สิ้นสุด */}
            <Grid2 size={{ md: 3, xs: 12 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="ค้นหาชื่อลูกค้า"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Person />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Grid2>
            <Grid2 size={{ md: 3, xs: 12 }}>
                <FormControl fullWidth size="small">
                    <InputLabel shrink>สถานะการซ่อม</InputLabel>
                    <Select
                        variant="outlined"
                        fullWidth
                        value={filters.status || ""}
                        onChange={handleFilterChange}
                        name="status"
                        size="small"
                        label="สถานะการซ่อม"
                        notched
                        displayEmpty
                        renderValue={(val) =>
                            val === "" ? <em style={{ color: "#aaa" }}>ทั้งหมด</em> : statusLabels[val] || val
                        }
                    >
                        <MenuItem value="">ทั้งหมด</MenuItem>
                        <MenuItem value="pending">กำลังดำเนินการซ่อม</MenuItem>
                        <MenuItem value="send">ส่งไปยังศูนย์ซ่อม PK</MenuItem>
                        <MenuItem value="success">ปิดการซ่อมแล้ว</MenuItem>
                        <MenuItem value="canceled">ยกเลิกการซ่อมแล้ว</MenuItem>
                    </Select>
                </FormControl>
            </Grid2>
            <Grid2 size={{ md: 3, xs: 12 }}>
                <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="วันที่เริ่มต้น"
                    name="date_start"
                    value={filters.date_start}
                    onChange={handleFilterChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
            </Grid2>
            <Grid2 size={{ md: 3, xs: 12 }}>
                <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="วันที่สิ้นสุด"
                    name="date_end"
                    value={filters.date_end}
                    onChange={handleFilterChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
            </Grid2>

            {/* แถว 3: ร้านค้า Dealer | ปุ่มค้นหา + ล้าง + ส่งออก */}
            <Grid2 size={{ md: 4, xs: 12 }}>
                <FormControl fullWidth size="small">
                    <InputLabel shrink>กรองร้านค้า Dealer</InputLabel>
                    <Select
                        multiple
                        name="shops"
                        value={filters.shops || []}
                        onChange={handleFilterChange}
                        label="กรองร้านค้า Dealer"
                        notched
                        displayEmpty
                        renderValue={(selected) =>
                            selected.length === 0
                                ? <em style={{ color: "#aaa" }}>ทั้งหมด</em>
                                : `เลือก ${selected.length} ร้านค้า`
                        }
                    >
                        {stores.map((store) => (
                            <MenuItem key={store.is_code_cust_id} value={store.is_code_cust_id}>
                                <Checkbox
                                    checked={(filters.shops || []).includes(store.is_code_cust_id)}
                                    size="small"
                                />
                                <ListItemText
                                    primary={`(${store.is_code_cust_id}) ${store.shop_name}`}
                                />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid2>
            <Grid2 size={{ md: 8, xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" height="100%">
                    <Button onClick={searchJobs} startIcon={<Search />} variant="contained">
                        ค้นหา
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => {
                            setFilters({
                                serial_id: "",
                                job_id: "",
                                phone: "",
                                name: "",
                                status: "",
                                date_start: "",
                                date_end: "",
                                shops: [],
                            });
                            router.get(route("admin.history-job-shop.index"), {}, { preserveState: true });
                        }}
                    >
                        ล้างตัวกรอง
                    </Button>
                    <Button
                        startIcon={<FileUpload />}
                        variant="contained"
                        color="success"
                        onClick={() => {
                            const params = new URLSearchParams();
                            Object.entries(filters).forEach(([key, val]) => {
                                if (Array.isArray(val)) {
                                    val.forEach((v) => params.append(`${key}[]`, v));
                                } else if (val !== "") {
                                    params.append(key, val);
                                }
                            });
                            window.open(
                                route("admin.history-job-shop.export") + "?" + params.toString(),
                                "_blank"
                            );
                        }}
                    >
                        ส่งออก Excel
                    </Button>
                </Stack>
            </Grid2>
        </Grid2>
    );
};

export default function Index({ jobs, stores = [] }) {
    const { props } = usePage();
    const { flash } = props;

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (flash?.error) {
            setErrorMessage(flash.error);
            setSnackbarOpen(true);
        }
    }, [flash]);

    const isMobile = useMediaQuery("(max-width:700px)");

    const [filters, setFilters] = useState({
        serial_id: "",
        job_id: "",
        phone: "",
        name: "",
        status: "",
        date_start: "",
        date_end: "",
        shops: [],
    });

    const [openDrawer, setOpenDrawer] = useState(false);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const searchJobs = () => {
        router.get(route("admin.history-job-shop.index"), filters, { preserveState: true });
        setOpenDrawer(false);
    };

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const handleShowDetail = (item) => {
        setSelected(item);
        setOpen(true);
    };

    const DrawerList = (
        <Box sx={{ minWidth: 200, maxWidth: 300, p: 3 }} role="presentation">
            <FilterForm
                filters={filters}
                setFilters={setFilters}
                handleFilterChange={handleFilterChange}
                searchJobs={searchJobs}
                stores={stores}
            />
        </Box>
    );

    return (
        <>
            {open && selected && (
                <ListDetailModal open={open} setOpen={setOpen} selected={selected} />
            )}
            <AuthenticatedLayout>
                <Head title="ประวัติซ่อม (ร้านค้า Dealer)" />
                <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
                    <DrawerHeader>
                        <IconButton onClick={() => setOpenDrawer(false)}>
                            <ChevronLeft />
                        </IconButton>
                    </DrawerHeader>
                    {DrawerList}
                </Drawer>

                <Container maxWidth={false} sx={{ backgroundColor: "white", p: 3 }}>
                    <Grid2 container spacing={2}>
                        {isMobile ? (
                            <Button
                                variant="contained"
                                onClick={() => setOpenDrawer(true)}
                                startIcon={<FilterList />}
                            >
                                กรองค้นหา
                            </Button>
                        ) : (
                            <Grid2 size={12}>
                                <FilterForm
                                    filters={filters}
                                    setFilters={setFilters}
                                    handleFilterChange={handleFilterChange}
                                    searchJobs={searchJobs}
                                    stores={stores}
                                />
                            </Grid2>
                        )}

                        <Grid2 size={12}>
                            <Stack
                                direction={{ sm: "row", xs: "column" }}
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography variant="h5" fontWeight="bold">
                                    ประวัติซ่อม (ร้านค้า Dealer)
                                </Typography>
                                <Typography variant="subtitle1">
                                    รายการ {jobs.to} จากรายการทั้งหมด {jobs.total} รายการ
                                </Typography>
                            </Stack>
                        </Grid2>

                        <Grid2 size={12}>
                            {isMobile ? (
                                <MobileDetail jobs={jobs.data} handleShowDetail={handleShowDetail} />
                            ) : (
                                <Paper
                                    variant="outlined"
                                    sx={{ height: "calc(100vh - 350px)", overflowX: "auto" }}
                                >
                                    <TableDetail jobs={jobs.data} handleShowDetail={handleShowDetail} />
                                </Paper>
                            )}

                            <Stack mt={3} direction="row" justifyContent="center">
                                <Pagination
                                    count={jobs.links.length - 2}
                                    onChange={(e, page) => {
                                        router.get(
                                            route("admin.history-job-shop.index"),
                                            { ...filters, page },
                                            { preserveState: true }
                                        );
                                    }}
                                />
                            </Stack>
                        </Grid2>
                    </Grid2>
                </Container>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity="error"
                        sx={{ width: "100%" }}
                    >
                        {errorMessage}
                    </Alert>
                </Snackbar>
            </AuthenticatedLayout>
        </>
    );
}
