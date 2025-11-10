import { Box, Stack, TextField, IconButton, Button, Badge, Typography } from "@mui/material";
import { Search, Tune } from "@mui/icons-material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import { router } from "@inertiajs/react";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function MobileHeader({
    searchValue,
    setSearchValue,
    onSubmit,
    showModelPickerSlot,

    cartCount = 0,
    onCartClick,
    onHistoryClick,
}) {
    return (
        <Box sx={{ position: "sticky", top: 0, zIndex: 1100, bgcolor: "white", pt: 1, pb: 1.5 }}>
            {/* หัวข้อ */}
            <Typography variant="h8" fontWeight="bold" sx={{ px: 1.5 }}>
                เบิกอะไหล่สำหรับศูนย์บริการ
            </Typography>
            {/* แถวค้นหา */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1.5, mt: 1.5 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                    }}
                >
                    {/* ปุ่มย้อนกลับ */}
                    <Typography
                        component="div"
                        onClick={() => router.get(route("withdrawJob.index"))}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "primary.main",
                            "&:hover": {
                                color: "primary.main",
                            },
                        }}
                    >
                        <ArrowBackIosIcon sx={{ fontSize: 20 }} />
                    </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                    <form onSubmit={onSubmit}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="ค้นหาอะไหล่ / SKU"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: "text.disabled" }} />,
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 999,
                                    bgcolor: "#F5F6F7",
                                },
                            }}
                        />
                    </form>
                </Box>

                <IconButton size="small" sx={{ bgcolor: "#F5F6F7" }}>
                    <Tune fontSize="small" />
                </IconButton>
            </Stack>

            {/* ตัวเลือกโมเดล (ถ้ามี) */}
            {showModelPickerSlot && <Box sx={{ px: 1.5, pt: 1 }}>{showModelPickerSlot}</Box>}

            {/* ปุ่มตะกร้า & ประวัติ */}
            {/* <Stack direction="row" spacing={1} sx={{ px: 1.5, pt: 1 }}>
                <Button
                    onClick={onCartClick}
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="small"
                    startIcon={
                        <Badge color="error" badgeContent={cartCount > 0 ? cartCount : null}>
                            <AddShoppingCartIcon fontSize="small" />
                        </Badge>
                    }
                    sx={{ textTransform: "none" }}
                >
                    ตะกร้าเบิก
                </Button>

                <Button
                    onClick={onHistoryClick}
                    variant="contained"
                    color="warning"
                    fullWidth
                    size="small"
                    startIcon={<HistoryIcon fontSize="small" />}
                    sx={{ textTransform: "none" }}
                >
                    ประวัติการเบิก
                </Button>
            </Stack> */}
        </Box>
    );
}