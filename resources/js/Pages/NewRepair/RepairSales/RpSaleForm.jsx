import {
    Box,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputAdornment,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
    Divider,
    Card,
    CardContent,
    Chip
} from "@mui/material";
import { Store } from "@mui/icons-material";
import { useState } from "react";
import axios from "axios";

export default function RpSaleForm({ data, setData, form1Saved, JOB }) {
    const [loadingPhone, setLoadingPhone] = useState(false);

    const handleChange = async (e) => {
        const { name, value } = e.target;

        let newData = {
            ...data.customer,
            [name]: value
        };
        setData('customer', newData);

        // Auto-fetch logic for phone number
        if (name === 'phone' && value.length === 10) {
            setLoadingPhone(true);
            try {
                // Adjust route as needed based on your backend
                const res = await axios.get(route('repair.check.phone'), {
                    params: { phone: value }
                });

                if (res.data.found) {
                    setData('customer', {
                        ...newData,
                        name: res.data.name || '',
                        address: res.data.address || ''
                    });
                }
            } catch (error) {
                console.error("Error checking phone:", error);
            } finally {
                setLoadingPhone(false);
            }
        }
    }

    const handleChecked = (e) => {
        const { name, checked } = e.target;
        setData('customer', {
            ...data.customer,
            [name]: checked
        })
    }

    // Determine Shop Name and Code from JOB prop
    const shopName = JOB?.cust_name || JOB?.customer?.name || '-';
    const shopCode = JOB?.cust_code || JOB?.customer?.code || '-';

    return (
        <Stack direction='column' spacing={3}>
            
            {/* --- 1. Shop Information Header --- */}
            <Box sx={{ p: 2, border: '1px dashed #bdbdbd', borderRadius: 2, bgcolor: '#f9f9f9' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Store color="primary" fontSize="small" />
                            <Typography variant="subtitle2" color="text.secondary">
                                (ส่งจากร้าน) ชื่อศูนย์บริการที่เลือก (รหัส)
                            </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight="bold" color="#1976d2">
                            {shopName} <Typography component="span" color="text.secondary">({shopCode})</Typography>
                        </Typography>
                    </Box>
                    <Chip label="ศูนย์บริการ" size="small" color="primary" variant="outlined" />
                </Stack>
            </Box>

            <Divider />

            {/* --- 2. Contact Info --- */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                    <FormLabel required>เบอร์โทรศัพท์</FormLabel>
                    <TextField
                        value={data.customer?.phone || ''}
                        id='phone' name='phone' size='small'
                        placeholder='999999' type='number'
                        required onChange={handleChange}
                        disabled={form1Saved}
                        slotProps={{
                            input: {
                                endAdornment: loadingPhone ? (
                                    <InputAdornment position="end">
                                        <CircularProgress size={20} />
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                    />
                </FormControl>

                <FormControl fullWidth>
                    <FormLabel required>ชื่อ-นามสกุล</FormLabel>
                    <TextField
                        value={data.customer?.name || ''}
                        id='name' name='name' size='small'
                        placeholder='xxxxxxx'
                        required onChange={handleChange}
                        disabled={loadingPhone || form1Saved}
                    />
                </FormControl>
            </Stack>

            {/* --- 3. Address & Delivery Options --- */}
            <Box>
                <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                    <FormLabel component="legend" required sx={{ mb: 1 }}>ที่อยู่ / การจัดส่ง</FormLabel>
                    <RadioGroup
                        row
                        aria-label="delivery_type"
                        name="delivery_type"
                        value={data.customer?.delivery_type || 'shop'} // Default
                        onChange={handleChange}
                    >
                        <FormControlLabel 
                            value="shop" 
                            control={<Radio size="small" disabled={form1Saved} />} 
                            label="ส่งถึงร้านลูกค้า" 
                        />
                        <FormControlLabel 
                            value="customer" 
                            control={<Radio size="small" disabled={form1Saved} />} 
                            label="ส่งถึงลูกค้า (ร้านค้า)" 
                        />
                        <FormControlLabel 
                            value="sales" 
                            control={<Radio size="small" disabled={form1Saved} />} 
                            label="เซลล์รับเอง" 
                        />
                    </RadioGroup>
                </FormControl>

                <FormControl fullWidth>
                    <FormLabel>ที่อยู่ในการจัดส่ง</FormLabel>
                    <TextField
                        value={data.customer?.address || ''}
                        multiline minRows={2}
                        sx={{ bgcolor: 'white' }}
                        id='address' name='address' size='small'
                        placeholder='xxxxxxxxx'
                        onChange={handleChange}
                        disabled={loadingPhone || form1Saved}
                    />
                </FormControl>
            </Box>

            {/* --- 4. Remarks --- */}
            <FormControl>
                <FormLabel>หมายเหตุความต้องการของลูกค้า</FormLabel>
                <Stack direction={{ md: 'row', sm: 'column' }} spacing={1} sx={{ mt: 1, mb: 1 }}>
                    <FormControlLabel control={
                        <Checkbox
                            disabled={form1Saved}
                            name='subremark1' id='subremark1'
                            checked={Boolean(data.customer?.subremark1)}
                            onChange={handleChecked}
                        />
                    } label="เสนอราคาก่อนซ่อม" />
                    <FormControlLabel control={
                        <Checkbox
                            disabled={form1Saved}
                            name='subremark2' id='subremark2'
                            checked={Boolean(data.customer?.subremark2)}
                            onChange={handleChecked}
                        />
                    } label="ซ่อมเสร็จส่งกลับทางไปรษณีย์" />
                    <FormControlLabel control={
                        <Checkbox
                            disabled={form1Saved}
                            name='subremark3' id='subremark3'
                            checked={Boolean(data.customer?.subremark3)}
                            onChange={handleChecked}
                        />
                    } label="อื่นๆ" />
                </Stack>
                
                {data.customer?.subremark3 && (
                    <TextField
                        disabled={form1Saved}
                        value={data.customer?.remark || ''}
                        multiline minRows={2}
                        sx={{ bgcolor: 'white' }}
                        id='remark' name='remark' size='small'
                        placeholder='หมายเหตุเพิ่มเติม...'
                        required onChange={handleChange}
                    />
                )}
            </FormControl>
        </Stack>
    )
}