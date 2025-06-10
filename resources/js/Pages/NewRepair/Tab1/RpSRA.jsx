import {FormControl, FormLabel, Stack, TextField} from "@mui/material";

export default function RpSRA() {

    const handleChange = (e) => {
        const {name, value} = e.target;
        console.log(name, value);
    }
    return (
        <Stack direction='column' spacing={2}>
            <FormControl>
                <FormLabel required>กรอกอาการเบื้องต้น</FormLabel>
                <TextField
                    multiline minRows={3} sx={{bgcolor: 'white'}}
                    id='customer-symptom' name='customer-symptom' size='small'
                    placeholder='กรอกอาการเบื้องต้นที่ได้รับเข้าจากลูกค้า'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel required>หมายเหตุอุปกรณ์เสริม</FormLabel>
                <TextField
                    multiline minRows={3} sx={{bgcolor: 'white'}}
                    id='customer-accessory' name='customer-accessory' size='small'
                    placeholder='หมายเหตุอุปกรณ์เสริม'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel required>หมายเหตุสำหรับสื่อสารภายใน</FormLabel>
                <TextField
                    multiline minRows={3} sx={{bgcolor: 'white'}}
                    id='customer-remark' name='customer-remark' size='small'
                    placeholder='หมายเหตุการซ่อมของช่างเทคนิค สำหรับการสื่อสารภายในศูนย์ซ่อม เช่น ตรวจสอบเครื่องเรียบร้อยแล้ว รอเสนอราคา'
                    required onChange={handleChange}
                />
            </FormControl>


        </Stack>
    )
}
