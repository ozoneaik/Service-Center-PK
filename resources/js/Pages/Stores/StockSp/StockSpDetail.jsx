import { usePage } from "@inertiajs/react";
import {
    CircularProgress, Dialog, DialogContent, DialogTitle, IconButton,
    Table, TableBody, TableCell, TableHead, TableRow, Box, Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function fmtDate(d) {
    if (!d) return "-";
    const dt = new Date(d);
    const day = String(dt.getDate()).padStart(2, "0");
    const mon = String(dt.getMonth() + 1).padStart(2, "0");
    const yr = dt.getFullYear();
    return `${day}/${mon}/${yr}`;
}

export default function StockSpDetail({ open, setOpen, sp_code = null }) {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!open || !sp_code) return;
        fetchData();
    }, [open, sp_code]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                route("stockSp.detail", {
                    sp_code,
                    is_code_cust_id: auth.user.is_code_cust_id,
                })
            );
            setRows(data.transactions || []);
            setCurrent(data.current_stock ?? 0);
        } catch (error) {
            console.error("Error fetching data:", error);
            setRows([]);
            setCurrent(0);
        } finally {
            setLoading(false);
        }
    };

    const title = useMemo(
        () => `Transection`,
        []
    );

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
                {title}
                <IconButton
                    onClick={() => setOpen(false)}
                    sx={{ position: "absolute", right: 8, top: 8 }}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ p: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ p: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={HEAD}>วันที่</TableCell>
                                    <TableCell sx={HEAD}>คำอธิบาย</TableCell>
                                    <TableCell sx={HEAD}>ประเภท</TableCell>
                                    <TableCell sx={HEAD}>สต็อก Before</TableCell>
                                    <TableCell sx={HEAD}>จำนวน Tran</TableCell>
                                    <TableCell sx={HEAD}>สต็อก After</TableCell>
                                    <TableCell sx={HEAD}>วันที่-เวลา อัพเดท</TableCell>
                                    <TableCell sx={HEAD}>ชื่อผู้อัพเดท</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">ไม่พบประวัติการเคลื่อนไหว</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((r, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{fmtDate(r.date)}</TableCell>
                                            <TableCell>{r.ref}</TableCell>
                                            <TableCell>{r.type}</TableCell>
                                            <TableCell>{r.before}</TableCell>
                                            <TableCell>{r.tran}</TableCell>
                                            <TableCell>{r.after}</TableCell>
                                            <TableCell>{r.updated_at || "-"}</TableCell>
                                            <TableCell>{r.actor || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="body2">
                                สต็อกปัจจุบันของ <b>{sp_code}</b> : <b>{current}</b>
                            </Typography>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

const HEAD = { fontWeight: 700 };