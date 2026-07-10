import { router, usePage } from "@inertiajs/react";
import {
    Avatar, Box, Button, Card, CardContent, Divider, Grid2, IconButton, LinearProgress, Stack, Typography, useMediaQuery, CircularProgress, Paper
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import { Check, Delete, Add, Remove, FileUpload, AddShoppingCart } from "@mui/icons-material";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import Swal from "sweetalert2";

const ListSp = ({ sps, onUpdateQty, onRemove, operatingCartId, removingIds }) => {
    const [SpPreview, setSpPreview] = useState(false);
    const [SpImage, setSpImage] = useState('');
    const isMobile = useMediaQuery('(max-width:600px)');

    const QtyControls = ({ sp }) => {
        const isOperating = operatingCartId === sp.id;
        const isRemoving = removingIds?.has(sp.id);
        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small" disabled={sp.qty <= 1 || isOperating || isRemoving} onClick={() => onUpdateQty(sp.id, 'remove')}>
                    <Remove />
                </IconButton>
                <Box sx={{ width: '60px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isOperating
                        ? <CircularProgress size={18} />
                        : <Typography variant="body1">{sp.qty}</Typography>
                    }
                </Box>
                <IconButton size="small" disabled={isOperating || isRemoving} onClick={() => onUpdateQty(sp.id, 'add')}>
                    <Add />
                </IconButton>
                <IconButton color="error" size="small" disabled={isOperating || isRemoving} onClick={() => onRemove(sp)}>
                    {isRemoving ? <CircularProgress size={18} color="error" /> : <Delete />}
                </IconButton>
            </Stack>
        );
    };

    return (
        <>
            {SpPreview && <SpPreviewImage open={SpPreview} setOpen={setSpPreview} imagePath={SpImage} />}
            {sps.map((sp) => {
                const sp_image = `${import.meta.env.VITE_IMAGE_SP_NEW}/${sp.sp_code}.jpg`;
                return (
                    <React.Fragment key={sp.id ?? sp.sp_code}>
                        <Stack direction='row' width='100%' justifyContent='space-between' alignItems='center'>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <img src={sp_image} alt={'ไม่พบรูปภาพ'} width='100'
                                    onClick={() => { setSpImage(sp_image); setSpPreview(true); }}
                                    onError={(e) => { e.target.src = import.meta.env.VITE_IMAGE_DEFAULT; }}
                                />
                                <Stack direction='column' spacing={1}>
                                    <Typography fontWeight='bold'>{sp.sp_code}</Typography>
                                    <Typography variant='body2'>{sp.sp_name}</Typography>
                                    <Typography variant='body2'>หมายเหตุ : {sp.remark}</Typography>
                                    <Typography variant="body2" color="green">
                                        {formatFloat(sp.price_per_unit, sp.qty, sp)}
                                    </Typography>
                                </Stack>
                            </Stack>
                            {!isMobile && <QtyControls sp={sp} />}
                        </Stack>
                        {isMobile && (
                            <Stack direction="row" justifyContent='center' alignItems='center'>
                                <QtyControls sp={sp} />
                            </Stack>
                        )}
                        <Divider />
                    </React.Fragment>
                );
            })}
        </>
    );
}

export default function CartList({ refreshCounter, onSuccess, onDataLoaded, onCartUpdate, operatingCartId, isLoading }) {
    const [groups, setGroups] = useState([]);
    const [totalSp, setTotalSp] = useState(0);
    const [loading, setLoading] = useState(false);
    const [removingIds, setRemovingIds] = useState(new Set());
    const user = usePage().props.auth.user;
    const [address, setAddress] = useState(user.store_info.address);
    const [phone, setPhone] = useState(user.store_info.phone);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [refreshCounter]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(route('orders.carts.json'));
            setGroups(data.groups ?? []);
            setTotalSp(data.totalSp ?? 0);
            if (onDataLoaded) onDataLoaded(data.totalSp, data.groups);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateQtyOptimistic = (id, condition) => {
        const updated = groups.map(g => ({
            ...g,
            list: g.list.map(item =>
                item.id === id
                    ? { ...item, qty: condition === 'add' ? Number(item.qty) + 1 : Math.max(1, Number(item.qty) - 1) }
                    : item
            ),
        }));
        setGroups(updated);
        return updated;
    };

    const handleUpdateQty = async (id, condition = 'add') => {
        const updated = updateQtyOptimistic(id, condition);
        if (onCartUpdate) onCartUpdate(updated);
        try {
            await axios.post(`/orders/carts/add-remove/${condition}`, { id });
        } catch {
            fetchCart();
        }
    };

    const handleRemove = (sp) => {
        AlertDialogQuestion({
            title: `ยืนยันการลบอะไหล่ ${sp.sp_code}`,
            text: `คุณต้องการลบอะไหล่ ${sp.sp_code} ${sp.sp_name} ออกจากตะกร้า ใช่หรือไม่?`,
            onPassed: async (confirm) => {
                if (!confirm) return;
                setRemovingIds(prev => new Set([...prev, sp.id]));
                try {
                    await axios.delete(`/orders/carts/delete/${sp.id}`);
                    const updated = groups
                        .map(g => ({ ...g, list: g.list.filter(item => item.id !== sp.id) }))
                        .filter(g => g.list.length > 0);
                    setGroups(updated);
                    setTotalSp(prev => Math.max(0, prev - 1));
                    if (onCartUpdate) onCartUpdate(updated, -1);
                    fetchCart();
                } catch {
                    fetchCart();
                } finally {
                    setRemovingIds(prev => { const next = new Set(prev); next.delete(sp.id); return next; });
                }
            },
        });
    };

    // const totalPrice = useMemo(() => {
    //     return groups.reduce((total, group) => {
    //         return total + group.list.reduce((sum, sp) => {
    //             const price = parseFloat(sp.price_per_unit) || 0;
    //             const quantity = parseFloat(sp.qty) || 0;
    //             return sum + (price * quantity);
    //         }, 0);
    //     }, 0);
    // }, [groups]);

    const totalPrice = useMemo(() => {
        // 1. ดัก groups ด้วย (groups || [])
        return (groups || []).reduce((total, group) => {
            // 2. ดัก group.list ด้วย (group?.list || [])
            return total + (group?.list || []).reduce((sum, sp) => {
                const price = parseFloat(sp.price_per_unit) || 0;
                const quantity = parseFloat(sp.qty) || 0;
                return sum + (price * quantity);
            }, 0);
        }, 0);
    }, [groups]);

    // const handleExportPdf = async () => {
    //     try {
    //         setProcessing(true);
    //         console.log("🚀 กำลังยิง API /orders/export-pdf-cart ...", { groups, address, phone });
    //         // router.post(route('orders.export.pdf'), {
    //         //     groups,
    //         //     address,
    //         //     phone
    //         // });
    //         const { data } = await axios.post(route('orders.export.pdf'), {
    //             groups,
    //             address,
    //             phone
    //         });

    //         if (data.success && data.pdf_url) {
    //             window.open(data.pdf_url, '_blank');
    //         } else {
    //             AlertDialog({ title: 'ผิดพลาด', text: 'ไม่พบไฟล์ PDF' });
    //         }
    //     } catch (error) {
    //         console.error("❌ Error handleExportPdf:", error);
    //         AlertDialog({
    //             title: 'ผิดพลาด',
    //             text: error.response?.data?.message || error.message
    //         });
    //     } finally {
    //         setProcessing(false);
    //     }
    // };

    const handleExportPdf = async () => {
        try {
            setProcessing(true);

            const { data } = await axios.post(route('orders.export.pdf'), {
                groups,
                address,
                phone
            });

            if (!data.success) {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: data.message || "ไม่สามารถสร้างไฟล์ PDF ได้",
                });
                return;
            }

            if (data.pdf_url) {
                const pdfWindow = window.open(data.pdf_url, "_blank");

                // ถ้า popup ถูกบล็อก
                if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === "undefined") {
                    Swal.fire({
                        icon: "warning",
                        title: "⚠️ ไม่สามารถเปิดไฟล์ PDF ได้",
                        text: "เบราว์เซอร์ของคุณบล็อกป๊อปอัป กรุณาอนุญาตหรือคลิกปุ่มด้านล่าง",
                        showCancelButton: true,
                        confirmButtonText: "เปิดอีกครั้ง",
                        cancelButtonText: "ยกเลิก",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.open(data.pdf_url, "_blank");
                        }
                    });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: "ระบบไม่พบ URL ของ PDF",
                });
            }

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "ผิดพลาด",
                text: error.response?.data?.message || error.message,
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirmOrder = () => {
        AlertDialogQuestion({
            title: 'แน่ใจหรือไม่',
            text: 'คุณต้องการยืนยันการสั่งซื้อสินค้าใช่หรือไม่?',
            onPassed: async (confirm) => {
                confirm && await onSubmit();
            }
        })
    }

    const onSubmit = async () => {
        try {
            setProcessing(true);
            const URL = '/orders/carts/store'
            const { data } = await axios.post(URL, {
                groups: groups,
                address: address,
                phone: phone
            });
            Swal.fire({ title: 'สำเร็จ', text: data.message, icon: 'success', timer: 2500, showConfirmButton: false });
            if (onSuccess) onSuccess();
            setGroups([]);
        } catch (error) {
            AlertDialog({ title: 'เกิดข้อผิดพลาด', text: error.response?.data?.message });
        } finally {
            setProcessing(false);
        }
    }

    // Remove flash useEffect as it's not needed for SPA drawer

    return (
        <Paper id="cart-section" variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mt: 3 }}>
            <Box sx={{ px: 1.5, py: 1.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "#fafafa" }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <AddShoppingCart sx={{ fontSize: 20, color: "text.secondary" }} />
                    <Typography variant="h6" fontWeight="bold">ตะกร้าสินค้า</Typography>
                </Stack>
            </Box>
            {isLoading && <LinearProgress />}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                    {loading && groups.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <CircularProgress />
                        </Box>
                    ) : groups.length === 0 ? (
                        <Box textAlign="center" py={5} color="text.secondary">
                            <Typography>ตะกร้าสินค้าว่างเปล่า</Typography>
                        </Box>
                    ) : (
                    <Grid2 container spacing={2}>
                        {groups.map((group, index) => {
                            return (
                                <Grid2 key={index} size={12}>
                                    <Card variant="outlined" sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between"
                                                sx={{ mb: 2, backgroundColor: '#0000000D', p: 1 }}>
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <Avatar
                                                        src={group.sku_image_path} variant="square"
                                                        sx={{ width: 48, height: 48 }}
                                                    />
                                                    <Typography variant="h6">
                                                        กลุ่มสินค้า: {group.sku_code} | {group.sku_name}
                                                    </Typography>
                                                </Stack>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<AddShoppingCart />}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        router.visit(route('orders.diagram') + '?sku=' + group.sku_code + '&model=' + encodeURIComponent(group.sku_name));
                                                    }}
                                                >
                                                    เพิ่มอะไหล่
                                                </Button>
                                            </Stack>
                                            <Stack direction="column" spacing={1}>
                                                <React.Fragment>
                                                    <ListSp
                                                        sps={group.list}
                                                        sku_code={group.sku_code}
                                                        onUpdateQty={handleUpdateQty}
                                                        onRemove={handleRemove}
                                                        operatingCartId={operatingCartId}
                                                        removingIds={removingIds}
                                                    />
                                                </React.Fragment>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            )
                        })}
                    </Grid2>
                    )}
                </Box>
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Grid2 container spacing={2} alignItems="center">
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <Typography variant="h6">
                                จำนวนรายการทั้งหมด: {parseInt(totalSp)} รายการ
                            </Typography>
                            <Typography variant="h5" color="primary">
                                ยอดรวมทั้งสิ้น: ฿{totalPrice.toFixed(2)}
                            </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'right' }}>
                            <Button
                                loading={processing}
                                loadingPosition='start'
                                startIcon={<FileUpload />} variant="contained"
                                color="secondary"
                                size="large"
                                onClick={handleExportPdf}>
                                ส่งออก PDF
                            </Button>
                            &nbsp;&nbsp;
                            <Button
                                loading={processing}
                                loadingPosition='start'
                                startIcon={<Check />} variant="contained" color="success" size="large"
                                onClick={handleConfirmOrder}>
                                ยืนยันการสั่งซื้อ
                            </Button>
                        </Grid2>
                    </Grid2>
                </Box>
            </Box>
        </Paper>
    )
}

const formatFloat = (price_per_unit, quantity, item) => {
    const PricePerUnitForCal = parseFloat(price_per_unit) || 0;
    const Qty = parseFloat(quantity);
    const totalPriceSp = (PricePerUnitForCal * Qty).toFixed(2);
    const showPricePerUnit = parseFloat(PricePerUnitForCal).toFixed(2);
    return `${showPricePerUnit} × ${Qty} = ${totalPriceSp}`;
};
