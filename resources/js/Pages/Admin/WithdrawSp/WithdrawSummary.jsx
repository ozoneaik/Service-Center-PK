// import React, { useMemo } from "react";
// import { Head, router, usePage } from "@inertiajs/react";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
// import {
//     Avatar,
//     Box,
//     Button,
//     Card,
//     CardContent,
//     Container,
//     Divider,
//     Paper,
//     Stack,
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableRow,
//     Typography,
//     useMediaQuery,
// } from "@mui/material";
// import { ArrowBack, Save } from "@mui/icons-material";
// import { showDefaultImage } from "@/utils/showImage.js";
// import { AlertDialog } from "@/Components/AlertDialog";

// const money = (n) =>
//     Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// export default function WithdrawSummary({ groupSku = [], totalSp = 0, is_code_cust_id, job_id }) {
//     const user = usePage().props.auth.user;
//     const isMobile = useMediaQuery("(max-width:900px)");
//     const [groupData, setGroupData] = React.useState(groupSku);
//     const [discountPercent, setDiscountPercent] = React.useState(20);
//     const [outOfStockList, setOutOfStockList] = React.useState([]);

//     const allItems = groupSku.flatMap((g) => g.list || []);

//     const discountedTotal = useMemo(() => {
//         const sum = allItems.reduce((acc, i) => {
//             const price = Number(i.sell_price || i.stdprice_per_unit || 0);
//             const qty = Number(i.qty || 0);
//             return acc + price * qty;
//         }, 0);
//         const discount = (sum * discountPercent) / 100;
//         return sum - discount;
//     }, [allItems, discountPercent]);

//     const totalAmount = useMemo(
//         () =>
//             allItems.reduce((sum, i) => {
//                 // const price = Number(i.stdprice_per_unit || 0);
//                 const price = Number(i.sell_price || i.stdprice_per_unit || 0);
//                 const qty = Number(i.qty || 0);
//                 return sum + price * qty;
//             }, 0),
//         [allItems]
//     );

//     const getImageSrc = (item) => {
//         if (item.path_file) return item.path_file;
//         const base =
//             import.meta.env.VITE_IMAGE_SP || "https://images.pumpkin.tools/SKUS/SP/offn/";
//         const sp = item.sp_code || "";
//         return sp ? `${base}${sp}.jpg` : `${base}default.jpg`;
//     };

//     const handleBack = () => {
//         router.visit(route("withdrawSp.index"), {
//             data: { is_code_cust_id, job_id },
//         });
//     };

//     // const handleSaveJob = async () => {
//     //     if (!allItems.length) {
//     //         AlertDialog({
//     //             title: "แจ้งเตือน",
//     //             text: "กรุณาเลือกอะไหล่อย่างน้อย 1 รายการก่อนบันทึก",
//     //             icon: "warning",
//     //         });
//     //         return;
//     //     }

//     //     try {
//     //         for (const item of allItems) {
//     //             const res = await axios.get(route("withdrawJob.checkStock"), {
//     //                 params: { sp_code: item.sp_code },
//     //             });
//     //             const stock = res.data?.stock_balance ?? 0;
//     //             const qty = Number(item.qty || 0);

//     //             if (qty > stock) {
//     //                 AlertDialog({
//     //                     title: "สต็อกไม่พอ",
//     //                     text: `อะไหล่ ${item.sp_code} (${item.sp_name}) คงเหลือ ${stock} ชิ้น ไม่สามารถเบิก ${qty} ชิ้นได้`,
//     //                     icon: "error",
//     //                 });
//     //                 return;
//     //             }
//     //         }
//     //     } catch (error) {
//     //         console.error("❌ Error while checking stock:", error);
//     //         AlertDialog({
//     //             title: "เกิดข้อผิดพลาด",
//     //             text: "ตรวจสอบสต็อกไม่สำเร็จ กรุณาลองใหม่",
//     //             icon: "error",
//     //         });
//     //         return;
//     //     }

//     //     const newJobId = job_id || `JOB-WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
//     //     const payload = {
//     //         job_id: newJobId,
//     //         is_code_cust_id,
//     //         discount_percent: discountPercent,
//     //         items: allItems.map((x) => ({
//     //             sp_code: x.sp_code,
//     //             sp_name: x.sp_name,
//     //             sku_code: x.sku_code,
//     //             qty: Number(x.qty || 0),
//     //             sp_unit: x.sp_unit || "",
//     //             // price: Number(x.stdprice_per_unit || 0),
//     //             stdprice_per_unit: Number(x.stdprice_per_unit || 0),
//     //             sell_price: Number(x.sell_price || x.stdprice_per_unit || 0),
//     //         })),
//     //         created_by: user?.name || "unknown",
//     //     };

