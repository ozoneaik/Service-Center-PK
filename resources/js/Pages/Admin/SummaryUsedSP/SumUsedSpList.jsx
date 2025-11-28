import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Head, router, usePage } from "@inertiajs/react"
import { Autocomplete, Box, Modal, TextField, useMediaQuery, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilePresentIcon from '@mui/icons-material/FilePresent';
<style>
    {`
@media (max-width: 640px) {
    .mobile-table {
        display: block;
    }
    .mobile-table thead {
        display: none;
    }
    .mobile-table tbody tr {
        display: block;
        margin-bottom: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 10px;
    }
    .mobile-table td {
        display: flex;
        justify-content: space-between;
        padding: 6px 0 !important;
        border: none !important;
    }
    .mobile-table td:before {
        content: attr(data-label);
        font-weight: bold;
        color: #555;
    }
}
`}
</style>

export default function SumUsedSpList() {
    const { shops, selectedShop, currentShopName, isAdmin, spareParts, summary, search } = usePage().props;
    const defaultShop = shops.find(s => s.is_code_cust_id === selectedShop) || null;
    const [shopValue, setShopValue] = useState(defaultShop);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);
    const [detailList, setDetailList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [filterStatus, setFilterStatus] = useState("");

    // SEARCH
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            router.get(
                route(
                    isAdmin
                        ? "admin.summary-spare-parts.index"
                        : "report.summary-spare-parts.index"
                ),
                {
                    shop: shopValue?.is_code_cust_id || "",
                    search: searchTerm,
                },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, 500); // หน่วง 500ms

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, shopValue]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            router.get(
                route(
                    isAdmin
                        ? "admin.summary-spare-parts.index"
                        : "report.summary-spare-parts.index"
                ),
                {
                    shop: shopValue?.is_code_cust_id || "",
                    search: searchTerm,
                    filter: filterStatus, // เพิ่มตรงนี้
                },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, shopValue, filterStatus]);

    const loadDetail = async (sp) => {
        setLoading(true);
        try {
            const res = await axios.get(sp.detail_url);
            setDetailList(res.data.details);
            setOpen(true);
        } catch (error) {
            console.error(error);
            alert("ดึงข้อมูลรายละเอียดไม่สำเร็จ");
        }
        setLoading(false);
    };

    const handleSelectShop = (newValue) => {
        setShopValue(newValue);

        router.get(
            route("admin.summary-spare-parts.index"),
            { shop: newValue?.is_code_cust_id || "" },
            { replace: true }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="รายงานอะไหล่ที่ใช้ไป" />

            <section className="p-3">
                <div className="pt-3 pl-4">
                    <h2>
                        รายงานสรุปยอดอะไหล่ที่ใช้ไป ร้าน{" "}
                        <span className="font-bold">{currentShopName}</span>
                    </h2>
                </div>
                <div className="flex flex-col md:flex-row gap-4">

                    {/* ค้นหารหัส / ชื่ออะไหล่ */}
                    <div className="mt-4 ml-4">
                        <TextField
                            label="ค้นหารหัสอะไหล่ / ชื่ออะไหล่"
                            variant="outlined"
                            fullWidth={isMobile}
                            sx={{ width: isMobile ? "100%" : 300 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* เลือกร้านค้า */}
                    <div className="mt-4">
                        {isAdmin && (
                            <Autocomplete
                                options={shops}
                                sx={{ width: isMobile ? "100%" : 300 }}
                                value={shopValue}
                                onChange={(e, v) => handleSelectShop(v)}
                                getOptionLabel={(option) =>
                                    option?.shop_name ? `${option.shop_name}` : ""
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="เลือกสาขา / ร้าน" />
                                )}
                            />
                        )}
                    </div>
                    <div className="mt-4">
                        <TextField
                            select
                            SelectProps={{ native: true }}
                            sx={{ width: isMobile ? "100%" : 200 }}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}

                        >
                            <option value="">กรองสถานะทั้งหมด</option>
                            <option value="repair_complete">งานซ่อม (complete)</option>
                            <option value="repair_process">งานซ่อม (process)</option>
                            <option value="withdraw_process">งานเบิก (process)</option>
                            <option value="withdraw_complete">งานเบิก (complete)</option>
                        </TextField>
                    </div>

                    {/* ปุ่ม Export Excel */}
                    <div className="mt-4">
                        <button
                            onClick={() => {
                                const url = route(
                                    isAdmin
                                        ? "admin.summary-spare-parts.export"
                                        : "report.summary-spare-parts.export"
                                ) + `?shop=${shopValue?.is_code_cust_id}&search=${searchTerm}`;

                                window.open(url, "_blank");
                            }}
                            className="flex justify-center p-2 items-center bg-green-600 text-white rounded shadow hover:bg-green-700"
                        >
                            Excel
                            <FileDownloadIcon />
                        </button>
                    </div>

                </div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pl-4 pr-4">

                    {/* รายการอะไหล่ทั้งหมด */}
                    <div className="p-5 rounded-lg shadow text-center" style={{ background: "#f1f1f1" }}>
                        <div className="text-3xl font-bold">{summary.total_list}</div>
                        <div>จำนวนรายการอะไหล่</div>
                    </div>

                    {/* process */}
                    <div className="p-5 rounded-lg shadow text-center" style={{ background: "#ffcc80" }}>
                        <div className="text-3xl font-bold">{summary.total_process}</div>
                        <div>จำนวนซ่อมสถานะกำลังดำเนินการ (process)</div>
                    </div>

                    {/* complete */}
                    <div className="p-5 rounded-lg shadow text-center" style={{ background: "#ffcc80" }}>
                        <div className="text-3xl font-bold">{summary.total_complete}</div>
                        <div>จำนวนซ่อมสถานะปิดงานแล้ว (complete)</div>
                    </div>

                    {/* รวมจำนวนซ่อมทั้งหมด */}
                    <div className="p-5 rounded-lg shadow text-center" style={{ background: "#ffcc80", border: "2px solid #ffcc9d" }}>
                        <div className="text-3xl font-bold">{summary.total_all_repair}</div>
                        <div>รวม จำนวนซ่อมทั้งหมด</div>
                    </div>

                    {/* withdraw process */}
                    <div
                        className="p-5 rounded-lg shadow text-center"
                        style={{ background: "#ffab91", border: "2px solid #ffbd7a" }}
                    >
                        <div className="text-3xl font-bold">{summary.total_withdraw_process}</div>
                        <div>งานเบิกสถานะกำลังดำเนินการ (process)</div>
                    </div>

                    {/* withdraw complete */}
                    <div
                        className="p-5 rounded-lg shadow text-center"
                        style={{ background: "#ffab91", border: "2px solid #e8a869" }}
                    >
                        <div className="text-3xl font-bold">{summary.total_withdraw_complete}</div>
                        <div>งานเบิกสถานะปิดงานแล้ว (complete)</div>
                    </div>

                    <div className="p-5 rounded-lg shadow text-center" style={{ background: "#ffab91", border: "2px solid #ffcc9d" }}>
                        <div className="text-3xl font-bold">{summary.total_all_withdraw}</div>
                        <div>รวม จำนวนเบิกทั้งหมด</div>
                    </div>

                    <div className="p-5 rounded-lg shadow text-center" style={{ background: "#eeeeee" }}>
                        <div className="text-3xl font-bold">{summary.total_all}</div>
                        <div>รวมรายการทั้งหมด</div>
                    </div>
                </div>

                {/* ตารางอะไหล่ */}
                <div className="mt-5 bg-white p-4 shadow sm:rounded-lg">
                    {/* <h3 className="font-bold mb-2">รายการอะไหล่ในสต็อคร้าน: <span className="font-bold">{currentShopName}</span></h3> */}
                    <div className="overflow-x-auto w-full pl-4">
                        <table className="w-full table-auto border mobile-table">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">#</th>
                                    <th className="p-2 border">รูปอะไหล่</th>
                                    <th className="p-2 border">รหัสอะไหล่</th>
                                    <th className="p-2 border">ชื่ออะไหล่</th>
                                    <th className="p-2 border">หน่วย</th>
                                    {/* <th className="p-2 border">จำนวนคงเหลือ</th> */}
                                    <th className="p-2 border text-blue-600">งานซ่อม (process)</th>
                                    <th className="p-2 border text-green-600">งานซ่อม (complete)</th>
                                    <th className="p-2 border text-orange-600">งานเบิก (process)</th>
                                    <th className="p-2 border text-orange-800">งานเบิก (complete)</th>
                                    <th className="p-2 border text-purple-600">รวม</th>
                                    <th className="p-2 border text-center">รายละเอียด</th>
                                </tr>
                            </thead>

                            <tbody>
                                {spareParts.data.map((sp, index) => {
                                    const imgUrl = sp.sku_code
                                        ? `https://images.pumpkin.tools/SKUS/SP/offn/${sp.sp_code}.jpg`
                                        : "https://images.dcpumpkin.com/images/product/500/default.jpg";

                                    return (
                                        <tr key={sp.sp_code}>
                                            <td className="border p-2 text-center">
                                                {(spareParts.current_page - 1) * spareParts.per_page +
                                                    index +
                                                    1}
                                            </td>

                                            <td className="border p-2 text-center">
                                                <img
                                                    src={imgUrl}
                                                    alt={sp.sp_name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                            "https://images.dcpumpkin.com/images/product/500/default.jpg";
                                                    }}
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </td>

                                            <td className="border p-2 text-center">{sp.sp_code}</td>
                                            <td className="border p-2 text-center">{sp.sp_name}</td>
                                            <td className="border p-2 text-center">{sp.sp_unit ?? "-"}</td>
                                            {/* <td className="border p-2 text-center">{sp.qty_sp}</td> */}

                                            <td className="border p-2 text-center text-blue-600 font-bold">
                                                {sp.process_count}
                                            </td>
                                            <td className="border p-2 text-center text-green-600 font-bold">
                                                {sp.complete_count}
                                            </td>
                                            <td className="border p-2 text-center text-orange-600 font-bold">
                                                {sp.withdraw_process}
                                            </td>
                                            <td className="border p-2 text-center text-orange-800 font-bold">
                                                {sp.withdraw_complete}
                                            </td>
                                            <td className="border p-2 text-center text-purple-600 font-bold">
                                                {sp.total_used}
                                            </td>
                                            <td className="border p-2 text-center">
                                                <button
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    onClick={() => loadDetail(sp)}
                                                >
                                                    <FilePresentIcon />
                                                    {/* ดู */}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Modal open={open} onClose={() => setOpen(false)}>
                        <Box sx={{
                            background: "white",
                            width: "90%",
                            maxWidth: 1000,
                            margin: "100px auto",
                            padding: "20px",
                            borderRadius: "10px",
                            maxHeight: "80vh",
                            overflowY: "auto"
                        }}>
                            <h2 className="font-bold text-xl mb-3">รายละเอียด</h2>

                            {loading ? (
                                <p>กำลังโหลด...</p>
                            ) : (
                                <table className="w-full table-auto border">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2 border">วันที่</th>
                                            <th className="p-2 border">คำอธิบาย</th>
                                            <th className="p-2 border">ชื่อลูกค้า</th>
                                            <th className="p-2 border">จำนวน</th>
                                            <th className="p-2 border">อัพเดทเมื่อ</th>
                                            <th className="p-2 border">ผู้ทำรายการ</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {detailList.map((d, idx) => (
                                            <tr key={idx}>
                                                {/* วันที่ */}
                                                <td className="border p-2">
                                                    {dayjs(d.date).format("DD/MM/YYYY")}
                                                </td>

                                                {/* หมายเลขอ้างอิง */}
                                                <td className="border p-2">
                                                    {d.type === "repair" ? (
                                                        <span className="text-blue-600 font-bold">
                                                            งานซ่อม: {d.ref_no}
                                                        </span>
                                                    ) : (
                                                        <span className="text-orange-600 font-bold">
                                                            เบิก: {d.ref_no}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* ชื่อลูกค้า (เฉพาะงานซ่อม) */}
                                                <td className="border p-2">
                                                    {d.type === "repair" ? d.customer_name : "-"}
                                                </td>

                                                {/* จำนวน */}
                                                <td className="border p-2 text-center">{d.qty}</td>

                                                {/* updated at */}
                                                <td className="border p-2">
                                                    {dayjs(d.updated_at).format("DD/MM/YYYY HH:mm")}
                                                </td>

                                                {/* ผู้ทำรายการ */}
                                                <td className="border p-2">{d.updated_by}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            <div className="mt-4 text-right">
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded"
                                    onClick={() => setOpen(false)}
                                >
                                    ปิด
                                </button>
                            </div>
                        </Box>
                    </Modal>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center">
                        <button
                            disabled={!spareParts.prev_page_url}
                            onClick={() =>
                                router.get(
                                    spareParts.prev_page_url,
                                    {},
                                    { preserveState: true, preserveScroll: true, replace: true }
                                )
                            }
                            className="px-3 py-1 border mx-1 bg-gray-200"
                        >
                            ก่อนหน้า
                        </button>

                        <button
                            disabled={!spareParts.next_page_url}
                            onClick={() =>
                                router.get(
                                    spareParts.next_page_url,
                                    {},
                                    { preserveState: true, preserveScroll: true, replace: true }
                                )
                            }
                            className="px-3 py-1 border mx-1 bg-gray-200"
                        >
                            ถัดไป
                        </button>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}