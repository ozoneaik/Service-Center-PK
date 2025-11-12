import React, { useEffect, useMemo, useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, Link, router, usePage } from "@inertiajs/react";
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
    Divider,
    Fab,
    Grid2,
    Paper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { ArrowBack, Search } from "@mui/icons-material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import axios from "axios";
import DmPreview from "@/Components/DmPreview.jsx";
import { showDefaultImage } from "@/utils/showImage.js";

import WithdrawRowView from "./components/WithdrawRowView.jsx";
import WithdrawSum from "./components/WithdrawSum.jsx";

import MobileHeader from "./components/MobileHeader.jsx";
import BrandBanner from "./components/BrandBanner.jsx";
import SpGridMobile from "./components/SpGridMobile.jsx";
import { Snackbar, Alert } from "@mui/material";

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

function sortByTracking(a, b) {
    const aTrack = a.tracking_number ?? "";
    const bTrack = b.tracking_number ?? "";

    // พยายามแปลงเป็นเลข ถ้าไม่ใช่เลขให้เปรียบแบบตัวอักษร
    const aNum = parseFloat(aTrack);
    const bNum = parseFloat(bTrack);

    // กรณีทั้งคู่เป็นเลข
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

    // กรณีผสมตัวอักษร เช่น A, B, SET1, SET2
    return (aTrack + "").localeCompare(bTrack + "", undefined, { numeric: true });
}

