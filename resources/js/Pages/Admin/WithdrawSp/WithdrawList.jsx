import React, { useEffect, useMemo, useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    Snackbar,
    Alert,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import axios from "axios";
import DmPreview from "@/Components/DmPreview.jsx";
import WithdrawRowView from "./components/WithdrawRowView.jsx";
import WithdrawSum from "./components/WithdrawSum.jsx";
import SpGridMobile from "./components/SpGridMobile.jsx";
import MobileHeader from "./components/MobileHeader.jsx";
import BrandBanner from "./components/BrandBanner.jsx";

const sortByTracking = (a, b) => {
    const aTrack = a.tracking_number ?? "";
    const bTrack = b.tracking_number ?? "";
    const aNum = parseFloat(aTrack);
    const bNum = parseFloat(bTrack);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return (aTrack + "").localeCompare(bTrack + "", undefined, { numeric: true });
};

export default function WithdrawList({ count_cart, message, sku, result, job_id, is_code_cust_id }) {
    const user = usePage().props.auth.user;
    const { restore } = usePage().props;
    const [allSp, setAllSp] = useState(result?.sp || []);
    const [spList, setSpList] = useState([]);
    const [searchValue, setSearchValue] = useState(sku ?? "");
    const [modelOptions, setModelOptions] = useState(result?.model_options || []);
    const [selectedModel, setSelectedModel] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(result || null);
    const [activeLayout, setActiveLayout] = useState(1);
    const [bucket, setBucket] = useState([]);
    const [warnIncomplete, setWarnIncomplete] = useState(false);
    const [imgPreview, setImgPreview] = useState({ open: false, src: "", alt: "" });
    const [restored, setRestored] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");

    const handleSearch = (e) => {
        e.preventDefault();
        localStorage.removeItem("withdraw_sp_state");
        router.get(
            route("withdrawSp.index"),
            { sku: searchValue },
            {
                replace: true,
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false)
            }
        );
    };

    useEffect(() => {
        const saved = localStorage.getItem("withdraw_sp_state");
        if (saved) {
            const state = JSON.parse(saved);

            if (state.searchValue) setSearchValue(state.searchValue);
            if (state.selectedModel) setSelectedModel(state.selectedModel);
            if (state.activeLayout) setActiveLayout(state.activeLayout);
            if (state.product) setProduct(state.product);
            if (state.allSp) setAllSp(state.allSp);
            if (state.spList) setSpList(state.spList);

            setRestored(true);
        }
    }, []);

    // โหลดตะกร้า
    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const res = await axios.get(route("withdrawSp.cartCount"));
                const count = res.data?.count ?? 0;
                if (count > 0) setBucket(Array(count).fill({}));
            } catch (err) {
                console.error("ไม่สามารถโหลดข้อมูลตะกร้าได้", err);
            }
        };
        fetchCartCount();
    }, []);

    // เมื่อค้นหาใหม่
    useEffect(() => {
        if (restore == 1) return;
        setSearchValue(sku ?? "");
        const nextAll = result?.sp || [];
        setAllSp(nextAll);
        let models = Array.isArray(result?.model_options) ? [...result.model_options] : [];
        if (!models.length) {
            const uniq = Array.from(new Set((nextAll || []).map((x) => x.modelfg).filter(Boolean)));
            models = uniq;
        }
        setModelOptions(models);
        const firstModel = models.length ? models[0] : null;
        setSelectedModel(firstModel);
        setSpList(nextAll);
        setBucket([]);
    }, [result, sku]);

    useEffect(() => {
        if (!selectedModel) {
            setSpList(allSp);
            return;
        }

        let filtered = allSp;

        // ถ้าเลือก DM01 / DM02 → กรองด้วย typedm
        // if (selectedModel.startsWith("DM")) {
        //     const dmNum = selectedModel.replace("DM", "").trim();
        //     filtered = allSp.filter((sp) => sp.typedm === dmNum);
        // } else {
        //     filtered = allSp.filter((sp) => sp.modelfg === selectedModel);
        // }

        filtered = allSp.filter((sp) => sp.modelfg === selectedModel);

        // ต่อด้วยกรอง layout (inside/outside)
        const byLayout = filtered.filter(
            (sp) => Number(sp.layout) === Number(activeLayout)
        );

        const sorted = (byLayout.length ? byLayout : filtered).sort(sortByTracking);
        setSpList(sorted);
    }, [selectedModel, activeLayout, allSp]);

    // จัดการรูป diagram ตาม model
    const diagramLayersForModel = (product?.diagram_layers || []).filter((x) => {
        if (!selectedModel) return true;
        if (selectedModel.startsWith("DM")) return x.typedm === selectedModel.replace("DM", "");
        return x.modelfg === selectedModel;
    });

    // แสดง Warning ถ้าข้อมูลไม่ครบ
    useEffect(() => {
        if (product) {
            const missingSp = !Array.isArray(product.sp) || product.sp.length === 0;
            const missingDiagram = !Array.isArray(product.diagram_layers) || product.diagram_layers.length === 0;
            if (missingSp || missingDiagram) setWarnIncomplete(true);
        }
    }, [product]);

    useEffect(() => {
        const saveState = {
            searchValue,
            selectedModel,
            activeLayout,
            product,
            allSp,
            spList,
        };

        localStorage.setItem("withdraw_sp_state", JSON.stringify(saveState));
    }, [searchValue, selectedModel, activeLayout, product, allSp, spList]);

    const handleAddToBucket = (sp) => {
        setBucket((prev) => {
            const ex = prev.find((x) => x.spcode === sp.spcode);
            if (ex) return prev.map((x) => (x.spcode === sp.spcode ? { ...x, qty: (x.qty || 1) + 1 } : x));
            return [
                ...prev,
                { spcode: sp.spcode, spname: sp.spname, sp_unit: sp.spunit || "ชิ้น", qty: 1, skufg: sp.skufg },
            ];
        });
    };

    const handleRemove = (spcode) => setBucket((prev) => prev.filter((x) => x.spcode !== spcode));
    const handleQty = (spcode, qty) => setBucket((prev) => prev.map((x) => (x.spcode === spcode ? { ...x, qty } : x)));
    const handleAdded = (sp) => {
        handleAddToBucket(sp);
        setSpList((prev) => prev.map((x) => (x.spcode === sp.spcode ? { ...x, added: true } : x)));
    };

    const handleNext = () => router.visit(route("withdrawSp.summary"));
    const handleClosePreview = () => setImgPreview((p) => ({ ...p, open: false }));

    return (
        <AuthenticatedLayout>
            <Head title="เบิกอะไหล่สินค้า" />

            <WithdrawSum open={open} setOpen={setOpen} items={bucket} onQty={handleQty} onRemove={handleRemove} />

            <Container maxWidth="false" sx={{ backgroundColor: "white", p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <ArrowBackIosIcon
                        sx={{ cursor: "pointer", color: "primary.main" }}
                        onClick={() => router.get(route("withdrawJob.index"))}
                    />
                    <Typography variant="h6" fontWeight="bold">
                        เบิกอะไหล่สำหรับศูนย์บริการ
                    </Typography>
                </Stack>

                <form onSubmit={handleSearch}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            required
                            fullWidth
                            label="ค้นหารหัสสินค้า"
                            size="small"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        {Array.isArray(modelOptions) && modelOptions.length > 0 && (
                            <Autocomplete
                                sx={{ width: { xs: "100%", sm: 200 } }}
                                size="small"
                                options={modelOptions}
                                value={selectedModel}
                                onChange={(_e, v) => setSelectedModel(v)}
                                renderInput={(params) => (
                                    <TextField {...params} label="เลือก DM" placeholder="เลือก DM" fullWidth size="small" />
                                )}
                            />
                        )}
                        <Button type="submit" startIcon={<Search />} variant="contained" size="small" disabled={loading}>
                            ค้นหา
                        </Button>
                    </Stack>
                </form>

                {loading ? (
                    <Box textAlign="center" py={5}>
                        <CircularProgress />
                    </Box>
                ) : spList.length ? (
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={3}>
                        <Card variant="outlined" sx={{ flex: 1, maxWidth: 400 }}>
                            <DmPreview
                                key={`${product?.pid || ""}-${selectedModel || "all"}`}
                                detail={{ pid: product?.pid }}
                                diagramLayers={diagramLayersForModel}
                                initialLayout={activeLayout}
                                onLayoutChange={(layoutNum) => setActiveLayout(Number(layoutNum) || 1)}
                            />
                        </Card>
                        <Paper variant="outlined" sx={{ flex: 2, p: 2 }}>
                            <Box height={650} sx={{ overflowY: "auto" }}>
                                <WithdrawRowView spList={spList} onAdded={handleAdded} onPreview={(src, alt) => setImgPreview({ open: true, src, alt })}
                                />
                            </Box>
                        </Paper>
                    </Stack>
                ) : (
                    <Box textAlign="center" py={5}>
                        ไม่พบรายการอะไหล่รหัสสินค้านี้ โปรดลองอีกครั้ง
                    </Box>
                )}
            </Container>

            {/* ปุ่มถัดไป */}
            <Box
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                bgcolor="white"
                py={1.5}
                boxShadow="0 -2px 6px rgba(0,0,0,0.15)"
                display="flex"
                justifyContent="center"
                zIndex={1300}
            >
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{ minWidth: 200, maxWidth: 260, borderRadius: 3, fontWeight: 600, fontSize: "1rem" }}
                    onClick={handleNext}
                    disabled={bucket.length === 0}
                >
                    {bucket.length > 0 ? `ถัดไป (${bucket.length})` : "ถัดไป (ยังไม่มีรายการ)"}
                </Button>
            </Box>

            {/* Preview รูปอะไหล่ */}
            <Dialog open={imgPreview.open} onClose={handleClosePreview} maxWidth="sm" fullWidth>
                <DialogTitle>{imgPreview.alt || "ภาพอะไหล่"}</DialogTitle>
                <DialogContent dividers>
                    <Box
                        component="img"
                        src={imgPreview.src}
                        alt={imgPreview.alt}
                        sx={{ width: "100%", maxHeight: "30vh", objectFit: "contain", mx: "auto" }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePreview}>ปิด</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={warnIncomplete}
                autoHideDuration={8000}
                onClose={() => setWarnIncomplete(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity="warning"
                    variant="filled"
                    onClose={() => setWarnIncomplete(false)}
                    sx={{ width: "100%" }}
                >
                    ⚠️ ข้อมูลสินค้าอาจยังโหลดไม่ครบ กรุณารีเฟรชหน้านี้อีกครั้ง
                </Alert>
            </Snackbar>
        </AuthenticatedLayout>
    );
}
