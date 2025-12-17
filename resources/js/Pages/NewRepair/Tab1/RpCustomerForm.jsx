import {
    Checkbox, CircularProgress, FormControl, FormControlLabel, FormGroup, FormLabel, InputAdornment, Stack, TextField
} from "@mui/material";
import { useState } from "react";

export default function RpCustomerForm({data, setData,form1Saved}) {
    const [loadingPhone, setLoadingPhone] = useState(false);
    // const handleChange = (e) => {
    //     const {name, value} = e.target;
    //     setData('customer', {
    //         ...data.customer,
    //         [name]: value
    //     })
    // }

    const handleChange = async (e) => {
        const { name, value } = e.target;

        let newData = {
            ...data.customer,
            [name]: value
        };
        setData('customer', newData);

        if (name === 'phone' && value.length === 10) {
            setLoadingPhone(true);
            try {
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
        const {name, checked} = e.target;
        setData('customer', {
            ...data.customer,
            [name]: checked
        })
    }

    return (
        <Stack direction='column' spacing={2}>
            <FormControl>
                <FormLabel required>เบอร์โทรศัพท์</FormLabel>
                <TextField
                    // disabled={form1Saved}
                    value={data.customer?.phone || ''}
                    id='phone' name='phone' size='small'
                    placeholder='ตัวอย่าง : 081-234-5678' type='number'
                    required onChange={handleChange}
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

            <FormControl>
                <FormLabel required>ชื่อ-นามสกุล</FormLabel>
                <TextField
                    // disabled={form1Saved}
                    value={data.customer?.name || ''}
                    id='name' name='name' size='small'
                    placeholder='ตัวอย่าง : มานี มานะ'
                    required onChange={handleChange}
                    disabled={loadingPhone || form1Saved}
                />
            </FormControl>

            <FormControl>
                <FormLabel>ที่อยู่</FormLabel>
                <TextField
                    // disabled={form1Saved}
                    value={data.customer?.address || ''}
                    multiline minRows={3}
                    sx={{bgcolor: 'white'}}
                    id='address' name='address' size='small'
                    placeholder='ตัวอย่าง : บ้าน x ซอย x แขวง x กทม xxxxx'
                    onChange={handleChange}
                    disabled={loadingPhone || form1Saved}
                />
            </FormControl>

            <FormControl>
                <FormLabel>หมายเหตุความต้องการของลูกค้า</FormLabel>

                <Stack direction={{md: 'row', sm: 'column'}} spacing={1}>
                    <FormControlLabel control={
                        <Checkbox
                            // disabled={form1Saved}
                            name='subremark1' id='subremark1'
                            checked={Boolean(data.customer?.subremark1)}
                            onChange={handleChecked}
                        />
                    } label="เสนอราคาก่อนซ่อม"/>
                    <FormControlLabel control={
                        <Checkbox
                            // disabled={form1Saved}
                            name='subremark2' id='subremark2'
                            checked={Boolean(data.customer?.subremark2)}
                            onChange={handleChecked}
                        />
                    } label="ซ่อมเสร็จส่งกลับทางไปรษณีย์"/>
                    <FormControlLabel control={
                        <Checkbox
                            // disabled={form1Saved}
                            name='subremark3' id='subremark3'
                            checked={Boolean(data.customer?.subremark3)}
                            onChange={handleChecked}
                        />
                    } label="อื่นๆ"/>
                </Stack>
                {data.customer?.subremark3 && (
                    <TextField
                        // disabled={form1Saved}
                        value={data.customer?.remark || ''}
                        multiline minRows={3}
                        sx={{bgcolor: 'white'}}
                        id='remark' name='remark' size='small'
                        placeholder='หมายเหตุสำหรับลูกค้าในการสื่อสาร เช่น ลูกค้าจะเข้ามารับวันไหน,ลูกค้าต้องการให้ตวรจสอบเครื่องเพิ่มเติมจุดไหนเป็นพิเศษ'
                        required onChange={handleChange}
                    />
                )}
            </FormControl>
        </Stack>
    )
}