//     //     AlertDialog({
//     //         title: "ยืนยันการบันทึก",
//     //         text: `ต้องการบันทึกใบเบิกอะไหล่ทั้งหมด ${allItems.length} รายการ หรือไม่ ?`,
//     //         icon: "question",
//     //         showCancelButton: true,
//     //         confirmButtonText: "ตกลง",
//     //         cancelButtonText: "ยกเลิก",
//     //         onPassed: (confirm) => {
//     //             if (confirm) {
//     //                 router.post(route("withdrawJob.store"), payload, {
//     //                     onStart: () => console.log("saving..."),
//     //                     onSuccess: () => {
//     //                         AlertDialog({
//     //                             title: "สำเร็จ",
//     //                             text: `✅ บันทึกใบเบิก ${newJobId} เรียบร้อยแล้ว`,
//     //                             icon: "success",
//     //                             timer: 2000,
//     //                         });
//     //                         router.visit(route("withdrawJob.index"));
//     //                     },
//     //                     onError: (err) => {
//     //                         console.error(err);
//     //                         AlertDialog({
//     //                             title: "เกิดข้อผิดพลาด",
//     //                             text: err?.response?.data?.message || "❌ บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
//     //                             icon: "error",
//     //                         });
//     //                     },
//     //                 });
//     //             }
//     //         },
//     //     });
//     // };

//     const handleSaveJob = async () => {
//         if (!allItems.length) {
//             AlertDialog({
//                 title: "แจ้งเตือน",
//                 text: "กรุณาเลือกอะไหล่อย่างน้อย 1 รายการก่อนบันทึก",
//                 icon: "warning",
//             });
//             return;
//         }

//         try {
//             const outOfStock = [];

//             for (const item of allItems) {
//                 const res = await axios.get(route("withdrawJob.checkStock"), {
//                     params: { sp_code: item.sp_code },
//                 });
//                 const stock = res.data?.stock_balance ?? 0;
//                 const qty = Number(item.qty || 0);

//                 if (stock <= 0 || qty > stock) {
//                     outOfStock.push(item.sp_code);
//                 }
//             }

//             if (outOfStock.length > 0) {
//                 setOutOfStockList(outOfStock);

//                 // สร้างข้อความ list เป็น bullet point
//                 const names = allItems
//                     .filter((i) => outOfStock.includes(i.sp_code))
//                     .map((i) => `<br/>• ${i.sp_code} (${i.sp_name})`)
//                     .join("\n");

//                 AlertDialog({
//                     title: `สต็อกไม่เพียงพอ (${outOfStock.length} รายการ)`,
//                     html: `รายการต่อไปนี้สต็อกหมดหรือไม่พอ:<br/><br/>${names}<br/><br/>กรุณาปรับสต็อกหรือเอาออกก่อนดำเนินการต่อ`,
//                     icon: "error",
//                 });

//                 // ถ้ารายการเดียว → ใช้บรรทัดเดียว
//                 const title =
//                     outOfStock.length === 1
//                         ? "สต็อกไม่เพียงพอ"
//                         : `สต็อกไม่เพียงพอ (${outOfStock.length} รายการ)`;

//                 AlertDialog({
//                     title,
//                     text: `รายการต่อไปนี้สต็อกหมดหรือไม่พอ:\n${names}\n\nกรุณาปรับสต็อกหรือเอาออกก่อนดำเนินการต่อ`,
//                     icon: "error",
//                 });
//                 return;
//             }
//         } catch (error) {
//             console.error("❌ Error while checking stock:", error);
//             AlertDialog({
//                 title: "เกิดข้อผิดพลาด",
//                 text: "ตรวจสอบสต็อกไม่สำเร็จ กรุณาลองใหม่",
//                 icon: "error",
//             });
//             return;
//         }

//         // ถ้าผ่านการเช็กทั้งหมดค่อยทำต่อ
//         const newJobId = job_id || `JOB-WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
//         const payload = {
//             job_id: newJobId,
//             is_code_cust_id,
//             discount_percent: discountPercent,
//             items: allItems.map((x) => ({
//                 sp_code: x.sp_code,
//                 sp_name: x.sp_name,
//                 sku_code: x.sku_code,
//                 qty: Number(x.qty || 0),
//                 sp_unit: x.sp_unit || "",
//                 stdprice_per_unit: Number(x.stdprice_per_unit || 0),
//                 sell_price: Number(x.sell_price || x.stdprice_per_unit || 0),
//             })),
//             created_by: user?.name || "unknown",
//         };

//         AlertDialog({
//             title: "ยืนยันการบันทึก",
//             text: `ต้องการบันทึกใบเบิกอะไหล่ทั้งหมด ${allItems.length} รายการ หรือไม่ ?`,
//             icon: "question",
//             showCancelButton: true,
//             confirmButtonText: "ตกลง",
//             cancelButtonText: "ยกเลิก",
//             onPassed: (confirm) => {
//                 if (confirm) {
//                     router.post(route("withdrawJob.store"), payload, {
//                         onStart: () => console.log("saving..."),
//                         onSuccess: () => {
//                             AlertDialog({
//                                 title: "สำเร็จ",
//                                 text: `✅ บันทึกใบเบิก ${newJobId} เรียบร้อยแล้ว`,
//                                 icon: "success",
//                                 timer: 2000,
//                             });
//                             router.visit(route("withdrawJob.index"));
//                         },
//                         onError: (err) => {
//                             console.error(err);
//                             AlertDialog({
//                                 title: "เกิดข้อผิดพลาด",
//                                 text: err?.response?.data?.message || "❌ บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
//                                 icon: "error",
//                             });
//                         },
//                     });
//                 }
//             },
//         });
//     };

