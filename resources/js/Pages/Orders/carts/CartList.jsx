import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, router} from "@inertiajs/react";
import {
    Avatar,
    Box, Button, Card,
    CardContent, Divider,
    Grid2,
    IconButton,
    Stack,
    Typography
} from "@mui/material";
import React, {useMemo, useState} from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

const formatFloat = (price_per_unit, quantity, item) => {
    const PricePerUnitForCal = parseFloat(price_per_unit) || 0;
    const Qty = parseFloat(quantity);
    const totalPriceSp = (PricePerUnitForCal * Qty).toFixed(2);
    const showPricePerUnit = parseFloat(PricePerUnitForCal).toFixed(2);
    return `${showPricePerUnit} × ${Qty} = ${totalPriceSp}`;
};


const ListSp = ({sps, sku_code, setGroups, groups}) => {
    const updateQuantity = async (id, condition = 'add') => {
        try {
            const {data, status} = await axios.post(`/orders/carts/add-remove/${condition}`, {
                id: id
            });
            if (status === 200) {
                // อัปเดต groups โดยตรงแทนที่จะอัปเดต spList ภายใน
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

    const handleRemove = (id) => {
        AlertDialogQuestion({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบสินค้านี้ใช่หรือไม่?',
            onPassed: async (confirm) => confirm && await onRemoveSp(id)
        });
    }

    const onRemoveSp = async (id) => {
        const {data, status} = await axios.delete(`/orders/carts/delete/${id}`);
        if (status === 200) {
            const updatedGroups = groups.map(group => {
                return {
                    ...group,
                    list: group.list.filter(sp => sp.id !== id)
                };
            });
            setGroups(updatedGroups);
        }else{
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถลบสินค้านี้ได้'
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
                                <img src={sp_image} alt={''} width='100'/>
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
                                    disabled={sp.qty <= 1}
                                    color="primary" size="small"
                                    onClick={() => updateQuantity(sp.id, 'remove')}
                                >
                                    <RemoveIcon/>
                                </IconButton>
                                <Typography variant="body1" sx={{width: '60px', textAlign: 'center'}}>
                                    {sp.qty}
                                </Typography>

                                <IconButton
                                    color="primary" size="small"
                                    onClick={() => updateQuantity(sp.id)}
                                >
                                    <AddIcon/>
                                </IconButton>
                                <IconButton
                                    color="error" size="small"
                                    onClick={() => handleRemove(sp.id)}
                                >
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
    console.log(groups)
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
            title : 'แน่ใจหรือไม่',
            text : 'คุณต้องการยืนยันการสั่งซื้อสินค้าใช่หรือไม่?',
            onPassed : async (confirm) => {
                confirm && await onSubmit();
            }
        })
    }

    const onSubmit = async () => {
        try {
            const {data, status} = await axios.post('/orders/carts/store',{
                groups : groups
            });
            router.visit('/orders/success');
        }catch (error){
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถยืนยันการสั่งซื้อได้'
            })
        }
    }



    return (
        <AuthenticatedLayout>
            <Head title='ตะกร้าสินค้า'/>
            <Box sx={{p: 2, height: '90%', display: 'flex', flexDirection: 'column', bgcolor: 'white'}}>
                <Box sx={{flexGrow: 1, overflow: 'auto', mb: 2}}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Typography variant='h6' fontWeight='bold'>ตะกร้าสินค้า</Typography>
                        </Grid2>
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
                            <Button variant="contained" color="primary" size="large"
                                    onClick={handleConfirmOrder}>
                            >
                                ยืนยันการสั่งซื้อ
                            </Button>
                        </Grid2>
                    </Grid2>
                </Box>
            </Box>
        </AuthenticatedLayout>
    )
}
