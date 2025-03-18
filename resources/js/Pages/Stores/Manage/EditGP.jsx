import { Button, Dialog, DialogContent, Stack, TextField, Typography } from "@mui/material";

export default function EditGP({ is_code_cust_id, gp_val = 0, open, setOpen }) {
    const handleClose = (e, reason) => {
        console.log(e, reason);
        if (reason === 'escapeKeyDown' || reason === 'backdropClick') {
            return;
        }
        setOpen(false);

    }
    return (
        <Dialog
            open={open}
            onClose={(e, reason) => handleClose(e, reason)}
        >
            <DialogContent>
                <Stack direction='column' spacing={2}>
                    <Typography>ค่า GP</Typography>
                    <Typography variant="body2">
                        ระบบจัดการ GP (Gross Profit) สำหรับร้านค้าหรือธุรกิจที่มีหลายสาขา ช่วยให้เจ้าของร้านหรือผู้บริหารสามารถติดตาม กำไรขั้นต้น (GP)
                         ของแต่ละสาขาได้แบบเรียลไทม์ วิเคราะห์ต้นทุน รายได้ และกำไรของแต่ละร้าน เพื่อวางแผนการดำเนินงานและเพิ่มประสิทธิภาพในการบริหารธุรกิจได้อย่างแม่นยำ
                    </Typography>
                    <TextField type="number" value={gp_val} />
                    <Button variant="contained">บันทึก</Button>
                    <Button onClick={() => setOpen(false)} variant="outlined">ยกเลิก</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}