//     const handleRemoveItem = async (group, item) => {
//         AlertDialog({
//             title: "ยืนยันการลบ",
//             text: `ต้องการลบ "${item.sp_name}" ออกจากรายการหรือไม่ ?`,
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonText: "ลบ",
//             cancelButtonText: "ยกเลิก",
//             onPassed: async (confirm) => {
//                 if (!confirm) return;

//                 try {
//                     //  ลบออกจาก state (frontend)
//                     const updated = groupData.map((g) =>
//                         g.sku_code === group.sku_code
//                             ? { ...g, list: g.list.filter((x) => x.sp_code !== item.sp_code) }
//                             : g
//                     ).filter((g) => g.list.length > 0);

//                     setGroupData(updated);

//                     await axios.delete(route("withdrawSp.carts.delete"), {
//                         data: { sp_code: item.sp_code },
//                     });

//                     AlertDialog({
//                         title: "สำเร็จ",
//                         text: `ลบอะไหล่ "${item.sp_name}" ออกจากรายการแล้ว`,
//                         icon: "success",
//                         timer: 1500,
//                     });

//                     router.visit(route('withdrawSp.summary'), {
//                         replace: true,
//                         preserveScroll: true,
//                     });

//                 } catch (err) {
//                     AlertDialog({
//                         title: "เกิดข้อผิดพลาด",
//                         text: err?.response?.data?.message || err.message,
//                         icon: "error",
//                     });
//                 }
//             },
//         });
//     };

//     React.useEffect(() => {
//         const savedDiscount = localStorage.getItem("withdraw_discount_percent");
//         if (savedDiscount) {
//             setDiscountPercent(Number(savedDiscount));
//         }
//     }, []);

//     React.useEffect(() => {
//         const fetchStocks = async () => {
//             try {
//                 const updatedGroups = await Promise.all(
//                     groupSku.map(async (group) => {
//                         const updatedList = await Promise.all(
//                             (group.list || []).map(async (item) => {
//                                 const res = await axios.get(route("withdrawJob.checkStock"), {
//                                     params: { sp_code: item.sp_code },
//                                 });
//                                 const stock = res.data?.stock_balance ?? 0;
//                                 return { ...item, stock_balance: stock };
//                             })
//                         );
//                         return { ...group, list: updatedList };
//                     })
//                 );
//                 setGroupData(updatedGroups);
//             } catch (error) {
//                 console.error("โหลดสต๊อกคงเหลือล้มเหลว", error);
//             }
//         };

//         fetchStocks();
//     }, []);

//     return (
//         <AuthenticatedLayout>
//             <Head title="สรุปรายการเบิกอะไหล่" />
//             <Container maxWidth="false" sx={{ backgroundColor: "white", p: 3, minHeight: "90vh" }}>
//                 <Stack
//                     direction={{ sm: "row", xs: "column" }}
//                     justifyContent="space-between"
//                     alignItems="center"
//                     mb={2}
//                 >
//                     <Typography variant="h5" fontWeight="bold">
//                         สรุปรายการเบิกอะไหล่
//                     </Typography>

//                     {/* กล่องส่วนลด */}
//                     <Stack direction="row" alignItems="center" spacing={1}>
//                         <Typography variant="body2" color="text.secondary">
//                             ส่วนลด (%):
//                         </Typography>
//                         <input
//                             type="number"
//                             min="0"
//                             max="100"
//                             value={discountPercent}
//                             onChange={(e) => setDiscountPercent(Number(e.target.value))}
//                             style={{
//                                 width: 70,
//                                 textAlign: "center",
//                                 border: "1px solid #ccc",
//                                 borderRadius: "4px",
//                                 padding: "2px 6px",
//                             }}
//                         />
//                         <Typography variant="body2" color="text.secondary">
//                             รวม {totalSp} รายการ
//                         </Typography>
//                     </Stack>
//                 </Stack>

//                 {/* DESKTOP LAYOUT */}
//                 {!isMobile && (
//                     <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
//                         {groupSku.map((group, idx) => (
//                             <Box key={idx} sx={{ mb: 3 }}>
//                                 <Stack
//                                     direction="row"
//                                     alignItems="center"
//                                     spacing={1.5}
//                                     sx={{ mb: 1, borderBottom: "1px solid #eee", pb: 1 }}
//                                 >
//                                     <Avatar
//                                         src={group.sku_image_path}
//                                         variant="square"
//                                         sx={{ width: 40, height: 40 }}
//                                         onError={showDefaultImage}
//                                     />
//                                     <Typography fontWeight={600}>
//                                         {group.sku_code} {group.sku_name ? `• ${group.sku_name}` : ""}
//                                     </Typography>
//                                 </Stack>

