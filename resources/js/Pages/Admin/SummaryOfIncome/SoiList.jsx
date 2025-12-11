import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Autocomplete, Paper, TextField, useTheme } from "@mui/material";
import { Container } from "postcss";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import 'dayjs/locale/th';
dayjs.locale('th');
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function SoiList() {
    const { shops,
        selectedShop,
        currentShopName,
        isAdmin,
        jobs,
        job_id,
        sp_code,
        is_code_key,
        selectedStatus,
        summary,
        start_date,
        end_date
    } = usePage().props;

    const defaultShop = shops.find(s => s.is_code_cust_id === selectedShop) || null;
    const [shopValue, setShopValue] = useState(defaultShop);
    const theme = useTheme();
    const [detailList, setDetailList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [currentJobId, setCurrentJobId] = useState(null);
    const indexRouteName = isAdmin ? "admin.summary-income.index" : "report.summary-income.index";
    const [startDate, setStartDate] = useState(start_date || '');
    const [endDate, setEndDate] = useState(end_date || '');

    useEffect(() => {
        setStartDate(start_date || '');
        setEndDate(end_date || '');
    }, [start_date, end_date]);

    const formatCurrency = (number) => Number(number || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const getDateRangeInfo = () => {
        if (!startDate || !endDate) {
            return "ข้อมูลทั้งหมด";
        }

        const start = dayjs(startDate);
        const end = dayjs(endDate);

        // ถ้าเป็นเดือนเดียวกัน
        if (start.format('YYYY-MM') === end.format('YYYY-MM')) {
            // ใช้ format('MMMM YYYY') เพื่อแสดงชื่อเดือนเป็นภาษาไทย
            return `ข้อมูลประจำเดือน ${start.format('MMMM YYYY')}`;
        }

        // ถ้าเป็นคนละเดือน
        return `ข้อมูลตั้งแต่ ${start.format('DD/MM/YYYY')} ถึง ${end.format('DD/MM/YYYY')}`;
    };

    //แปลง status ให้เป็นชื่อไทย
    const getStatusName = (status) => {
        if (status === "pending") return "กำลังดำเนินการซ่อม";
        if (status === "success") return "ปิดการซ่อมแล้ว";
        if (status === "canceled") return "ยกเลิกงานซ่อม";
        if (status === "send") return "ส่งไปยังศูนย์ซ่อม";
        return status;
    }

    const statusOptions = [
        { value: '', label: 'ทั้งหมด' },
        { value: 'pending', label: 'กำลังดำเนินการซ่อม' },
        { value: 'success', label: 'ปิดการซ่อมแล้ว' },
        { value: 'canceled', label: 'ยกเลิกงานซ่อม' },
        { value: 'send', label: 'ส่งไปยังศูนย์ซ่อม' },
    ];

    const defaultStatus = statusOptions.find(opt => opt.value === selectedStatus) || statusOptions[0];
    const [statusValue, setStatusValue] = useState(defaultStatus);

    // เปลี่ยนสีสถานะ
    const getStatusColor = (status) => {
        if (status === "pending") return "bg-yellow-100 text-yellow-800";      // กำลังซ่อม
        if (status === "success") return "bg-green-100 text-green-800";        // เสร็จแล้ว
        if (status === "canceled") return "bg-red-100 text-red-800";           // ยกเลิก
        if (status === "send") return "bg-blue-100 text-blue-800";             // ส่งไปศูนย์
        return "bg-gray-100 text-gray-800";                                  // default
    };

    const handleSelectShop = (newValue) => {
        setShopValue(newValue);
        // Force a full Inertia visit to update data based on shop
        router.get(
            route(indexRouteName),
            {
                shop: newValue?.is_code_cust_id || "",
                status: statusValue?.value || "",
                start_date: startDate || "",
                end_date: endDate || ""
            },
            { replace: true, preserveState: false }
        );
    };

    const handleSelectStatus = (newValue) => {
        setStatusValue(newValue);
        router.get(
            route(indexRouteName),
            {
                shop: shopValue?.is_code_cust_id || "",
                status: newValue?.value || "",
                start_date: startDate || "",
                end_date: endDate || ""
            },
            {
                replace: true,
                preserveState: true
            }
        );
    };

    const handleDateChange = (type, value) => {
        const newStartDate = type === 'start' ? value : startDate;
        const newEndDate = type === 'end' ? value : endDate;

        if (type === 'start') setStartDate(value);
        if (type === 'end') setEndDate(value);

        // Debounce or apply filter directly. Here we apply directly for simplicity.
        router.get(route(indexRouteName), {
            shop: shopValue?.is_code_cust_id || "",
            status: statusValue?.value || "",
            start_date: newStartDate,
            end_date: newEndDate
        }, { replace: true, preserveState: true });
    };

    const handleShowAllDates = () => {
        setStartDate("");
        setEndDate("");
        router.get(route(indexRouteName), {
            shop: shopValue?.is_code_cust_id || "",
            status: statusValue?.value || "",
            start_date: "",
            end_date: ""
        }, { replace: true, preserveState: true });
    };

    const loadDetail = async (job_id, is_code_key) => {
        setLoading(true);
        setDetailList([]);
        setCurrentJobId(job_id);

        const routeName = isAdmin
            ? "admin.summary-income.detail"
            : "report.summary-income.detail";

        try {
            const res = await axios.get(
                // Use selectedShop from props if shopValue is null or undefined for the route param
                route(routeName, [job_id, shopValue?.is_code_cust_id || selectedShop])
            );
            setDetailList(res.data.details);
            setOpen(true);
        } catch (error) {
            console.error(error);
            alert("ดึงข้อมูลรายละเอียดไม่สำเร็จ");
        }
        setLoading(false);
    };

    const handleExportAll = () => {
        const shopKey = shopValue?.is_code_cust_id || selectedShop;
        const status = statusValue?.value || selectedStatus || '';
        if (!shopKey) {
            alert("กรุณาเลือกหรือเข้าสู่ระบบด้วยร้านค้าที่ถูกต้อง");
            return;
        }
        const routeName = isAdmin
            ? "admin.summary-income.export-all"
            : "report.summary-income.export-all";

        const params = { status };
        if (startDate) {
            params.start_date = startDate;
        }
        if (endDate) {
            params.end_date = endDate;
        }

        const queryParams = new URLSearchParams(params).toString();
        const url = route(routeName, shopKey) + `?${queryParams}`;
        window.location.href = url;
    };


    return (
        <AuthenticatedLayout>
            <Head title='รายสรุปยอดรายรับ ศูนย์ซ่อม แยก เป็น ค่าบริการ ค่าอะไหล่ ค่าตอบแทน'></Head>
            <Paper className='p-6'>
                <h2>
                    <span role="img" aria-label="chart">📊</span> รายสรุปยอดรายรับ ศูนย์ซ่อม แยก เป็น ค่าบริการ ค่าอะไหล่ ค่าตอบแทน ร้าน:
                    <span className="text-orange-500 font-bold ml-2">{currentShopName}</span>
                </h2>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

                    {/* Shop Select (Admin only) */}
                    {isAdmin && (
                        <div className="col-span-1">
                            <Autocomplete
                                options={shops}
                                fullWidth
                                value={shopValue}
                                onChange={(e, v) => handleSelectShop(v)}
                                getOptionLabel={(option) =>
                                    option?.shop_name ? `${option.shop_name}` : ""
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="ร้านค้า" size="small" />
                                )}
                                isOptionEqualToValue={(option, value) => option.is_code_cust_id === value.is_code_cust_id}
                            />
                        </div>
                    )}

                    {/* Status Select */}
                    <div className="col-span-1">
                        <Autocomplete
                            options={statusOptions}
                            fullWidth
                            value={statusValue}
                            onChange={(e, v) => handleSelectStatus(v)}
                            getOptionLabel={(option) => option.label || "ทั้งหมด"}
                            renderInput={(params) => (
                                <TextField {...params} label="สถานะงาน" size="small" />
                            )}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                        />
                    </div>

                    {/* Date Range Inputs */}
                    <div className="col-span-1 flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">วันที่เริ่มต้น</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            className="border border-gray-300 p-2 rounded-md w-full h-10 text-sm"
                        />
                    </div>
                    <div className="col-span-1 flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">วันที่สิ้นสุด</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            className="border border-gray-300 p-2 rounded-md w-full h-10 text-sm"
                        />
                    </div>

                    {/* Action Buttons Group */}
                    <div className="col-span-1 flex gap-2 h-10">
                        <button
                            onClick={handleShowAllDates}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg h-full text-sm hover:bg-gray-700 transition duration-150 ease-in-out"
                            title="แสดงข้อมูลทั้งหมดโดยไม่จำกัดช่วงวันที่"
                        >
                            <span role="img" aria-label="calendar">🗓️</span>
                        </button>
                        <button
                            onClick={handleExportAll}
                            // className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition duration-150 ease-in-out flex-grow text-sm"
                            className="bg-green-500 p-2 text-white rounded-lg hover:bg-green-600"
                        >
                            <span className="flex"> <FileDownloadIcon /> Export Excel </span>
                            {/* <span role="img" aria-label="export">📦</span> Export Excel */}
                        </button>
                    </div>

                    {/* Date Range Info Bar - Below filters, taking full width in a new row */}
                    {/* <div className="md:col-span-5 col-span-1 w-full mt-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-semibold text-blue-900">{getDateRangeInfo()}</p>
                        </div>
                    </div> */}
                </div>

                <hr className="my-6" />
                {/* Card - Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-4">
                    <div className="p-5 rounded-lg shadow text-center border-b-4 border-gray-400" style={{ background: "#f1f1f1" }}>
                        <div className="text-xs text-gray-600 uppercase font-medium">จำนวน JOB ทั้งหมด</div>
                        <div className="text-3xl font-extrabold mt-1 text-gray-800">
                            {summary.total_jobs.toLocaleString()}
                        </div>
                    </div>
                    <div className="p-5 rounded-lg shadow text-center border-b-4 border-orange-400" style={{ background: "#ffcc80" }}>
                        <div className="text-xs text-orange-800 uppercase font-medium">มูลค่ารวม (ค่าอะไหล่/ราคาขาย)</div>
                        <div className="text-3xl font-extrabold mt-1 text-orange-900">
                            {formatCurrency(summary.total_sale_price)}
                        </div>
                    </div>
                    <div className="p-5 rounded-lg shadow text-center border-b-4 border-orange-400" style={{ background: "#ffcc80" }}>
                        <div className="text-xs text-orange-800 uppercase font-medium">มูลค่ารวม (ค่าบริการ)</div>
                        <div className="text-3xl font-extrabold mt-1 text-orange-900">
                            {formatCurrency(summary.total_service_fee)}
                        </div>
                    </div>
                    <div className="p-5 rounded-lg shadow text-center border-b-4 border-orange-400" style={{ background: "#ffcc80" }}>
                        <div className="text-xs text-orange-800 uppercase font-medium">มูลค่ารวม (ค่าตอบแทน)</div>
                        <div className="text-3xl font-extrabold mt-1 text-orange-900">
                            {formatCurrency(summary.total_startup_cost)}
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="mt-2 bg-white p-4 shadow sm:rounded-lg overflow-x-auto">
                    <p className="text-sm font-semibold text-blue-900">{getDateRangeInfo()}</p>
                    <table className="w-full min-w-[1000px] table-auto border divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">#</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">วันที่งาน</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">สถานะงาน</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">เลขที่งาน</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">รหัสสินค้า</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">การรับประกัน</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">จำนวนอะไหล่</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">มูลค่า อะไหล่</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">มูลค่า ค่าบริการ</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">มูลค่า ค่าตอบแทน</th>
                                <th className="p-2 border text-center text-xs font-semibold text-gray-700 uppercase">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jobs.data.map((job, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-2 border text-center text-sm">
                                        {(jobs.current_page - 1) * jobs.per_page + idx + 1}
                                    </td>
                                    <td className="p-2 border text-center text-sm">
                                        {dayjs(job.created_at).format("DD/MM/YYYY")}
                                    </td>
                                    <td className={`p-2 border text-center text-xs font-bold rounded ${getStatusColor(job.status)}`}>
                                        {getStatusName(job.status)}
                                    </td>
                                    <td className="p-2 border text-center text-sm font-mono">{job.job_id}</td>
                                    <td className="p-2 border text-center text-sm">{job.pid}</td>
                                    <td className="p-2 border text-center">
                                        {job.warranty === "yes" || job.warranty === "t" || job.warranty === true || job.warranty === 1 ? (
                                            <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                                No
                                            </span>

                                        )}
                                    </td>
                                    <td className="p-2 border text-center text-sm">{job.spare_count || 0}</td>
                                    <td className="p-2 border text-right text-sm font-medium">
                                        {formatCurrency(job.total_sale_price)}
                                    </td>

                                    {/* Service Fee */}
                                    <td className="p-2 border text-right text-sm font-medium">
                                        {job.service_fee > 0 ? formatCurrency(job.service_fee) : "-"}
                                    </td>

                                    {/* Startup Cost */}
                                    <td className="p-2 border text-right text-sm font-medium">
                                        {(job.warranty && job.status === "success" && job.startup_cost > 0)
                                            ? formatCurrency(job.startup_cost)
                                            : "-"}
                                    </td>

                                    {/* Detail Button */}
                                    <td className="border p-2 text-center">
                                        <button
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out"
                                            onClick={() => loadDetail(job.job_id, selectedShop)}
                                            title={`ดูรายละเอียดอะไหล่/ค่าบริการของงาน ${job.job_id}`}
                                        >
                                            <FilePresentIcon fontSize="small" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {jobs.data.length === 0 && (
                                <tr>
                                    <td colSpan="11" className="p-4 text-center text-gray-500">ไม่พบข้อมูลงานซ่อมในเงื่อนไขที่เลือก</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center items-center gap-2">
                    {/* Prev */}
                    <button
                        disabled={!jobs.prev_page_url}
                        onClick={() =>
                            router.get(
                                jobs.prev_page_url,
                                {},
                                { preserveState: true, preserveScroll: true }
                            )
                        }
                        className={`px-3 py-1 border rounded text-sm transition duration-150 ease-in-out
                            ${jobs.prev_page_url ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    >
                        &lsaquo; ก่อนหน้า
                    </button>
                    {/* Page Numbers */}
                    {jobs.links
                        .filter(link => link.label !== "pagination.previous" && link.label !== "pagination.next")
                        .map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(
                                    link.url,
                                    {
                                        shop: shopValue?.is_code_cust_id || "",
                                        status: statusValue?.value || "",
                                        start_date: startDate,
                                        end_date: endDate
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true
                                    })}
                                className={`px-3 py-1 border rounded text-sm transition duration-150 ease-in-out
                                    ${link.active ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 hover:bg-gray-300"}
                                `}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    {/* Next */}
                    <button
                        disabled={!jobs.next_page_url}
                        onClick={() =>
                            router.get(
                                jobs.next_page_url,
                                {
                                    shop: shopValue?.is_code_cust_id || "",
                                    status: statusValue?.value || "",
                                    start_date: startDate,
                                    end_date: endDate
                                },
                                { preserveState: true, preserveScroll: true }
                            )
                        }
                        className={`px-3 py-1 border rounded text-sm transition duration-150 ease-in-out
                            ${jobs.next_page_url ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    >
                        ถัดไป &rsaquo;
                    </button>
                </div>
            </Paper>

            {/* Detail Modal (Unchanged functional structure) */}
            {open && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
                    <div className="relative p-6 border w-full max-w-4xl shadow-2xl rounded-xl bg-white transform transition-all duration-300 ease-out">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h3 className="text-xl font-extrabold text-gray-900 flex items-center">
                                <span className="mr-2 text-blue-600"><FilePresentIcon fontSize="medium" /></span>
                                รายละเอียดอะไหล่/ค่าบริการ (JOB ID: <span className="text-red-500 ml-1">{currentJobId}</span>)
                            </h3>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-3xl font-semibold leading-none p-1 transition duration-150"
                                title="ปิดหน้าต่าง"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mt-4 max-h-[70vh] overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-lg text-blue-500 font-medium py-10">กำลังโหลดรายละเอียด...</p>
                            ) : detailList.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead className="bg-gray-50 sticky top-0 shadow-sm">
                                        <tr>
                                            <th className="p-2 border text-center text-xs font-bold text-gray-700 uppercase">วันที่</th>
                                            <th className="p-2 border text-left text-xs font-bold text-gray-700 uppercase">คำอธิบาย</th>
                                            <th className="p-2 border text-left text-xs font-bold text-gray-700 uppercase">รหัสสินค้า</th>
                                            <th className="p-2 border text-center text-xs font-bold text-gray-700 uppercase">รหัสอะไหล่</th>
                                            <th className="p-2 border text-center text-xs font-bold text-gray-700 uppercase">รายการอะไหล่</th>
                                            <th className="p-2 border text-right text-xs font-bold text-gray-700 uppercase">ราคาตั้ง</th>
                                            <th className="p-2 border text-right text-xs font-bold text-gray-700 uppercase">ราคาทุน</th>
                                            <th className="p-2 border text-right text-xs font-bold text-gray-700 uppercase">ราคาขาย</th>
                                            <th className="p-2 border text-center text-xs font-bold text-gray-700 uppercase">ชื่อลูกค้า</th>
                                            <th className="p-2 border text-center text-xs font-bold text-gray-700 uppercase">จำนวน</th>
                                            <th className="p-2 border text-center text-xs font-bold text-gray-700 uppercase">อัพเดทเมื่อ</th>
                                            <th className="p-2 border text-center text-xs font-bold text-gray-700 uppercase">ผู้ทำรายการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {detailList.map((detail, index) => (
                                            <tr
                                                key={index}
                                                className={detail.sp_warranty === true
                                                    ? 'bg-green-200 hover:bg-green-100'
                                                    : (index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100')}
                                            >
                                                <td className="p-2 border whitespace-nowrap text-xs text-gray-900 text-center">{dayjs(detail.date).format("DD/MM/YYYY")}</td>
                                                <td className="p-2 border whitespace-nowrap text-sm text-gray-700">{detail.ref_no || '-'}</td>
                                                <td className="p-2 border whitespace-nowrap text-sm text-gray-700">{detail.pid || '-'}</td>
                                                <td className="p-2 border whitespace-nowrap text-sm text-gray-700 text-center font-mono">{detail.sp_code}</td>
                                                <td className="p-2 border whitespace-nowrap text-sm text-gray-700">{detail.sp_name}</td>
                                                <td className="p-2 border whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(detail.stdprice_per_unit)}</td>
                                                <td className="p-2 border whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(detail.price_per_unit)}</td>
                                                <td className="p-2 border whitespace-nowrap text-sm font-semibold text-gray-900 text-right">{formatCurrency(detail.price_multiple_gp)}</td>
                                                <td className="p-2 border text-center text-sm text-gray-700">{detail.customer_name || '-'}</td>
                                                <td className="p-2 border text-center whitespace-nowrap text-sm text-gray-700">{detail.qty || 0}</td>
                                                <td className="p-2 border text-center whitespace-nowrap text-xs text-gray-700">
                                                    {dayjs(detail.updated_at).format('DD/MM/YYYY HH:mm')}
                                                </td>
                                                <td className="p-2 border whitespace-nowrap text-sm text-gray-700 text-center">{detail.updated_by || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500 py-10">ไม่พบรายละเอียดอะไหล่สำหรับงานนี้</p>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-6 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    )
}