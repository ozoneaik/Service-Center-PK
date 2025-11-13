import { useState } from "react";
import axios from "axios";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {
    Box,
    Button,
    Stack,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useMediaQuery,
} from "@mui/material";
import { showDefaultImage } from "@/utils/showImage.js";
import { AlertDialog } from "@/Components/AlertDialog";

const DEFAULT_SP_IMG =
    (import.meta.env.VITE_IMAGE_SP || "https://images.dcpumpkin.com/images/product/500/") + "default.jpg";

export default function WithdrawRowView({ spList = [], onAdded, onPreview }) {
    const [loadingId, setLoadingId] = useState(null);
    const isMobile = useMediaQuery("(max-width:900px)");

    // const handleAddToCart = async (sp) => {
    //     try {
    //         setLoadingId(sp.spcode);
    //         const { status } = await axios.post(route("withdrawSp.carts.add"), {
    //             ...sp,
    //             skufg: sp.skufg,
    //             pname: sp.pname,
    //             remark: "มาจากการเบิก",
    //         });
    //         if (status === 200) onAdded?.(sp);
    //     } catch (e) {
    //         alert(e?.response?.data?.message || e.message);
    //     } finally {
    //         setLoadingId(null);
    //     }
    // };

    // const handleAddToCart = async (sp) => {
    //     try {
    //         const stockQty = Number(sp.stock_balance ?? 0);
    //         if (stockQty <= 0) {
    //             AlertDialog({
    //                 title: "สต็อกไม่เพียงพอ",
    //                 text: `สินค้า "${sp.spname}" ไม่มีสต็อกคงเหลือ ไม่สามารถเพิ่มในตะกร้าได้`,
    //                 icon: "warning",
    //             });
    //             return;
    //         }

    //         setLoadingId(sp.spcode);

    //         const { status } = await axios.post(route("withdrawSp.carts.add"), {
    //             ...sp,
    //             skufg: sp.skufg,
    //             pname: sp.pname,
    //             remark: "มาจากการเบิก",
    //         });

    //         if (status === 200) {
    //             onAdded?.(sp);
    //         }
    //     } catch (e) {
    //         alert(e?.response?.data?.message || e.message);
    //     } finally {
    //         setLoadingId(null);
    //     }
    // };

    const handleAddToCart = async (sp) => {
        try {
            setLoadingId(sp.spcode);

            const { data, status } = await axios.post(route("withdrawSp.carts.add"), {
                ...sp,
                skufg: sp.skufg,
                pname: sp.pname,
                remark: "มาจากการเบิก",
            });

            if (status === 200) {
                if (data.message === "out_of_stock") {
                    AlertDialog({
                        title: "สต็อกไม่เพียงพอ",
                        text: `สินค้า "${sp.spname}" ไม่มีสต็อกคงเหลือในระบบ`,
                        icon: "warning",
                    });
                } else if (data.message === "already_added") {
                    AlertDialog({
                        title: "มีในตะกร้าแล้ว",
                        text: `อะไหล่ "${sp.spname}" <br/> ถูกเพิ่มโดยเครื่องอื่นแล้ว <br/> กรุณากดถัดไปเพื่อดำเนินการต่อ`,
                        icon: "info",
                    });
                    onAdded?.(sp);
                } else if (data.message === "success") {
                    onAdded?.(sp);
                }
            }
        } catch (e) {
            alert(e?.response?.data?.message || e.message);
        } finally {
            setLoadingId(null);
        }
    };

    if (isMobile) {
        // มือถือยังคงใช้ layout เดิม
        return (
            <Stack spacing={1.5}>
                {spList.map((sp) => (
                    <Paper
                        key={sp.spcode}
                        variant="outlined"
                        sx={{ p: 1.25, "&:hover": { boxShadow: 2, borderColor: "primary.light" } }}
                    >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Box
                                component="img"
                                src={sp.path_file || DEFAULT_SP_IMG}
                                alt={sp.spname}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 1,
                                    objectFit: "cover",
                                    border: "1px solid #ddd",
                                }}
                                onError={showDefaultImage}
                                onClick={() =>
                                    onPreview?.(sp.path_file || DEFAULT_SP_IMG, sp.spname || sp.spcode)
                                }
                            />
                            <Stack flex={1} spacing={0.5}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {sp.spname}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {sp.spcode}
                                </Typography>
                                <Typography variant="caption" color="primary.main" fontWeight="bold">
                                    คงเหลือ: {sp.stock_balance ?? 0} {sp.spunit || "ชิ้น"}
                                </Typography>
                            </Stack>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<AddShoppingCartIcon fontSize="small" />}
                                onClick={() => handleAddToCart(sp)}
                                disabled={
                                    // sp.added ||
                                    // loadingId === sp.spcode ||
                                    // (sp.stock_balance ?? 0) <= 0
                                    sp.added ||
                                    loadingId === sp.spcode
                                }
                            >
                                {sp.stock_balance <= 0
                                    ? "สต็อกหมด"
                                    : sp.added
                                        ? "เพิ่มแล้ว"
                                        : loadingId === sp.spcode
                                            ? "..."
                                            : "เพิ่ม"}
                            </Button>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        );
    }

    // Desktop Layout (Table)
    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: "grey.100" }}>
                    <TableRow>
                        <TableCell align="center" width="10%">ตำแหน่งไดอะแกรม</TableCell>
                        <TableCell align="center" width="10%">รูปอะไหล่</TableCell>
                        <TableCell>ชื่ออะไหล่</TableCell>
                        <TableCell align="center" width="12%">สต็อคพร้อมใช้งาน</TableCell>
                        <TableCell align="center" width="10%">ราคาตั้ง</TableCell>
                        <TableCell align="center" width="10%">ราคาทุน</TableCell>
                        <TableCell align="center" width="12%">เพิ่มในตะกร้า</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {spList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                ไม่พบข้อมูลอะไหล่
                            </TableCell>
                        </TableRow>
                    ) : (
                        spList.map((sp, index) => (
                            <TableRow key={sp.spcode} hover>
                                {/* ตำแหน่งไดอะแกรม */}
                                <TableCell align="center">
                                    {sp.tracking_number || `#${index + 1}`}
                                </TableCell>

                                {/* รูปอะไหล่ */}
                                <TableCell align="center">
                                    <Box
                                        component="img"
                                        src={sp.path_file || DEFAULT_SP_IMG}
                                        alt={sp.spname}
                                        onError={showDefaultImage}
                                        onClick={() =>
                                            onPreview?.(sp.path_file || DEFAULT_SP_IMG, sp.spname || sp.spcode)
                                        }
                                        sx={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 1,
                                            border: "1px solid #ccc",
                                            cursor: "zoom-in",
                                        }}
                                    />
                                </TableCell>

                                {/* ชื่ออะไหล่ */}
                                <TableCell>
                                    <Typography fontWeight={600}>{sp.spname}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        รหัส: {sp.spcode}
                                    </Typography>
                                    {sp.modelfg && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            โมเดล: {sp.modelfg}
                                        </Typography>
                                    )}
                                </TableCell>

                                {/* สต็อคพร้อมใช้งาน */}
                                <TableCell align="center">
                                    <Typography fontWeight="bold" color="primary.main">
                                        {sp.stock_balance ?? 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {sp.spunit || "ชิ้น"}
                                    </Typography>
                                </TableCell>

                                {/* ราคาตั้ง */}
                                <TableCell align="center">
                                    {sp.stdprice_per_unit != null
                                        ? `${Number(sp.stdprice_per_unit).toLocaleString()} ฿`
                                        : "-"}
                                </TableCell>

                                {/* ราคาขาย */}
                                <TableCell align="center">
                                    {sp.price_per_unit != null
                                        ? `${Number(sp.price_per_unit).toLocaleString()} ฿`
                                        : "-"}
                                </TableCell>

                                {/* ปุ่มเพิ่มในตะกร้า */}
                                <TableCell align="center">
                                    {sp.added ? (
                                        <Button size="small" disabled variant="outlined" color="success">
                                            เพิ่มแล้ว
                                        </Button>
                                    ) : (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<AddShoppingCartIcon fontSize="small" />}
                                            onClick={() => handleAddToCart(sp)}
                                            // disabled={
                                            //     loadingId === sp.spcode ||
                                            //     (sp.stock_balance ?? 0) <= 0
                                            // }
                                            disabled={loadingId === sp.spcode}
                                        >
                                            {/* {sp.stock_balance <= 0
                                                ? "สต็อกหมด"
                                                : loadingId === sp.spcode
                                                    ? "กำลังเพิ่ม..."
                                                    : "เพิ่ม"} */}
                                            {loadingId === sp.spcode
                                                ? "กำลังเพิ่ม..."
                                                : sp.added
                                                    ? "เพิ่มแล้ว"
                                                    : "เพิ่ม"}
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