//                                 <Table size="small">
//                                     <TableHead>
//                                         <TableRow sx={{ bgcolor: "grey.100" }}>
//                                             <TableCell align="center" width="5%">#</TableCell>
//                                             <TableCell align="center" width="10%">รูปอะไหล่</TableCell>
//                                             <TableCell>ชื่ออะไหล่</TableCell>
//                                             <TableCell align="center" width="8%">หน่วย</TableCell>
//                                             <TableCell align="center" width="10%">คงเหลือ</TableCell>
//                                             <TableCell align="center" width="10%">ราคาตั้ง (฿)</TableCell>
//                                             <TableCell align="center" width="10%">จำนวน</TableCell>
//                                             <TableCell align="center" width="10%">ราคาขาย (฿)</TableCell>
//                                             <TableCell align="center" width="10%">ยอดรวม (฿)</TableCell>
//                                             <TableCell align="center" width="8%">ส่วนลด (%)</TableCell>
//                                             <TableCell align="center" width="10%">ยอดสุทธิ (฿)</TableCell>
//                                             <TableCell align="center" width="10%">การจัดการ</TableCell>
//                                             <TableCell align="center" width="6%">ลบ</TableCell>
//                                         </TableRow>
//                                     </TableHead>
//                                     <TableBody>
//                                         {(group.list || []).map((item, i) => {
//                                             const price = Number(item.stdprice_per_unit || 0);
//                                             const qty = Number(item.qty || 0);
//                                             const total = price * qty;
//                                             const img = getImageSrc(item);

//                                             // state ภายใน row — ใช้ useState inline
//                                             const [editMode, setEditMode] = React.useState(false);
//                                             const [editQty, setEditQty] = React.useState(qty);
//                                             const [editPrice, setEditPrice] = React.useState(price);

//                                             const handleSave = async () => {
//                                                 try {
//                                                     const res = await axios.get(route("withdrawJob.checkStock"), {
//                                                         params: { sp_code: item.sp_code },
//                                                     });

//                                                     const stock = res.data?.stock_balance ?? 0;

//                                                     if (editQty > stock) {
//                                                         AlertDialog({
//                                                             title: "สต๊อกไม่เพียงพอ",
//                                                             text: `คงเหลือ ${stock} ชิ้น สต็อคที่คุณต้องการ ${editQty} ชิ้น`,
//                                                             icon: "error",
//                                                         });
//                                                         return;
//                                                     }

//                                                     item.qty = editQty;
//                                                     // item.stdprice_per_unit = editPrice;
//                                                     item.sell_price = editPrice;
//                                                     setEditMode(false);

//                                                     AlertDialog({
//                                                         title: "บันทึกสำเร็จ",
//                                                         text: `อัปเดตจำนวน ${item.sp_code} เป็น ${editQty} ชิ้นเรียบร้อยแล้ว`,
//                                                         icon: "success",
//                                                         timer: 1000,
//                                                     });
//                                                 } catch (err) {
//                                                     console.error(err);
//                                                     AlertDialog({
//                                                         title: "เกิดข้อผิดพลาด",
//                                                         text: err?.response?.data?.message || err.message,
//                                                         icon: "error",
//                                                     });
//                                                 }
//                                             };

//                                             const handleCancel = () => {
//                                                 setEditQty(qty);
//                                                 setEditPrice(price);
//                                                 setEditMode(false);
//                                             };

//                                             return (
//                                                 <TableRow
//                                                     key={i}
//                                                     hover
//                                                     sx={{
//                                                         bgcolor: outOfStockList.includes(item.sp_code)
//                                                             ? "rgba(255, 99, 71, 0.15)" // สีแดงอ่อน
//                                                             : "inherit",
//                                                     }}
//                                                 >
//                                                     <TableCell align="center">{i + 1}</TableCell>
//                                                     <TableCell align="center">
//                                                         <Box
//                                                             component="img"
//                                                             src={img}
//                                                             alt={item.sp_name}
//                                                             onError={showDefaultImage}
//                                                             sx={{
//                                                                 width: 64,
//                                                                 height: 64,
//                                                                 borderRadius: 1,
//                                                                 border: "1px solid #ddd",
//                                                                 objectFit: "cover",
//                                                             }}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell>
//                                                         <Typography fontWeight={600}>{item.sp_code}</Typography>
//                                                         <Typography color="text.secondary">{item.sp_name}</Typography>
//                                                     </TableCell>
//                                                     <TableCell align="center">{item.sp_unit}</TableCell>
//                                                     <TableCell align="center">
//                                                         {editMode
//                                                             ? (item.stock_balance ?? 0) - editQty
//                                                             : item.stock_balance ?? 0}
//                                                     </TableCell>
//                                                     {/* <TableCell align="center">฿{money(price)}</TableCell> */}
//                                                     <TableCell align="center">
//                                                         ฿{money(item.stdprice_per_unit ?? 0)}
//                                                     </TableCell>

//                                                     <TableCell align="center">
//                                                         {editMode ? (
//                                                             <input
//                                                                 type="number"
//                                                                 min="1"
//                                                                 value={editQty}
//                                                                 onChange={(e) => setEditQty(Number(e.target.value))}
//                                                                 style={{
//                                                                     width: "60px",
//                                                                     textAlign: "center",
//                                                                     border: "1px solid #ccc",
//                                                                     borderRadius: "4px",
//                                                                     padding: "2px 4px",
//                                                                 }}
//                                                             />
//                                                         ) : (
//                                                             qty
//                                                         )}
//                                                     </TableCell>

