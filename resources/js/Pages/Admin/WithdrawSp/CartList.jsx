import React, { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowBack, Check, Add, Remove, Delete } from "@mui/icons-material";
import {
    Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogContent,
    Divider, Grid2, IconButton, Stack, Typography, useMediaQuery
} from "@mui/material";
import { showDefaultImage } from "@/utils/showImage.js";

const money = (n) =>
    Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function ListSp({ sps = [], groups = [], setGroups }) {
    const isMobile = useMediaQuery("(max-width:600px)");
    const [preview, setPreview] = useState({ open: false, src: "" });

    const responsiveStyles = {
        fontSize: isMobile ? "0.8125rem" : "0.875rem",
        smallText: isMobile ? "0.6875rem" : "0.75rem",
    };

    const updateQty = async (id, condition = "add") => {
        try {
            const { data, status } = await axios.post(route("carts.qty", condition), { id });
            if (status === 200) {
                const updated = groups.map((g) => ({
                    ...g,
                    list: (g.list || []).map((sp) => (sp.id === id ? { ...sp, qty: data.sp.qty } : sp)),
                }));
                setGroups(updated);
            }
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        }
    };

    const removeItem = async (id) => {
        if (!confirm("ยืนยันลบรายการนี้ออกจากตะกร้า?")) return;
        try {
            await axios.delete(route("carts.delete", id));
            const updated = groups.map((g) => ({
                ...g,
                list: (g.list || []).filter((sp) => sp.id !== id),
            }));
            setGroups(updated);
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        }
    };

    return (
        <>
            {(sps || []).map((sp, idx) => {
                const img = sp.path_file || (import.meta.env.VITE_IMAGE_SP_NEW + sp.sp_code + ".jpg");
                const qty = Number(sp.qty || 1);
                const price = Number(sp.price_per_unit || 0);
                const lineTotal = qty * price;

                return (
                    <React.Fragment key={idx}>
                        <Stack direction="row" spacing={isMobile ? 0.75 : 1.25} alignItems="flex-start">
                            <Box
                                component="img"
                                src={img}
                                alt={sp.sp_name}
                                width={isMobile ? 70 : 96}
                                height={isMobile ? 70 : 96}
                                sx={{ objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider", cursor: "zoom-in" }}
                                onError={showDefaultImage}
                                onClick={() => setPreview({ open: true, src: img })}
                            />

                            <Stack spacing={isMobile ? 0.375 : 0.5} sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    fontWeight="bold"
                                    noWrap
                                    title={sp.sp_name}
                                    sx={{ fontSize: responsiveStyles.fontSize }}
                                >
                                    {sp.sp_name}
                                </Typography>

                                <Stack direction="row" spacing={0.375} useFlexGap flexWrap="wrap">
                                    <Chip
                                        size="small"
                                        label={sp.sp_code}
                                        variant="outlined"
                                        sx={{
                                            height: isMobile ? 20 : 24,
                                            fontSize: responsiveStyles.smallText,
                                            "& .MuiChip-label": { px: isMobile ? 0.5 : 1 }
                                        }}
                                    />
                                    {sp.modelfg && (
                                        <Chip
                                            size="small"
                                            label={sp.modelfg}
                                            variant="soft"
                                            sx={{
                                                height: isMobile ? 20 : 24,
                                                fontSize: responsiveStyles.smallText,
                                                "& .MuiChip-label": { px: isMobile ? 0.5 : 1 }
                                            }}
                                        />
                                    )}
                                    {sp.layout && (
                                        <Chip
                                            size="small"
                                            label={String(sp.layout).toLowerCase() === "inside" ? "Inside" : "Outside"}
                                            variant="soft"
                                            sx={{
                                                height: isMobile ? 20 : 24,
                                                fontSize: responsiveStyles.smallText,
                                                "& .MuiChip-label": { px: isMobile ? 0.5 : 1 }
                                            }}
                                        />
                                    )}
                                </Stack>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: responsiveStyles.smallText }}
                                >
                                    ที่มา: {sp.remark || "-"}
                                </Typography>

                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: isMobile ? 0.125 : 0.25 }}>
                                    <Stack spacing={0}>
                                        <Typography
                                            color="error.main"
                                            fontWeight="bold"
                                            sx={{ fontSize: responsiveStyles.fontSize }}
                                        >
                                            ฿{money(price)}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: responsiveStyles.smallText }}
                                        >
                                            รวม: ฿{money(lineTotal)}
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" spacing={isMobile ? 0.25 : 0.5} alignItems="center">
                                        <IconButton
                                            size="small"
                                            disabled={qty <= 1}
                                            onClick={() => updateQty(sp.id, "remove")}
                                            sx={{ p: isMobile ? 0.375 : 0.5 }}
                                        >
                                            <Remove sx={{ fontSize: isMobile ? 16 : 20 }} />
                                        </IconButton>
                                        <Typography sx={{
                                            width: isMobile ? 32 : 42,
                                            textAlign: "center",
                                            fontSize: responsiveStyles.fontSize
                                        }}>
                                            {qty}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => updateQty(sp.id, "add")}
                                            sx={{ p: isMobile ? 0.375 : 0.5 }}
                                        >
                                            <Add sx={{ fontSize: isMobile ? 16 : 20 }} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => removeItem(sp.id)}
                                            sx={{ p: isMobile ? 0.375 : 0.5 }}
                                        >
                                            <Delete sx={{ fontSize: isMobile ? 16 : 20 }} />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Stack>

                        <Divider sx={{ my: isMobile ? 0.75 : 1.25 }} />
                    </React.Fragment>
                );
            })}

            <Dialog open={preview.open} onClose={() => setPreview({ open: false, src: "" })} maxWidth="sm" fullWidth>
                <DialogContent sx={{ p: 0 }}>
                    <Box component="img" src={preview.src} alt="" onError={showDefaultImage}
                        sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }} />
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function CartList({ groupSku = [], totalSp = 0 }) {
    const [groups, setGroups] = useState(Array.isArray(groupSku) ? groupSku : []);
    const isMobile = useMediaQuery("(max-width:600px)");

    const totalQty = useMemo(
        () =>
            groups.reduce(
                (sum, g) =>
                    sum + (Array.isArray(g.list) ? g.list.reduce((a, b) => a + Number(b.qty || 1), 0) : 0),
                0
            ),
        [groups]
    );

    const grandTotal = useMemo(
        () =>
            groups.reduce(
                (sum, g) =>
                    sum +
                    (Array.isArray(g.list)
                        ? g.list.reduce((a, b) => a + Number(b.qty || 1) * Number(b.price_per_unit || 0), 0)
                        : 0),
                0
            ),
        [groups]
    );

    const handleSubmit = async () => {
        if (!confirm("ยืนยันสร้างใบเบิกจากตะกร้านี้?")) return;
        try {
            const { data } = await axios.post(route("withdrawSp.createOrder"), {
                groups,
                remark: "เบิกอะไหล่จากระบบหน้าเว็บ",
            });
            alert(data.message);
            router.visit(route("withdrawSp.index"));
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="ตะกร้าเบิกอะไหล่" />
            <Box sx={{
                p: isMobile ? 1 : 2,
                bgcolor: "white",
                minHeight: "90vh",
                display: "flex",
                flexDirection: "column"
            }}>
                <Grid2 container spacing={isMobile ? 1 : 2}>
                    <Grid2 size={12}>
                        <Stack
                            direction="row"
                            spacing={isMobile ? 1 : 2}
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: isMobile ? 0.5 : 0 }}
                        >
                            <Button
                                size="small"
                                variant="contained"
                                component={Link}
                                href={route("withdrawSp.index")}
                                sx={{
                                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                                    px: isMobile ? 1 : 1.5,
                                    py: isMobile ? 0.5 : 0.75
                                }}
                            >
                                <ArrowBack sx={{ mr: isMobile ? 0.5 : 1, fontSize: isMobile ? 16 : 20 }} />
                                {isMobile ? "กลับ" : "กลับไปยังหน้าสินค้าสำหรับเบิกอะไหล่"}
                            </Button>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
                            >
                                ตะกร้าเบิก
                            </Typography>
                        </Stack>
                    </Grid2>

                    {(groups || []).map((group, idx) => (
                        <Grid2 key={idx} size={12}>
                            <Card variant="outlined" sx={{ mb: isMobile ? 1 : 2, borderRadius: 2 }}>
                                <CardContent sx={{ p: isMobile ? 1.25 : 2 }}>
                                    <Stack
                                        direction="row"
                                        spacing={isMobile ? 0.75 : 1.25}
                                        alignItems="center"
                                        sx={{
                                            mb: isMobile ? 0.75 : 1,
                                            pb: isMobile ? 0.75 : 1,
                                            borderBottom: "1px solid",
                                            borderColor: "divider"
                                        }}
                                    >
                                        <Avatar
                                            src={group.sku_image_path}
                                            variant="square"
                                            sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}
                                        />
                                        <Stack sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                fontWeight="bold"
                                                noWrap
                                                sx={{ fontSize: isMobile ? "0.8125rem" : "0.875rem" }}
                                            >
                                                {group.sku_code} {group.sku_name ? `• ${group.sku_name}` : ""}
                                            </Typography>
                                        </Stack>
                                    </Stack>

                                    <ListSp sps={group.list || []} groups={groups} setGroups={setGroups} />
                                </CardContent>
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>

                {/* 🔹 แถบสรุป sticky ด้านล่าง */}
                <Box
                    sx={{
                        position: "sticky",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: "background.paper",
                        borderTop: "1px solid",
                        borderColor: "divider",
                        py: isMobile ? 0.75 : 1.25,
                        px: isMobile ? 1 : 1.5,
                        mt: "auto",
                        zIndex: 10,
                    }}
                >
                    <Stack
                        direction={isMobile ? "column" : "row"}
                        alignItems={isMobile ? "stretch" : "center"}
                        justifyContent={isMobile ? "flex-start" : "space-between"}
                        spacing={isMobile ? 1 : 2}
                    >
                        <Stack textAlign={isMobile ? "center" : "left"}>
                            <Typography variant="caption" color="text.secondary">
                                ยอดรวมทั้งหมด
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="error.main">
                                ฿{money(grandTotal)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                จำนวนชิ้นรวม: {totalQty} | จำนวนรายการ: {parseInt(totalSp, 10) || 0}
                            </Typography>
                        </Stack>

                        <Button
                            startIcon={<Check />}
                            variant="contained"
                            color="success"
                            onClick={handleSubmit}
                            sx={{
                                alignSelf: isMobile ? "stretch" : "flex-end",
                                ml: isMobile ? 0 : "auto",
                                minWidth: isMobile ? "100%" : 200,
                            }}
                        >
                            ยืนยันสร้างใบเบิก
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </AuthenticatedLayout>
    );
}