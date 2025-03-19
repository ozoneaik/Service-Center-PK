import { useForm } from "@inertiajs/react";
import { Button, Dialog, DialogContent, Stack, TextField, Typography } from "@mui/material";

export default function AddStore({ addStoreOpen, setAddStoreOpen }) {
    const { data, setData,processing,errors,recentlySuccessful } = useForm({ is_code_cust_id: '', shop_name: "", address: "", phone: "", gp: 0 });
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("บันทึกข้อมูลร้านค้า:", data);
        setAddStoreOpen(false);
    };
    const feilds = [
        { key: "is_code_cust_id", label: "รหัสร้าน",type : 'text' },
        { key: "shop_name", label: "ชื่อร้าน",type : 'text' },
        { key: "address", label: "ที่อยู่",type : 'text' },
        { key: "phone", label: "เบอร์โทรศัพท์",type : 'number' },
        // { key: "gp", label: "GP",type : 'number' }
    ]

    return (
        <Dialog open={addStoreOpen} onClose={() => setAddStoreOpen(false)} fullWidth maxWidth="sm">
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <Typography variant="h6">เพิ่มศูนย์ซ่อม</Typography>
                        {feilds.map((item, index) => (
                            <TextField
                                key={index}
                                label={item.label}
                                value={data[item.key]}
                                onChange={(e) => setData(item.key, e.target.value)}
                                fullWidth type={item.type}
                                size="small" required
                            />
                        ))}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button onClick={() => setAddStoreOpen(false)} variant="outlined">ยกเลิก</Button>
                            <Button type="submit" variant="contained">บันทึก</Button>
                        </Stack>
                    </Stack>
                </form>
            </DialogContent>
        </Dialog>
    );
}
