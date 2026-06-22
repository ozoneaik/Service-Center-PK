import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Avatar, Box, Button, Card, CardContent, Divider, Grid2, IconButton, Stack, Typography, useMediaQuery
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";
import { ArrowBack, Check, Delete, Add, Remove, FileUpload, AddShoppingCart } from "@mui/icons-material";
import SpPreviewImage from "@/Components/SpPreviewImage.jsx";
import Swal from "sweetalert2";

const ListSp = ({ sps, sku_code, setGroups, groups }) => {
    const [SpPreview, setSpPreview] = useState(false);
    const [SpImage, setSpImage] = useState('');
    const isMobile = useMediaQuery('(max-width:600px)');
    const updateQuantity = async (id, condition = 'add') => {
        try {
            const API_URL = `/orders/carts/add-remove/${condition}`;
            const { data, status } = await axios.post(API_URL, { id: id });
            if (status === 200) {
                const updatedGroups = groups.map(group => {
                    return {
                        ...group,
                        list: group.list.map(sp =>
                            sp.id === id ? { ...sp, qty: data.sp.qty } : sp
                        )
                    };
                });
                setGroups(updatedGroups);
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเพิ่มหรือลดสินค้าลงตะกร้าได้'
            });
        }
    };

    const handleRemove = (sp) => {
        AlertDialogQuestion({
            title: `ยืนยันการลบอะไหล่ ${sp.sp_code}`,
            text: `คุณต้องการลบอะไหล่ ${sp.sp_code} ${sp.sp_name} ออกจากตะกร้า ใช่หรือไม่?`,
            onPassed: async (confirm) => confirm && await onRemoveSp(sp.id)
        });
    }

    const onRemoveSp = async (id) => {
        try {
            const { status } = await axios.delete(`/orders/carts/delete/${id}`);
            const updatedGroups = groups.map(group => {
                return {
                    ...group,
                    list: group.list.filter(sp => sp.id !== id)
                };
            });
            setGroups(updatedGroups);
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message
            })
        }

    }

    return (
        <>
            {SpPreview && <SpPreviewImage open={SpPreview} setOpen={setSpPreview} imagePath={SpImage} />}
            {sps.map((sp, index) => {
                const sp_image = `${import.meta.env.VITE_IMAGE_SP_NEW}/${sp.sp_code}.jpg`;
                return (
                    <React.Fragment key={index}>
                        <Stack direction='row' width='100%' justifyContent='space-between' alignItems='center'>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <img src={sp_image} alt={'ไม่พบรูปภาพ'} width='100'
                                    onClick={() => {
                                        setSpImage(sp_image);
                                        setSpPreview(true)
                                    }}
                                    onError={(e) => {
                                        e.target.src = import.meta.env.VITE_IMAGE_DEFAULT
                                    }}
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

                            {!isMobile && (

                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
                                    <IconButton
                                        disabled={sp.qty <= 1} size="small"
                                        onClick={() => updateQuantity(sp.id, 'remove')}
                                    >
                                        <Remove />
                                    </IconButton>
                                    <Typography variant="body1" sx={{ width: '60px', textAlign: 'center' }}>
                                        {sp.qty}
                                    </Typography>
                                    <IconButton size="small" onClick={() => updateQuantity(sp.id)}>
                                        <Add />
                                    </IconButton>
                                    <IconButton color="error" size="small" onClick={() => handleRemove(sp)}>
                                        <Delete />
                                    </IconButton>
                                </Stack>

                            )}
                        </Stack>
                        {isMobile && (
                            <Stack direction="row" justifyContent='center' alignItems='center'>
                                <IconButton
                                    disabled={sp.qty <= 1} size="small"
                                    onClick={() => updateQuantity(sp.id, 'remove')}
                                >
                                    <Remove />
                                </IconButton>
                                <Typography variant="body1" sx={{ width: '60px', textAlign: 'center' }}>
                                    {sp.qty}
                                </Typography>
                                <IconButton size="small" onClick={() => updateQuantity(sp.id)}>
                                    <Add />
                                </IconButton>
                                <IconButton color="error" size="small" onClick={() => handleRemove(sp)}>
                                    <Delete />
                                </IconButton>
                            </Stack>

                        )}
                        <Divider />
                    </React.Fragment>
                )
            })}
        </>
    )
}

export default function CartList({ groupSku, totalSp, flash }) {
    const [groups, setGroups] = useState(groupSku);
    const user = usePage().props.auth.user;
    const [address, setAddress] = useState(user.store_info.address);
    const [phone, setPhone] = useState(user.store_info.phone);
    const [processing, setProcessing] = useState(false);
    const totalPrice = useMemo(() => {
        return groups.reduce((total, group) => {
            return total + group.list.reduce((sum, sp) => {
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
            const { data, status } = await axios.post(URL, {
                groups: groups,
                address: address,
                phone: phone
            });
            console.log(data, status);
            router.visit(route('orders.success', { message: data.message }));
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message
            })
        } finally {
            setProcessing(false);
        }
    }

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: flash.success,
                icon: 'success',
                timer: 2500,
                showConfirmButton: false,
            });
        }
        if (flash?.error) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: flash.error,
                icon: 'error'
            });
        }
        // if (flash?.pdf_url) {
        //     window.open(flash.pdf_url, '_blank');
        // }
        if (flash?.pdf_url) {
            const newWindow = window.open(flash.pdf_url, '_blank');
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                Swal.fire({
                    title: '⚠️ ไม่สามารถเปิดไฟล์ PDF ได้',
                    text: 'เบราว์เซอร์ของคุณอาจบล็อกหน้าต่างป๊อปอัปไว้ กรุณาอนุญาตการเปิดป๊อปอัป หรือคลิกปุ่มด้านล่างเพื่อเปิดใหม่',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'เปิด PDF อีกครั้ง',
                    cancelButtonText: 'ยกเลิก'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.open(flash.pdf_url, '_blank');
                    }
                });
            }
        }
    }, [flash]);

    return (
        <AuthenticatedLayout>
            <Head title='ตะกร้าสินค้า' />
            <Box sx={{ p: 2, height: '90%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Stack direction='row' spacing={2} justifyContent='space-between'>
                                <Button
                                    startIcon={<ArrowBack />}
                                    size='small' variant='contained'
                                    component={Link} href={route('orders.list')}
                                >
                                    กลับไปยังหน้าสั่งซื้ออะไหล่
                                </Button>
                                <Typography variant='h6' fontWeight='bold'>ตะกร้าสินค้า</Typography>
                            </Stack>
                        </Grid2>
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
                                                    component={Link}
                                                    href={route('orders.list', { sku: group.sku_code })}
                                                >
                                                    เพิ่มอะไหล่
                                                </Button>
                                            </Stack>
                                            <Stack direction="column" spacing={1}>
                                                <React.Fragment>
                                                    <ListSp
                                                        groups={groups}
                                                        setGroups={setGroups}
                                                        sps={group.list}
                                                        sku_code={group.sku_code}
                                                    />
                                                </React.Fragment>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            )
                        })}
                    </Grid2>
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
        </AuthenticatedLayout>
    )
}

const formatFloat = (price_per_unit, quantity, item) => {
    const PricePerUnitForCal = parseFloat(price_per_unit) || 0;
    const Qty = parseFloat(quantity);
    const totalPriceSp = (PricePerUnitForCal * Qty).toFixed(2);
    const showPricePerUnit = parseFloat(PricePerUnitForCal).toFixed(2);
    return `${showPricePerUnit} × ${Qty} = ${totalPriceSp}`;
};
