import { Button, Checkbox, Dialog, DialogContent, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function AddStore({ addStoreOpen, setAddStoreOpen }) {
    // สร้าง state สำหรับเก็บข้อมูลร้านค้า
    const [storeData, setStoreData] = useState({
        shop_name: "",
        address: "",
        phone: "",
        is_code_cust_id: false
    });

    // ฟังก์ชันจัดการการปิด dialog
    const handleClose = (e, reason) => {
        console.log(e, reason);
        if (reason === 'escapeKeyDown' || reason === 'backdropClick') {
            return;
        }
        setAddStoreOpen(false);
    };

    // ฟังก์ชันอัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลงใน input
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setStoreData({
            ...storeData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    // ฟังก์ชันสำหรับบันทึกข้อมูล
    const handleSubmit = () => {
        console.log("บันทึกข้อมูลร้านค้า:", storeData);
        // ตรงนี้คุณสามารถเพิ่มโค้ดสำหรับส่งข้อมูลไปยัง API ได้
        setAddStoreOpen(false);
    };

    return (
        <Dialog
            open={addStoreOpen}
            onClose={(e, reason) => handleClose(e, reason)}
            fullWidth
            maxWidth="sm"
        >
            <DialogContent>
                <Stack direction="column" spacing={3}>
                    <Typography variant="h6">เพิ่มร้านค้า</Typography>

                    <TextField
                        fullWidth
                        label="ชื่อร้านค้า"
                        name="shop_name"
                        value={storeData.shop_name}
                        onChange={handleChange}
                        variant="outlined"
                    />

                    <TextField
                        id="claim-remark"
                        fullWidth
                        label="ที่อยู่"
                        name="address"
                        value={storeData.address}
                        onChange={handleChange}
                        variant="outlined"
                        multiline
                        rows={3}
                    />

                    <TextField
                        fullWidth
                        label="เบอร์โทรศัพท์"
                        name="phone"
                        value={storeData.phone}
                        onChange={handleChange}
                        variant="outlined"
                    />

                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            onClick={() => setAddStoreOpen(false)}
                            variant="outlined"
                            color="error"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                        >
                            บันทึก
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}