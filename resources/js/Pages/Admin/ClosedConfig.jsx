import React, { useEffect, useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    OutlinedInput,
    Checkbox,
    ListItemText,
} from "@mui/material";
import ListClosedConfig from "./ListClosedConfig";

export default function ClosedConfig() {
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [form, setForm] = useState({
        groups: [],
        title: "",
        detail: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        axios.get("/api/getgroup").then((res) => {
            if (res.data.status) {
                setGroups(res.data.data);
            }
        });
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                title: form.title,
                message: form.detail, // map ให้ตรงกับ DB (detail → message)
                groups: form.groups.map((g) => parseInt(g)), // string → int
                start_at: form.startDate,
                end_at: form.endDate || null,
            };

            const res = await axios.post("/admin/config/notifications", payload);

            if (res.data.status) {
                alert("บันทึกสำเร็จ!");
                setOpen(false);
                setForm({
                    groups: [],
                    title: "",
                    detail: "",
                    startDate: "",
                    endDate: "",
                });
            }
        } catch (err) {
            console.error(err.response?.data || err);
            alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || "ไม่สามารถบันทึกได้"));
        }
    };


    return (
        <AuthenticatedLayout>
            {/* ปุ่มเปิด modal */}
            <div className="p-6">
                <Button
                    variant="contained"
                    color="warning"
                    onClick={() => setOpen(true)}
                >
                    ตั้งค่าการแจ้งเตือนปิดระบบ
                </Button>
            </div>
            <ListClosedConfig />
            {/* Modal */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>ตั้งค่าการแจ้งเตือนปิดระบบ</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent className="space-y-4">
                        {/* กลุ่มลูกค้า */}
                        <FormControl fullWidth>
                            <InputLabel id="groups-label">กลุ่มลูกค้า</InputLabel>
                            <Select
                                labelId="groups-label"
                                multiple
                                value={form.groups}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        groups: e.target.value,
                                    })
                                }
                                input={<OutlinedInput label="กลุ่มลูกค้า" />}
                                renderValue={(selected) =>
                                    groups
                                        .filter((g) => selected.includes(g.id.toString()))
                                        .map((g) => g.name)
                                        .join(", ")
                                }
                            >
                                {groups.map((g) => (
                                    <MenuItem key={g.id} value={g.id.toString()}>
                                        <Checkbox
                                            checked={form.groups.includes(g.id.toString())}
                                        />
                                        <ListItemText primary={g.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* หัวข้อ */}
                        <TextField
                            label="หัวข้อ"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            fullWidth
                        />

                        {/* รายละเอียด */}
                        <TextField
                            label="รายละเอียด"
                            name="detail"
                            value={form.detail}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        />

                        {/* วันที่เวลาเริ่ม */}
                        <TextField
                            label="เริ่ม"
                            type="datetime-local"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        {/* วันที่เวลาสิ้นสุด */}
                        <TextField
                            label="สิ้นสุด"
                            type="datetime-local"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpen(false)} color="secondary">
                            ยกเลิก
                        </Button>
                        <Button type="submit" variant="contained" color="warning">
                            บันทึก
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </AuthenticatedLayout>
    );
}