//                                                     <TableCell align="center">
//                                                         {editMode ? (
//                                                             <input
//                                                                 type="number"
//                                                                 min="0"
//                                                                 step="0.01"
//                                                                 value={editPrice}
//                                                                 readOnly
//                                                                 onChange={(e) => setEditPrice(Number(e.target.value))}
//                                                                 style={{
//                                                                     width: "80px",
//                                                                     textAlign: "center",
//                                                                     border: "1px solid #ddd",
//                                                                     borderRadius: "4px",
//                                                                     padding: "2px 4px",
//                                                                     backgroundColor: "#f9f9f9",
//                                                                     color: "#555",
//                                                                 }}
//                                                             />
//                                                         ) : (
//                                                             // `฿${money(price)}`
//                                                             `฿${money(item.sell_price ?? item.stdprice_per_unit ?? 0)}`
//                                                         )}
//                                                     </TableCell>

//                                                     <TableCell align="center">
//                                                         ฿{money(editMode ? editPrice * editQty : total)}
//                                                     </TableCell>

//                                                     <TableCell align="center">
//                                                         {discountPercent > 0 ? `${discountPercent}%` : "-"}
//                                                     </TableCell>

//                                                     <TableCell align="center">
//                                                         ฿{money(
//                                                             (editMode ? editPrice * editQty : total) *
//                                                             (1 - discountPercent / 100)
//                                                         )}
//                                                     </TableCell>

//                                                     <TableCell align="center">
//                                                         {editMode ? (
//                                                             <Stack direction="row" justifyContent="center" spacing={1}>
//                                                                 <Button
//                                                                     size="small"
//                                                                     color="success"
//                                                                     variant="contained"
//                                                                     onClick={handleSave}
//                                                                 >
//                                                                     บันทึก
//                                                                 </Button>
//                                                                 <Button
//                                                                     size="small"
//                                                                     color="error"
//                                                                     variant="outlined"
//                                                                     onClick={handleCancel}
//                                                                 >
//                                                                     ยกเลิก
//                                                                 </Button>
//                                                             </Stack>
//                                                         ) : (
//                                                             <Button
//                                                                 size="small"
//                                                                 variant="contained"
//                                                                 color="primary"
//                                                                 onClick={() => setEditMode(true)}
//                                                             >
//                                                                 แก้ไข
//                                                             </Button>
//                                                         )}
//                                                     </TableCell>
//                                                     <TableCell align="center">
//                                                         <Button
//                                                             size="small"
//                                                             color="error"
//                                                             variant="outlined"
//                                                             onClick={() => handleRemoveItem(group, item)}
//                                                         >
//                                                             ลบ
//                                                         </Button>
//                                                     </TableCell>
//                                                 </TableRow>
//                                             );
//                                         })}
//                                     </TableBody>
//                                 </Table>
//                             </Box>
//                         ))}
//                     </Paper>
//                 )}

//                 {/* MOBILE LAYOUT */}
//                 {isMobile && (
//                     <Stack spacing={2}>
//                         {groupData.map((group, idx) => (
//                             <Card key={idx} variant="outlined" sx={{ borderRadius: 2 }}>
//                                 <CardContent>
//                                     {/* หัวกลุ่มสินค้า */}
//                                     <Stack direction="row" alignItems="center" spacing={1} mb={1}>
//                                         <Avatar
//                                             src={group.sku_image_path}
//                                             variant="square"
//                                             sx={{ width: 36, height: 36 }}
//                                             onError={showDefaultImage}
//                                         />
//                                         <Typography fontWeight="bold" noWrap>
//                                             {group.sku_code} {group.sku_name ? `• ${group.sku_name}` : ""}
//                                         </Typography>
//                                     </Stack>

//                                     {/* รายการอะไหล่ */}
//                                     <Stack spacing={1}>
//                                         {(group.list || []).map((item, i) => {
//                                             const price = Number(item.stdprice_per_unit || 0);
//                                             const stdPrice = Number(item.stdprice_per_unit || item.std_price || price);
//                                             const qty = Number(item.qty || 0);
//                                             const total = price * qty;
//                                             const img = getImageSrc(item);

//                                             const [editMode, setEditMode] = React.useState(false);
//                                             const [editQty, setEditQty] = React.useState(qty);
//                                             const [editPrice, setEditPrice] = React.useState(price);

//                                             const handleSave = async () => {
//                                                 try {
//                                                     const res = await axios.get(route("withdrawJob.checkStock"), {
//                                                         params: { sp_code: item.sp_code },
//                                                     });
//                                                     const stock = res.data?.stock_balance ?? 0;

//                                                     if (editQty > stock) {
//                                                         AlertDialog({
//                                                             title: "สต๊อกไม่เพียงพอ",
//                                                             text: `คงเหลือ ${stock} ชิ้น แต่ต้องการ ${editQty} ชิ้น`,
//                                                             icon: "error",
//                                                         });
//                                                         return;
//                                                     }

