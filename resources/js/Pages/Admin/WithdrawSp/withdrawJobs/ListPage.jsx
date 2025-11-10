import { router } from "@inertiajs/react";
import {
    Button,
    Chip,
    FormControl,
    Grid2,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { Add, Search, ClearAll, ListAlt } from "@mui/icons-material";
import { useState } from "react";
import { DateFormatTh } from "@/Components/DateFormat.jsx";
import { TableStyle } from "@/../css/TableStyle.js";

export default function ListPage({ list, filters = {}, auth }) {
    const isMobile = useMediaQuery("(max-width:600px)");

    const jobs = list?.data || [];
    const links = list?.links || [];

    const [searchJob, setSearchJob] = useState(filters?.searchJob || "");
    const [searchJobStatus, setSearchJobStatus] = useState(filters?.searchJobStatus || "");
    const [searchJobDateFrom, setSearchJobDateFrom] = useState(filters?.searchJobDateFrom || "");
    const [searchJobDateTo, setSearchJobDateTo] = useState(filters?.searchJobDateTo || "");

    const handleCreateJob = () => {
        const is_code_cust_id = auth?.user?.is_code_cust_id;
        router.get(route("withdrawSp.index"), { is_code_cust_id });
    };

    // ค้นหา / ล้างฟิลเตอร์
    const handleSearchFilter = (clear = false) => {
        if (clear) {
            setSearchJob("");
            setSearchJobStatus("");
            setSearchJobDateFrom("");
            setSearchJobDateTo("");

            router.get(route("withdrawJob.index"));
        } else {
            router.get(
                route("withdrawJob.index"),
                {
                    searchJob,
                    searchJobStatus,
                    searchJobDateFrom,
                    searchJobDateTo,
                },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }
    };

    const colorByStatus = (status) => {
        if (status === "complete") return "success";
        if (status === "Inactive") return "error";
        return "default";
    };

    const handlePageChange = (url) => {
        if (!url) return;
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <Grid2 container spacing={2} sx={{ p: 2 }}>
            {/* หัวข้อ */}
            <Grid2 size={12}>
                <Typography variant="h6" fontWeight="bold">
                    เบิกอะไหล่สำหรับศูนย์บริการ
                </Typography>
            </Grid2>

            {/* ฟิลเตอร์ */}
            <Grid2 size={12}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="ค้นหาเลขที่ JOB"
                        value={searchJob}
                        onChange={(e) => setSearchJob(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ListAlt />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    {/* สถานะ */}
                    <FormControl fullWidth size="small">
                        <InputLabel>สถานะ</InputLabel>
                        <Select
                            value={searchJobStatus}
                            label="สถานะ"
                            onChange={(e) => setSearchJobStatus(e.target.value)}
                        >
                            <MenuItem value="">ทั้งหมด</MenuItem>
                            <MenuItem value="complete">complete</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                    {/* วันที่เริ่ม */}
                    <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="วันที่เริ่ม (JOB)"
                        value={searchJobDateFrom}
                        onChange={(e) => setSearchJobDateFrom(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* วันที่สิ้นสุด */}
                    <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="วันที่สิ้นสุด (JOB)"
                        value={searchJobDateTo}
                        onChange={(e) => setSearchJobDateTo(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <Button
                        sx={{ minWidth: 100 }}
                        size="small"
                        variant="contained"
                        startIcon={<Search />}
                        onClick={() => handleSearchFilter(false)}
                    >
                        ค้นหา
                    </Button>

                    <Button
                        sx={{ minWidth: 150 }}
                        size="small"
                        color="secondary"
                        variant="contained"
                        startIcon={<ClearAll />}
                        onClick={() => handleSearchFilter(true)}
                    >
                        ล้างการค้นหา
                    </Button>

                    <Button
                        sx={{ minWidth: 150 }}
                        variant="contained"
                        color="warning"
                        startIcon={<Add />}
                        onClick={handleCreateJob}
                    >
                        สร้างเอกสาร
                    </Button>
                </Stack>
            </Grid2>

            {/* ตารางแสดงผล */}
            <Grid2 size={12}>
                <Paper variant="outlined" sx={{ p: 2, overflowX: "auto" }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={TableStyle.TableHead}>
                                <TableCell>#</TableCell>
                                <TableCell>สถานะ</TableCell>
                                <TableCell>วันที่ JOB</TableCell>
                                <TableCell>เลขที่ JOB</TableCell>
                                <TableCell>จำนวนรายการ</TableCell>
                                <TableCell>วันที่สร้าง</TableCell>
                                <TableCell>ผู้สร้าง</TableCell>
                                <TableCell>วันที่-เวลา-อัปเดต</TableCell>
                                <TableCell align="center">#</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {jobs.length > 0 ? (
                                jobs.map((item, index) => (
                                    <TableRow key={item.stock_job_id ?? index}>
                                        <TableCell>
                                            {/* แสดงเลข running ตามหน้า */}
                                            {((list?.current_page || 1) - 1) *
                                                (list?.per_page || jobs.length) +
                                                (index + 1)}
                                        </TableCell>

                                        {/* สถานะ */}
                                        <TableCell>
                                            <Chip
                                                label={item.job_status}
                                                color={colorByStatus(item.job_status)}
                                                size="small"
                                            />
                                        </TableCell>

                                        {/* วันที่ JOB (ใช้ created_at) */}
                                        <TableCell>
                                            <DateFormatTh date={item.created_at} />
                                        </TableCell>

                                        {/* รหัส JOB */}
                                        <TableCell>{item.stock_job_id}</TableCell>

                                        {/* จำนวนรายการ */}
                                        <TableCell align="center">
                                            {item.total_qty ?? 0}
                                        </TableCell>

                                        {/* วันที่สร้าง */}
                                        <TableCell>
                                            <DateFormatTh date={item.created_at} />
                                        </TableCell>

                                        {/* ผู้สร้าง */}
                                        <TableCell>{item.user_name}</TableCell>

                                        {/* วันเวลาอัปเดตล่าสุด */}
                                        <TableCell>
                                            <DateFormatTh
                                                date={item.updated_at}
                                                showTime={true}
                                            />
                                        </TableCell>

                                        {/* ปุ่มแอคชัน */}
                                        <TableCell align="center">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() =>
                                                    router.get(
                                                        route(
                                                            "withdrawJob.show",
                                                            item.stock_job_id
                                                        )
                                                    )
                                                }
                                            >
                                                รายละเอียด
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        ไม่พบข้อมูล
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            </Grid2>

            {/* 🔻 Pagination ด้านล่าง */}
            {links.length > 0 && (
                <Grid2 size={12}>
                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ mt: 2, flexWrap: "wrap" }}
                    >
                        {links.map((link, index) => {
                            if (!link.label) return null;

                            // Laravel จะส่ง &laquo; &raquo; มา ให้ล้าง HTML tag
                            const label = link.label
                                .replace("&laquo;", "«")
                                .replace("&raquo;", "»")
                                .replace(/&raquo;/g, "»")
                                .replace(/&laquo;/g, "«")
                                .replace(/<\/?[^>]+(>|$)/g, "");

                            return (
                                <Button
                                    key={index}
                                    size="small"
                                    variant={link.active ? "contained" : "outlined"}
                                    disabled={!link.url}
                                    onClick={() => handlePageChange(link.url)}
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </Stack>
                </Grid2>
            )}
        </Grid2>
    );
}