export default function WithdrawList({ count_cart, message, sku, result, job_id, is_code_cust_id }) {
    const user = usePage().props.auth.user;
    const { props, url } = usePage();
    const jobId =
        job_id || props?.job_id || new URLSearchParams(window.location.search).get("job_id");
    const custId =
        is_code_cust_id ||
        props?.is_code_cust_id ||
        new URLSearchParams(window.location.search).get("is_code_cust_id");

    const [allSp, setAllSp] = useState(result?.sp || []);
    const [spList, setSpList] = useState([]);

    const [searchValue, setSearchValue] = useState(sku ?? "");
    const searchSku = useRef(null);

    const [modelOptions, setModelOptions] = useState(result?.model_options || []);
    const [selectedModel, setSelectedModel] = useState(null);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(result || null);

    const [activeLayout, setActiveLayout] = useState(1);
    // const [activeLayout, setActiveLayout] = useState("outside");
    const [warnIncomplete, setWarnIncomplete] = useState(false);

    const [bucket, setBucket] = useState([]);
    const [imgPreview, setImgPreview] = useState({ open: false, src: "", alt: "" });
    const handleOpenPreview = (src, alt) => setImgPreview({ open: true, src, alt });
    const handleClosePreview = () => setImgPreview((p) => ({ ...p, open: false }));

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route("withdrawSp.index"),
            { sku: searchValue, is_code_cust_id: custId, job_id: jobId },
            {
                replace: true,
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            }
        );
    };



    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const res = await axios.get(route('withdrawSp.cartCount'));
                const count = res.data?.count ?? 0;
                if (count > 0) {
                    setBucket(Array(count).fill({}));
                }
            } catch (err) {
                console.error("ไม่สามารถโหลดข้อมูลตะกร้าได้", err);
            }
        };

        fetchCartCount();
    }, []);

    useEffect(() => {
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
        const layersForModel = (product?.diagram_layers || []).filter(
            (x) => !selectedModel || x.modelfg === selectedModel);
        // const first = layersForModel[0];
        // const nextLayout = ((first?.layer_char || "outside") + "").toLowerCase().trim();
        // setActiveLayout(nextLayout);

        // const byModel = !selectedModel ? allSp : allSp.filter((x) => (x.modelfg || null) === selectedModel);
        // const want = (nextLayout || "outside").toLowerCase().trim();
        // const byLayout = byModel.filter(
        //     (x) => ((x.layout || "outside") + "").toLowerCase().trim() === want
        // );

        // // setSpList(byLayout.length ? byLayout : byModel);
        // const sorted = (byLayout.length ? byLayout : byModel).sort(sortByTracking);
        // setSpList(sorted);
        const first = layersForModel[0];
        const nextLayout = Number(first?.layout || 1);
        setActiveLayout(nextLayout);

        const byModel = !selectedModel ? allSp : allSp.filter((x) => x.modelfg === selectedModel);
        const byLayout = byModel.filter(
            (x) => Number(x.layout) === Number(nextLayout)
        );
        const sorted = (byLayout.length ? byLayout : byModel).sort(sortByTracking);
        setSpList(sorted);
    }, [selectedModel]);

    useEffect(() => {
        // const byModel = !selectedModel ? allSp : allSp.filter(x => x.modelfg === selectedModel);
        // const byLayout = byModel.filter(x => Number(x.layout) === Number(activeLayout));
        // const sorted = (byLayout.length ? byLayout : byModel).sort(sortByTracking);
        // setSpList(sorted);
        const byModel = !selectedModel
            ? allSp
            : allSp.filter((x) => x.modelfg === selectedModel);
        const byLayout = byModel.filter(
            (x) => Number(x.layout) === Number(activeLayout)
        );
        const sorted = (byLayout.length ? byLayout : byModel).sort(sortByTracking);
        setSpList(sorted);
        console.log("🔁 activeLayout changed →", activeLayout, "found:", byLayout.length);
    }, [activeLayout, selectedModel, allSp]);

    const diagramLayersForModel = (product?.diagram_layers || []).filter(
        (x) => !selectedModel || x.modelfg === selectedModel);

    useEffect(() => {
        if (Array.isArray(spList) && spList.length > 0) {
            const alreadyAdded = spList.filter((sp) => sp.added);
            if (alreadyAdded.length > 0) {
                // เติม bucket อัตโนมัติ
                setBucket(
                    alreadyAdded.map((x) => ({
                        spcode: x.spcode,
                        spname: x.spname,
                        sp_unit: x.spunit || "ชิ้น",
                        qty: 1,
                        skufg: x.skufg,
                    }))
                );
            }
        }
    }, [spList]);

    useEffect(() => {
        if (product) {
            const missingSp = !Array.isArray(product.sp) || product.sp.length === 0;
            const missingDiagram = !Array.isArray(product.diagram_layers) || product.diagram_layers.length === 0;
            const missingTrackingNumber = Array.isArray(product.sp) && product.sp.some(sp => !sp.tracking_number);
            if (missingSp || missingDiagram || missingTrackingNumber) {
                setWarnIncomplete(true);
            }
        }
    }, [product]);

    const isMobile = useMediaQuery("(max-width:600px)");
    const showModelPicker = !!product && Array.isArray(modelOptions) && modelOptions.length > 0;

    const handleAddToBucket = (sp) => {
        setBucket((prev) => {
            const ex = prev.find((x) => x.spcode === sp.spcode);
            if (ex)
                return prev.map((x) =>
                    x.spcode === sp.spcode ? { ...x, qty: (x.qty || 1) + 1 } : x
                );
            return [
                ...prev,
                {
                    spcode: sp.spcode,
                    spname: sp.spname,
                    sp_unit: sp.spunit || "ชิ้น",
                    qty: 1,
                    skufg: sp.skufg,
                },
            ];
        });
    };

    const handleQty = (spcode, qty) => setBucket((prev) => prev.map((x) => (x.spcode === spcode ? { ...x, qty } : x)));
    const handleRemove = (spcode) => setBucket((prev) => prev.filter((x) => x.spcode !== spcode));

    const handleAdded = (sp) => {
        handleAddToBucket(sp);
        setSpList((prev) =>
            prev.map((x) => (x.spcode === sp.spcode ? { ...x, added: true } : x))
        );
    };

    const handleNext = () => {
        router.visit(route("withdrawSp.summary"), {
            data: {
                items: bucket,
                is_code_cust_id: custId,
                job_id: jobId,
            },
        });
    };

    const handleCreateWithdraw = async () => {
        try {
            const header = { requester: user?.name, remark: "สร้างจากหน้าเบิก" };
            const items = bucket.map((b) => ({ spcode: b.spcode, name: b.spname, qty: b.qty, unit: b.sp_unit }));
            const res = await axios.post(route("withdrawSp.store"), { header, items, mode: "submit" });
            if (res.status === 200) {
                setOpen(false);
                setBucket([]);
                if (res.data?.doc_no) {
                    router.visit(route("withdrawSp.detail", res.data.doc_no));
                } else {
                    router.reload({ only: ["result"] });
                }
            }
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "สร้างใบเบิกล้มเหลว");
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="เบิกอะไหล่สินค้า" />

            <WithdrawSum
                open={open}
                setOpen={setOpen}
                items={bucket}
                onQty={handleQty}
                onRemove={handleRemove}
                onSubmit={handleCreateWithdraw}
            />

            {/* ===== MOBILE LAYOUT ===== */}
            {isMobile ? (
                <Box sx={{ bgcolor: "white" }}>
                    <MobileHeader
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        onSubmit={handleSearch}
                        showModelPickerSlot={
                            showModelPicker ? (
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={modelOptions}
                                    value={selectedModel}
                                    onChange={(_e, v) => setSelectedModel(v)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="เลือกโมเดล"
                                            placeholder="เช่น J-12BID1504"
                                            fullWidth
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    )}
                                />
                            ) : null
                        }
                        cartCount={bucket.length}
                        onCartClick={() => router.get(route('withdrawSp.carts'))}
                        onHistoryClick={() => router.get(route('withdrawSp.history'))}
                    />

                    {product ? (
                        <BrandBanner
                            product={product}
                            diagramLayers={diagramLayersForModel}
                            layout={activeLayout}
                            selectedModel={selectedModel}
                            onLayoutChange={(layout) => {
                                const next = (layout || "outside").toLowerCase().trim();
                                setActiveLayout(next);
                            }}
                        />
                    ) : (
                        <Box p={2} textAlign="center">ไม่มีข้อมูลสินค้า</Box>
                    )}

                    {loading ? (
                        <Box textAlign="center" py={5}>
                            <CircularProgress />
                        </Box>
                    ) : spList.length ? (
                        <SpGridMobile
                            spList={spList}
                            // onAdded={(sp) => {
                            //     setSpList((prev) =>
                            //         prev.map((x) => (x.spcode === sp.spcode ? { ...x, added: true } : x))
                            //     );
                            // }}
                            onAdded={handleAdded}
                            onPreview={handleOpenPreview}
                        />
                    ) : (
                        <Box textAlign="center" py={5}>
                            ไม่พบรายการอะไหล่รหัสสินค้านี้ โปรดลองอีกครั้ง
                        </Box>
                    )}
                </Box>
            ) : (
                /* ===== DESKTOP LAYOUT (เดิม) ===== */
                <Container maxWidth="false" sx={{ backgroundColor: "white", p: 3 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 2,
                                }}
                            >
                                {/* ปุ่มย้อนกลับ */}
                                <Typography
                                    component="div"
                                    onClick={() => router.get(route("withdrawJob.index"))}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: "primary.main",
                                        "&:hover": {
                                            color: "primary.main",
                                        },
                                    }}
                                >
                                    <ArrowBackIosIcon sx={{ fontSize: 20 }} />
                                </Typography>

                                {/* หัวข้อ */}
                                <Typography variant="h6" fontWeight="bold">
                                    เบิกอะไหล่สำหรับศูนย์บริการ
                                </Typography>
                            </Box>

                            <form onSubmit={handleSearch}>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <Box sx={{ flex: 1 }}>
                                        {/* ใช้ Stack ภายในเพื่อจัดเรียงช่องค้นหาและช่องเลือกโมเดลให้อยู่ในแถวเดียวกัน */}
                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                            <TextField
                                                required
                                                inputRef={searchSku}
                                                fullWidth
                                                label="ค้นหารหัสสินค้า"
                                                type="text"
                                                size="small"
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                            />
                                            {showModelPicker && (
                                                <Autocomplete
                                                    sx={{ width: { xs: "100%", sm: 300 } }}
                                                    size="small"
                                                    options={modelOptions}
                                                    value={selectedModel}
                                                    onChange={(_e, v) => setSelectedModel(v)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="เลือกโมเดล"
                                                            placeholder="เช่น J-12BID1504"
                                                            fullWidth
                                                            size="small"
                                                        />
                                                    )}
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                    <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>

                                        <Button
                                            fullWidth={isMobile}
                                            type="submit"
                                            startIcon={<Search />}
                                            variant="contained"
                                            size="small"
                                            disabled={loading}
                                        >
                                            ค้นหา
                                        </Button>

                                        {/* {!isMobile && (
                                            <Button
                                                component={Link}
                                                href={route("withdrawSp.summary")}
                                                color="secondary"
                                                variant="contained"
                                                size="small"
                                                startIcon={<AddShoppingCartIcon />}
                                            >
                                                รายการเบิกอะไหล่{" "} ({bucket.length})
                                                {bucket.length > 0 && (
                                                    <b>({bucket.length} รายการ)</b>
                                                )}
                                            </Button>
                                        )} */}

                                        {/* <Button
                                            fullWidth={isMobile}
                                            onClick={() => router.get(route('withdrawSp.history'))}
                                            startIcon={<HistoryIcon />}
                                            color="warning"
                                            variant="contained"
                                            size="small"
                                        >
                                            {!isMobile && "ประวัติการเบิก"}
                                        </Button> */}
                                    </Stack>
                                </Stack>
                            </form>
                        </Grid2>
                        {spList.length > 0 && !loading ? (
                            <>
                                <Grid2 size={{ md: 3, sm: 12 }}>
                                    <Card variant="outlined">
                                        {product ? (
                                            <DmPreview
                                                key={`${product?.pid || ""}-${selectedModel || "all"}`}
                                                detail={{ pid: product.pid }}
                                                diagramLayers={diagramLayersForModel}
                                                initialLayout={activeLayout}
                                                onLayoutChange={(layoutNum) => {
                                                    const next = Number(layoutNum) || 1;
                                                    setActiveLayout(next);
                                                }}
                                            />
                                        ) : (
                                            <Box p={2} textAlign="center">
                                                ไม่มีข้อมูลสินค้า
                                            </Box>
                                        )}
                                    </Card>
                                </Grid2>
                                <Grid2 size={{ md: 9, sm: 12 }}>
                                    <Paper variant="outlined" sx={{ p: { xs: 1.5, lg: 3 } }}>
                                        <Box height={650} sx={{ overflowY: "auto" }}>
                                            <WithdrawRowView
                                                spList={spList}
                                                onAdded={handleAdded}
                                                // onAdded={(sp) => {
                                                //     setSpList((prev) =>
                                                //         prev.map((x) => (x.spcode === sp.spcode ? { ...x, added: true } : x))
                                                //     );
                                                // }}
                                                onPreview={handleOpenPreview}
                                            />
                                        </Box>
                                    </Paper>
                                </Grid2>
                            </>
                        ) : loading ? (
                            <Grid2 size={12}>
                                <Box textAlign="center" py={5}>
                                    <CircularProgress />
                                </Box>
                            </Grid2>
                        ) : (
                            <Grid2 size={12}>
                                <Box textAlign="center" py={5}>
                                    ไม่พบรายการอะไหล่รหัสสินค้านี้ โปรดลองอีกครั้ง
                                </Box>
                            </Grid2>
                        )}
                    </Grid2>
                    {isMobile && (
                        <Box position="fixed" bottom={0} right={0} p={2} zIndex={1000}>
                            <Fab color="secondary" onClick={() => setOpen(true)}>
                                <AddShoppingCartIcon />
                            </Fab>
                        </Box>
                    )}

                </Container>
            )}

            {/* {spList.length > 0 && bucket.length > 0 && (
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
                        sx={{ minWidth: 200, maxWidth: 260, borderRadius: 3 }}
                        onClick={handleNext}
                    >
                        ถัดไป ({bucket.length})
                    </Button>
                </Box>
            )} */}
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
                    sx={{
                        minWidth: 200,
                        maxWidth: 260,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: "1rem",
                    }}
                    onClick={handleNext}
                    disabled={bucket.length === 0} 
                >
                    {bucket.length > 0
                        ? `ถัดไป (${bucket.length})`
                        : "ถัดไป (ยังไม่มีรายการ)"}
                </Button>
            </Box>

            {/* Image Preview Dialog */}
            <Dialog open={imgPreview.open} onClose={handleClosePreview} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pr: 2 }}>{imgPreview.alt || "ภาพอะไหล่"}</DialogTitle>
                <DialogContent dividers>
                    <Box
                        component="img"
                        src={imgPreview.src}
                        alt={imgPreview.alt}
                         
                        sx={{ width: "100%", maxHeight: "30vh", display: "block", objectFit: "contain", mx: "auto" }}
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
                    ⚠️ ข้อมูลสินค้าอาจยังโหลดไม่ครบ กรุณารีเฟรชหน้านี้อีกครั้งหรือกรอกรหัสสินค้าแล้วค้นหาอีกครั้งหากรายการไม่ครบถ้วน
                </Alert>
            </Snackbar>

        </AuthenticatedLayout>
    );
}