//                                                     item.qty = editQty;
//                                                     // item.stdprice_per_unit = editPrice;
//                                                     item.sell_price = editPrice;

//                                                     setEditMode(false);
//                                                     AlertDialog({
//                                                         title: "สำเร็จ",
//                                                         text: `อัปเดต ${item.sp_name} เป็น ${editQty} ชิ้นแล้ว`,
//                                                         icon: "success",
//                                                         timer: 1200,
//                                                     });
//                                                 } catch (err) {
//                                                     AlertDialog({
//                                                         title: "เกิดข้อผิดพลาด",
//                                                         text: err?.response?.data?.message || err.message,
//                                                         icon: "error",
//                                                     });
//                                                 }
//                                             };

//                                             const handleCancel = () => {
//                                                 setEditQty(qty);
//                                                 setEditPrice(price);
//                                                 setEditMode(false);
//                                             };

//                                             return (
//                                                 <Box
//                                                     key={i}
//                                                     sx={{
//                                                         border: "1px solid #eee",
//                                                         borderRadius: 2,
//                                                         p: 1,
//                                                         bgcolor: outOfStockList.includes(item.sp_code)
//                                                             ? "rgba(255, 99, 71, 0.15)"
//                                                             : "#fafafa",
//                                                     }}
//                                                 >
//                                                     {/* รูป + ชื่อ */}
//                                                     <Stack direction="row" spacing={1.5}>
//                                                         <Box
//                                                             component="img"
//                                                             src={img}
//                                                             alt={item.sp_name}
//                                                             onError={showDefaultImage}
//                                                             sx={{
//                                                                 width: 72,
//                                                                 height: 72,
//                                                                 objectFit: "cover",
//                                                                 borderRadius: 1,
//                                                                 border: "1px solid #ddd",
//                                                                 flexShrink: 0,
//                                                             }}
//                                                         />
//                                                         <Stack flex={1} spacing={0.3}>
//                                                             <Typography fontWeight={600}>{item.sp_name}</Typography>
//                                                             <Typography variant="caption" color="text.secondary">
//                                                                 {item.sp_code}
//                                                             </Typography>
//                                                             <Typography variant="caption" color="text.secondary">
//                                                                 หน่วย: {item.sp_unit}
//                                                             </Typography>
//                                                             <Typography variant="caption" color="text.secondary">
//                                                                 คงเหลือ:{" "}
//                                                                 {editMode
//                                                                     ? Math.max((item.stock_balance ?? 0) - editQty, 0)
//                                                                     : item.stock_balance ?? 0}{" "}
//                                                                 ชิ้น
//                                                             </Typography>
//                                                         </Stack>
//                                                     </Stack>

//                                                     {/* ราคา */}
//                                                     <Stack spacing={0.25} sx={{ mt: 1.25 }}>
//                                                         <Stack direction="row" justifyContent="space-between">
//                                                             <Typography variant="caption" color="text.secondary">
//                                                                 ราคาตั้ง:
//                                                             </Typography>
//                                                             <Typography variant="caption" fontWeight="bold">
//                                                                 ฿{money(item.stdprice_per_unit ?? 0)}
//                                                             </Typography>
//                                                         </Stack>
//                                                         <Stack direction="row" justifyContent="space-between">
//                                                             <Typography variant="caption" color="text.secondary">
//                                                                 ราคาทุน:
//                                                             </Typography>
//                                                             <Typography variant="caption" fontWeight="bold">
//                                                                 ฿{money(editMode ? editPrice : price)}
//                                                             </Typography>
//                                                         </Stack>
//                                                     </Stack>

//                                                     {/* จำนวนและรวม */}
//                                                     <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
//                                                         {editMode ? (
//                                                             <Stack direction="row" spacing={1}>
//                                                                 <input
//                                                                     type="number"
//                                                                     min="1"
//                                                                     value={editQty}
//                                                                     onChange={(e) => setEditQty(Number(e.target.value))}
//                                                                     style={{
//                                                                         width: "50px",
//                                                                         textAlign: "center",
//                                                                         border: "1px solid #ccc",
//                                                                         borderRadius: "4px",
//                                                                     }}
//                                                                 />
//                                                                 <input
//                                                                     type="number"
//                                                                     min="0"
//                                                                     step="0.01"
//                                                                     readOnly
//                                                                     value={editPrice}
//                                                                     onChange={(e) => setEditPrice(Number(e.target.value))}
//                                                                     style={{
//                                                                         width: "70px",
//                                                                         textAlign: "center",
//                                                                         border: "1px solid #ccc",
//                                                                         borderRadius: "4px",
//                                                                         backgroundColor: "#f9f9f9",
//                                                                     }}
//                                                                 />
//                                                             </Stack>
//                                                         ) : (
//                                                             <Typography variant="caption">
//                                                                 จำนวน: {qty} {item.sp_unit}
//                                                             </Typography>
//                                                         )}

//                                                         <Typography variant="body2" fontWeight={700} color="primary">
//                                                             ฿{money(editMode ? editPrice * editQty : total)}
//                                                         </Typography>
//                                                     </Stack>

