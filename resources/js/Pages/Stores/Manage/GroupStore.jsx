import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Stack,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Snackbar,
    Alert
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

export default function GroupStore({ open, setOpen, shops, groups, fetchGroups, editingGroup }) {
    const [groupName, setGroupName] = useState("");
    const [selectedShops, setSelectedShops] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // โหลดค่าเริ่มต้นถ้าเป็นแก้ไข
    useEffect(() => {
        if (editingGroup) {
            setGroupName(editingGroup.name);
            setSelectedShops(editingGroup.stores.map(s => s.id));
        } else {
            setGroupName("");
            setSelectedShops([]);
        }
    }, [editingGroup, open]);

    // หาร้านที่ยังไม่อยู่ในกลุ่มอื่น
    const assignedShopIds = groups
        ? groups
            .filter(g => !editingGroup || g.id !== editingGroup.id)
            .flatMap(g => g.stores.map(s => s.id))
        : [];

    const availableShops = shops
        .filter(shop => !assignedShopIds.includes(shop.id))
        .filter(shop => shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleToggleShop = (shopId) => {
        setSelectedShops(prev =>
            prev.includes(shopId) ? prev.filter(id => id !== shopId) : [...prev, shopId]
        );
    };

    const handleSubmit = async () => {
        if (!groupName) {
            setSnackbar({ open: true, message: "กรุณากรอกชื่อกลุ่ม", severity: "warning" });
            return;
        }
        if (selectedShops.length === 0) {
            setSnackbar({ open: true, message: "กรุณาเลือกร้านอย่างน้อย 1 ร้าน", severity: "warning" });
            return;
        }

        try {
            if (editingGroup) {
                await axios.put(`/stock-sp/groupStore/${editingGroup.id}`, {
                    name: groupName,
                    store_ids: selectedShops,
                });
                setSnackbar({ open: true, message: "แก้ไขกลุ่มร้านค้าสำเร็จ 🎉", severity: "success" });
            } else {
                await axios.post("/stock-sp/groupStore", {
                    group_name: groupName,
                    selected_shops: selectedShops,
                });
                setSnackbar({ open: true, message: "สร้างกลุ่มร้านค้าสำเร็จ 🎉", severity: "success" });
            }

            fetchGroups();
            handleClose();
        } catch (error) {
            console.error(error);
            setSnackbar({ open: true, message: "บันทึกกลุ่มร้านค้าล้มเหลว ❌", severity: "error" });
        }
    };

    const handleClose = () => {
        setGroupName("");
        setSelectedShops([]);
        setSearchTerm("");
        setOpen(false);
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editingGroup ? "แก้ไขกลุ่มร้านค้า" : "สร้างกลุ่มร้านค้า"}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField
                            label="ชื่อกลุ่มร้านค้า"
                            fullWidth
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />

                        <TextField
                            label="ค้นหาร้านค้า"
                            fullWidth
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <Typography variant="subtitle1" fontWeight="bold">
                            เลือกร้านค้า
                        </Typography>
                        <Paper
                            variant="outlined"
                            sx={{
                                maxHeight: 250,
                                overflowY: "auto",
                                borderRadius: 1,
                            }}
                        >
                            <List dense>
                                {availableShops.length > 0 ? (
                                    availableShops.map((shop) => (
                                        <ListItem
                                            key={shop.id}
                                            button
                                            onClick={() => handleToggleShop(shop.id)}
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={selectedShops.includes(shop.id)}
                                                    tabIndex={-1}
                                                />
                                            </ListItemIcon>
                                            <ListItemText primary={shop.shop_name} />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                                        ไม่มีร้านค้าที่ว่างให้เลือก
                                    </Typography>
                                )}
                            </List>
                        </Paper>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color="inherit">ยกเลิก</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingGroup ? "บันทึกการแก้ไข" : "บันทึก"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
