import {
    Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Stack, TextField
} from "@mui/material";

export default function RpCustomerForm() {

    const handleChange = (e) => {
        const {name, value} = e.target;
        console.log(name, value);
    }
    return (
        <Stack direction='column' spacing={2}>
            <FormControl>
                <FormLabel required>เบอร์โทรศัพท์</FormLabel>
                <TextField
                    id='customer-phone' name='customer-phone' size='small'
                    placeholder='ตัวอย่าง : 081-234-5678' type='number'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel required>ชื่อ-นามสกุล</FormLabel>
                <TextField
                    id='customer-name' name='customer-name' size='small'
                    placeholder='ตัวอย่าง : มานี มานะ'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel required>ที่อยู่</FormLabel>
                <TextField
                    multiline minRows={3}
                    sx={{bgcolor: 'white'}}
                    id='customer-address' name='customer-address' size='small'
                    placeholder='ตัวอย่าง : บ้าน x ซอย x แขวง x กทม xxxxx'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel required>หมายเหตุความต้องการของลูกค้า</FormLabel>

                <Stack direction={{md : 'row', sm : 'column'}} spacing={1}>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox defaultChecked/>} label="เสนอราคาก่อนซ่อม"/>
                    </FormGroup>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox defaultChecked/>} label="ซ่อมเสร็จส่งกลับทางไปรษณีย์"/>
                    </FormGroup>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox defaultChecked/>} label="อื่นๆ"/>
                    </FormGroup>
                </Stack>
                <TextField
                    multiline minRows={3}
                    sx={{bgcolor: 'white'}}
                    id='customer-name' name='customer-name' size='small'
                    placeholder='หมายเหตุสำหรับลูกค้าในการสื่อสาร เช่น ลูกค้าให้ส่งใบเสนอราคาก่อนซ่อม,ลูกค้าต้องการให้จัดส่งตามที่อยู่การจัดส่ง'
                    required onChange={handleChange}
                />
            </FormControl>
        </Stack>
    )
}