//                                                     {/* ปุ่มจัดการ */}
//                                                     <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
//                                                         {editMode ? (
//                                                             <>
//                                                                 <Button size="small" color="success" variant="contained" onClick={handleSave}>
//                                                                     บันทึก
//                                                                 </Button>
//                                                                 <Button size="small" color="error" variant="outlined" onClick={handleCancel}>
//                                                                     ยกเลิก
//                                                                 </Button>
//                                                             </>
//                                                         ) : (
//                                                             <>
//                                                                 <Button
//                                                                     size="small"
//                                                                     variant="contained"
//                                                                     color="primary"
//                                                                     onClick={() => setEditMode(true)}
//                                                                 >
//                                                                     แก้ไข
//                                                                 </Button>
//                                                                 <Button
//                                                                     size="small"
//                                                                     color="error"
//                                                                     variant="outlined"
//                                                                     onClick={() => handleRemoveItem(group, item)}
//                                                                 >
//                                                                     ลบ
//                                                                 </Button>
//                                                             </>
//                                                         )}
//                                                     </Stack>
//                                                 </Box>
//                                             );
//                                         })}
//                                     </Stack>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </Stack>
//                 )}

//                 {/* FOOTER SUMMARY */}
//                 <Box display="flex" justifyContent="flex-end" mt={3}>
//                     <Box
//                         sx={{
//                             border: "1px solid #ccc",
//                             borderRadius: 1,
//                             px: 2,
//                             py: 1,
//                             minWidth: 240,
//                             textAlign: "right",
//                         }}
//                     >
//                         {/* <Typography variant="body1" fontWeight={600}>
//                             ยอดรวมทั้งหมด: ฿{money(totalAmount)}
//                         </Typography> */}
//                         <Stack direction="column" alignItems="flex-end" spacing={0.5}>
//                             <Typography variant="body2" color="text.secondary">
//                                 ยอดรวมก่อนส่วนลด: ฿{money(totalAmount)}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                                 ส่วนลด {discountPercent}% = ฿{money((totalAmount * discountPercent) / 100)}
//                             </Typography>
//                             <Typography variant="h6" fontWeight={700} color="primary">
//                                 ยอดสุทธิ: ฿{money(discountedTotal)}
//                             </Typography>
//                         </Stack>
//                     </Box>
//                 </Box>

//                 <Divider sx={{ mt: 3, mb: 3 }} />

//                 {/* ปุ่ม */}
//                 <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
//                     <Button
//                         variant="contained"
//                         color="warning"
//                         startIcon={<ArrowBack />}
//                         onClick={handleBack}
//                         sx={{
//                             width: 160,
//                             bgcolor: "#FFA726",
//                             "&:hover": { bgcolor: "#FB8C00" },
//                         }}
//                     >
//                         กลับ
//                     </Button>

//                     <Button
//                         variant="contained"
//                         color="success"
//                         startIcon={<Save />}
//                         onClick={handleSaveJob}
//                         disabled={!allItems.length}
//                         sx={{
//                             width: 160,
//                             bgcolor: "#2E7D32",
//                             "&:hover": { bgcolor: "#1B5E20" },
//                         }}
//                     >
//                         บันทึก
//                     </Button>
//                 </Stack>
//             </Container>
//         </AuthenticatedLayout>
//     );
// }


//---------------------------------------------------------------------------------------------------------
//version 2
import React, { useMemo } from "react";
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
import axios from "axios"; // 👈 ให้แน่ใจว่ามี import ตัวนี้อยู่

const money = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

/* ----------------------------- COMPONENT หลัก ----------------------------- */

