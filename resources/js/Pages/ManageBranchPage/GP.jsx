import {Button, Card, CardContent, Stack, TextField, Typography} from "@mui/material";

export default function GP({gpVal,setGpVal,onSubmit}){
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    จัดการ GP
                </Typography>
                <Typography sx={{color: 'text.secondary', mb: 1.5}}>
                    ระบบจัดการ GP (Gross Profit) สำหรับร้านค้าหรือธุรกิจที่มีหลายสาขา
                    ช่วยให้เจ้าของร้านหรือผู้บริหารสามารถติดตาม กำไรขั้นต้น (GP)
                    ของแต่ละสาขาได้แบบเรียลไทม์ วิเคราะห์ต้นทุน รายได้ และกำไรของแต่ละร้าน
                    เพื่อวางแผนการดำเนินงานและเพิ่มประสิทธิภาพในการบริหารธุรกิจได้อย่างแม่นยำ
                </Typography>
                <TextField
                    type='number' fullWidth
                    defaultValue={gpVal}
                    onChange={(e) => setGpVal(e.target.value)}
                />
                <Stack direction='row-reverse' mt={2}>
                    <form onSubmit={onSubmit}>
                        <Button type='submit' size="small" variant='contained'>บันทึก</Button>
                    </form>
                </Stack>
            </CardContent>
        </Card>
    )
}
