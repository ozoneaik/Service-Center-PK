import { useForm, usePage } from "@inertiajs/react";
import {
    Alert, Button, Dialog, DialogContent, DialogTitle,
    FormControl, FormHelperText, InputLabel, MenuItem, Select,
    Grid2, Box, TextField, Typography, Divider, CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';

// แก้ไขการสะกดผิด fields แทน feilds
const fields = [
    { key: "is_code_cust_id", label: "รหัสร้าน", type: 'text' },
    { key: "shop_name", label: "ชื่อร้าน", type: 'text' },
    { key: "phone", label: "เบอร์โทรศัพท์", type: 'tel' },
    {key: 'line_id' , label : 'ไอดีไลน์' , type : 'text'},

];

export default function AddStore({ addStoreOpen, setAddStoreOpen, onSave, sales }) {
    const [statusSaved, setStatusSaved] = useState(false);
     const { flash } = usePage().props
    const { data, setData, post, processing, errors, reset } = useForm({
        is_code_cust_id: '',
        shop_name: "",
        address: "",
        phone: "",
        gp: 0,
        province: "",
        district: "",
        subdistrict: "",
        zipcode: "",
        full_address : '',
        sale_id : '',
    });

    const [provinces, setProvinces] = useState([]);
    const [amphures, setAmphures] = useState([]);
    const [tambons, setTambons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [shouldSubmit, setShouldSubmit] = useState(false);

    const [selected, setSelected] = useState({
        province_id: "",
        amphure_id: "",
        tambon_id: ""
    });

    useEffect(() => {
        console.log("✅ sales จาก Controller:", sales);
    }, [sales]);

    useEffect(() => {
        const fetchProvinces = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    // "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json"
                    "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json"
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch provinces");
                }
                const result = await response.json();
                setProvinces(result);
            } catch (error) {
                console.error("Error fetching provinces:", error);
                setApiError("ไม่สามารถโหลดข้อมูลจังหวัดได้ กรุณาลองใหม่อีกครั้ง");
            } finally {
                setLoading(false);
            }
        };

        fetchProvinces();

        return () => {
            // Clean up function เมื่อ component unmount
            reset();
        };
    }, [reset]);

    // Effect เพื่อแก้ปัญหาที่ไม่เก็บค่าที่อยู่ลงใน form data
    useEffect(() => {
        if (selected.province_id) {
            const province = provinces.find(p => p.id === selected.province_id);
            if (province) {
                setData("province", province.name_th);
            }
        }

        if (selected.amphure_id && amphures.length > 0) {
            const district = amphures.find(a => a.id === selected.amphure_id);
            if (district) {
                setData("district", district.name_th);
            }
        }

        if (selected.tambon_id && tambons.length > 0) {
            const subdistrict = tambons.find(t => t.id === selected.tambon_id);
            if (subdistrict) {
                setData("subdistrict", subdistrict.name_th);
                setData("zipcode", subdistrict.zip_code);
            }
        }
    }, [selected, provinces, amphures, tambons, setData]);

    const handleProvinceChange = (event) => {
        // alert(event.target.value);
        const provinceId = event.target.value ? Number(event.target.value) : "";

        // รีเซ็ตข้อมูลอำเภอและตำบล
        setSelected({
            province_id: provinceId,
            amphure_id: "",
            tambon_id: ""
        });

        setAmphures([]);
        setTambons([]);

        if (provinceId) {
            console.log(provinces);


            const province = provinces.find(p => p.id === provinceId);
            if (province) {
                console.log(province);
                setAmphures(province.districts);
            }
        }
    };

    const handleAmphureChange = (event) => {
        const amphureId = event.target.value ? Number(event.target.value) : "";

        // รีเซ็ตข้อมูลตำบล
        setSelected(prev => ({
            ...prev,
            amphure_id: amphureId,
            tambon_id: ""
        }));

        setTambons([]);

        if (amphureId) {
            const district = amphures.find(a => a.id === amphureId);
            if (district) {
                setTambons(district.sub_districts);
            }
        }
    };

    const handleTambonChange = (event) => {
        const tambonId = event.target.value ? Number(event.target.value) : "";

        setSelected(prev => ({
            ...prev,
            tambon_id: tambonId
        }));
    };

    const handleClose = () => {
        setAddStoreOpen(false);
        reset();
        setSelected({
            province_id: "",
            amphure_id: "",
            tambon_id: ""
        });
        setAmphures([]);
        setTambons([]);
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     // สร้างข้อมูลที่จะส่งไป
    //     const formData = {
    //         ...data,
    //         // สร้างที่อยู่แบบสมบูรณ์
    //         full_address: `${data.address} ${data.subdistrict} ${data.district} ${data.province} ${data.zipcode}`
    //     };
    //     setData('full_address', formData.full_address);
    //     console.log("บันทึกข้อมูล:", formData);
    //     // ส่งข้อมูลกลับไปที่ component หลัก
    //     //shop.store stockSp.shopList
    //     post(route('shop.store'), {
    //         preserveScroll: true,
    //         onSuccess: (response) => {
    //             console.log("✅ บันทึกสำเร็จ:", response);
    //             setStatusSaved(true);
    //         },
    //         onError: (errors) => {
    //             console.error("❌ เกิดข้อผิดพลาดจาก Backend:", errors);
    //             setStatusSaved(true);
    //         }
    //     })
    //     // if (onSave) { onSave(formData); }
    //     // handleClose();
    // };

    useEffect(() => {
        if (shouldSubmit && data.full_address) {
            console.log("🚀 ส่งข้อมูลหลัง state update:", data);

            post(route('shop.store'), {
                preserveScroll: true,
                onSuccess: (response) => {
                    console.log("✅ บันทึกสำเร็จ:", response);
                    setStatusSaved(true);
                    setShouldSubmit(false);
                    setTimeout(() => {
                        handleClose();
                        setStatusSaved(false);
                    }, 2000);
                },
                onError: (errors) => {
                    console.error("❌ เกิดข้อผิดพลาดจาก Backend:", errors);
                    setStatusSaved(true);
                    setShouldSubmit(false);
                }
            });
        }
    }, [data.full_address, shouldSubmit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("🔍 ข้อมูลปัจจุบัน:", data);
        const fullAddress = `${data.address} ${data.subdistrict} ${data.district} ${data.province} ${data.zipcode}`.trim();
        console.log("📍 Full Address:", fullAddress);
        setData('full_address', fullAddress);
        setShouldSubmit(true);
    };

    return (
        <Dialog
            maxWidth="md" fullWidth
            open={addStoreOpen} onClose={handleClose}
            PaperProps={{
                sx: { borderRadius: 2, boxShadow: 3 }
            }}
        >
            <DialogTitle sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                borderBottom: '1px solid', borderColor: 'divider',
                bgcolor: 'primary.main', color: 'primary.contrastText'
            }}>
                <StoreIcon />
                <Typography variant="h6" component="div">
                    เพิ่มศูนย์ซ่อม
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 3, mt: 1 }}>
                {apiError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {apiError}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={3}>
                        <Grid2 size={12}>
                            {statusSaved && flash.success && (
                                <Alert severity="success" onClose={() => { }}>
                                    {flash.success}
                                </Alert>
                            )}
                            {statusSaved && flash.error && (
                                <Alert severity="error" onClose={() => { }}>
                                    {flash.error}
                                </Alert>
                            )}

                        </Grid2>
                        <Grid2 size={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                ข้อมูลร้าน
                            </Typography>
                        </Grid2>

                        {fields.map((item) => (
                            <Grid2 size={{ xs: 12, sm: 6 }} key={item.key}>
                                <TextField
                                    label={item.label} value={data[item.key]} fullWidth
                                    onChange={(e) => setData(item.key, e.target.value)}
                                    type={item.type} size="small" required
                                    error={!!errors[item.key]}
                                    helperText={errors[item.key]}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid2>
                        ))}

                        <Grid2 size={12}>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <LocationOnIcon color="primary" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    ข้อมูลที่อยู่
                                </Typography>
                            </Box>
                        </Grid2>
                        <Grid2 size={12}>
                            <TextField
                                id="claim-remark"
                                minRows={5}
                                multiline
                                label={'ที่อยู่'} value={data.address} fullWidth
                                onChange={(e) => setData('address', e.target.value)}
                                type='text' size="small" required
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small" required error={!!errors.province}>
                                <InputLabel id="province-label">จังหวัด</InputLabel>
                                <Select
                                    labelId="province-label"
                                    value={selected.province_id}
                                    onChange={handleProvinceChange}
                                    label="จังหวัด" disabled={loading}
                                    variant='outlined'>
                                    <MenuItem value="">
                                        <em>กรุณาเลือกจังหวัด</em>
                                    </MenuItem>
                                    {provinces.map((province) => (
                                        <MenuItem key={province.id} value={province.id}>
                                            {province.name_th}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.province && <FormHelperText>{errors.province}</FormHelperText>}
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small" required error={!!errors.district} disabled={!selected.province_id}>
                                <InputLabel id="district-label">อำเภอ/เขต</InputLabel>
                                <Select
                                    labelId="district-label"
                                    value={selected.amphure_id}
                                    onChange={handleAmphureChange}
                                    label="อำเภอ/เขต"
                                    variant='outlined'>
                                    <MenuItem value="">
                                        <em>กรุณาเลือกอำเภอ/เขต</em>
                                    </MenuItem>
                                    {amphures.map((amphure) => (
                                        <MenuItem key={amphure.id} value={amphure.id}>
                                            {amphure.name_th}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.district && <FormHelperText>{errors.district}</FormHelperText>}
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small" required error={!!errors.subdistrict} disabled={!selected.amphure_id}>
                                <InputLabel id="subdistrict-label">ตำบล/แขวง</InputLabel>
                                <Select
                                    labelId="subdistrict-label" value={selected.tambon_id}
                                    onChange={handleTambonChange} label="ตำบล/แขวง"
                                 variant='outlined'>
                                    <MenuItem value="">
                                        <em>กรุณาเลือกตำบล/แขวง</em>
                                    </MenuItem>
                                    {tambons.map((tambon) => (
                                        <MenuItem key={tambon.id} value={tambon.id}>
                                            {tambon.name_th}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.subdistrict && <FormHelperText>{errors.subdistrict}</FormHelperText>}
                            </FormControl>
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="รหัสไปรษณีย์" value={data.zipcode}
                                onChange={(e) => setData("zipcode", e.target.value)}
                                fullWidth type="text" size="small" required
                                error={!!errors.zipcode}
                                helperText={errors.zipcode}
                                InputProps={{
                                    readOnly: !!data.zipcode,
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid2>
                        <Grid2 size={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                เซลล์ประจำร้าน
                            </Typography>
                        </Grid2>
                        <Grid2 size={12}>
                            <FormControl fullWidth size="small" required error={!!errors.sale_id}>
                                <InputLabel id="sale-label">เลือกเซลล์</InputLabel>
                                <Select
                                    labelId="sale-label"
                                    value={String(data.sale_id || "")}
                                    onChange={(e) => setData('sale_id', e.target.value)}
                                    label="เซลล์ประจำร้าน"
                                >
                                    <MenuItem value="">
                                        <em>กรุณาเลือกเซลล์</em>
                                    </MenuItem>
                                    {sales?.map((sale) => (
                                        <MenuItem key={sale.id} value={String(sale.id)}>
                                            {sale.sale_code} - {sale.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.sale_id && <FormHelperText>{errors.sale_id}</FormHelperText>}
                            </FormControl>
                        </Grid2>
                    </Grid2>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={handleClose} sx={{ px: 3 }}
                            variant="outlined" color="inherit"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit" variant="contained" color="primary" sx={{ px: 3 }}
                            disabled={processing || loading}
                            startIcon={processing && <CircularProgress size={20} color="inherit" />}
                        >
                            บันทึกข้อมูล
                        </Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