export default function WithdrawSummary({ groupSku = [], totalSp = 0, is_code_cust_id, job_id }) {
    const user = usePage().props.auth.user;
    const isMobile = useMediaQuery("(max-width:900px)");
    const [groupData, setGroupData] = React.useState(groupSku);
    const [discountPercent, setDiscountPercent] = React.useState(20);
    const [outOfStockList, setOutOfStockList] = React.useState([]);

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
            import.meta.env.VITE_IMAGE_SP || "https://images.pumpkin.tools/SKUS/SP/offn/";
        const sp = item.sp_code || "";
        return sp ? `${base}${sp}.jpg` : `${base}default.jpg`;
    };

    const handleBack = () => {
        router.visit(route("withdrawSp.index"), {
            data: { is_code_cust_id, job_id },
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

        try {
            const outOfStock = [];

            for (const item of allItems) {
                const res = await axios.get(route("withdrawJob.checkStock"), {
                    params: { sp_code: item.sp_code },
                });
                const stock = res.data?.stock_balance ?? 0;
                const qty = Number(item.qty || 0);

                if (stock <= 0 || qty > stock) {
                    outOfStock.push(item.sp_code);
                }
            }

            if (outOfStock.length > 0) {
                setOutOfStockList(outOfStock);

                const names = allItems
                    .filter((i) => outOfStock.includes(i.sp_code))
                    .map((i) => `<br/>• ${i.sp_code} (${i.sp_name})`)
                    .join("\n");

                AlertDialog({
                    title: `สต็อกไม่เพียงพอ (${outOfStock.length} รายการ)`,
                    text: `รายการต่อไปนี้สต็อกหมดหรือไม่พอ:\n${names}\n\nกรุณาปรับสต็อกหรือเอาออกก่อนดำเนินการต่อ`,
                    icon: "error",
                });

                await fetchStocks();
                return;
            }
        } catch (error) {
            console.error("❌ Error while checking stock:", error);
            AlertDialog({
                title: "เกิดข้อผิดพลาด",
                text: "ตรวจสอบสต็อกไม่สำเร็จ กรุณาลองใหม่",
                icon: "error",
            });
            return;
        }

        const newJobId = job_id || `JOB-WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
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
                        onStart: () => console.log("saving..."),
                        onSuccess: () => {
                            AlertDialog({
                                title: "สำเร็จ",
                                text: `✅ บันทึกใบเบิก ${newJobId} เรียบร้อยแล้ว`,
                                icon: "success",
                                timer: 2000,
                            });
                            router.visit(route("withdrawJob.index"));
                        },
                        onError: (err) => {
                            console.error(err);
                            AlertDialog({
                                title: "เกิดข้อผิดพลาด",
                                text:
                                    err?.response?.data?.message ||
                                    "❌ บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
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

    React.useEffect(() => {
        const savedDiscount = localStorage.getItem("withdraw_discount_percent");
        if (savedDiscount) {
            setDiscountPercent(Number(savedDiscount));
        }
    }, []);

    // React.useEffect(() => {
    //     const fetchStocks = async () => {
    //         try {
    //             const updatedGroups = await Promise.all(
    //                 groupSku.map(async (group) => {
    //                     const updatedList = await Promise.all(
    //                         (group.list || []).map(async (item) => {
    //                             const res = await axios.get(route("withdrawJob.checkStock"), {
    //                                 params: { sp_code: item.sp_code },
    //                             });
    //                             const stock = res.data?.stock_balance ?? 0;
    //                             return { ...item, stock_balance: stock };
    //                         })
    //                     );
    //                     return { ...group, list: updatedList };
    //                 })
    //             );
    //             setGroupData(updatedGroups);
    //         } catch (error) {
    //             console.error("โหลดสต๊อกคงเหลือล้มเหลว", error);
    //         }
    //     };

    //     fetchStocks();
    // }, []);

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
                                            <TableCell align="center" width="10%">
                                                ราคาขาย (฿)
                                            </TableCell>
                                            <TableCell align="center" width="10%">
                                                ยอดรวม (฿)
                                            </TableCell>
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
            qtyRef.current.select(); // ✅ ไฮไลท์อัตโนมัติ
        }
    }, [editMode]);

    const handleSave = async () => {
        if (editQty <= 0) {
            AlertDialog({
                title: "จำนวนไม่ถูกต้อง",
                text: "จำนวนอะไหล่ต้องมากกว่า 0",
                icon: "warning",
            });
            return;
        }

        try {
            const res = await axios.get(route("withdrawJob.checkStock"), {
                params: { sp_code: item.sp_code },
            });

            const stock = res.data?.stock_balance ?? 0;

            if (editQty > stock) {
                AlertDialog({
                    title: "สต๊อกไม่เพียงพอ",
                    text: `คงเหลือ ${stock} ชิ้น สต็อคที่คุณต้องการ ${editQty} ชิ้น`,
                    icon: "error",
                });
                return;
            }

            // item.qty = editQty;
            // item.sell_price = editPrice;
            // setEditMode(false);

            onUpdate(group.sku_code, item.sp_code, editQty, editPrice);
            setEditMode(false);

            AlertDialog({
                title: "บันทึกสำเร็จ",
                text: `อัปเดตจำนวน ${item.sp_code} เป็น ${editQty} ชิ้นเรียบร้อยแล้ว`,
                icon: "success",
                timer: 1000,
            });
        } catch (err) {
            console.error(err);
            AlertDialog({
                title: "เกิดข้อผิดพลาด",
                text: err?.response?.data?.message || err.message,
                icon: "error",
            });
        }
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

            <TableCell align="center">
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

            <TableCell align="center">฿{money(rowTotal)}</TableCell>

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

    const handleSave = async () => {
        try {
            const res = await axios.get(route("withdrawJob.checkStock"), {
                params: { sp_code: item.sp_code },
            });
            const stock = res.data?.stock_balance ?? 0;

            if (editQty > stock) {
                AlertDialog({
                    title: "สต๊อกไม่เพียงพอ",
                    text: `คงเหลือ ${stock} ชิ้น แต่ต้องการ ${editQty} ชิ้น`,
                    icon: "error",
                });
                return;
            }

            // item.qty = editQty;
            // item.sell_price = editPrice;
            // setEditMode(false);

            onUpdate(group.sku_code, item.sp_code, editQty, editPrice);
            setEditMode(false);

            AlertDialog({
                title: "สำเร็จ",
                text: `อัปเดต ${item.sp_name} เป็น ${editQty} ชิ้นแล้ว`,
                icon: "success",
                timer: 1200,
            });
        } catch (err) {
            AlertDialog({
                title: "เกิดข้อผิดพลาด",
                text: err?.response?.data?.message || err.message,
                icon: "error",
            });
        }
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