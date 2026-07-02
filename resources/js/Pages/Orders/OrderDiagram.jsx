import { useState, useEffect, useMemo } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Alert, Badge, Box, Button, Card, CardContent, Chip,
    CircularProgress, Container, Dialog, DialogContent, DialogTitle,
    Divider,
    Fab, Grid2, IconButton, InputAdornment,
    Paper, Snackbar, Stack, TextField, Tooltip, Typography,
    useMediaQuery, useTheme,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Search, Close } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import CartDrawer from "./carts/CartList.jsx";

// ─── Pumpkin API ──────────────────────────────────────────────────────────────
const EXT_API = "https://warranty-sn.pumpkin.tools/api/diagram";
const SP_IMG = (c) => `https://warranty-sn.pumpkin.tools/storage/uploads/sp_images/${c}.jpg`;
const SP_FALL = "https://images.dcpumpkin.com/images/product/500/default.jpg";

// ─── helpers ─────────────────────────────────────────────────────────────────
// controller expects: skufg, pname, spcode, spname, price_per_unit, spunit
function spToCartItem(sp, sku, modelName) {
    return {
        skufg: sku ?? "",
        pname: modelName ?? "",
        spcode: sp.spcode,
        spname: sp.spname ?? "",
        price_per_unit: sp.price_per_unit ?? sp.stdprice ?? 0,
        spunit: sp.spunit ?? "ชิ้น",
    };
}

