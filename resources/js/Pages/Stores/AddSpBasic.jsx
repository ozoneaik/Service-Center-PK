import InputError from "@/Components/InputError";
import { useForm, usePage } from "@inertiajs/react";
import { Alert, Button, CircularProgress, Dialog, DialogContent, Divider, Grid2, InputAdornment, Stack, TextField, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { useRef, useState } from "react";

export default function AddSpBasic({ openAddSpBasic, setOpenAddSpBasic }) {
    const theme = useTheme();
    const pumpkinColor = theme.palette.pumpkinColor;
    const user = usePage().props.auth.user;
    const [statusSaved, setStatusSaved] = useState(false);
    const searchSp = useRef(null);
    const [searching, setSerching] = useState(false);

    const handleOnClose = (e, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
        }
        setOpenAddSpBasic(false);
    }

    const { data, setData, processing, errors, post } = useForm({
        is_code_cust_id: user.is_code_cust_id,
        sku_code: '',
        sku_name: '',
        sp_code: '',
        sp_name: '',
        qty_sp: '',
        received_date: ''
    });

    const handleOnSave = async (e) => {
        e.preventDefault();

        console.log("📤 ส่งข้อมูลไปยัง Backend:", data); // Log ข้อมูลที่ส่งไป
        try {
            await post(route('stockSp.storeOneSp'), {
                preserveScroll: true,
                onSuccess: (response) => {
                    console.log("✅ บันทึกสำเร็จ:", response);
                    // setOpenAddSpBasic(false);
                    setStatusSaved(true);
                },
                onError: (errors) => {
                    console.error("❌ เกิดข้อผิดพลาดจาก Backend:", errors);
                }
            });

            console.log("✅ บันทึกข้อมูลเสร็จสิ้นแล้ว!"); // ตรวจสอบว่าผ่าน await หรือไม่
        } catch (error) {
            console.error("⚠️ เกิดข้อผิดพลาดใน post() :", error);
        }
    };

    const handleSearch = async () => {
        if (!searchSp.current.value) return;
        try {
            setSerching(true);
            const response = await axios.get(route('stockSp.searchSku', {
                sp_code: searchSp.current.value,
                is_code_cust_id: user.is_code_cust_id
            }));
            console.log("🔍 ค้นหาสินค้า:", response);

            if (response.status === 200) {
                setData('sku_code', response.data.data.sku_code);
                setData('sku_name', response.data.data.sku_name);
                setData('sp_code', response.data.data.sp_code);
                setData('sp_name', response.data.data.sp_name);
                // setData('qty_sp', response.data.data.qty_sp);
            }
        } catch (error) {
            setData('sku_code', '');
            setData('sku_name', '');
            setData('sp_code', '');
            setData('sp_name', '');
            setData('qty_sp', '');
            console.error("⚠️ เกิดข้อผิดพลาดใน handleSearch() :", error);
        } finally {
            setSerching(false);
        }
    }

    return (
        <Dialog
            open={openAddSpBasic}
            onClose={(e, reason) => handleOnClose(e, reason)}
            fullWidth
            maxWidth="md"
        >
            <DialogContent>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography variant="h6" fontWeight='bold'>ค้นหา</Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction={{ md: 'row', xs: 'column' }} spacing={2}>
                            <TextField
                                inputRef={searchSp}
                                autoFocus fullWidth label='ค้นหารหัสอะไหล่ หากจำไม่ได้ว่าเคยกรอกไปแล้ว เพื่อดึงข้อมูลอะไหล่'
                                placeholder="ตัวอย่าง SP001"
                            />
                            <Button disabled={searching} variant="contained" onClick={handleSearch}>
                                {searching && <CircularProgress size={24} />}
                                ค้นหา
                            </Button>
                        </Stack>
                        <br />
                        <Divider />
                    </Grid2>
                    <form onSubmit={handleOnSave}>
                        <Grid2 container spacing={2}>
                            {statusSaved && <Grid2 size={12}>
                                <Alert severity="success" onClose={() => setStatusSaved(false)}>
                                    บันทึกข้อมูลสำเร็จแล้ว
                                </Alert>
                            </Grid2>}

                            <Grid2 size={12}>
                                <Typography variant="h6" fontWeight='bold'>เพิ่มอะไหล่</Typography>
                            </Grid2>
                            <Grid2 size={12}>
                                <Typography variant='body2' sx={{ color: pumpkinColor.main }}>ข้อมูลสินค้า</Typography>
                            </Grid2>
                            <Grid2 size={{ md: 6, xs: 12 }}>
                                <TextField
                                    value={data.sku_code}
                                    onChange={(e) => setData('sku_code', e.target.value)}
                                    size="small"
                                    fullWidth label='รหัสสินค้า'
                                    placeholder="ตัวอย่าง 50277"
                                />
                            </Grid2>
                            <Grid2 size={{ md: 6, xs: 12 }}>
                                <TextField
                                    value={data.sku_name}
                                    onChange={(e) => setData('sku_name', e.target.value)}
                                    size="small"
                                    fullWidth label='ชื่อสินค้า'
                                    placeholder="ตัวอย่าง เครื่องเจียรมือ"
                                />
                            </Grid2>
                            <Grid2 size={12}>
                                <Typography variant='body2' sx={{ color: pumpkinColor.main }}>ข้อมูลอะไหล่</Typography>
                            </Grid2>
                            <Grid2 size={{ md: 6, xs: 12 }}>
                                <TextField
                                    error={errors.sp_code && !data.sp_code}
                                    value={data.sp_code}
                                    onChange={(e) => setData('sp_code', e.target.value)}
                                    required size="small"
                                    fullWidth label='รหัสอะไหล่'
                                    placeholder="ตัวอย่าง SP001"
                                />
                                <InputError message={errors.sp_code} />
                            </Grid2>
                            <Grid2 size={{ md: 6, xs: 12 }}>
                                <TextField
                                    error={errors.sp_name && !data.sp_name}
                                    value={data.sp_name}
                                    onChange={(e) => setData('sp_name', e.target.value)}
                                    required size="small"
                                    fullWidth label='ชื่ออะไหล่'
                                    placeholder="ตัวอย่าง ประกบบน"
                                />
                                <InputError message={errors.sp_name} />
                            </Grid2>
                            <Grid2 size={{ md: 12, xs: 12 }}>
                                <TextField
                                    required fullWidth label='จำนวนที่รับเข้ามา'
                                    error={errors.qty_sp && !data.qty_sp} value={data.qty_sp}
                                    onChange={(e) => setData('qty_sp', e.target.value)}
                                    type="number" size="small"
                                    placeholder="ตัวอย่าง ประกบบน"
                                />
                                <InputError message={errors.qty_sp} />
                            </Grid2>
                            <Grid2 size={12}>
                                <Stack direction={{ md: 'row', xs: 'column' }} spacing={2}>
                                    <Button disabled={processing} variant="outlined" onClick={() => setOpenAddSpBasic(false)} fullWidth>ยกเลิก</Button>
                                    <Button disabled={processing} type="submit" variant="contained" fullWidth>
                                        {processing && <CircularProgress size={24} />}
                                        บันทึก
                                    </Button>
                                </Stack>
                            </Grid2>
                        </Grid2>
                    </form>

                </Grid2>
            </DialogContent>
        </Dialog>
    )
}