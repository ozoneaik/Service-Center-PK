import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Stack, Box, CircularProgress,
    Autocomplete, Paper, Typography, useMediaQuery,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import axios from "axios";
import DmPreview from "@/Components/DmPreview.jsx";
import { AlertDialog } from "@/Components/AlertDialog";
import { router } from "@inertiajs/react";
import { showDefaultImage } from "@/utils/showImage";

const DEFAULT_SP_IMG =
    (import.meta.env.VITE_IMAGE_SP || "https://images.dcpumpkin.com/images/product/500/") + "default.jpg";

export default function WithdrawEditModal({ open, onClose, jobId, jobDiscount, onAdded }) {

    const [sku, setSku] = useState("");
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(null);

    const [allSp, setAllSp] = useState([]);
    const [spList, setSpList] = useState([]);
    const [modelOptions, setModelOptions] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);

    const [activeLayout, setActiveLayout] = useState(1);
    const [loadingId, setLoadingId] = useState(null);

    const [selectedAddList, setSelectedAddList] = useState([]);

    const isMobile = useMediaQuery("(max-width:900px)");

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!sku.trim()) return;

        setLoading(true);
        setProduct(null);
        setAllSp([]);
        setSpList([]);
        setModelOptions([]);
        setSelectedAddList([]);

        try {
            const res = await axios.get(route("withdrawSp.search.json"), {
                params: { sku: sku.trim(), job_id: jobId }
            });

            const result = res.data.result;
            if (!result) throw new Error("ไม่พบสินค้า");

            setProduct(result);
            setAllSp(result.sp ?? []);
            setModelOptions(result.model_options ?? []);

            if (result.model_options?.length > 0) {
                setSelectedModel(result.model_options[0]);
            }

        } catch (err) {
            AlertDialog({
                icon: "error",
                title: "ผิดพลาด",
                text: err?.response?.data?.message || "ค้นหาไม่สำเร็จ"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedModel) {
            setSpList(allSp);
            return;
        }

        let filtered = allSp.filter(sp => sp.modelfg === selectedModel);
        filtered = filtered.filter(sp => Number(sp.layout) === Number(activeLayout));

        filtered.sort((a, b) => {
            const ta = Number(a.tracking_number || a.trackno || a.tracking || 0);
            const tb = Number(b.tracking_number || b.trackno || b.tracking || 0);
            return ta - tb;
        });
        
        setSpList(filtered.length ? filtered : []);
    }, [selectedModel, activeLayout, allSp]);

    const handleAddToJob = (sp) => {

        if (sp.already_in_job) {
            return AlertDialog({
                icon: "warning",
                title: "รายการซ้ำ",
                text: `${sp.spname} มีอยู่ใน JOB นี้แล้ว`
            });
        }

        setSelectedAddList(prev => {
            if (prev.find(x => x.spcode === sp.spcode)) {
                return prev;
            }
            return [...prev, sp];
        });

        AlertDialog({
            icon: "success",
            title: "เพิ่มรายการชั่วคราว",
            text: `${sp.spname} ถูกเพิ่มในรายการ (ยังไม่ได้บันทึก)`
        });
    };

    const handleUpdateJob = async () => {
        if (selectedAddList.length === 0) {
            return AlertDialog({
                icon: "info",
                title: "ไม่มีรายการ",
                text: "กรุณาเลือกอะไหล่ก่อนอัพเดท"
            });
        }

        try {
            const payload = {
                job_id: jobId,
                list: selectedAddList.map(sp => ({
                    sp_code: sp.spcode,
                    sp_name: sp.spname,
                    sp_unit: sp.spunit,
                    stdprice_per_unit: sp.stdprice_per_unit,
                    sell_price: sp.price_per_unit,
                    sku_code: sp.skufg,
                    sp_qty: 1,
                    // discount_percent: sp.discount_percent ?? 0,
                    discount_percent: jobDiscount,
                    discount_amount: sp.discount_amount ?? 0,
                }))
            };

            const response = await axios.post(route("withdrawSp.updateAllDetail"), payload);

            AlertDialog({
                icon: "success",
                title: "อัพเดทสำเร็จ",
                text: "ระบบบันทึกรายการอะไหล่แล้ว"
            });

            onAdded?.(response.data.items);

            setSku("");
            setProduct(null);
            setAllSp([]);
            setSpList([]);
            setModelOptions([]);
            setSelectedModel(null);
            setSelectedAddList([]);
            onClose();
            // router.get(route("withdrawJob.show"));

        } catch (err) {
            AlertDialog({
                icon: "error",
                title: "ผิดพลาด",
                text: err?.response?.data?.message || err.message
            });
        }
    };

    const diagramLayersForModel =
        product?.diagram_layers?.filter(di => di.modelfg === selectedModel) ?? [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth scroll="paper">
            <DialogTitle sx={{ fontWeight: "bold" }}>
                เพิ่มอะไหล่เข้าใบเบิก (JOB: {jobId})
            </DialogTitle>

            <DialogContent dividers>

                {/* Search */}
                <form onSubmit={handleSearch}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
                        <TextField
                            label="รหัสสินค้า (SKU)"
                            fullWidth
                            size="small"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Search />}
                            disabled={loading}
                        >
                            {loading ? "กำลังค้นหา..." : "ค้นหา"}
                        </Button>
                    </Stack>
                </form>

                {loading && (
                    <Box textAlign="center" py={5}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && product && (
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

                        {/* Diagram */}
                        <Paper variant="outlined" sx={{ flex: 1, p: 2 }}>
                            <DmPreview
                                detail={{ pid: product?.pid }}
                                diagramLayers={diagramLayersForModel}
                                initialLayout={activeLayout}
                                onLayoutChange={(num) => setActiveLayout(num)}
                            />
                        </Paper>

                        {/* Table */}
                        <Paper variant="outlined" sx={{ flex: 2, p: 2 }}>

                            {/* Filter */}
                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                <Autocomplete
                                    options={modelOptions}
                                    size="small"
                                    sx={{ width: 200 }}
                                    value={selectedModel}
                                    onChange={(_e, v) => setSelectedModel(v)}
                                    renderInput={(params) =>
                                        <TextField {...params} size="small" label="เลือก Model" />
                                    }
                                />

                                {/* <Stack direction="row" spacing={1}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <Button
                                            key={num}
                                            size="small"
                                            variant={activeLayout === num ? "contained" : "outlined"}
                                            onClick={() => setActiveLayout(num)}
                                        >
                                            {num}
                                        </Button>
                                    ))}
                                </Stack> */}
                                <Stack direction="row" spacing={1}>
                                    {diagramLayersForModel.map(layer => (
                                        <Button
                                            key={layer.layout}
                                            size="small"
                                            variant={activeLayout === layer.layout ? "contained" : "outlined"}
                                            onClick={() => setActiveLayout(layer.layout)}
                                        >
                                            {layer.layout}
                                        </Button>
                                    ))}
                                </Stack>

                            </Stack>

                            {/* Table */}
                            <TableContainer>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: "grey.100" }}>
                                        <TableRow>
                                            <TableCell align="center">รูป</TableCell>
                                            <TableCell>ชื่ออะไหล่</TableCell>
                                            <TableCell align="center">Tracking</TableCell>
                                            <TableCell align="center">สต็อค</TableCell>
                                            <TableCell align="center">ราคาตั้ง</TableCell>
                                            <TableCell align="center">ราคาขาย</TableCell>
                                            <TableCell align="center">เพิ่ม</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {spList.map((sp) => (
                                            <TableRow key={sp.spcode}>

                                                <TableCell align="center">
                                                    <Box
                                                        component="img"
                                                        src={sp.path_file || DEFAULT_SP_IMG}
                                                        sx={{
                                                            width: 70,
                                                            height: 70,
                                                            borderRadius: 1,
                                                            border: "1px solid #ccc"
                                                        }}
                                                        onError={showDefaultImage}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Typography fontWeight={600}>{sp.spname}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {sp.spcode}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="center">
                                                    {sp.tracking_number || sp.trackno || sp.tracking || "-"}
                                                </TableCell>

                                                <TableCell align="center">
                                                    {sp.stock_balance}
                                                </TableCell>

                                                <TableCell align="center">
                                                    {sp.stdprice_per_unit?.toLocaleString()} ฿
                                                </TableCell>

                                                <TableCell align="center">
                                                    {sp.price_per_unit?.toLocaleString()} ฿
                                                </TableCell>

                                                <TableCell align="center">
                                                    {sp.already_in_job ? (
                                                        <Button size="small" variant="outlined" color="warning" disabled>
                                                            มีใน JOB แล้ว
                                                        </Button>
                                                    ) : selectedAddList.find(x => x.spcode === sp.spcode) ? (
                                                        <Button size="small" variant="outlined" color="success" disabled>
                                                            เลือกแล้ว
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() => handleAddToJob(sp)}
                                                        >
                                                            เพิ่ม
                                                        </Button>
                                                    )}
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Paper>

                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: "space-between" }}>
                <Button onClick={onClose}>ปิด</Button>

                <Button
                    variant="contained"
                    color="success"
                    disabled={selectedAddList.length === 0}
                    onClick={handleUpdateJob}
                >
                    อัพเดท ({selectedAddList.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
}