export default function OrderDiagram() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // ── search ──────────────────────────────────────────────────────────────
    const [searchValue, setSearchValue] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    // ── DMS list ─────────────────────────────────────────────────────────────
    const [currentSku, setCurrentSku] = useState("");
    const [dmsItems, setDmsItems] = useState([]);   // [{ dm, modelfg, img, annotation_count }]
    const [selectedDm, setSelectedDm] = useState(null);
    const [dmsLoading, setDmsLoading] = useState(false);

    // ── diagram state ────────────────────────────────────────────────────────
    const [diagramLoading, setDiagramLoading] = useState(false);
    const [imgPages, setImgPages] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const [annotations, setAnnotations] = useState([]);
    const [headerModel, setHeaderModel] = useState("");
    const [pdfUrl, setPdfUrl] = useState(null);

    // ── parts list state ─────────────────────────────────────────────────────
    const [spList, setSpList] = useState([]);   // spData + cart state
    const [hoveredCode, setHoveredCode] = useState(null);
    const [loadingMap, setLoadingMap] = useState({});
    const [selectedSpcode, setSelectedSpcode] = useState(null);

    // ── lightbox ─────────────────────────────────────────────────────────────
    const [openSpImage, setOpenSpImage] = useState(false);
    const [spImageSrc, setSpImageSrc] = useState("");

    // ── right panel: view history (stacked cards) + list filter ──────────────
    const [viewHistory, setViewHistory] = useState([]);  // spcodes, most recent first
    const [listFilter, setListFilter] = useState("");

    // ── info dialog ───────────────────────────────────────────────────────────
    const [infoOpen, setInfoOpen] = useState(false);

    // ── snackbar feedback ─────────────────────────────────────────────────────
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const showToast = (message, severity = "success") =>
        setSnackbar({ open: true, message, severity });

    // ── cart state ────────────────────────────────────────────────────────────
    const [cartRefreshCounter, setCartRefreshCounter] = useState(0);
    const [globalCartTotal, setGlobalCartTotal] = useState(0);
    const [cartOperating, setCartOperating] = useState(false);
    const [operatingCartId, setOperatingCartId] = useState(null);

    const triggerCartRefresh = () => setCartRefreshCounter(c => c + 1);

    // ── derived ───────────────────────────────────────────────────────────────
    const currentAnns = annotations.filter((a) => (a.page ?? 1) === activePage);
    const currentImg = imgPages[activePage - 1] ?? null;
    const inCartItems = useMemo(() => spList.filter((s) => s.added), [spList]);

    const listFiltered = useMemo(() => {
        const activeAnnsSet = new Set(
            annotations.filter((a) => (a.page ?? 1) === activePage).map((a) => a.spcode)
        );
        const allAnnotatedCodes = new Set(annotations.map((a) => a.spcode));

        // Keep only parts on current page (or parts with no annotation on any page)
        let result = spList.filter(
            (s) => activeAnnsSet.has(s.spcode) || !allAnnotatedCodes.has(s.spcode)
        );

        if (!listFilter.trim()) return result;
        const q = listFilter.toLowerCase();
        return result.filter((s) =>
            s.spcode?.toLowerCase().includes(q) ||
            s.spname?.toLowerCase().includes(q) ||
            String(s.tracking_number) === listFilter.trim()
        );
    }, [spList, listFilter, activePage, annotations]);

    // ── Search ────────────────────────────────────────────────────────────────
    async function handleSearch(e) {
        e.preventDefault();
        const q = searchValue.trim();
        if (!q) return;
        setListFilter("");
        setSearching(true);
        setSearchError("");
        setDmsItems([]);
        setSelectedDm(null);
        setSpList([]);
        setAnnotations([]);
        setImgPages([]);
        setHeaderModel("");
        try {
            const res = await fetch(
                `https://warranty-sn.pumpkin.tools/api/getdatadup?search=${encodeURIComponent(q)}`
            );
            const data = await res.json();
            if (data.status !== "SUCCESS") throw new Error(data.message || "ไม่พบข้อมูล");

            const reserved = new Set(["status", "message", "search", "search_type", "skumain"]);
            const skuKey = Object.keys(data).find((k) => !reserved.has(k));
            const result = skuKey ? data[skuKey] : null;
            if (!result) throw new Error("ไม่พบข้อมูลสำหรับคำค้นนี้");

            const sku = data.skumain || result.skumain || skuKey;

            if (data.search_type === "serial" && result.sn_hd?.DM) {
                // Serial + มี DM → โหลด diagram เลย
                await loadDmsAndDiagram(sku, result.sn_hd.DM);
            } else {
                await loadDms(sku);
            }
        } catch (err) {
            setSearchError(err.message);
        } finally {
            setSearching(false);
        }
    }

    async function loadDms(sku, targetModel = null) {
        setCurrentSku(sku);
        setDmsLoading(true);
        try {
            const res = await fetch(`${EXT_API}/${sku}?source=wordpress`);
            const data = await res.json();
            if (!data.dms?.length) throw new Error(`ไม่พบข้อมูลสำหรับ SKU ${sku}`);
            setDmsItems(data.dms);

            const sorted = [...data.dms].sort((a, b) => b.dm - a.dm);
            const target = targetModel
                ? (data.dms.find((d) => d.modelfg === targetModel) ?? sorted[0])
                : sorted[0];
            setSelectedDm(target);
            await loadDiagram(sku, target.dm);
        } catch (err) {
            setSearchError(err.message);
        } finally {
            setDmsLoading(false);
        }
    }

    async function loadDmsAndDiagram(sku, dm) {
        setCurrentSku(sku);
        const [dmsRes] = await Promise.allSettled([
            fetch(`${EXT_API}/${sku}?source=wordpress`).then((r) => r.json()),
        ]);
        if (dmsRes.status === "fulfilled" && dmsRes.value.dms?.length) {
            setDmsItems(dmsRes.value.dms);
            const found = dmsRes.value.dms.find((d) => d.dm === dm) ?? dmsRes.value.dms[0];
            setSelectedDm(found);
        }
        await loadDiagram(sku, dm);
    }

    async function loadDiagram(sku, dm) {
        setDiagramLoading(true);
        setAnnotations([]);
        setSpList([]);
        setImgPages([]);
        setActivePage(1);
        setHoveredCode(null);
        setSelectedSpcode(null);
        setViewHistory([]);
        setHeaderModel("กำลังโหลด…");
        try {
            // โหลด diagram + ราคาจาก backend พร้อมกัน
            const [diagRes, priceRes] = await Promise.allSettled([
                fetch(`${EXT_API}/${sku}/${dm}?source=wordpress`).then((r) => r.json()),
                axios.get("/orders/search-sp", { params: { sku, dm } }),
            ]);

            if (diagRes.status !== "fulfilled" || diagRes.value.status !== "ok") {
                throw new Error(diagRes.value?.message ?? "ไม่พบข้อมูลไดอะแกรม");
            }

            const data = diagRes.value;
            const priceMap = priceRes.status === "fulfilled" ? (priceRes.value.data.sp ?? {}) : {};

            const dm_ = data.dmData ?? {};
            const pages = [1, 2, 3, 4, 5].map((n) => dm_[`img_${n}`]).filter(Boolean);

            setImgPages(pages);
            setHeaderModel(dm_.modelfg ?? `SKU ${sku}`);
            setPdfUrl(dm_.pdf_path ?? null);
            setAnnotations((data.annotations ?? []).map((a) => ({ ...a, page: a.page ?? 1 })));

            const spData = Array.isArray(data.spData) ? data.spData : [];
            const spListData = spData.map((s) => ({
                ...s,
                price_per_unit: priceMap[s.spcode]?.price_per_unit ?? null,
                stdprice_per_unit: priceMap[s.spcode]?.stdprice_per_unit ?? s.stdprice ?? 0,
                spunit: priceMap[s.spcode]?.spunit ?? s.unit ?? "ชิ้น",
                added: priceMap[s.spcode]?.cart_added ?? false,
                cartId: priceMap[s.spcode]?.cart_id ?? null,
                cartQty: priceMap[s.spcode]?.cart_qty ?? 0,
            }));
            setSpList(spListData);

            // Auto-populate right panel with items already in cart
            const cartSpcodes = spListData.filter((s) => s.added).map((s) => s.spcode);
            if (cartSpcodes.length > 0) setViewHistory(cartSpcodes);
        } catch (err) {
            setHeaderModel(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setDiagramLoading(false);
        }
    }

    // ── DM Autocomplete change ────────────────────────────────────────────────
    async function handleDmChange(_, dm) {
        if (!dm) return;
        setSelectedDm(dm);
        await loadDiagram(currentSku, dm.dm);
    }

    // ── Cart actions ──────────────────────────────────────────────────────────
    const setItemLoading = (spcode, val) =>
        setLoadingMap((prev) => ({ ...prev, [spcode]: val }));

    async function handleAddToCart(sp) {
        if (loadingMap[sp.spcode]) return;
        const price = parseFloat(sp.price_per_unit);
        if (!price || price <= 0) {
            showToast(`ไม่สามารถเพิ่ม ${sp.spcode} ได้ เนื่องจากราคาเป็น 0`, "warning");
            return;
        }
        try {
            setItemLoading(sp.spcode, true);
            setCartOperating(true);
            const { data, status } = await axios.post("/orders/carts/add-cart", spToCartItem(sp, currentSku, headerModel));
            if (status === 200) {
                setSpList((list) =>
                    list.map((s) =>
                        s.spcode === sp.spcode
                            ? { ...s, added: true, cartId: data.cart.id, cartQty: 1 }
                            : s
                    )
                );
                setViewHistory((prev) => [sp.spcode, ...prev.filter((c) => c !== sp.spcode)]);
                showToast(`เพิ่ม ${sp.spcode} ลงตะกร้าแล้ว`);
                triggerCartRefresh();
            }
        } catch (err) {
            showToast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error");
        } finally {
            setItemLoading(sp.spcode, false);
            setCartOperating(false);
        }
    }

    async function handleQtyChange(sp, direction) {
        setCartOperating(true);
        setOperatingCartId(sp.cartId);
        if (direction === "remove" && sp.cartQty <= 1) {
            setSpList((list) =>
                list.map((s) =>
                    s.spcode === sp.spcode ? { ...s, added: false, cartId: null, cartQty: 0 } : s
                )
            );
            try {
                await axios.delete(`/orders/carts/delete/${sp.cartId}`);
                triggerCartRefresh();
            } catch (err) {
                showToast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error");
                triggerCartRefresh();
            } finally {
                setCartOperating(false);
                setOperatingCartId(null);
            }
        } else {
            const newQty = direction === "add" ? sp.cartQty + 1 : sp.cartQty - 1;
            setSpList((list) =>
                list.map((s) =>
                    s.spcode === sp.spcode ? { ...s, cartQty: newQty } : s
                )
            );
            try {
                await axios.post(`/orders/carts/add-remove/${direction}`, { id: sp.cartId });
                triggerCartRefresh();
            } catch (err) {
                showToast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error");
                triggerCartRefresh();
            } finally {
                setCartOperating(false);
                setOperatingCartId(null);
            }
        }
    }

    async function handleDeleteCart(sp) {
        setCartOperating(true);
        setSpList((list) =>
            list.map((s) =>
                s.spcode === sp.spcode ? { ...s, added: false, cartId: null, cartQty: 0 } : s
            )
        );
        try {
            await axios.delete(`/orders/carts/delete/${sp.cartId}`);
            showToast(`นำ ${sp.spcode} ออกจากตะกร้าแล้ว`, "info");
            triggerCartRefresh();
        } catch (err) {
            showToast(err.response?.data?.message || "เกิดข้อผิดพลาด", "error");
            triggerCartRefresh();
        } finally {
            setCartOperating(false);
        }
    }

    // ── Marker click → toggle card (remove if not in cart, add/select otherwise)
    function handleMarkerClick(ann) {
        const sp = spList.find((s) => s.spcode === ann.spcode);
        if (!sp) return;
        if ((ann.page ?? 1) !== activePage) setActivePage(ann.page ?? 1);
        const inHistory = viewHistory.includes(ann.spcode);
        if (inHistory && !sp.added) {
            // คลิกซ้ำ + ยังไม่ได้เพิ่มตะกร้า → เอาออก
            setViewHistory((prev) => prev.filter((c) => c !== ann.spcode));
            setSelectedSpcode((prev) => prev === ann.spcode ? null : prev);
        } else {
            // เพิ่มขึ้นบนสุด (หรือ re-select ถ้าอยู่ในตะกร้าแล้ว)
            setSelectedSpcode(ann.spcode);
            setViewHistory((prev) => [ann.spcode, ...prev.filter((c) => c !== ann.spcode)]);
        }
    }

    // ── Auto-load SKU from URL query param (e.g. ?sku=XXX&model=YYY from cart page) ────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const skuParam = params.get("sku");
        const modelParam = params.get("model");
        if (!skuParam) return;
        loadDms(skuParam, modelParam || null);
    }, []);

    const hasContent = imgPages.length > 0 || spList.length > 0;

    function syncSpListFromCart(groups) {
        const cartItemsMap = {};
        groups.forEach(group => {
            group.list.forEach(item => { cartItemsMap[item.sp_code] = item; });
        });
        setSpList(prev => prev.map(s => {
            const cartItem = cartItemsMap[s.spcode];
            if (cartItem) return { ...s, added: true, cartQty: parseFloat(cartItem.qty), cartId: cartItem.id };
            return { ...s, added: false, cartQty: 0, cartId: null };
        }));
    }


    // ─────────────────────────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout>
            <Head title="สั่งซื้ออะไหล่ (Diagram)" />

            {openSpImage && (
                <SpPreviewImage imagePath={spImageSrc} setOpen={setOpenSpImage} open={openSpImage} />
            )}

            <Container maxWidth={false} sx={{ backgroundColor: "white", p: { xs: 2, md: 3 } }}>
                <Grid2 container spacing={2}>
                    {/* ── Page Header ────────────────────────────────────── */}
                    <Grid2 size={12}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="text.primary">
                                    เช็คไดอะแกรม & สั่งซื้ออะไหล่
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ค้นหาด้วย <span style={{ color: "red", fontWeight: "bold" }}>หมายเลขซีเรียล</span> หรือ <span style={{ color: "red", fontWeight: "bold" }}>รหัสสินค้า (SKU)</span> แล้วเพิ่มอะไหล่ลงตะกร้า
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="ประวัติการสั่งซื้อ">
                                    <Button
                                        component={Link}
                                        href="/orders/history"
                                        startIcon={<HistoryIcon />}
                                        color="warning"
                                        variant="outlined"
                                        size="small"
                                    >
                                        {!isMobile && "ประวัติ"}
                                    </Button>
                                </Tooltip>
                                <Tooltip title="ดูตะกร้าสินค้า">
                                    <Button
                                        startIcon={
                                            cartOperating
                                                ? <CircularProgress size={16} color="inherit" />
                                                : <Badge badgeContent={globalCartTotal || null} color="error" max={99}>
                                                    <AddShoppingCartIcon />
                                                </Badge>
                                        }
                                        onClick={() => {
                                            document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        color="secondary"
                                        variant="contained"
                                        size="small"
                                    >
                                        {!isMobile && "ตะกร้าสินค้า"}
                                    </Button>
                                </Tooltip>
                            </Stack>
                        </Stack>
                        <Typography sx={{ fontSize: { xs: 16, sm: 20, md: 24 }, fontWeight: "bold", textAlign: "center" }} color="red">
                            ** การค้นหาด้วย Serial เพื่อการตรวจสอบและสั่งซื้ออะไหล่ได้อย่างถูกต้องและแม่นยำ **
                        </Typography>
                    </Grid2>

                    {/* ── Search Bar ─────────────────────────────────────── */}
                    <Grid2 size={12}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <form onSubmit={handleSearch}>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                                    <TextField
                                        sx={{ flex: 1, width: { xs: "100%", sm: "auto" } }}
                                        required
                                        label="ค้นหารหัสสินค้าหรือหมายเลขซีเรียล"
                                        type="text"
                                        size="small"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        placeholder="เช่น J-S4540, SN1234567..."
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        error={!!searchError}
                                        helperText={searchError || ""}
                                    />
                                    <Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                        <Button
                                            type="submit"
                                            startIcon={searching || dmsLoading ? <CircularProgress size={16} color="inherit" /> : <Search />}
                                            variant="contained"
                                            size="small"
                                            disabled={searching || dmsLoading}
                                            sx={{ flex: { xs: 1, sm: "initial" }, height: 40 }}
                                        >
                                            {searching || dmsLoading ? "กำลังค้น…" : "ค้นหา"}
                                        </Button>
                                        <Tooltip title="แนะนําวิธีดูรหัสสินค้าและซีเรียลนัมเบอร์">
                                            <IconButton
                                                type="button"
                                                color="info"
                                                onClick={() => setInfoOpen(true)}
                                                sx={{ height: 40, width: 40, border: "1px solid", borderColor: "info.light", borderRadius: 1.5, flexShrink: 0 }}
                                            >
                                                <InfoOutlinedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </form>
                        </Paper>
                    </Grid2>

                    {/* ── DM Picker (แสดงเมื่อมีหลาย DM) ─────────────────── */}
                    {dmsItems.length > 0 && (
                        <Grid2 size={12}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", fontWeight: "medium" }}>
                                    {dmsItems.length > 1 ? `พบ ${dmsItems.length} รุ่น — เลือกรุ่นที่ต้องการ` : "รุ่นสินค้า"}
                                </Typography>
                                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                    {dmsItems.map((dm) => {
                                        const isActive = selectedDm?.dm === dm.dm;
                                        return (
                                            <Card
                                                key={dm.dm}
                                                variant="outlined"
                                                onClick={() => handleDmChange(null, dm)}
                                                sx={{
                                                    cursor: "pointer",
                                                    minWidth: 140,
                                                    borderColor: isActive ? "primary.main" : "divider",
                                                    borderWidth: isActive ? 2 : 1,
                                                    bgcolor: isActive ? "#eff6ff" : "background.paper",
                                                    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                                                    boxShadow: isActive ? "0 0 0 3px #bfdbfe" : "none",
                                                    "&:hover": { borderColor: "primary.main", bgcolor: "#f8fafc" },
                                                }}
                                            >
                                                <CardContent sx={{ p: "10px 14px !important" }}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Box sx={{
                                                            width: 32, height: 32, borderRadius: 1,
                                                            bgcolor: isActive ? "primary.main" : "#e2e8f0",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            flexShrink: 0,
                                                        }}>
                                                            <Typography sx={{ fontSize: 10, fontWeight: "bold", color: isActive ? "white" : "#64748b" }}>
                                                                {`DM${String(dm.dm).padStart(2, "0")}`}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography variant="body2" fontWeight="bold" noWrap sx={{ color: isActive ? "primary.dark" : "text.primary" }}>
                                                                {dm.modelfg ?? `DM ${dm.dm}`}
                                                            </Typography>
                                                            {dm.annotation_count > 0 && (
                                                                <Typography variant="caption" color="text.disabled">
                                                                    {dm.annotation_count} ชิ้นส่วน
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        {isActive && (
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />
                                                        )}
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </Grid2>
                    )}

                    {/* ── Content Area ───────────────────────────────────── */}
                    {diagramLoading ? (
                        <Grid2 size={12}>
                            <Box textAlign="center" py={5}>
                                <CircularProgress />
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    กำลังโหลดไดอะแกรม…
                                </Typography>
                            </Box>
                        </Grid2>
                    ) : hasContent ? (
                        <>
                            {/* Left: Diagram */}
                            <Grid2 size={{ xs: 12, md: 5 }}>
                                <Card variant="outlined" sx={{ position: "sticky", top: 16 }}>
                                    {/* Header model + page tabs */}
                                    <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                            {headerModel}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5} flexWrap="wrap">
                                            {imgPages.length > 1 && imgPages.map((_, i) => (
                                                <Chip
                                                    key={i}
                                                    size="small"
                                                    label={`หน้า ${i + 1}`}
                                                    color={activePage === i + 1 ? "warning" : "default"}
                                                    onClick={() => setActivePage(i + 1)}
                                                    sx={{ cursor: "pointer" }}
                                                />
                                            ))}
                                            {pdfUrl && (
                                                <Chip
                                                    size="small"
                                                    label="📄 PDF"
                                                    component="a"
                                                    href={pdfUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    clickable
                                                    color="default"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                    <Box sx={{ px: 2, pb: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            👆คลิกที่หมายเลขบนไดอะแกรมเพื่อดูรายละเอียดอะไหล่
                                        </Typography>
                                    </Box>
                                    {/* Diagram image + markers */}
                                    <Box sx={{ p: 1, position: "relative" }}>
                                        {currentImg && (
                                            <div style={{ position: "relative" }}>
                                                <img
                                                    src={currentImg}
                                                    alt="Spare Parts Diagram"
                                                    draggable={false}
                                                    style={{ width: "100%", display: "block", borderRadius: 8 }}
                                                />
                                                {/* Markers */}
                                                {currentAnns.map((ann) => {
                                                    const sp = spList.find((s) => s.spcode === ann.spcode);
                                                    const isH = hoveredCode === ann.spcode;
                                                    const inCart = sp?.added;
                                                    const isSelected = selectedSpcode === ann.spcode;
                                                    const inHistory = !isSelected && viewHistory.includes(ann.spcode);
                                                    return (
                                                        <div
                                                            key={ann.spcode + "_" + ann.tracking_number}
                                                            style={{
                                                                position: "absolute",
                                                                left: `${ann.x_percent}%`,
                                                                top: `${ann.y_percent}%`,
                                                                transform: "translate(-50%,-50%)",
                                                                zIndex: isH ? 100 : (isSelected ? 20 : inHistory ? 15 : 10),
                                                            }}
                                                        >
                                                            {/* Popup on hover — smart edge-aware positioning */}
                                                            {isH && (() => {
                                                                // ซ้าย/ขวา: ถ้าชิดขอบให้ชิดทิศนั้น ถ้ากลางให้ center
                                                                const nearLeft = ann.x_percent < 28;
                                                                const nearRight = ann.x_percent > 72;
                                                                const popupStyle = {
                                                                    position: "absolute",
                                                                    paddingBottom: 10,
                                                                    minWidth: 210,
                                                                    zIndex: 50,
                                                                    pointerEvents: "none",
                                                                    // แนวตั้ง: ถ้าชิดบนให้แสดงด้านล่าง
                                                                    ...(ann.y_percent < 22
                                                                        ? { top: "100%", paddingBottom: 0, paddingTop: 10 }
                                                                        : { bottom: "100%" }),
                                                                    // แนวนอน
                                                                    ...(nearLeft
                                                                        ? { left: "-8px", transform: "none" }
                                                                        : nearRight
                                                                            ? { right: "-8px", transform: "none" }
                                                                            : { left: "50%", transform: "translateX(-50%)" }),
                                                                };
                                                                const isBelow = ann.y_percent < 22;
                                                                const arrowJustify = nearLeft ? "flex-start" : nearRight ? "flex-end" : "center";
                                                                const arrowMarginLeft = nearLeft ? 12 : 0;
                                                                const arrowMarginRight = nearRight ? 12 : 0;
                                                                return (
                                                                    <div style={popupStyle}>
                                                                        {/* Arrow top (when popup is below marker) */}
                                                                        {isBelow && (
                                                                            <div style={{ display: "flex", justifyContent: arrowJustify, marginLeft: arrowMarginLeft, marginRight: arrowMarginRight, marginBottom: -1 }}>
                                                                                <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: "7px solid #fed7aa" }} />
                                                                            </div>
                                                                        )}
                                                                        <div style={{
                                                                            background: "white", borderRadius: 12,
                                                                            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                                                                            border: "1px solid #fed7aa", padding: 10,
                                                                        }}>
                                                                            <div style={{ display: "flex", gap: 10 }}>
                                                                                <img
                                                                                    src={SP_IMG(ann.spcode)}
                                                                                    onError={(e) => (e.currentTarget.src = SP_FALL)}
                                                                                    style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, border: "1px solid #eee", background: "#f9fafb", flexShrink: 0 }}
                                                                                />
                                                                                <div style={{ minWidth: 0 }}>
                                                                                    <div style={{ fontWeight: "bold", fontSize: 12, color: "#111", lineHeight: 1.3, marginBottom: 2 }}>
                                                                                        {ann.tracking_number}. {sp?.spname ?? ""}
                                                                                    </div>
                                                                                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "#9ca3af" }}>{ann.spcode}</div>
                                                                                    {sp?.price_per_unit != null && (
                                                                                        <div style={{ fontWeight: "bold", color: "#16a34a", fontSize: 12, marginTop: 4 }}>
                                                                                            ฿{parseFloat(sp.price_per_unit).toFixed(2)}
                                                                                        </div>
                                                                                    )}
                                                                                    <div style={{ fontSize: 10, color: "#16a34a", marginTop: 2 }}>
                                                                                        {sp?.added ? `✓ ในตะกร้า ×${sp.cartQty}` : "คลิกเพื่อดูรายละเอียด"}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Arrow bottom (default — popup is above marker) */}
                                                                        {!isBelow && (
                                                                            <div style={{ display: "flex", justifyContent: arrowJustify, marginLeft: arrowMarginLeft, marginRight: arrowMarginRight, marginTop: -1 }}>
                                                                                <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "7px solid #fed7aa" }} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}

                                                            {/* Dot */}
                                                            <div
                                                                onClick={() => handleMarkerClick(ann)}
                                                                onMouseEnter={() => setHoveredCode(ann.spcode)}
                                                                onMouseLeave={() => setHoveredCode(null)}
                                                                title={`${ann.tracking_number}. ${sp?.spname ?? ""} — คลิกเพื่อดูรายละเอียด`}
                                                                style={{
                                                                    width: isSelected ? 32 : inHistory ? 28 : 26,
                                                                    height: isSelected ? 32 : inHistory ? 28 : 26,
                                                                    borderRadius: "50%",
                                                                    background: inCart ? "#16a34a" : isSelected ? "#2563eb" : inHistory ? "#6366f1" : isH ? "#fb923c" : "#f97316",
                                                                    border: isSelected ? "3px solid white" : "2px solid white",
                                                                    color: "white", fontWeight: "bold", fontSize: isSelected ? 13 : 11,
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    cursor: "pointer", userSelect: "none",
                                                                    boxShadow: isSelected ? "0 0 0 3px #2563eb55, 0 2px 8px rgba(0,0,0,0.3)" : inHistory ? "0 0 0 2px #6366f155, 0 2px 6px rgba(0,0,0,0.25)" : "0 2px 6px rgba(0,0,0,0.25)",
                                                                    transform: isSelected ? "scale(1.3)" : isH ? "scale(1.2)" : "scale(1)",
                                                                    transition: "transform 0.15s, background 0.15s, box-shadow 0.15s, width 0.15s, height 0.15s",
                                                                    position: "relative",
                                                                    zIndex: isSelected ? 20 : inHistory ? 15 : 10,
                                                                }}
                                                            >
                                                                {loadingMap[ann.spcode]
                                                                    ? <span style={{ fontSize: 8 }}>…</span>
                                                                    : (ann.tracking_number ?? "?")}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Box>


                                </Card>
                            </Grid2>

                            {/* Right: Parts list */}
                            <Grid2 size={{ xs: 12, md: 7 }}>
                                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                                    {/* Header: title + stats + search */}
                                    <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "#fafafa" }}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
                                            <Typography variant="subtitle2" fontWeight="bold" fontSize={18}>
                                                รายการอะไหล่ทั้งหมด
                                            </Typography>
                                            <Stack direction="row" spacing={0.75}>
                                                <Chip
                                                    label={`${listFiltered.length}${listFilter ? `/${spList.length}` : ""} รายการ`}
                                                    size="small" variant="outlined"
                                                    sx={{ fontSize: 10, height: 20 }}
                                                />
                                                {inCartItems.length > 0 && (
                                                    <Chip
                                                        icon={<CheckCircleIcon sx={{ fontSize: "12px !important" }} />}
                                                        label={`${inCartItems.length} ในตะกร้า`}
                                                        size="small" color="success"
                                                        sx={{ fontSize: 10, height: 20, cursor: "pointer" }}
                                                        onClick={() => router.get(route("orders.carts"))}
                                                    />
                                                )}
                                            </Stack>
                                        </Stack>
                                        <TextField
                                            fullWidth size="small"
                                            placeholder="ค้นหา รหัส / ชื่อ / เลขที่..."
                                            value={listFilter}
                                            onChange={(e) => setListFilter(e.target.value)}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Search fontSize="small" color="action" />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                            sx={{ "& .MuiInputBase-root": { fontSize: 13 } }}
                                        />
                                    </Box>

                                    {/* Scrollable rows */}
                                    <Box sx={{ maxHeight: { xs: 420, md: "125vh" }, overflowY: "auto" }}>
                                        {listFiltered.length === 0 ? (
                                            <Box textAlign="center" py={4} color="text.disabled">
                                                <Typography variant="body2">ไม่พบรายการที่ตรงกับคำค้นหา</Typography>
                                            </Box>
                                        ) : listFiltered.map((sp, index) => {
                                            const hasPrice = !isNaN(parseFloat(sp.price_per_unit)) && parseFloat(sp.price_per_unit) > 0;
                                            const isLoading = loadingMap[sp.spcode];
                                            const isSelected = selectedSpcode === sp.spcode;
                                            const isHovered = hoveredCode === sp.spcode;
                                            const inDiag = annotations.some((a) => a.spcode === sp.spcode);
                                            return (
                                                <Box
                                                    key={`${sp.spcode}_${index}`}
                                                    onMouseEnter={() => setHoveredCode(sp.spcode)}
                                                    onMouseLeave={() => setHoveredCode(null)}
                                                    onClick={() => {
                                                        const alreadySelected = sp.spcode === selectedSpcode;
                                                        if (alreadySelected && !sp.added) {
                                                            setSelectedSpcode(null);
                                                            setViewHistory((prev) => prev.filter((c) => c !== sp.spcode));
                                                        } else {
                                                            setSelectedSpcode(sp.spcode);
                                                            const ann = annotations.find((a) => a.spcode === sp.spcode);
                                                            if (ann) setActivePage(ann.page ?? 1);
                                                            setViewHistory((prev) => [sp.spcode, ...prev.filter((c) => c !== sp.spcode)]);
                                                        }
                                                    }}
                                                    sx={{
                                                        display: "flex", alignItems: "center",
                                                        borderBottom: "1px solid", borderColor: "divider",
                                                        borderLeft: "3px solid",
                                                        borderLeftColor: isSelected ? "primary.main" : sp.added ? "success.main" : "transparent",
                                                        bgcolor: isSelected ? "#eff6ff" : sp.added ? "#f0fdf4" : isHovered ? "#FFA500" : "transparent",
                                                        transition: "background 0.12s, border-color 0.12s",
                                                        cursor: "pointer",
                                                        "&:last-child": { borderBottom: "none" },
                                                    }}
                                                >
                                                    {/* Position No. */}
                                                    <Box sx={{ width: 50, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", py: 1 }}>
                                                        <Box sx={{
                                                            width: 30, height: 30, borderRadius: "50%",
                                                            bgcolor: isSelected ? "primary.main" : inDiag ? "#f97316" : "#cbd5e1",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            color: "white", fontWeight: "bold", fontSize: 13,
                                                            transition: "background 0.12s", flexShrink: 0,
                                                        }}>
                                                            {sp.tracking_number ?? "–"}
                                                        </Box>
                                                    </Box>

                                                    {/* Image */}
                                                    <Box sx={{ width: 64, flexShrink: 0, py: 0.5 }}>
                                                        <img
                                                            src={SP_IMG(sp.spcode)}
                                                            alt=""
                                                            style={{ width: "100%", height: 56, objectFit: "contain" }}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = SP_FALL; }}
                                                            onClick={(e) => { e.stopPropagation(); setSpImageSrc(SP_IMG(sp.spcode)); setOpenSpImage(true); }}
                                                        />
                                                    </Box>

                                                    {/* Info */}
                                                    <Box sx={{ flex: 1, minWidth: 0, px: 1.5, py: 1 }}>
                                                        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                                                            <Typography variant="body2" fontWeight="bold" noWrap>
                                                                {sp.spcode}
                                                            </Typography>
                                                            {sp.added && (
                                                                <Chip label={`×${sp.cartQty}`} size="small" color="success" sx={{ height: 18, fontSize: 11 }} />
                                                            )}
                                                            {sp.layout > 1 && (
                                                                <Chip label={`P${sp.layout}`} size="small" variant="outlined" sx={{ height: 18, fontSize: 11 }} />
                                                            )}
                                                        </Stack>
                                                        <Typography variant="body2" color="text.secondary" sx={{ display: "block", lineHeight: 1.4, mb: 0.25 }} noWrap>
                                                            {sp.spname}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                                            <Typography variant="caption" sx={{ fontSize: 12 }}>
                                                                <span style={{ color: "#94a3b8" }}>ทุน: </span>
                                                                {hasPrice
                                                                    ? <span style={{ fontWeight: "bold", color: "#15803d" }}>฿{parseFloat(sp.price_per_unit).toFixed(2)}</span>
                                                                    : <span style={{ color: "#f87171" }}>ไม่พบ</span>}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontSize: 12, color: "#94a3b8" }}>
                                                                ขาย: <span style={{ color: "#cbd5e1" }}>เร็วๆนี้</span>
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontSize: 12 }}>
                                                                <span style={{ color: "#94a3b8" }}>ตั้ง: </span>
                                                                <span style={{ color: "#475569" }}>฿{parseFloat(sp.stdprice_per_unit ?? 0).toFixed(2)}</span>
                                                            </Typography>
                                                        </Stack>
                                                    </Box>

                                                    {/* Cart control */}
                                                    <Box sx={{ px: 1, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                                                        {sp.added ? (
                                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                <Stack direction="row" alignItems="center" spacing={0.25}
                                                                    sx={{ border: "1px solid", borderColor: "success.light", borderRadius: 2, px: 0.25 }}>
                                                                    <IconButton size="small" disabled={sp.cartQty <= 1}
                                                                        onClick={() => handleQtyChange(sp, "remove")}
                                                                        color="default" sx={{ p: 0.5 }}>
                                                                        <RemoveIcon sx={{ fontSize: 14 }} />
                                                                    </IconButton>
                                                                    <Typography sx={{ minWidth: 20, textAlign: "center", fontSize: 13, fontWeight: "bold" }}>
                                                                        {sp.cartQty}
                                                                    </Typography>
                                                                    <IconButton size="small"
                                                                        onClick={() => handleQtyChange(sp, "add")}
                                                                        color="primary" sx={{ p: 0.5 }}>
                                                                        <AddIcon sx={{ fontSize: 14 }} />
                                                                    </IconButton>
                                                                </Stack>
                                                                <Tooltip title="ลบออกจากตะกร้า">
                                                                    <IconButton size="small" color="error"
                                                                        onClick={() => handleDeleteCart(sp)}
                                                                        sx={{ border: "1px solid", borderColor: "error.light", borderRadius: 1.5, p: 0.5 }}>
                                                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        ) : hasPrice ? (
                                                            <Tooltip title="เพิ่มลงตะกร้า">
                                                                <IconButton size="small" color="primary" disabled={isLoading}
                                                                    onClick={() => handleAddToCart(sp)}
                                                                    sx={{ border: "1px solid", borderColor: "primary.light", borderRadius: 1.5, p: 0.75 }}>
                                                                    {isLoading ? <CircularProgress size={14} /> : <AddShoppingCartIcon sx={{ fontSize: 16 }} />}
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : null}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid2>
                        </>
                    ) : (
                        <Grid2 size={12}>
                            <Box textAlign="center" py={8} color="text.secondary">
                                {searching || dmsLoading ? (
                                    <Stack alignItems="center" spacing={1}>
                                        <CircularProgress size={36} />
                                        <Typography variant="body2">กำลังโหลดข้อมูล…</Typography>
                                    </Stack>
                                ) : (
                                    <Stack alignItems="center" spacing={1}>
                                        <AddShoppingCartIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                                        <Typography variant="body1" fontWeight="medium">ยังไม่มีข้อมูลสินค้า</Typography>
                                        <Typography variant="body2">พิมพ์หมายเลขซีเรียลหรือรหัสสินค้า (SKU) แล้วกด ค้นหา</Typography>
                                    </Stack>
                                )}
                            </Box>
                        </Grid2>
                    )}
                </Grid2>

                {/* ── Cart Section ─────────────────────────────────── */}
                <CartDrawer
                    refreshCounter={cartRefreshCounter}
                    isLoading={cartOperating}
                    operatingCartId={operatingCartId}
                    onDataLoaded={(totalSp, groups) => {
                        setGlobalCartTotal(totalSp);
                        if (groups) syncSpListFromCart(groups);
                    }}
                    onCartUpdate={(groups, totalSpDelta = 0) => {
                        if (totalSpDelta !== 0) setGlobalCartTotal(prev => Math.max(0, prev + totalSpDelta));
                        syncSpListFromCart(groups);
                    }}
                    onSuccess={() => {
                        triggerCartRefresh();
                        // Clear the `added` state from local spList since cart is checked out
                        setSpList(list => list.map(s => ({ ...s, added: false, cartId: null, cartQty: 0 })));
                    }}
                />

                {/* Mobile FAB */}
                {isMobile && (
                    <Box position="fixed" bottom={16} right={16} zIndex={1000}>
                        <Fab color="secondary" onClick={() => {
                            document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            <Badge badgeContent={globalCartTotal || null} color="error" max={99}>
                                <AddShoppingCartIcon />
                            </Badge>
                        </Fab>
                    </Box>
                )}
            </Container>

            {/* ── Info Dialog ─────────────────────────────────── */}
            <Dialog
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                fullWidth
                maxWidth="md"
                fullScreen={isMobile}
                slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3 } } }}
            >
                <DialogTitle sx={{ pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoOutlinedIcon color="info" />
                            <Typography variant="subtitle1" fontWeight="bold">แนะนําวิธีดูรหัสสินค้าและซีเรียลนัมเบอร์</Typography>
                        </Stack>
                        <IconButton size="small" onClick={() => setInfoOpen(false)}>
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid2 container spacing={2} sx={{ mt: 0 }}>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 1, mt: 2 }}>
                                วิธีดูรหัสสินค้า / โมเดล (SKU)
                            </Typography>
                            <Box
                                component="img"
                                src="https://pumpkin-image-sku.s3.ap-southeast-1.amazonaws.com/diagram_check_pid_fg.png"
                                alt="วิธีหารหัสสินค้า"
                                sx={{ width: "100%", borderRadius: 2, border: "1px solid", borderColor: "divider" }}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 1, mt: 2 }}>
                                วิธีดูหมายเลขชีเรียล (Serial Number)
                            </Typography>
                            <Box
                                component="img"
                                src="https://pumpkin-image-sku.s3.ap-southeast-1.amazonaws.com/callcenter_some/logoinfo/pumpkinInfo2569.png"
                                alt="ข้อมูลติดต่อ Pumpkin"
                                sx={{ width: "100%", borderRadius: 2, border: "1px solid", borderColor: "divider" }}
                            />
                        </Grid2>
                    </Grid2>
                </DialogContent>
            </Dialog>

            {/* Toast feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%", borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </AuthenticatedLayout>
    );
}
