import { useMemo } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

export default function WithdrawSum({ open, setOpen, items, onQty, onRemove, onSubmit }) {
    const total = useMemo(() => items.reduce((a, b) => a + (b.qty || 1), 0), [items]);

    return (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>สรุปรายการเบิกอะไหล่</DialogTitle>
            <DialogContent>
                {items.length === 0 ? (
                    <Typography>ยังไม่มีรายการในตะกร้าเบิก</Typography>
                ) : (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        {items.map((it) => (
                            <Paper key={it.spcode} variant="outlined" sx={{ p: 1.5 }}>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                                    <Box flex={1}>
                                        <Typography fontWeight={600}>{it.spname}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {it.spcode}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Button size="small" variant="outlined" onClick={() => onQty(it.spcode, Math.max(1, (it.qty || 1) - 1))}>
                                            -
                                        </Button>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={it.qty || 1}
                                            onChange={(e) => onQty(it.spcode, Math.max(1, parseInt(e.target.value || 1)))}
                                            sx={{ width: 80 }}
                                            inputProps={{ min: 1 }}
                                        />
                                        <Button size="small" variant="outlined" onClick={() => onQty(it.spcode, (it.qty || 1) + 1)}>
                                            +
                                        </Button>
                                        <Button size="small" color="error" onClick={() => onRemove(it.spcode)}>
                                            ลบ
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Paper>
                        ))}
                        <Divider />
                        <Typography textAlign="right" fontWeight={700}>
                            รวมจำนวน: {total}
                        </Typography>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>ปิด</Button>
                <Button variant="contained" onClick={onSubmit} disabled={items.length === 0}>
                    ยืนยันสร้างใบเบิก
                </Button>
            </DialogActions>
        </Dialog>
    );
}