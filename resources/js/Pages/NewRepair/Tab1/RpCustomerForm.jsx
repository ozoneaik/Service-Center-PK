import {
    Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Stack, TextField
} from "@mui/material";

export default function RpCustomerForm({data, setData}) {

    const handleChange = (e) => {
        const {name, value} = e.target;
        setData('customer', {
            ...data.customer,
            [name]: value
        })
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
                    value={data.customer.phone || ''}
                    id='phone' name='phone' size='small'
                    placeholder='ตัวอย่าง : 081-234-5678' type='number'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel required>ชื่อ-นามสกุล</FormLabel>
                <TextField
                    value={data.customer.name || ''}
                    id='name' name='name' size='small'
                    placeholder='ตัวอย่าง : มานี มานะ'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel required>ที่อยู่</FormLabel>
                <TextField
                    value={data.customer.address || ''}
                    multiline minRows={3}
                    sx={{bgcolor: 'white'}}
                    id='address' name='address' size='small'
                    placeholder='ตัวอย่าง : บ้าน x ซอย x แขวง x กทม xxxxx'
                    required onChange={handleChange}
                />
            </FormControl>

            <FormControl>
                <FormLabel required>หมายเหตุความต้องการของลูกค้า</FormLabel>

                <Stack direction={{md: 'row', sm: 'column'}} spacing={1}>
                    <FormControlLabel control={
                        <Checkbox
                            name='subremark1' id='subremark1'
                            checked={Boolean(data.customer.subremark1)}
                            onChange={handleChecked}
                        />
                    } label="เสนอราคาก่อนซ่อม"/>
                    <FormControlLabel control={
                        <Checkbox
                            name='subremark2' id='subremark2'
                            checked={Boolean(data.customer.subremark2)}
                            onChange={handleChecked}
                        />
                    } label="ซ่อมเสร็จส่งกลับทางไปรษณีย์"/>
                    <FormControlLabel control={
                        <Checkbox
                            name='subremark3' id='subremark3'
                            checked={Boolean(data.customer.subremark3)}
                            onChange={handleChecked}
                        />
                    } label="อื่นๆ"/>
                </Stack>
                {data.customer.subremark3 && (
                    <TextField
                        value={data.customer.remark || ''}
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
