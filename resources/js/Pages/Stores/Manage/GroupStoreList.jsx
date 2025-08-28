import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, usePage } from "@inertiajs/react";
import {
    Container,
    Button,
    Stack,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";
import GroupStore from "./GroupStore.jsx";
import axios from "axios";

export default function GroupStoreList() {
    const { shops } = usePage().props;
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [editingGroup, setEditingGroup] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const fetchGroups = async () => {
        try {
            const res = await axios.get("/stock-sp/getGroup");
            setGroups(res.data);
        } catch (error) {
            console.error("❌ ดึงข้อมูลกลุ่มล้มเหลว:", error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleDeleteStore = async (groupId, storeId) => {
        if (!confirm("คุณแน่ใจว่าต้องการลบร้านค้านี้?")) return;
        try {
            await axios.delete(`/stock-sp/groupStore/${groupId}/store/${storeId}`);
            fetchGroups();
        } catch (error) {
            console.error("❌ ลบร้านค้าล้มเหลว:", error);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบกลุ่มนี้?")) return;

        try {
            await axios.delete(`/stock-sp/groupStoreDestroy/${groupId}`);

            // อัปเดต state โดยตรง
            setGroups((prev) => prev.filter((g) => g.id !== groupId));

            // ถ้าอยากดึงข้อมูลจาก DB ใหม่ก็ยังใช้ fetchGroups() ได้
            // await fetchGroups();

            console.log("✅ ลบกลุ่มสำเร็จ");
        } catch (error) {
            console.error("❌ ลบกลุ่มล้มเหลว:", error);
        }
    };


    const handleEditStore = (group, store) => {
        console.log("แก้ไขร้านค้า:", group, store);
    };

    return (
        <AuthenticatedLayout>
            <Head title="รายการกลุ่มร้านค้า" />

            <GroupStore
                open={open}
                setOpen={setOpen}
                shops={shops}
                groups={groups}
                fetchGroups={fetchGroups}
                editingGroup={editingGroup}
            />

            <Container maxWidth="xl" sx={{ mt: 4, background: "#FFF",py: 4, borderRadius: 2 ,boxShadow: 3}}>
                {/* Header */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                    mb={3}
                >
                    <Typography variant="h4" fontWeight="bold">
                        กลุ่มร้านค้า
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setEditingGroup(null);
                            setOpen(true);
                        }}
                        sx={{ boxShadow: 3 }}
                    >
                        + สร้างกลุ่มร้านค้า
                    </Button>
                </Stack>

                {groups.length === 0 ? (
                    <Typography color="text.secondary">ยังไม่มีข้อมูลกลุ่มร้านค้า</Typography>
                ) : (
                    groups.map((group) => (
                        <Accordion
                            key={group.id}
                            sx={{
                                mb: 2,
                                borderRadius: 2,
                                boxShadow: 3,
                                "&:before": { display: "none" },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    backgroundColor: "#e3f2fd",
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.5,
                                }}
                            >
                                <Typography variant="h6" fontWeight="medium" sx={{ flexGrow: 1 }}>
                                    {group.name}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        component="span"    // 🔑 ป้องกัน nested button
                                        size="small"
                                        variant="outlined"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingGroup(group);
                                            setOpen(true);
                                        }}
                                    >
                                        แก้ไข
                                    </Button>
                                    <Button
                                        component="span"    // 🔑 ป้องกัน nested button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteGroup(group.id);
                                        }}
                                    >
                                        ลบกลุ่ม
                                    </Button>
                                </Stack>
                            </AccordionSummary>


                            <AccordionDetails sx={{ px: 0, pb: 2 }}>
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        width: "98%",
                                        mx: 2,
                                        boxShadow: 2,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "#1976d2" }}>
                                                {["ชื่อร้าน", "เบอร์โทร", "จังหวัด"].map((title) => (
                                                    <TableCell
                                                        key={title}
                                                        sx={{
                                                            color: "white",
                                                            fontWeight: "bold",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {title}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(group.stores || []).map((store, index) => (
                                                <TableRow
                                                    key={store.id}
                                                    sx={{
                                                        backgroundColor:
                                                            index % 2 === 0 ? "rgba(25, 118, 210, 0.05)" : "white",
                                                        "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.15)" },
                                                        transition: "0.3s",
                                                    }}
                                                >
                                                    <TableCell sx={{ textAlign: "center", fontWeight: 500 }}>
                                                        {store.shop_name}
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{store.phone}</TableCell>
                                                    <TableCell sx={{ textAlign: "center" }}>{store.province}</TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Container>
        </AuthenticatedLayout>
    );
}
