import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, Link, router, usePage} from "@inertiajs/react";
import {
    Avatar, Box, Button, Card, CardContent, Divider, Grid2, IconButton, Stack, Typography
} from "@mui/material";
import React, {useMemo, useState} from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ListSp = ({sps, sku_code, setGroups, groups}) => {
    const updateQuantity = async (id, condition = 'add') => {
        try {
            const API_URL = `/orders/carts/add-remove/${condition}`;
            const {data, status} = await axios.post(API_URL, {id: id});
            if (status === 200) {
                const updatedGroups = groups.map(group => {
                    return {
                        ...group,
                        list: group.list.map(sp =>
                            sp.id === id ? {...sp, qty: data.sp.qty} : sp
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
            const {status} = await axios.delete(`/orders/carts/delete/${id}`);
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
            {sps.map((sp, index) => {
                const sp_image = `${import.meta.env.VITE_IMAGE_SP}${sku_code}/${sp.sp_code}.jpg`;
                return (
                    <React.Fragment key={index}>
                        <Stack direction='row' width='100%' justifyContent='space-between' alignItems='center'>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <img src={sp_image} alt={'ไม่พบรูปภาพ'} width='100'
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
                            <Stack direction="row" spacing={1} sx={{alignItems: 'center', mt: {xs: 1, sm: 0}}}>
                                <IconButton
                                    disabled={sp.qty <= 1} size="small"
                                    onClick={() => updateQuantity(sp.id, 'remove')}
                                >
                                    <RemoveIcon/>
                                </IconButton>
                                <Typography variant="body1" sx={{width: '60px', textAlign: 'center'}}>
                                    {sp.qty}
                                </Typography>

                                <IconButton size="small" onClick={() => updateQuantity(sp.id)}>
                                    <AddIcon/>
                                </IconButton>
                                <IconButton color="error" size="small" onClick={() => handleRemove(sp)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Stack>
                        </Stack>
                        <Divider/>
                    </React.Fragment>
                )
            })}
        </>
    )
}

export default function CartList({groupSku, totalSp}) {
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
            const {data, status} = await axios.post(URL, {
                groups: groups,
                address: address,
                phone: phone
            });
            console.log(data, status);
            router.visit(route('orders.success', {message: data.message}));
        } catch (error) {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message
            })
        } finally {
            setProcessing(false);
        }
    }


    return (
        <AuthenticatedLayout>
            <Head title='ตะกร้าสินค้า'/>
            <Box sx={{p: 2, height: '90%', display: 'flex', flexDirection: 'column', bgcolor: 'white'}}>
                <Box sx={{flexGrow: 1, overflow: 'auto', mb: 2}}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Stack direction='row' spacing={2} justifyContent='space-between'>
                                <Button
                                    startIcon={<ArrowBackIcon/>}
                                    size='small' variant='contained'
                                    component={Link} href={route('orders.list')}
                                >
                                    กลับไปยังหน้าสั่งซื้ออะไหล่
                                </Button>
                                <Typography variant='h6' fontWeight='bold'>ตะกร้าสินค้า</Typography>
                            </Stack>
                        </Grid2>
                        {/*<Grid2 size={12}>*/}
                        {/*    <TextField id='claim-remark' multiline minRows={3} fullWidth slotProps={{*/}
                        {/*        input: {*/}
                        {/*            startAdornment: (*/}
                        {/*                <InputAdornment position='start'>*/}
                        {/*                    <RoomIcon/>*/}
                        {/*                </InputAdornment>*/}
                        {/*            )*/}
                        {/*        }*/}
                        {/*    }} size='small' label='ที่อยู่' value={address}*/}
                        {/*               onChange={(e) => setAddress(e.target.value)}/>*/}
                        {/*</Grid2>*/}
                        {/*<Grid2 size={12}>*/}
                        {/*    <TextField fullWidth slotProps={{*/}
                        {/*        input: {*/}
                        {/*            startAdornment: (*/}
                        {/*                <InputAdornment position='start'>*/}
                        {/*                    <LocalPhoneIcon/>*/}
                        {/*                </InputAdornment>*/}
                        {/*            )*/}
                        {/*        }*/}
                        {/*    }} size='small' label='เบอร์โทรศัพท์' value={phone}*/}
                        {/*               onChange={(e) => setPhone(e.target.value)}/>*/}
                        {/*</Grid2>*/}
                        {groups.map((group, index) => {
                            return (
                                <Grid2 key={index} size={12}>
                                    <Card variant="outlined" sx={{mb: 2}}>
                                        <CardContent>
                                            <Stack direction="row" alignItems="center" spacing={2}
                                                   sx={{mb: 2, backgroundColor: '#0000000D', p: 1}}>
                                                <Avatar
                                                    src={group.sku_image_path} variant="square"
                                                    sx={{width: 48, height: 48}}
                                                />
                                                <Typography
                                                    variant="h6">กลุ่มสินค้า: {group.sku_code} | {group.sku_name}</Typography>
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
                <Box sx={{p: 2, borderTop: '1px solid', borderColor: 'divider'}}>
                    <Grid2 container spacing={2} alignItems="center">
                        <Grid2 size={{xs: 12, sm: 6}}>
                            <Typography variant="h6">
                                จำนวนรายการทั้งหมด: {parseInt(totalSp)} รายการ
                            </Typography>
                            <Typography variant="h5" color="primary">
                                ยอดรวมทั้งสิ้น: ฿{totalPrice.toFixed(2)}
                            </Typography>
                        </Grid2>
                        <Grid2 size={{xs: 12, sm: 6}} sx={{textAlign: 'right'}}>
                            <Button
                                loading={processing}
                                loadingPosition='start'
                                startIcon={<CheckIcon/>} variant="contained" color="success" size="large"
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
