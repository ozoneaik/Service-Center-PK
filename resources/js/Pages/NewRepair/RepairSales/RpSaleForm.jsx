import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box, Checkbox, CircularProgress, FormControl, FormControlLabel,
    FormLabel, InputAdornment, Radio, RadioGroup, Stack, TextField,
    Typography, Divider, Chip, Avatar, Autocomplete, Grid, Paper, Card, CardContent
} from "@mui/material";
import { Store, Person, Phone, LocalShipping, Note, Business, LocationOn } from "@mui/icons-material";
import axios from "axios";
import { debounce } from "lodash";
import { usePage } from "@inertiajs/react";

export default function RpSaleForm({ data, setData, form1Saved, JOB }) {
    const { user_login_name } = usePage().props;
    // --- States ---
    const [loadingPhone, setLoadingPhone] = useState(false);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [loadingService, setLoadingService] = useState(false);

    // [เพิ่ม] State สำหรับเก็บค่า Value ของ Autocomplete
    const [selectedService, setSelectedService] = useState(null);

    // --- Derived Constants ---
    const shopName = JOB?.shop_under_sale_name || JOB?.shop_under_sale || data.customer?.shop_under_sale || '-';
    const shopCode = JOB?.shop_under_sale_id || data.customer?.shop_under_sale_id || '-';
    const shopPhone = JOB?.shop_under_sale_phone || data.customer?.shop_under_sale_phone || '';

    // --- Effects: Auto-fill Shop Info ---
    useEffect(() => {
        const newData = { ...data.customer };
        let hasChanges = false;
        if (shopName !== '-' && shopName !== newData.shop_under_sale) {
            newData.shop_under_sale = shopName;
            newData.shop_under_sale_id = shopCode !== '-' ? shopCode : newData.shop_under_sale_id;
            newData.shop_under_sale_phone = shopPhone || newData.shop_under_sale_phone;
            hasChanges = true;
        }
        if (!newData.name && JOB?.cust_name) {
            newData.name = JOB.cust_name;
            hasChanges = true;
        } else if (!newData.name && !JOB?.cust_name && user_login_name) {
            newData.name = user_login_name || '';
            hasChanges = true;
        }

        // const phoneToUse = JOB?.cust_phone || shopPhone;
        // if (!newData.phone && phoneToUse && phoneToUse !== '-') {
        //     newData.phone = phoneToUse;
        //     hasChanges = true;
        // }

        if (!newData.address && JOB?.cust_address) {
            newData.address = JOB.cust_address;
            hasChanges = true;
        }
        if (JOB?.delivery_type && newData.delivery_type !== JOB.delivery_type) {
            newData.delivery_type = JOB.delivery_type;
            hasChanges = true;
        }
        else if (!newData.delivery_type && !JOB?.delivery_type) {
            newData.delivery_type = 'sale_self';
            hasChanges = true;
        }
        if (JOB?.remark && !newData.remark) { newData.remark = JOB.remark; hasChanges = true; }
        // ... (subremark อื่นๆ ถ้าต้องการ) ...

        if (hasChanges) {
            setData('customer', newData);
        }
    }, [shopName, shopCode, shopPhone, JOB, user_login_name]);

    // [เพิ่ม] Effect: Auto-fill Service Center (กรณีมีข้อมูลเดิมอยู่แล้ว)
    useEffect(() => {
        const savedServiceId = data.customer?.is_code_cust_id || JOB?.is_code_cust_id;

        if (savedServiceId) {
            // ถ้ามีชื่อส่งมากับ JOB ให้ใช้เลย
            if (JOB?.service_center_name) {
                setSelectedService({
                    is_code_cust_id: savedServiceId,
                    shop_name: JOB.service_center_name
                });
            }
            else if (!selectedService) {
                fetchServiceCenters(savedServiceId).then((options) => {
                    if (options && options.length > 0) {
                        const match = options.find(opt => opt.is_code_cust_id === savedServiceId);
                        if (match) setSelectedService(match);
                    }
                });
            }
        }
    }, [JOB, data.customer?.is_code_cust_id]);


    // --- Handlers: Service Center Search ---
    const fetchServiceCenters = async (query) => {
        setLoadingService(true);
        try {
            const res = await axios.post(route('repair.sale.search.service.centers'), { search: query });
            if (res.data.status === 'success') {
                setServiceOptions(res.data.data);
                return res.data.data;
            }
        } catch (error) {
            console.error("Error searching service centers:", error);
        } finally {
            setLoadingService(false);
        }
    };

    const debouncedSearch = useMemo(() => debounce((query) => {
        fetchServiceCenters(query);
    }, 500), []);

    const handleInputChangeService = (event, newInputValue) => {
        debouncedSearch(newInputValue);
    };

    const handleSelectService = (event, newValue) => {
        setSelectedService(newValue);
        setData('customer', {
            ...data.customer,
            is_code_cust_id: newValue ? newValue.is_code_cust_id : '',
        });
    };

    // const handleChange = async (e) => {
    //     const { name, value } = e.target;
    //     setData('customer', { ...data.customer, [name]: value });
    //     if (name === 'phone' && value.length === 10) {
    //         setLoadingPhone(true);
    //         try {
    //             const res = await axios.get(route('repair.check.phone'), { params: { phone: value } });
    //             if (res.data.found) {
    //                 setData('customer', (prev) => ({
    //                     ...prev,
    //                     name: res.data.name || prev.name,
    //                     address: res.data.address || prev.address
    //                 }));
    //             }
    //         } catch (error) { console.error(error); } finally { setLoadingPhone(false); }
    //     }
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData('customer', { ...data.customer, [name]: value });
    };

    const handleChecked = (e) => {
        const { name, checked } = e.target;
        setData('customer', { ...data.customer, [name]: checked });
    };

    const currentDeliveryType = data.customer?.delivery_type || 'sale_self';
    const isAddressRequired = currentDeliveryType === 'shop' || currentDeliveryType === 'customer';

    return (
        <Stack spacing={3}>
            <Paper elevation={0} variant="outlined" sx={{ p: 2, bgcolor: '#f5f9ff', borderColor: 'primary.light' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}><Store /></Avatar>
                    <Box>
                        <Typography variant="caption" color="text.secondary">ข้อมูลร้านค้าส่งซ่อม</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.dark" sx={{ lineHeight: 1.2 }}>{shopName}</Typography>
                        {shopCode !== '-' && <Chip label={`Code: ${shopCode}`} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />}
                    </Box>
                </Stack>
            </Paper>

            {/* --- Section 2: Service Center Selection --- */}
            <Card variant="outlined">
                <CardContent sx={{ pb: '16px !important' }}>
                    <Typography required variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business color="primary" /> เลือกศูนย์บริการ (Service Center)
                    </Typography>

                    <Autocomplete
                        required
                        disabled={form1Saved}
                        fullWidth
                        size="small"
                        value={selectedService}
                        isOptionEqualToValue={(option, value) => option.is_code_cust_id === value.is_code_cust_id}

                        options={serviceOptions}
                        loading={loadingService}
                        getOptionLabel={(option) => `${option.is_code_cust_id} : ${option.shop_name}`}
                        filterOptions={(x) => x}
                        onOpen={() => {
                            if (serviceOptions.length === 0) fetchServiceCenters('');
                        }}
                        onInputChange={handleInputChangeService}
                        onChange={handleSelectService}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id || option.is_code_cust_id}>
                                <Stack>
                                    <Typography variant="body2" fontWeight="bold">
                                        {option.is_code_cust_id} - {option.shop_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <LocationOn fontSize="inherit" />
                                        {option.sub_district} {option.district} {option.province}
                                    </Typography>
                                </Stack>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="ค้นหาศูนย์บริการ (ชื่อ หรือ รหัส)"
                                placeholder="พิมพ์เพื่อค้นหา..."
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingService ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </CardContent>
            </Card>
            <Divider><Chip label="ข้อมูลการติดต่อ & การจัดส่ง" size="small" /></Divider>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <FormLabel required sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}>
                                <Phone fontSize="small" /> เบอร์โทรศัพท์
                            </FormLabel>
                            <TextField
                                value={data.customer?.phone || ''}
                                name='phone' size='small' placeholder='08xxxxxxxx'
                                onChange={handleChange}
                                disabled={form1Saved} InputProps={{ endAdornment: loadingPhone && <InputAdornment position="end"><CircularProgress size={20} /></InputAdornment> }} />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <FormLabel required sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}>
                                <Person fontSize="small" /> ชื่อผู้ติดต่อ
                            </FormLabel>
                            <TextField value={data.customer?.name || ''} name='name' size='small' placeholder='ชื่อ-นามสกุล'
                                // onChange={handleChange} 
                                disabled={loadingPhone || form1Saved} />
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            <Card variant="outlined" sx={{ bgcolor: '#fafafa' }}>
                <CardContent>
                    <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                        <FormLabel component="legend" required sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                            <LocalShipping color="action" /> รูปแบบการจัดส่งคืน
                        </FormLabel>
                        <RadioGroup row name="delivery_type" value={data.customer?.delivery_type || 'shop'} onChange={handleChange}>
                            <FormControlLabel value="shop" control={<Radio size="small" disabled={form1Saved} />} label="ส่งคืนร้านค้า" />
                            <FormControlLabel value="customer" control={<Radio size="small" disabled={form1Saved} />} label="ส่งถึงลูกค้า (ร้านค้า)" />
                            <FormControlLabel value="sale_self" control={<Radio size="small" disabled={form1Saved} />} label="เซลล์รับเอง" />
                        </RadioGroup>
                    </FormControl>
                    <FormControl fullWidth>
                        <FormLabel
                            required={isAddressRequired} // ใส่เงื่อนไขแสดงดอกจันสีแดง (*)
                            sx={{ mb: 0.5, fontSize: '0.9rem' }}
                        >
                            ที่อยู่ในการจัดส่ง (กรณีส่งไปรษณีย์)
                        </FormLabel>
                        <TextField
                            value={data.customer?.address || ''}
                            multiline
                            minRows={2}
                            name='address'
                            size='small'
                            placeholder={isAddressRequired ? 'กรุณาระบุที่อยู่จัดส่ง...' : 'ระบุที่อยู่จัดส่ง...'}
                            onChange={handleChange}
                            disabled={loadingPhone || form1Saved}

                            // เพิ่ม properties เพื่อบังคับและแสดง error
                            required={isAddressRequired}
                            error={isAddressRequired && !data.customer?.address} // ขอบแดงถ้าจำเป็นต้องกรอกแต่ยังว่าง
                            helperText={isAddressRequired && !data.customer?.address ? "กรุณากรอกที่อยู่จัดส่ง" : ""}

                            sx={{ bgcolor: 'white' }}
                        />
                    </FormControl>
                </CardContent>
            </Card>

            <FormControl>
                <FormLabel sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontWeight: 500 }}>
                    <Note color="action" /> หมายเหตุความต้องการเพิ่มเติม
                </FormLabel>
                <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }} flexWrap="wrap">
                    <FormControlLabel control={<Checkbox disabled={form1Saved} name='subremark1' checked={Boolean(data.customer?.subremark1)} onChange={handleChecked} size="small" />} label={<Typography variant="body2">เสนอราคาก่อนซ่อม</Typography>} />
                    <FormControlLabel control={<Checkbox disabled={form1Saved} name='subremark2' checked={Boolean(data.customer?.subremark2)} onChange={handleChecked} size="small" />} label={<Typography variant="body2">ซ่อมเสร็จส่งกลับ ปณ.</Typography>} />
                    <FormControlLabel control={<Checkbox disabled={form1Saved} name='subremark3' checked={Boolean(data.customer?.subremark3)} onChange={handleChecked} size="small" />} label={<Typography variant="body2">อื่นๆ</Typography>} />
                </Stack>
                {data.customer?.subremark3 && (
                    <TextField disabled={form1Saved} value={data.customer?.remark || ''} multiline minRows={2} name='remark' size='small' placeholder='ระบุรายละเอียดเพิ่มเติม...' onChange={handleChange} sx={{ bgcolor: 'white', mt: 1 }} />
                )}
            </FormControl>
        </Stack>
    );
}