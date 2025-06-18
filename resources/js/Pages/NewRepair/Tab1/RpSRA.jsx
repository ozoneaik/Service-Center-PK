import {FormControl, FormLabel, Stack, TextField} from "@mui/material";

export default function RpSRA({data, setData,form1Saved}) {

    const handleChange = (e) => {
        const {name, value} = e.target;
        setData('remark_symptom_accessory', {
            ...data.remark_symptom_accessory,
            [name]: value
        })
    }

    return (
        <Stack direction='column' spacing={2}>
            <FormControl>
                <FormLabel required>กรอกอาการเบื้องต้น</FormLabel>
                <TextField
                    // disabled={form1Saved}
                    value={data.remark_symptom_accessory?.symptom || ''}
                    multiline minRows={3} sx={{bgcolor: 'white'}}
                    id='symptom' name='symptom' size='small'
                    placeholder='กรอกอาการเบื้องต้นที่ได้รับแจ้งจากลูกค้า'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel>หมายเหตุอุปกรณ์เสริม</FormLabel>
                <TextField
                    // disabled={form1Saved}
                    value={data.remark_symptom_accessory?.accessory || ''}
                    multiline minRows={3} sx={{bgcolor: 'white'}}
                    id='accessory' name='accessory' size='small'
                    placeholder='ระบุอุปกรณ์เสริม (กรณีที่มีอุปกรณ์เสริมของลูกค้ามาด้วย)'
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel>หมายเหตุสำหรับสื่อสารภายในศูนย์ซ่อม</FormLabel>
                <TextField
                    // disabled={form1Saved}
                    value={data.remark_symptom_accessory?.remark || ''}
                    multiline minRows={3} sx={{bgcolor: 'white'}}
                    id='remark' name='remark' size='small'
                    placeholder='หมายเหตุ เช่น ลูกค้าดัดแปลงสภาพเครื่อง,ลูกค้าเคยส่งซ่อมทั้งหมด ... เครื่อง'
                    onChange={handleChange}
                />
            </FormControl>


        </Stack>
    )
}
