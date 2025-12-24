import React, { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { showDefaultImage } from "@/utils/showImage.js";
import { AlertDialog } from "@/Components/AlertDialog";
import axios from "axios";
import { Backdrop, CircularProgress } from "@mui/material";

const money = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function WithdrawSummary({ groupSku = [], totalSp = 0, is_code_cust_id, job_id }) {
    const user = usePage().props.auth.user;
    const isMobile = useMediaQuery("(max-width:900px)");
    const [groupData, setGroupData] = React.useState(groupSku);
    const [discountPercent, setDiscountPercent] = React.useState(20);
    const [outOfStockList, setOutOfStockList] = React.useState([]);
    const [processing, setProcessing] = useState(false);

    const allItems = groupData.flatMap((g) => g.list || []);

    const discountedTotal = useMemo(() => {
        const sum = allItems.reduce((acc, i) => {
            const price = Number(i.sell_price || i.stdprice_per_unit || 0);
            const qty = Number(i.qty || 0);
            return acc + price * qty;
        }, 0);
        const discount = (sum * discountPercent) / 100;
        return sum - discount;
    }, [allItems, discountPercent]);

    const totalAmount = useMemo(
        () =>
            allItems.reduce((sum, i) => {
                const price = Number(i.sell_price || i.stdprice_per_unit || 0);
                const qty = Number(i.qty || 0);
                return sum + price * qty;
            }, 0),
        [allItems]
    );

    const getImageSrc = (item) => {
        if (item.path_file) return item.path_file;
        const base =
            import.meta.env.VITE_IMAGE_SP_NEW || "https://images.pumpkin.tools/SKUS/SP/offn/";
        const sp = item.sp_code || "";
        return sp ? `${base}${sp}.jpg` : `${base}default.jpg`;
    };

    const handleBack = () => {
        router.visit(route("withdrawSp.index"), {
            data: { restore: 1, job_id },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSaveJob = async () => {
        if (!allItems.length) {
            AlertDialog({
                title: "แจ้งเตือน",
                text: "กรุณาเลือกอะไหล่อย่างน้อย 1 รายการก่อนบันทึก",
                icon: "warning",
            });
            return;
        }

        const newJobId = job_id || `JOB-WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        // const newJobId = job_id;
        const payload = {
            job_id: newJobId,
            is_code_cust_id,
            discount_percent: discountPercent,
            items: allItems.map((x) => ({
                sp_code: x.sp_code,
                sp_name: x.sp_name,
                sku_code: x.sku_code,
                qty: Number(x.qty || 0),
                sp_unit: x.sp_unit || "",
                stdprice_per_unit: Number(x.stdprice_per_unit || 0),
                sell_price: Number(x.sell_price || x.stdprice_per_unit || 0),
            })),
            created_by: user?.name || "unknown",
        };

        AlertDialog({
            title: "ยืนยันการบันทึก",
            text: `ต้องการบันทึกใบเบิกอะไหล่ทั้งหมด ${allItems.length} รายการ หรือไม่ ?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
            onPassed: (confirm) => {
                if (confirm) {
                    router.post(route("withdrawJob.store"), payload, {
                        onSuccess: () => {
                            AlertDialog({
                                title: "สำเร็จ",
                                text: `✅ บันทึกใบเบิก ${newJobId} เรียบร้อยแล้ว`,
                                icon: "success",
                                timer: 2000,
                            });
                            router.visit(route("withdrawJob.show", newJobId));
                            // router.visit(route("withdrawJob.index") + `?job_id=${newJobId}`);
                        },
                        onError: (err) => {
                            AlertDialog({
                                title: "เกิดข้อผิดพลาด",
                                text: err?.response?.data?.message || "❌ บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
                                icon: "error",
                            });
                        },
                    });
                }
            },
        });
    };


    const handleRemoveItem = async (group, item) => {
        AlertDialog({
            title: "ยืนยันการลบ",
            text: `ต้องการลบ "${item.sp_name}" ออกจากรายการหรือไม่ ?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
            onPassed: async (confirm) => {
                if (!confirm) return;

                try {
                    const updated = groupData
                        .map((g) =>
                            g.sku_code === group.sku_code
                                ? { ...g, list: g.list.filter((x) => x.sp_code !== item.sp_code) }
                                : g
                        )
                        .filter((g) => (g.list || []).length > 0);

                    setGroupData(updated);

                    await axios.delete(route("withdrawSp.carts.delete"), {
                        data: { sp_code: item.sp_code },
                    });

                    AlertDialog({
                        title: "สำเร็จ",
                        text: `ลบอะไหล่ "${item.sp_name}" ออกจากรายการแล้ว`,
                        icon: "success",
                        timer: 1500,
                    });

                    router.visit(route("withdrawSp.summary"), {
                        data: { job_id },
                        replace: true,
                        preserveScroll: true,
                    });
                } catch (err) {
                    AlertDialog({
                        title: "เกิดข้อผิดพลาด",
                        text: err?.response?.data?.message || err.message,
                        icon: "error",
                    });
                }
            },
        });
    };

    const handleGeneratePDF_API = async () => {
        try {
            if (!groupData.length) {
                AlertDialog({
                    title: "ไม่มีข้อมูล",
                    text: "ไม่มีรายการอะไหล่ในใบเบิก",
                    icon: "warning",
                });
                return;
            }

            setProcessing(true);

            // เตรียมข้อมูลสาขา/ลูกค้า
            const soNumber = job_id || `SO-${Date.now()}`;
            const storeName = user?.store_info?.shop_name || user?.name || "ไม่ระบุชื่อร้าน";
            const address = user?.store_info?.address || "สำนักงานใหญ่";
            const phone = user?.phone || "-";
            const currentDate = new Date().toLocaleDateString("th-TH");
            const totalPrice = totalAmount.toFixed(2);
            const discountAmount = ((totalAmount * discountPercent) / 100).toFixed(2);
            const netTotal = discountedTotal.toFixed(2);

            const discountedGroups = groupData.map((group) => ({
                ...group,
                list: (group.list || []).map((item) => {
                    const stdPrice = Number(item.stdprice_per_unit || 0);
                    const qty = Number(item.qty || 0);
                    const discountPerUnit = discountPercent > 0 ? (stdPrice * discountPercent / 100) : 0;
                    const sellPrice = stdPrice - discountPerUnit; // ✅ ราคาหลังลด

                    return {
                        ...item,
                        discount_percent: discountPercent,
                        discount_per_unit: discountPerUnit,
                        sell_price: sellPrice,
                        amount: sellPrice * qty,
                    };
                }),
            }));

            // payload ส่งไป backend
            const payload = {
                so_number: soNumber,
                store_name: storeName,
                address,
                phone,
                date: currentDate,
                total_price: totalPrice,
                discount: discountAmount,
                discount_percent: discountPercent,
                net_total: netTotal,

                empproc: user?.name ?? "system",       // ผู้ทำรายการ
                custsccode: user?.user_code ?? "-",    // รหัสพนักงาน
                custscname: user?.name ?? "-",         // ชื่อพนักงาน

                // groups: groupData,
                groups: discountedGroups,
            };

            console.log("📦 ส่ง payload ไป export.pdf:", payload);

            const res = await axios.post(route("orders.export.pdf_withdraw"), payload);

            if (res?.data?.pdf_url) {
                AlertDialog({
                    title: "สำเร็จ",
                    text: "สร้างใบเบิกสำเร็จ",
                    icon: "success",
                    timer: 1500,
                    onPassed: () => window.open(res.data.pdf_url, "_blank"),
                });
            } else {
                AlertDialog({
                    title: "ผิดพลาด",
                    text: res?.data?.message || "ไม่พบ URL ของไฟล์ PDF",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("❌ Error handleGeneratePDF_API:", error);
            AlertDialog({
                title: "เกิดข้อผิดพลาด",
                text: error.response?.data?.message || error.message,
                icon: "error",
            });
        } finally {
            setProcessing(false);
        }
    };

    React.useEffect(() => {
        const savedDiscount = localStorage.getItem("withdraw_discount_percent");
        if (savedDiscount) {
            setDiscountPercent(Number(savedDiscount));
        }
    }, []);

    const fetchStocks = async () => {
        try {
            const updatedGroups = await Promise.all(
                groupData.map(async (group) => {
                    const updatedList = await Promise.all(
                        (group.list || []).map(async (item) => {
                            const res = await axios.get(route("withdrawJob.checkStock"), {
                                params: { sp_code: item.sp_code },
                            });
                            const stock = res.data?.stock_balance ?? 0;
                            return { ...item, stock_balance: stock };
                        })
                    );
                    return { ...group, list: updatedList };
                })
            );
            setGroupData(updatedGroups);
        } catch (error) {
            console.error("โหลดสต๊อกคงเหลือล้มเหลว", error);
        }
    };

    React.useEffect(() => {
        fetchStocks();
    }, []);

    const handleUpdateItem = (groupSkuCode, spCode, newQty, newPrice) => {
        setGroupData((prev) =>
            prev.map((g) =>
                g.sku_code === groupSkuCode
                    ? {
                        ...g,
                        list: g.list.map((i) =>
                            i.sp_code === spCode
                                ? { ...i, qty: newQty, sell_price: newPrice }
                                : i
                        ),
                    }
                    : g
            )
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="สรุปรายการเบิกอะไหล่" />
            <Container maxWidth="false" sx={{ backgroundColor: "white", p: 3, minHeight: "90vh" }}>
                <Stack
                    direction={{ sm: "row", xs: "column" }}
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Typography variant="h5" fontWeight="bold">
                        สรุปรายการเบิกอะไหล่
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            ส่วนลด (%):
                        </Typography>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(Number(e.target.value))}
                            style={{
                                width: 70,
                                textAlign: "center",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "2px 6px",
                            }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            รวม {totalSp} รายการ
                        </Typography>
                    </Stack>
                </Stack>

                {/* DESKTOP LAYOUT */}
                {!isMobile && (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        {groupData.map((group, idx) => (
                            <Box key={idx} sx={{ mb: 3 }}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1.5}
                                    sx={{ mb: 1, borderBottom: "1px solid #eee", pb: 1 }}
                                >
                                    <Avatar
                                        src={group.sku_image_path}
                                        variant="square"
                                        sx={{ width: 40, height: 40 }}
                                        onError={showDefaultImage}
                                    />
                                    <Typography fontWeight={600}>
                                        {group.sku_code} {group.sku_name ? `• ${group.sku_name}` : ""}
                                    </Typography>
                                </Stack>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "grey.100" }}>
                                            <TableCell align="center" width="5%">
                                                #
                                            </TableCell>
                                            <TableCell align="center" width="10%">
                                                รูปอะไหล่
                                            </TableCell>
                                            <TableCell>ชื่ออะไหล่</TableCell>
                                            <TableCell align="center" width="8%">
                                                หน่วย
                                            </TableCell>
                                            <TableCell align="center" width="10%">
                                                คงเหลือ
                                            </TableCell>
                                            <TableCell align="center" width="10%">
                                                ราคาตั้ง (฿)
                                            </TableCell>
                                            <TableCell align="center" width="10%">
                                                จำนวน
                                            </TableCell>
                                            {/* <TableCell align="center" width="10%">
                                                ราคาขาย (฿)
                                            </TableCell>
                                            <TableCell align="center" width="10%">
                                                ยอดรวม (฿)
                                            </TableCell> */}
                                            <TableCell align="center" width="8%">
                                                ส่วนลด (%)
                                            </TableCell>
                                            <TableCell align="center" width="10%">
                                                ยอดสุทธิ (฿)
                                            </TableCell>
                                            <TableCell align="center" width="10%">
                                                การจัดการ
                                            </TableCell>
                                            <TableCell align="center" width="6%">
                                                ลบ
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(group.list || []).map((item, i) => (
                                            <DesktopRow
                                                key={item.sp_code ?? i}
                                                index={i}
                                                item={item}
                                                group={group}
                                                discountPercent={discountPercent}
                                                outOfStockList={outOfStockList}
                                                getImageSrc={getImageSrc}
                                                onRemove={handleRemoveItem}
                                                onUpdate={handleUpdateItem}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        ))}
                    </Paper>
                )}

                {/* MOBILE LAYOUT */}
                {isMobile && (
                    <Stack spacing={2}>
                        {groupData.map((group, idx) => (
                            <Card key={idx} variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                        <Avatar
                                            src={group.sku_image_path}
                                            variant="square"
                                            sx={{ width: 36, height: 36 }}
                                            onError={showDefaultImage}
                                        />
                                        <Typography fontWeight="bold" noWrap>
                                            {group.sku_code} {group.sku_name ? `• ${group.sku_name}` : ""}
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={1}>
                                        {(group.list || []).map((item, i) => (
                                            <MobileRow
                                                key={item.sp_code ?? i}
                                                index={i}
                                                item={item}
                                                group={group}
                                                discountPercent={discountPercent}
                                                outOfStockList={outOfStockList}
                                                getImageSrc={getImageSrc}
                                                onRemove={handleRemoveItem}
                                                onUpdate={handleUpdateItem}
                                            />
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                {/* FOOTER SUMMARY */}
                <Box display="flex" justifyContent="flex-end" mt={3}>
                    <Box
                        sx={{
                            border: "1px solid #ccc",
                            borderRadius: 1,
                            px: 2,
                            py: 1,
                            minWidth: 240,
                            textAlign: "right",
                        }}
                    >
                        <Stack direction="column" alignItems="flex-end" spacing={0.5}>
                            <Typography variant="body2" color="text.secondary">
                                ยอดรวมก่อนส่วนลด: ฿{money(totalAmount)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ส่วนลด {discountPercent}% = ฿
                                {money((totalAmount * discountPercent) / 100)}
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color="primary">
                                ยอดสุทธิ: ฿{money(discountedTotal)}
                            </Typography>
                        </Stack>
                    </Box>
                </Box>

                <Divider sx={{ mt: 3, mb: 3 }} />

                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{
                            width: 160,
                            bgcolor: "#FFA726",
                            "&:hover": { bgcolor: "#FB8C00" },
                        }}
                    >
                        กลับ
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<Save />}
                        onClick={handleSaveJob}
                        disabled={!allItems.length}
                        sx={{
                            width: 160,
                            bgcolor: "#2E7D32",
                            "&:hover": { bgcolor: "#1B5E20" },
                        }}
                    >
                        บันทึก
                    </Button>

                    <Button
                        variant="contained"
                        color="info"
                        onClick={handleGeneratePDF_API}
                        disabled={processing}
                        // disabled
                        sx={{
                            width: 180,
                            bgcolor: "#0288D1",
                            "&:hover": { bgcolor: "#0277BD" },
                        }}
                    >
                        {processing ? "กำลังสร้าง..." : "ส่งออกใบเบิก PDF"}
                    </Button>
                    <Backdrop
                        open={processing}
                        sx={{
                            color: "#fff",
                            zIndex: (theme) => theme.zIndex.drawer + 1000,
                            backdropFilter: "blur(3px)",
                        }}
                    >
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress color="inherit" size={60} thickness={4} />
                            <Typography variant="h6" fontWeight="bold">
                                กำลังสร้างใบเบิกอะไหล่...
                            </Typography>
                        </Stack>
                    </Backdrop>

                </Stack>
            </Container>
        </AuthenticatedLayout>
    );
}

/* ------------------------ COMPONENT ย่อย: DesktopRow ------------------------ */

function DesktopRow({
    index,
    item,
    group,
    discountPercent,
    outOfStockList,
    getImageSrc,
    onRemove,
    onUpdate
}) {
    const price = Number(item.sell_price ?? item.stdprice_per_unit ?? 0);
    const qty = Number(item.qty || 0);
    const total = price * qty;
    const img = getImageSrc(item);

    const [editMode, setEditMode] = React.useState(false);
    const [editQty, setEditQty] = React.useState(qty);
    const [editPrice, setEditPrice] = React.useState(price);
    const qtyRef = React.useRef(null);

    React.useEffect(() => {
        if (editMode && qtyRef.current) {
            qtyRef.current.focus();
            qtyRef.current.select();
        }
    }, [editMode]);

    const handleSave = () => {
        if (editQty <= 0) {
            AlertDialog({
                title: "จำนวนไม่ถูกต้อง",
                text: "จำนวนอะไหล่ต้องมากกว่า 0",
                icon: "warning",
            });
            return;
        }

        // อัปเดตข้อมูลทันที ไม่เช็คสต๊อคแล้ว
        onUpdate(group.sku_code, item.sp_code, editQty, editPrice);
        setEditMode(false);

        AlertDialog({
            title: "บันทึกสำเร็จ",
            text: `อัปเดตจำนวน ${item.sp_code} เป็น ${editQty} ชิ้นเรียบร้อยแล้ว`,
            icon: "success",
            timer: 1000,
        });
    };


    const handleCancel = () => {
        setEditQty(qty);
        setEditPrice(price);
        setEditMode(false);
    };

    const rowTotal = editMode ? editPrice * editQty : total;
    const net = rowTotal * (1 - discountPercent / 100);

    return (
        <TableRow
            hover
            sx={{
                bgcolor: outOfStockList.includes(item.sp_code)
                    ? "rgba(255, 99, 71, 0.15)"
                    : "inherit",
            }}
        >
            <TableCell align="center">{index + 1}</TableCell>
            <TableCell align="center">
                <Box
                    component="img"
                    src={img}
                    alt={item.sp_name}
                    onError={showDefaultImage}
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 1,
                        border: "1px solid #ddd",
                        objectFit: "cover",
                    }}
                />
            </TableCell>
            <TableCell>
                <Typography fontWeight={600}>{item.sp_code}</Typography>
                <Typography color="text.secondary">{item.sp_name}</Typography>
            </TableCell>
            <TableCell align="center">{item.sp_unit}</TableCell>
            <TableCell align="center">
                {editMode
                    ? (item.stock_balance ?? 0) - editQty
                    : item.stock_balance ?? 0}
            </TableCell>
            <TableCell align="center">฿{money(item.stdprice_per_unit ?? 0)}</TableCell>

            <TableCell align="center">
                {editMode ? (
                    <input
                        ref={qtyRef}
                        type="number"
                        min="1"
                        value={editQty}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 1) setEditQty(val);
                        }}
                        style={{
                            width: "60px",
                            textAlign: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "2px 4px",
                        }}
                    />
                ) : (
                    qty
                )}
            </TableCell>

            {/* <TableCell align="center">
                {editMode ? (
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editPrice}
                        readOnly
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        style={{
                            width: "80px",
                            textAlign: "center",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            padding: "2px 4px",
                            backgroundColor: "#f9f9f9",
                            color: "#555",
                        }}
                    />
                ) : (
                    `฿${money(item.sell_price ?? item.stdprice_per_unit ?? 0)}`
                )}
            </TableCell>

            <TableCell align="center">฿{money(rowTotal)}</TableCell> */}

            <TableCell align="center">
                {discountPercent > 0 ? `${discountPercent}%` : "-"}
            </TableCell>

            <TableCell align="center">฿{money(net)}</TableCell>

            <TableCell align="center">
                {editMode ? (
                    <Stack direction="row" justifyContent="center" spacing={1}>
                        <Button
                            size="small"
                            color="success"
                            variant="contained"
                            onClick={handleSave}
                        >
                            บันทึก
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={handleCancel}
                        >
                            ยกเลิก
                        </Button>
                    </Stack>
                ) : (
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setEditMode(true)}
                    >
                        แก้ไข
                    </Button>
                )}
            </TableCell>

            <TableCell align="center">
                <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => onRemove(group, item)}
                >
                    ลบ
                </Button>
            </TableCell>
        </TableRow>
    );
}

/* ------------------------ COMPONENT ย่อย: MobileRow ------------------------ */

function MobileRow({
    index,
    item,
    group,
    discountPercent,
    outOfStockList,
    getImageSrc,
    onRemove,
    onUpdate
}) {
    const price = Number(item.sell_price ?? item.stdprice_per_unit ?? 0);
    const qty = Number(item.qty || 0);
    const total = price * qty;
    const img = getImageSrc(item);

    const [editMode, setEditMode] = React.useState(false);
    const [editQty, setEditQty] = React.useState(qty);
    const [editPrice, setEditPrice] = React.useState(price);

    const handleSave = () => {
        if (editQty <= 0) {
            AlertDialog({
                title: "จำนวนไม่ถูกต้อง",
                text: "จำนวนต้องมากกว่า 0",
                icon: "warning",
            });
            return;
        }

        onUpdate(group.sku_code, item.sp_code, editQty, editPrice);
        setEditMode(false);

        AlertDialog({
            title: "สำเร็จ",
            text: `อัปเดต ${item.sp_name} เป็น ${editQty} ชิ้นแล้ว`,
            icon: "success",
            timer: 1200,
        });
    };

    const handleCancel = () => {
        setEditQty(qty);
        setEditPrice(price);
        setEditMode(false);
    };

    const rowTotal = editMode ? editPrice * editQty : total;

    return (
        <Box
            sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                p: 1,
                bgcolor: outOfStockList.includes(item.sp_code)
                    ? "rgba(255, 99, 71, 0.15)"
                    : "#fafafa",
            }}
        >
            <Stack direction="row" spacing={1.5}>
                <Box
                    component="img"
                    src={img}
                    alt={item.sp_name}
                    onError={showDefaultImage}
                    sx={{
                        width: 72,
                        height: 72,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid #ddd",
                        flexShrink: 0,
                    }}
                />
                <Stack flex={1} spacing={0.3}>
                    <Typography fontWeight={600}>{item.sp_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {item.sp_code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        หน่วย: {item.sp_unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        คงเหลือ:{" "}
                        {editMode
                            ? Math.max((item.stock_balance ?? 0) - editQty, 0)
                            : item.stock_balance ?? 0}{" "}
                        ชิ้น
                    </Typography>
                </Stack>
            </Stack>

            <Stack spacing={0.25} sx={{ mt: 1.25 }}>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                        ราคาตั้ง:
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                        ฿{money(item.stdprice_per_unit ?? 0)}
                    </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                        ราคาทุน:
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                        ฿{money(editMode ? editPrice : price)}
                    </Typography>
                </Stack>
            </Stack>

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 0.5 }}
            >
                {editMode ? (
                    <Stack direction="row" spacing={1}>
                        <input
                            type="number"
                            min="1"
                            value={editQty}
                            onChange={(e) => setEditQty(Number(e.target.value))}
                            style={{
                                width: "50px",
                                textAlign: "center",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                            }}
                        />
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            readOnly
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            style={{
                                width: "70px",
                                textAlign: "center",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                backgroundColor: "#f9f9f9",
                            }}
                        />
                    </Stack>
                ) : (
                    <Typography variant="caption">
                        จำนวน: {qty} {item.sp_unit}
                    </Typography>
                )}

                <Typography variant="body2" fontWeight={700} color="primary">
                    ฿{money(rowTotal)}
                </Typography>
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                {editMode ? (
                    <>
                        <Button size="small" color="success" variant="contained" onClick={handleSave}>
                            บันทึก
                        </Button>
                        <Button size="small" color="error" variant="outlined" onClick={handleCancel}>
                            ยกเลิก
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => setEditMode(true)}
                        >
                            แก้ไข
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => onRemove(group, item)}
                        >
                            ลบ
                        </Button>
                    </>
                )}
            </Stack>
        </Box>
    );
}