// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import { Head, Link, useForm } from "@inertiajs/react";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//     CheckCircle,
//     Info,
//     Refresh,
//     Warning,
//     Error as ErrorIcon,
// } from "@mui/icons-material";
// import { AlertDialogQuestion } from "@/Components/AlertDialog";
// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogContentText,
//     DialogActions,
//     Button,
//     Typography,
//     Box,
// } from "@mui/material";

// export default function SuccessSendJobs() {
//     const [jobs, setJobs] = useState([]);
//     const [selectedJobIds, setSelectedJobIds] = useState([]);
//     const [searchLoading, setSearchLoading] = useState(false);
//     const [finishLoading, setFinishLoading] = useState(false);
//     const [alert, setAlert] = useState(null);
//     const [isVisible, setIsVisible] = useState(false);

//     const [currentView, setCurrentView] = useState("all_current");
//     const [searchMode, setSearchMode] = useState("individual");
//     const [statusCheckingJobId, setStatusCheckingJobId] = useState(null);
//     const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
//     const [jobsToFinishConfirm, setJobsToFinishConfirm] = useState([]);
//     const [activeTab, setActiveTab] = useState("all");

//     const { data, setData, reset } = useForm({
//         job_id: "",
//         serial_id: "",
//         group_job: "",
//     });

//     const [filters, setFilters] = useState({
//         job_id: "",
//         serial_id: "",
//         pid: "",
//         group_job: "",
//         start_date: "",
//         end_date: "",
//         status: "",
//     });

//     // ฟังก์ชันช่วยในการรีเซ็ตค่าทั้งหมด
//     const resetAll = () => {
//         reset();
//         setJobs([]);
//         setSelectedJobIds([]);
//         setAlert(null);
//     };

//     const checkJobStatusAndRefresh = async (job) => {
//         setStatusCheckingJobId(job.job_id);
//         setAlert(null);

//         try {
//             const response = await axios.post(
//                 route("sendJobs.checkJobStatus"),
//                 {
//                     job_id: job.job_id,
//                     serial_id: job.serial_id,
//                     pid: job.pid,
//                 },
//             );

//             const apiStatus = response.data.api_status;
//             const newTicketCode = response.data.ticket_code;
//             setJobs((prevJobs) =>
//                 prevJobs.map((item) => {
//                     if (item.job_id === job.job_id) {
//                         return {
//                             ...item,
//                             status: apiStatus,
//                             ticket_code: newTicketCode,
//                         };
//                     }
//                     return item;
//                 }),
//             );

//             setAlert({
//                 type: "success",
//                 message: `Job ID ${job.job_id} สถานะปัจจุบันเป็น: ${getStatus(apiStatus)}`,
//             });
//         } catch (error) {
//             console.error("Error checking status:", error);
//             const errorMsg =
//                 error.response?.data?.message ||
//                 error.message ||
//                 "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในการเช็คสถานะ";
//             setAlert({
//                 type: "error",
//                 message: `Job ID ${job.job_id} ข้อผิดพลาด: ${errorMsg}`,
//             });
//         } finally {
//             setStatusCheckingJobId(null);
//         }
//     };

//     const fetchAllCurrentJobs = async (searchFilters = filters) => {
//         setJobs([]);
//         setSelectedJobIds([]);
//         setAlert(null);
//         setSearchLoading(true);

//         try {
//             const response = await axios.post(
//                 route("sendJobs.allList"),
//                 searchFilters,
//             );

//             if (response.data.jobs && response.data.jobs.length > 0) {
//                 setJobs(response.data.jobs);
//                 setAlert({
//                     type: "success",
//                     message: `พบรายการงานทั้งหมด ${response.data.jobs.length} รายการ`,
//                 });
//             } else {
//                 setJobs([]);
//                 setAlert({
//                     type: "info",
//                     message: response.data.message || "ไม่พบรายการงานที่รอปิด",
//                 });
//             }
//         } catch (error) {
//             setJobs([]);
//             const errorMsg =
//                 error.response?.data?.message ||
//                 error.message ||
//                 "เกิดข้อผิดพลาดในการโหลดรายการงาน";
//             setAlert({ type: "error", message: errorMsg });
//         } finally {
//             setSearchLoading(false);
//         }
//     };

//     const handleResetFilter = () => {
//         const emptyFilters = {
//             group_job: "",
//             job_id: "",
//             serial_id: "",
//             pid: "",
//             start_date: "",
//             end_date: "",
//             status: "",
//         };
//         setFilters(emptyFilters);
//         // fetchAllCurrentJobs(emptyFilters);
//         if (currentView === "history") {
//             fetchHistoryJobs(emptyFilters);
//         } else {
//             fetchAllCurrentJobs(emptyFilters);
//         }
//     };

//     const handleFilterSubmit = (e) => {
//         e.preventDefault();
//         // fetchAllCurrentJobs();
//         if (currentView === "history") {
//             fetchHistoryJobs();
//         } else {
//             fetchAllCurrentJobs();
//         }
//     };

//     const handleViewChange = (view) => {
//         setCurrentView(view);
//         resetAll();

//         if (view === "history") {
//             fetchHistoryJobs();
//         } else if (view === "all_current") {
//             fetchAllCurrentJobs();
//         }
//     };

//     const handleClose = () => {
//         setIsVisible(false);
//         setTimeout(() => {
//             setAlert(null);
//         }, 300);
//     };

//     useEffect(() => {
//         if (alert) {
//             setIsVisible(true);

//             const timer = setTimeout(() => handleClose(), 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [alert]);

//     useEffect(() => {
//         fetchAllCurrentJobs();
//     }, []);

//     const handleModeChange = (mode) => {
//         setSearchMode(mode);
//         resetAll();
//     };

//     const getStatus = (status) => {
//         return status;
//     };

//     // รับ searchFilters เข้ามาแทน
//     const fetchHistoryJobs = async (searchFilters = filters) => {
//         setJobs([]);
//         setSelectedJobIds([]);
//         setAlert(null);
//         setSearchLoading(true);

//         try {
//             // ส่ง searchFilters ไปยัง API
//             const response = await axios.post(
//                 route("sendJobs.history"),
//                 searchFilters,
//             );

//             if (response.data.jobs && response.data.jobs.length > 0) {
//                 setJobs(response.data.jobs);
//                 setAlert({
//                     type: "success",
//                     message: `พบรายการประวัติการปิดงานสำเร็จ ${response.data.jobs.length} รายการ`,
//                 });
//             } else {
//                 setJobs([]);
//                 setAlert({
//                     type: "info",
//                     message:
//                         response.data.message ||
//                         "ไม่พบประวัติการปิดงานตามเงื่อนไข",
//                 });
//             }
//         } catch (error) {
//             setJobs([]);
//             const errorMsg =
//                 error.response?.data?.message ||
//                 error.message ||
//                 "เกิดข้อผิดพลาดในการค้นหาประวัติ";
//             setAlert({ type: "error", message: errorMsg });
//         } finally {
//             setSearchLoading(false);
//         }
//     };

//     const handleSearch = async (e) => {
//         e.preventDefault();
//         setJobs([]);
//         setSelectedJobIds([]);
//         setAlert(null);
//         setSearchLoading(true);

//         let searchData = {};
//         let errorMessage = "";

//         // ฟังก์ชันนี้จะทำงานเฉพาะในโหมด close_current แบบ Search เท่านั้น
//         if (currentView !== "close_current") {
//             setSearchLoading(false);
//             return;
//         }

//         if (searchMode === "individual") {
//             const isJobIdEmpty = !data.job_id.trim();
//             const isSerialIdEmpty = !data.serial_id.trim();

//             if (currentView === "close_current") {
//                 if (isJobIdEmpty || isSerialIdEmpty) {
//                     errorMessage =
//                         "โหมด 'ซีเรียลและเลข Job' ต้องกรอกทั้ง เลขที่ Job และ เลขที่ Serial สำหรับงานที่รอปิด";
//                 }
//             } else if (currentView === "history") {
//                 if (isJobIdEmpty && isSerialIdEmpty) {
//                     errorMessage =
//                         "โหมด 'ซีเรียลและเลข Job' สำหรับประวัติต้องกรอกอย่างน้อย เลขที่ Job หรือ เลขที่ Serial";
//                 }
//             }

//             if (!errorMessage) {
//                 searchData = {
//                     job_id: data.job_id,
//                     serial_id: data.serial_id,
//                     group_job: "",
//                 };
//             }
//         } else if (searchMode === "group") {
//             if (!data.group_job.trim()) {
//                 errorMessage = "โหมด 'เลข Group Job' ต้องกรอก เลขที่ Group Job";
//             } else {
//                 searchData = {
//                     job_id: "",
//                     serial_id: "",
//                     group_job: data.group_job,
//                 };
//             }
//         }

//         if (errorMessage) {
//             setJobs([]);
//             setAlert({ type: "warning", message: errorMessage });
//             setSearchLoading(false);
//             return;
//         }

//         try {
//             // โหมดปัจจุบันแบบ Search
//             const response = await axios.post(
//                 route("sendJobs.search"),
//                 searchData,
//             );

//             if (response.data.jobs && response.data.jobs.length > 0) {
//                 setJobs(response.data.jobs);
//                 setAlert({
//                     type: "success",
//                     message: `พบรายการ Job สถานะ 'ส่งซ่อมไปยังพัมคิน' จำนวน ${response.data.jobs.length} รายการ`,
//                 });
//             } else {
//                 setJobs([]);
//                 setAlert({
//                     type: "info",
//                     message:
//                         response.data.message || "ไม่พบรายการ Job ที่รอปิดงาน",
//                 });
//             }
//         } catch (error) {
//             setJobs([]);
//             const errorMsg =
//                 error.response?.data?.message ||
//                 error.message ||
//                 "เกิดข้อผิดพลาดในการค้นหา";
//             setAlert({ type: "error", message: errorMsg });
//         } finally {
//             setSearchLoading(false);
//         }
//     };

//     const handleCheckboxChange = (jobId) => {
//         setSelectedJobIds((prevSelected) => {
//             if (prevSelected.includes(jobId)) {
//                 return prevSelected.filter((id) => id !== jobId);
//             } else {
//                 return [...prevSelected, jobId];
//             }
//         });
//     };

//     const isReadyToFinish = () => {
//         if (selectedJobIds.length === 0) return false;

//         const selectedJobs = jobs.filter((job) =>
//             selectedJobIds.includes(job.job_id),
//         );

//         return selectedJobs.some(
//             (job) =>
//                 job.status === "ส่งสำเร็จ" ||
//                 job.status === "จบงาน" ||
//                 job.status === "ส่งของแล้ว" ||
//                 job.status === "บัญชีรับงานแล้ว" ||
//                 job.status === "จัดส่งสำเร็จ",
//         );
//     };

//     const handleConfirmOpen = () => {
//         if (selectedJobIds.length === 0) {
//             setAlert({
//                 type: "warning",
//                 message: "กรุณาเลือกรายการ Job ที่ต้องการจบงาน",
//             });
//             return;
//         }

//         // 1. เตรียมข้อมูลสำหรับส่ง
//         const dataToFinish = jobs
//             .filter((job) => selectedJobIds.includes(job.job_id))
//             .map((job) => ({
//                 job_id: job.job_id,
//                 serial_id: job.serial_id,
//                 pid: job.pid,
//             }));

//         setJobsToFinishConfirm(dataToFinish);
//         setOpenConfirmDialog(true);
//     };

//     const handleFinishJob = async (confirmed) => {
//         setOpenConfirmDialog(false);

//         if (!confirmed || jobsToFinishConfirm.length === 0) {
//             return;
//         }

//         setFinishLoading(true);
//         setAlert(null);

//         try {
//             const response = await axios.post(route("sendJobs.finish"), {
//                 jobs_to_finish: jobsToFinishConfirm,
//             });

//             if (response.data.success) {
//                 setCurrentView("history");
//                 setSelectedJobIds([]);
//                 const emptyFilters = {
//                     group_job: "",
//                     job_id: "",
//                     serial_id: "",
//                     pid: "",
//                     start_date: "",
//                     end_date: "",
//                     status: "",
//                 };
//                 setFilters(emptyFilters);
//                 reset();

//                 await fetchHistoryJobs(emptyFilters);

//                 setAlert({ type: "success", message: response.data.message });
//             } else {
//                 setAlert({ type: "warning", message: response.data.message });
//             }
//         } catch (error) {
//             let errorMessage =
//                 error.response?.data?.message ||
//                 error.message ||
//                 "เกิดข้อผิดพลาดในการจบงาน";
//             if (
//                 errorMessage.includes(
//                     "การตอบกลับ API ไม่ใช่รูปแบบ Response ที่คาดหวัง",
//                 ) ||
//                 errorMessage.includes("API ภายนอกไม่มีสถานะตอบกลับ") ||
//                 errorMessage.includes("ไม่พบผลลัพธ์การเรียก API ที่ชัดเจน") ||
//                 errorMessage.includes("การเชื่อมต่อล้มเหลว/หมดเวลา")
//             ) {
//                 errorMessage =
//                     "ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ";
//             }

//             setAlert({ type: "error", message: errorMessage });
//         } finally {
//             setFinishLoading(false);
//             setJobsToFinishConfirm([]);
//         }
//     };

//     const toggleSelectAll = (e) => {
//         if (e.target.checked) {
//             if (
//                 currentView === "all_current" ||
//                 currentView === "close_current"
//             ) {
//                 // setSelectedJobIds(jobs.map(job => job.job_id));
//                 setSelectedJobIds(filteredJobs.map((job) => job.job_id));
//             }
//         } else {
//             setSelectedJobIds([]);
//         }
//     };

//     const getAlertClasses = (type) => {
//         switch (type) {
//             case "success":
//                 return "bg-green-100 border-green-400 text-green-700";
//             case "info":
//                 return "bg-blue-100 border-blue-400 text-blue-700";
//             case "warning":
//                 return "bg-yellow-100 border-yellow-400 text-yellow-700";
//             case "error":
//             case "danger":
//                 return "bg-red-100 border-red-400 text-red-700";
//             default:
//                 return "bg-gray-100 border-gray-400 text-gray-700";
//         }
//     };

//     const statusTabs = [
//         {
//             id: "all",
//             label: "ทั้งหมด",
//             icon: <Info className="w-4 h-4" />,
//         },
//         {
//             id: "processing",
//             label: "กําลังดำเนินการ",
//             statuses: [
//                 "send",
//                 "เปิดออเดอร์แล้ว",
//                 "รอเปิดSO",
//                 "พร้อมส่ง",
//                 "แพ็คสินค้าเสร็จ",
//                 "กำลังจัดสินค้า",
//                 "กำลังส่ง",
//                 "เตรียมส่ง",
//                 "รอปิดงานซ่อม",
//                 "กำลังซ่อม",
//                 "พักงานซ่อม",
//                 "รอรับงานซ่อม",
//             ],
//             color: "text-indigo-600 border-indigo-600 bg-indigo-50",
//             countColor: "bg-indigo-100 text-indigo-600",
//         },
//         {
//             id: "ready_to_close",
//             label: "รอปิดงาน (จัดส่งสำเร็จ)",
//             statuses: ["บัญชีรับงานแล้ว", "ส่งของแล้ว"],
//             color: "text-green-600 border-green-600 bg-green-50",
//             countColor: "bg-green-100 text-green-600",
//         },
//         {
//             id: "completed",
//             label: "สำเร็จ",
//             statuses: ["success"],
//             color: "text-green-600 border-green-600 bg-green-50",
//             countColor: "bg-green-100 text-green-600",
//         },
//         {
//             id: "canceled",
//             label: "ยกเลิกแล้ว",
//             statuses: ["canceled"],
//             color: "text-indigo-600 border-indigo-600 bg-indigo-50",
//             countColor: "bg-indigo-100 text-indigo-600",
//         },
//     ];

//     const filteredJobs = jobs.filter((job) => {
//         if (activeTab === "all") return true;
//         const currentTabConfig = statusTabs.find((tab) => tab.id === activeTab);
//         return currentTabConfig?.statuses.includes(job.status);
//     });

//     const getTabCount = (tabId) => {
//         if (tabId === "all") return jobs.length;
//         const tabConfig = statusTabs.find((tab) => tab.id === tabId);
//         return jobs.filter((job) => tabConfig?.statuses.includes(job.status))
//             .length;
//     };

//     return (
//         <AuthenticatedLayout>
//             {openConfirmDialog && (
//                 <AlertDialogQuestion
//                     open={openConfirmDialog}
//                     setOpen={setOpenConfirmDialog}
//                     title="ยืนยันการปิดงานส่งกลับจากพัมคินฯ"
//                     text={`คุณต้องการยืนยันการปิดงานส่งกลับจากพัมคิน จำนวน ${jobsToFinishConfirm.length} รายการ ใช่หรือไม่?`}
//                     onPassed={handleFinishJob}
//                 />
//             )}
//             <Head
//                 title={
//                     currentView === "history"
//                         ? "ประวัติการปิดงาน"
//                         : "จบงานส่งซ่อมไปยังพัมคิน"
//                 }
//             />
//             <div className="py-5">
//                 <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
//                     <h2 className="text-2xl font-bold mb-6 text-gray-800">
//                         {currentView === "history"
//                             ? "📜 ประวัติการปิดงาน (History)"
//                             : "🛠️ ตรวจสอบสถานะส่งซ่อมพัมคินฯ"}
//                     </h2>
//                     {/* View Switch */}
//                     <div className="mb-3">
//                         <div className="flex space-x-4">
//                             <button
//                                 type="button"
//                                 onClick={() => handleViewChange("all_current")}
//                                 className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${
//                                     currentView === "all_current"
//                                         ? "bg-red-600 text-white hover:bg-red-700"
//                                         : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                                 }`}
//                             >
//                                 🎯 งานที่รอปิดทั้งหมด
//                             </button>
//                             {/* <button
//                                 type="button"
//                                 onClick={() => handleViewChange('close_current')}
//                                 className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${currentView === 'close_current'
//                                     ? 'bg-red-600 text-white hover:bg-red-700'
//                                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                                     }`}
//                             >
//                                 🔍 งานที่รอปิด (ค้นหา)
//                             </button> */}
//                             <button
//                                 type="button"
//                                 onClick={() => handleViewChange("history")}
//                                 className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${
//                                     currentView === "history"
//                                         ? "bg-indigo-600 text-white hover:bg-indigo-700"
//                                         : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                                 }`}
//                             >
//                                 📜 ประวัติการจบงาน (Success)
//                             </button>
//                         </div>
//                     </div>

//                     {/* ฟอร์มสำหรับค้นหา (แสดงเฉพาะในโหมด 'close_current' เท่านั้น) */}
//                     {currentView === "close_current" && (
//                         <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
//                             <h3 className="text-xl font-semibold mb-4 border-b pb-2">
//                                 ค้นหางานที่รอปิด
//                             </h3>

//                             {/* Mode Switch */}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     เลือกโหมดการค้นหา:
//                                 </label>
//                                 <div className="flex space-x-4">
//                                     <button
//                                         type="button"
//                                         onClick={() =>
//                                             handleModeChange("individual")
//                                         }
//                                         className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${
//                                             searchMode === "individual"
//                                                 ? "bg-indigo-600 text-white hover:bg-indigo-700"
//                                                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                                         }`}
//                                     >
//                                         ซีเรียลและเลข Job (กำหนด)
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() =>
//                                             handleModeChange("group")
//                                         }
//                                         className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${
//                                             searchMode === "group"
//                                                 ? "bg-indigo-600 text-white hover:bg-indigo-700"
//                                                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                                         }`}
//                                     >
//                                         เลข Group Job (ใบส่งซ่อม)
//                                     </button>
//                                 </div>
//                             </div>
//                             <hr className="my-4" />
//                             {/* Form */}
//                             <form onSubmit={handleSearch}>
//                                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//                                     {/* โหมด ค้นหาด้วยซีเรียลและเลข Job */}
//                                     {searchMode === "individual" && (
//                                         <>
//                                             <div className="md:col-span-2">
//                                                 <label
//                                                     htmlFor="jobId"
//                                                     className="block text-sm font-medium text-gray-700"
//                                                 >
//                                                     เลขที่ Job (Job ID){" "}
//                                                     <span className="text-red-500">
//                                                         *
//                                                     </span>
//                                                 </label>
//                                                 <input
//                                                     id="jobId"
//                                                     type="text"
//                                                     value={data.job_id}
//                                                     onChange={(e) =>
//                                                         setData(
//                                                             "job_id",
//                                                             e.target.value,
//                                                         )
//                                                     }
//                                                     placeholder="กรอก Job ID"
//                                                     required={
//                                                         searchMode ===
//                                                         "individual"
//                                                     }
//                                                     className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                                     disabled={
//                                                         searchLoading ||
//                                                         finishLoading
//                                                     }
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label
//                                                     htmlFor="serialId"
//                                                     className="block text-sm font-medium text-gray-700"
//                                                 >
//                                                     เลขที่ Serial (Serial ID){" "}
//                                                     <span className="text-red-500">
//                                                         *
//                                                     </span>
//                                                 </label>
//                                                 <input
//                                                     id="serialId"
//                                                     type="text"
//                                                     value={data.serial_id}
//                                                     onChange={(e) =>
//                                                         setData(
//                                                             "serial_id",
//                                                             e.target.value,
//                                                         )
//                                                     }
//                                                     placeholder="กรอก Serial ID"
//                                                     required={
//                                                         searchMode ===
//                                                         "individual"
//                                                     }
//                                                     className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                                     disabled={
//                                                         searchLoading ||
//                                                         finishLoading
//                                                     }
//                                                 />
//                                             </div>
//                                         </>
//                                     )}

//                                     {/* โหมด ค้นหาด้วย Group Job */}
//                                     {searchMode === "group" && (
//                                         <div className="md:col-span-3">
//                                             <label
//                                                 htmlFor="groupJob"
//                                                 className="block text-sm font-medium text-gray-700"
//                                             >
//                                                 เลขที่ Group Job (PK){" "}
//                                                 <span className="text-red-500">
//                                                     *
//                                                 </span>
//                                             </label>
//                                             <input
//                                                 id="groupJob"
//                                                 type="text"
//                                                 value={data.group_job}
//                                                 onChange={(e) =>
//                                                     setData(
//                                                         "group_job",
//                                                         e.target.value,
//                                                     )
//                                                 }
//                                                 placeholder="กรอก Group Job"
//                                                 required={
//                                                     searchMode === "group"
//                                                 }
//                                                 className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                                 disabled={
//                                                     searchLoading ||
//                                                     finishLoading
//                                                 }
//                                             />
//                                         </div>
//                                     )}

//                                     {/* ปุ่มค้นหาและล้างค่า */}
//                                     <div className="flex space-x-2 md:col-span-1">
//                                         <button
//                                             type="submit"
//                                             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//                                             disabled={
//                                                 searchLoading || finishLoading
//                                             }
//                                         >
//                                             {searchLoading ? (
//                                                 <svg
//                                                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                                                     xmlns="http://www.w3.org/2000/svg"
//                                                     fill="none"
//                                                     viewBox="0 0 24 24"
//                                                 >
//                                                     <circle
//                                                         className="opacity-25"
//                                                         cx="12"
//                                                         cy="12"
//                                                         r="10"
//                                                         stroke="currentColor"
//                                                         strokeWidth="4"
//                                                     ></circle>
//                                                     <path
//                                                         className="opacity-75"
//                                                         fill="currentColor"
//                                                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                                     ></path>
//                                                 </svg>
//                                             ) : (
//                                                 "🔍 ค้นหางาน"
//                                             )}
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={resetAll}
//                                             className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//                                             disabled={
//                                                 searchLoading || finishLoading
//                                             }
//                                         >
//                                             ล้างค่า
//                                         </button>
//                                     </div>
//                                 </div>
//                             </form>
//                         </div>
//                     )}
//                     {(currentView === "all_current" ||
//                         currentView === "history") && (
//                         <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4 p-6">
//                             <h3 className="text-lg font-semibold mb-2 border-b flex items-center">
//                                 <svg
//                                     className="w-5 h-5 mr-2"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth="2"
//                                         d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
//                                     ></path>
//                                 </svg>
//                                 ตัวกรองค้นหา{" "}
//                                 {currentView === "history"
//                                     ? "(ประวัติ)"
//                                     : "(งานปัจจุบัน)"}
//                             </h3>
//                             <form onSubmit={handleFilterSubmit}>
//                                 <div className="grid grid-cols-2 md:grid-cols-8 gap-4 items-end">
//                                     {/* วันที่เริ่มต้น */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             วันที่เริ่มต้น
//                                         </label>
//                                         <input
//                                             type="date"
//                                             value={filters.start_date}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     start_date: e.target.value,
//                                                 })
//                                             }
//                                             className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                         />
//                                     </div>

//                                     {/* วันที่สิ้นสุด */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             วันที่สิ้นสุด
//                                         </label>
//                                         <input
//                                             type="date"
//                                             value={filters.end_date}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     end_date: e.target.value,
//                                                 })
//                                             }
//                                             className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                         />
//                                     </div>

//                                     {/* Group Job */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             เลขที่ Group Job (PK)
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={filters.group_job}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     group_job: e.target.value,
//                                                 })
//                                             }
//                                             placeholder="ระบุบางส่วนของ Group Job"
//                                             className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                         ></input>
//                                     </div>

//                                     {/* Job ID */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             เลขที่ Job (Job ID)
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={filters.job_id}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     job_id: e.target.value,
//                                                 })
//                                             }
//                                             placeholder="ระบุบางส่วนของ Job ID"
//                                             // เพิ่ม max-w-xs ตรงนี้
//                                             className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                         />
//                                     </div>

//                                     {/* Serial ID */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             เลขที่ Serial (Serial ID)
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={filters.serial_id}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     serial_id: e.target.value,
//                                                 })
//                                             }
//                                             placeholder="ระบุบางส่วนของ Serial"
//                                             // เพิ่ม max-w-xs ตรงนี้
//                                             className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                         />
//                                     </div>

//                                     {/* Product ID (PID) */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">
//                                             รหัสสินค้า (PID)
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={filters.pid}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     pid: e.target.value,
//                                                 })
//                                             }
//                                             placeholder="ระบุรหัสสินค้า"
//                                             // เพิ่ม max-w-xs ตรงนี้
//                                             className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                         />
//                                     </div>

//                                     {/* สถานะ */}
//                                     {/* <div>
//                                         <label className="block text-sm font-medium text-gray-700">สถานะ</label>
//                                         <select
//                                             value={filters.status}
//                                             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                                             className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                         >
//                                             <option value="">ทั้งหมด</option>
//                                             <option value="send">ส่งซ่อมไปยังพัมคิน</option>
//                                             <option value="รับคำสั่งซื้อ">รับคำสั่งซื้อ</option>
//                                             <option value="กำลังเตรียมสินค้า">กำลังเตรียมสินค้า</option>
//                                             <option value="อยู่ระหว่างการจัดส่ง">อยู่ระหว่างการจัดส่ง</option>
//                                             <option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</option>
//                                         </select>
//                                     </div> */}

//                                     {/* Buttons: ย้ายมาอยู่แถวใหม่ หรือให้ชิดซ้ายต่อจาก input ตัวสุดท้าย */}
//                                     <div>
//                                         <button
//                                             type="submit"
//                                             disabled={searchLoading}
//                                             className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//                                         >
//                                             {searchLoading
//                                                 ? "กำลังค้นหา..."
//                                                 : "ค้นหา"}
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={handleResetFilter}
//                                             disabled={searchLoading}
//                                             className="inline-flex justify-center items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//                                         >
//                                             ล้างค่า
//                                         </button>
//                                     </div>
//                                 </div>
//                             </form>
//                         </div>
//                     )}

//                     {/* การแจ้งเตือน */}
//                     {/* {alert && (
//                         <div
//                             className={`p-4 mb-4 border-l-4 rounded-md shadow-sm ${getAlertClasses(alert.type)}`}
//                             role="alert"
//                         >
//                             <div className="flex justify-between items-start">
//                                 <p className="font-bold">{alert.type === 'success' ? 'สำเร็จ' : alert.type === 'error' ? 'ข้อผิดพลาด' : 'แจ้งเตือน'}</p>
//                                 <button onClick={handleClose} className="ml-4 text-gray-600 hover:text-gray-800 font-bold">
//                                     &times;
//                                 </button>
//                             </div>
//                             <p className="text-sm">{alert.message}</p>
//                         </div>
//                     )} */}

//                     {/* Alert Dialog Popup */}
//                     <Dialog
//                         open={!!alert} // แปลง object alert ให้เป็น boolean (มีค่า=true, null=false)
//                         onClose={() => setAlert(null)} // กดพื้นหลังเพื่อปิด
//                         aria-labelledby="alert-dialog-title"
//                         aria-describedby="alert-dialog-description"
//                         fullWidth
//                         maxWidth="xs" // ขนาดความกว้าง (xs, sm, md, lg)
//                     >
//                         {alert && (
//                             <>
//                                 <DialogTitle
//                                     id="alert-dialog-title"
//                                     sx={{
//                                         display: "flex",
//                                         alignItems: "center",
//                                         gap: 1,
//                                         bgcolor:
//                                             alert.type === "success"
//                                                 ? "#edf7ed"
//                                                 : alert.type === "error"
//                                                   ? "#fdeded"
//                                                   : "#e5f6fd",
//                                         color:
//                                             alert.type === "success"
//                                                 ? "#1e4620"
//                                                 : alert.type === "error"
//                                                   ? "#5f2120"
//                                                   : "#014361",
//                                     }}
//                                 >
//                                     {/* แสดงไอคอนตามประเภท */}
//                                     {alert.type === "success" && (
//                                         <CheckCircle color="success" />
//                                     )}
//                                     {/* {alert.type === 'error' && <Error color="error" />}
//                                     {alert.type === 'warning' && <Warning color="warning" />} */}
//                                     {alert.type === "error" && (
//                                         <ErrorIcon color="error" />
//                                     )}
//                                     {alert.type === "warning" && (
//                                         <Warning color="warning" />
//                                     )}
//                                     {alert.type !== "success" &&
//                                         alert.type !== "error" &&
//                                         alert.type !== "warning" && (
//                                             <Info color="info" />
//                                         )}

//                                     <Typography
//                                         variant="h6"
//                                         component="span"
//                                         fontWeight="bold"
//                                     >
//                                         {alert.type === "success"
//                                             ? "สำเร็จ"
//                                             : alert.type === "error"
//                                               ? "ข้อผิดพลาด"
//                                               : "แจ้งเตือน"}
//                                     </Typography>
//                                 </DialogTitle>

//                                 <DialogContent sx={{ mt: 2 }}>
//                                     <DialogContentText
//                                         id="alert-dialog-description"
//                                         sx={{ color: "text.primary" }}
//                                     >
//                                         {alert.message}
//                                     </DialogContentText>
//                                 </DialogContent>

//                                 <DialogActions>
//                                     <Button
//                                         onClick={() => setAlert(null)}
//                                         variant="contained"
//                                         color={
//                                             alert.type === "success"
//                                                 ? "success"
//                                                 : alert.type === "error"
//                                                   ? "error"
//                                                   : "primary"
//                                         }
//                                         autoFocus
//                                     >
//                                         ตกลง
//                                     </Button>
//                                 </DialogActions>
//                             </>
//                         )}
//                     </Dialog>

//                     {/* ตารางแสดงผลลัพธ์และปุ่มจบงาน */}
//                     {jobs.length > 0 && (
//                         <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
//                             <div className="p-6">
//                                 <div className="flex items-center justify-between mb-2">
//                                     <h3 className="text-xl font-semibold border-b pb-2">
//                                         {currentView === "history"
//                                             ? "รายการประวัติการปิดงาน (" +
//                                               jobs.length +
//                                               ")"
//                                             : "รายการงานทั้งหมด (" +
//                                               jobs.length +
//                                               ")"}
//                                     </h3>

//                                     {(currentView === "close_current" ||
//                                         currentView === "all_current") &&
//                                         isReadyToFinish() && (
//                                             <button
//                                                 type="button"
//                                                 onClick={handleConfirmOpen}
//                                                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
//                                                 disabled={
//                                                     selectedJobIds.length ===
//                                                         0 ||
//                                                     finishLoading ||
//                                                     searchLoading
//                                                 }
//                                             >
//                                                 {finishLoading ? (
//                                                     <>
//                                                         <svg
//                                                             className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                                                             xmlns="http://www.w3.org/2000/svg"
//                                                             fill="none"
//                                                             viewBox="0 0 24 24"
//                                                         >
//                                                             <circle
//                                                                 className="opacity-25"
//                                                                 cx="12"
//                                                                 cy="12"
//                                                                 r="10"
//                                                                 stroke="currentColor"
//                                                                 strokeWidth="4"
//                                                             ></circle>
//                                                             <path
//                                                                 className="opacity-75"
//                                                                 fill="currentColor"
//                                                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
//                                                                 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 
//                                                                 3 7.938l3-2.647z"
//                                                             ></path>
//                                                         </svg>
//                                                         กำลังจบงาน...
//                                                     </>
//                                                 ) : (
//                                                     `ปิดงาน ${selectedJobIds.length} รายการ`
//                                                 )}
//                                             </button>
//                                         )}
//                                 </div>

//                                 {/* Tap สถานะ */}
//                                 <div className="mb-4 border-b border-gray-200">
//                                     <nav
//                                         className="-mb-px flex space-x-4 overflow-x-auto"
//                                         aria-label="Tabs"
//                                     >
//                                         {statusTabs.map((tab) => {
//                                             const count = getTabCount(tab.id);
//                                             // ซ่อน Tab หากไม่มีข้อมูลใน Tab นั้น (ยกเว้น Tab All) เพื่อความสะอาดตา (Optional)
//                                             if (tab.id !== "all" && count === 0)
//                                                 return null;

//                                             return (
//                                                 <button
//                                                     key={tab.id}
//                                                     onClick={() => {
//                                                         setActiveTab(tab.id);
//                                                         setSelectedJobIds([]); // เคลียร์ checkbox เมื่อเปลี่ยน tab
//                                                     }}
//                                                     className={`
//                                                         whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200
//                                                         ${
//                                                             activeTab === tab.id
//                                                                 ? tab.color ||
//                                                                   "border-blue-500 text-blue-600 bg-blue-50/50"
//                                                                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                                                         }
//                                                     `}
//                                                 >
//                                                     {tab.label}
//                                                     <span
//                                                         className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium 
//                                                         ${
//                                                             activeTab === tab.id
//                                                                 ? tab.countColor ||
//                                                                   "bg-blue-100 text-blue-600"
//                                                                 : "bg-gray-100 text-gray-900"
//                                                         }`}
//                                                     >
//                                                         {count}
//                                                     </span>
//                                                 </button>
//                                             );
//                                         })}
//                                     </nav>
//                                 </div>

//                                 {/* <div className="overflow-x-auto mb-4 overflow-y-auto"> */}
//                                 <div className="overflow-x-auto overflow-y-auto mb-4 max-h-[45vh] max-w-[1000vh] border rounded-lg shadow-sm">
//                                     <table className="min-w-full divide-y divide-gray-200">
//                                         <thead className="bg-gray-50">
//                                             <tr>
//                                                 {/* คอลัมน์ Checkbox */}
//                                                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     {(currentView ===
//                                                         "close_current" ||
//                                                         currentView ===
//                                                             "all_current") && (
//                                                         <input
//                                                             type="checkbox"
//                                                             // checked={selectedJobIds.length === jobs.length && jobs.length > 0}
//                                                             checked={
//                                                                 selectedJobIds.length ===
//                                                                     filteredJobs.length &&
//                                                                 filteredJobs.length >
//                                                                     0
//                                                             }
//                                                             onChange={
//                                                                 toggleSelectAll
//                                                             }
//                                                             className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                                             disabled={
//                                                                 finishLoading
//                                                             }
//                                                         />
//                                                     )}
//                                                 </th>
//                                                 {/* คอลัมน์ข้อมูลหลัก */}
//                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Group Job
//                                                 </th>
//                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Job ID
//                                                 </th>
//                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Serial ID
//                                                 </th>
//                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     รหัสสินค้า (PID)
//                                                 </th>
//                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     ชื่อสินค้า
//                                                 </th>
//                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Ticket / ASS No.
//                                                 </th>
//                                                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     สถานะ
//                                                 </th>
//                                                 {(currentView ===
//                                                     "close_current" ||
//                                                     currentView ===
//                                                         "all_current") && (
//                                                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         ตรวจสอบสถานะ
//                                                     </th>
//                                                 )}
//                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     วันที่
//                                                     {currentView === "history"
//                                                         ? "ปิดงาน"
//                                                         : "ส่งซ่อม"}
//                                                 </th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="bg-white divide-y divide-gray-200">
//                                             {/* {jobs.map((job) => { */}
//                                             {filteredJobs.map((job) => {
//                                                 const isChecking =
//                                                     statusCheckingJobId ===
//                                                     job.job_id;
//                                                 const displayStatus =
//                                                     job.status;
//                                                 let statusClasses =
//                                                     "bg-gray-100 text-gray-800";
//                                                 if (
//                                                     displayStatus ===
//                                                         "success" ||
//                                                     displayStatus ===
//                                                         "บัญชีรับงานแล้ว" ||
//                                                     displayStatus ===
//                                                         "ส่งของแล้ว"
//                                                 ) {
//                                                     statusClasses =
//                                                         "bg-green-100 text-green-800";
//                                                 } else if (
//                                                     displayStatus === "send" ||
//                                                     displayStatus ===
//                                                         "กำลังส่ง" ||
//                                                     displayStatus ===
//                                                         "เตรียมส่ง"
//                                                 ) {
//                                                     statusClasses =
//                                                         "bg-indigo-100 text-indigo-700";
//                                                 } else if (
//                                                     displayStatus ===
//                                                         "รอปิดงานซ่อม" ||
//                                                     displayStatus ===
//                                                         "กำลังซ่อม" ||
//                                                     displayStatus ===
//                                                         "พักงานซ่อม" ||
//                                                     displayStatus ===
//                                                         "รอรับงานซ่อม"
//                                                 ) {
//                                                     statusClasses =
//                                                         "bg-yellow-100 text-yellow-800";
//                                                 } else if (
//                                                     displayStatus === "canceled"
//                                                 ) {
//                                                     statusClasses =
//                                                         "bg-red-100 text-red-800";
//                                                 }
//                                                 return (
//                                                     <tr
//                                                         key={job.job_id}
//                                                         className="hover:bg-gray-50"
//                                                     >
//                                                         <td className="px-6 py-4 whitespace-nowrap text-center">
//                                                             {currentView ===
//                                                                 "close_current" ||
//                                                             currentView ===
//                                                                 "all_current" ? (
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     checked={selectedJobIds.includes(
//                                                                         job.job_id,
//                                                                     )}
//                                                                     onChange={() =>
//                                                                         handleCheckboxChange(
//                                                                             job.job_id,
//                                                                         )
//                                                                     }
//                                                                     className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                                                     disabled={
//                                                                         finishLoading
//                                                                     }
//                                                                 />
//                                                             ) : (
//                                                                 <span className="text-gray-400">
//                                                                     -
//                                                                 </span>
//                                                             )}
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                                             {job.group_job}
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                                             <Link
//                                                                 href={route(
//                                                                     "repair.index",
//                                                                     {
//                                                                         job_id: job.job_id,
//                                                                         typedm:
//                                                                             job.typedm ||
//                                                                             null,
//                                                                         modelfg:
//                                                                             job.modelfg ||
//                                                                             null,
//                                                                         layout:
//                                                                             job.layout ||
//                                                                             null,
//                                                                     },
//                                                                 )}
//                                                             >
//                                                                 {job.job_id}
//                                                             </Link>
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                                             {job.serial_id}
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                                             {job.pid}
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                                             {job.p_name}
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
//                                                             {job.ticket_code
//                                                                 ? job.ticket_code
//                                                                 : "-"}
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
//                                                             <span
//                                                                 className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}
//                                                             >
//                                                                 {displayStatus}
//                                                             </span>
//                                                         </td>
//                                                         {(currentView ===
//                                                             "close_current" ||
//                                                             currentView ===
//                                                                 "all_current") && (
//                                                             <td className="px-6 py-4 whitespace-nowrap text-center">
//                                                                 {(job.status ===
//                                                                     "send" ||
//                                                                     job.status ===
//                                                                         "เปิดออเดอร์แล้ว" ||
//                                                                     job.status ===
//                                                                         "รอเปิดSO" ||
//                                                                     job.status ===
//                                                                         "พร้อมส่ง" ||
//                                                                     job.status ===
//                                                                         "แพ็คสินค้าเสร็จ" ||
//                                                                     job.status ===
//                                                                         "กำลังจัดสินค้า" ||
//                                                                     job.status ===
//                                                                         "กำลังส่ง" ||
//                                                                     job.status ===
//                                                                         "เตรียมส่ง" ||
//                                                                     job.status ===
//                                                                         "รอปิดงานซ่อม" ||
//                                                                     job.status ===
//                                                                         "กำลังซ่อม" ||
//                                                                     job.status ===
//                                                                         "พักงานซ่อม" ||
//                                                                     job.status ===
//                                                                         "รอรับงานซ่อม") && (
//                                                                     <button
//                                                                         type="button"
//                                                                         onClick={() =>
//                                                                             checkJobStatusAndRefresh(
//                                                                                 job,
//                                                                             )
//                                                                         }
//                                                                         disabled={
//                                                                             isChecking ||
//                                                                             finishLoading
//                                                                         }
//                                                                         className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-gray-700 bg-yellow-200 hover:bg-yellow-300 disabled:opacity-50"
//                                                                     >
//                                                                         {isChecking ? (
//                                                                             <svg
//                                                                                 className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
//                                                                                 xmlns="http://www.w3.org/2000/svg"
//                                                                                 fill="none"
//                                                                                 viewBox="0 0 24 24"
//                                                                             >
//                                                                                 <circle
//                                                                                     className="opacity-25"
//                                                                                     cx="12"
//                                                                                     cy="12"
//                                                                                     r="10"
//                                                                                     stroke="currentColor"
//                                                                                     strokeWidth="4"
//                                                                                 ></circle>
//                                                                                 <path
//                                                                                     className="opacity-75"
//                                                                                     fill="currentColor"
//                                                                                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                                                                 ></path>
//                                                                             </svg>
//                                                                         ) : (
//                                                                             <Refresh className="w-4 h-4 mr-1" />
//                                                                         )}
//                                                                         {isChecking
//                                                                             ? "กำลังเช็ค..."
//                                                                             : "ตรวจสอบ"}
//                                                                     </button>
//                                                                 )}
//                                                                 {(job.status ===
//                                                                     "จัดส่งสำเร็จ" ||
//                                                                     job.status ===
//                                                                         "ส่งสำเร็จ" ||
//                                                                     job.status ===
//                                                                         "จบงาน" ||
//                                                                     job.status ===
//                                                                         "ส่งของแล้ว" ||
//                                                                     job.status ===
//                                                                         "บัญชีรับงานแล้ว") && (
//                                                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
//                                                                         <span className="w-2 h-2 mr-1.5 bg-blue-400 rounded-full animate-pulse"></span>
//                                                                         รอปิดงาน
//                                                                     </span>
//                                                                 )}
//                                                                 {job.status ===
//                                                                     "ยกเลิกคำสั่งซื้อ" && (
//                                                                     <span className="text-gray-400">
//                                                                         -
//                                                                     </span>
//                                                                 )}
//                                                             </td>
//                                                         )}
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                             {new Date(
//                                                                 currentView ===
//                                                                     "history"
//                                                                     ? job.updated_at
//                                                                     : job.created_at,
//                                                             ).toLocaleString()}
//                                                         </td>
//                                                     </tr>
//                                                 );
//                                             })}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    CheckCircle,
    Info,
    Refresh,
    Warning,
    Error as ErrorIcon,
} from "@mui/icons-material";
import { AlertDialogQuestion } from "@/Components/AlertDialog";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    Box,
    Autocomplete,
    TextField,
} from "@mui/material";

// เพิ่ม props isAdmin และ shops
export default function SuccessSendJobs({ isAdmin, shops }) {
    const [jobs, setJobs] = useState([]);
    const [selectedJobIds, setSelectedJobIds] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [finishLoading, setFinishLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const [currentView, setCurrentView] = useState("all_current");
    const [searchMode, setSearchMode] = useState("individual");
    const [statusCheckingJobId, setStatusCheckingJobId] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [jobsToFinishConfirm, setJobsToFinishConfirm] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    const { data, setData, reset } = useForm({
        job_id: "",
        serial_id: "",
        group_job: "",
    });

    const [filters, setFilters] = useState({
        shop: "", // เพิ่ม Field shop
        job_id: "",
        serial_id: "",
        pid: "",
        group_job: "",
        start_date: "",
        end_date: "",
        status: "",
    });

    // ฟังก์ชันช่วยในการรีเซ็ตค่าทั้งหมด
    const resetAll = () => {
        reset();
        setJobs([]);
        setSelectedJobIds([]);
        setAlert(null);
    };

    const checkJobStatusAndRefresh = async (job) => {
        setStatusCheckingJobId(job.job_id);
        setAlert(null);

        try {
            const response = await axios.post(
                route("sendJobs.checkJobStatus"),
                {
                    job_id: job.job_id,
                    serial_id: job.serial_id,
                    pid: job.pid,
                },
            );

            const apiStatus = response.data.api_status;
            const newTicketCode = response.data.ticket_code;
            setJobs((prevJobs) =>
                prevJobs.map((item) => {
                    if (item.job_id === job.job_id) {
                        return {
                            ...item,
                            status: apiStatus,
                            ticket_code: newTicketCode,
                        };
                    }
                    return item;
                }),
            );

            setAlert({
                type: "success",
                message: `Job ID ${job.job_id} สถานะปัจจุบันเป็น: ${getStatus(apiStatus)}`,
            });
        } catch (error) {
            console.error("Error checking status:", error);
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในการเช็คสถานะ";
            setAlert({
                type: "error",
                message: `Job ID ${job.job_id} ข้อผิดพลาด: ${errorMsg}`,
            });
        } finally {
            setStatusCheckingJobId(null);
        }
    };

    const fetchAllCurrentJobs = async (searchFilters = filters) => {
        setJobs([]);
        setSelectedJobIds([]);
        setAlert(null);
        setSearchLoading(true);

        try {
            const response = await axios.post(
                route("sendJobs.allList"),
                searchFilters,
            );

            if (response.data.jobs && response.data.jobs.length > 0) {
                setJobs(response.data.jobs);
                setAlert({
                    type: "success",
                    message: `พบรายการงานทั้งหมด ${response.data.jobs.length} รายการ`,
                });
            } else {
                setJobs([]);
                setAlert({
                    type: "info",
                    message: response.data.message || "ไม่พบรายการงานที่รอปิด",
                });
            }
        } catch (error) {
            setJobs([]);
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "เกิดข้อผิดพลาดในการโหลดรายการงาน";
            setAlert({ type: "error", message: errorMsg });
        } finally {
            setSearchLoading(false);
        }
    };

    const handleResetFilter = () => {
        const emptyFilters = {
            shop: filters.shop, // เก็บร้านค้าปัจจุบันไว้ (ไม่ล้าง)
            group_job: "",
            job_id: "",
            serial_id: "",
            pid: "",
            start_date: "",
            end_date: "",
            status: "",
        };
        setFilters(emptyFilters);
        if (currentView === "history") {
            fetchHistoryJobs(emptyFilters);
        } else {
            fetchAllCurrentJobs(emptyFilters);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        if (currentView === "history") {
            fetchHistoryJobs();
        } else {
            fetchAllCurrentJobs();
        }
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
        resetAll();

        if (view === "history") {
            fetchHistoryJobs();
        } else if (view === "all_current") {
            fetchAllCurrentJobs();
        }
    };

    // ฟังก์ชันเลือกร้าน (สำหรับ Admin)
    const handleShopChange = (newShop) => {
        const newFilters = { ...filters, shop: newShop };
        setFilters(newFilters);

        // Auto Fetch เมื่อเปลี่ยนร้านค้า (เพื่อความสะดวก)
        if (currentView === "history") {
            fetchHistoryJobs(newFilters);
        } else if (currentView === "all_current") {
            fetchAllCurrentJobs(newFilters);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setAlert(null);
        }, 300);
    };

    useEffect(() => {
        if (alert) {
            setIsVisible(true);

            const timer = setTimeout(() => handleClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    useEffect(() => {
        fetchAllCurrentJobs();
    }, []);

    const handleModeChange = (mode) => {
        setSearchMode(mode);
        resetAll();
    };

    const getStatus = (status) => {
        return status;
    };

    const fetchHistoryJobs = async (searchFilters = filters) => {
        setJobs([]);
        setSelectedJobIds([]);
        setAlert(null);
        setSearchLoading(true);

        try {
            const response = await axios.post(
                route("sendJobs.history"),
                searchFilters,
            );

            if (response.data.jobs && response.data.jobs.length > 0) {
                setJobs(response.data.jobs);
                setAlert({
                    type: "success",
                    message: `พบรายการประวัติการปิดงานสำเร็จ ${response.data.jobs.length} รายการ`,
                });
            } else {
                setJobs([]);
                setAlert({
                    type: "info",
                    message:
                        response.data.message ||
                        "ไม่พบประวัติการปิดงานตามเงื่อนไข",
                });
            }
        } catch (error) {
            setJobs([]);
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "เกิดข้อผิดพลาดในการค้นหาประวัติ";
            setAlert({ type: "error", message: errorMsg });
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setJobs([]);
        setSelectedJobIds([]);
        setAlert(null);
        setSearchLoading(true);

        let searchData = {};
        let errorMessage = "";

        if (currentView !== "close_current") {
            setSearchLoading(false);
            return;
        }

        if (searchMode === "individual") {
            const isJobIdEmpty = !data.job_id.trim();
            const isSerialIdEmpty = !data.serial_id.trim();

            if (currentView === "close_current") {
                if (isJobIdEmpty || isSerialIdEmpty) {
                    errorMessage =
                        "โหมด 'ซีเรียลและเลข Job' ต้องกรอกทั้ง เลขที่ Job และ เลขที่ Serial สำหรับงานที่รอปิด";
                }
            } else if (currentView === "history") {
                if (isJobIdEmpty && isSerialIdEmpty) {
                    errorMessage =
                        "โหมด 'ซีเรียลและเลข Job' สำหรับประวัติต้องกรอกอย่างน้อย เลขที่ Job หรือ เลขที่ Serial";
                }
            }

            if (!errorMessage) {
                searchData = {
                    job_id: data.job_id,
                    serial_id: data.serial_id,
                    group_job: "",
                    shop: filters.shop, // แนบ Shop ไปด้วย
                };
            }
        } else if (searchMode === "group") {
            if (!data.group_job.trim()) {
                errorMessage = "โหมด 'เลข Group Job' ต้องกรอก เลขที่ Group Job";
            } else {
                searchData = {
                    job_id: "",
                    serial_id: "",
                    group_job: data.group_job,
                    shop: filters.shop, // แนบ Shop ไปด้วย
                };
            }
        }

        if (errorMessage) {
            setJobs([]);
            setAlert({ type: "warning", message: errorMessage });
            setSearchLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                route("sendJobs.search"),
                searchData,
            );

            if (response.data.jobs && response.data.jobs.length > 0) {
                setJobs(response.data.jobs);
                setAlert({
                    type: "success",
                    message: `พบรายการ Job สถานะ 'ส่งซ่อมไปยังพัมคิน' จำนวน ${response.data.jobs.length} รายการ`,
                });
            } else {
                setJobs([]);
                setAlert({
                    type: "info",
                    message:
                        response.data.message || "ไม่พบรายการ Job ที่รอปิดงาน",
                });
            }
        } catch (error) {
            setJobs([]);
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "เกิดข้อผิดพลาดในการค้นหา";
            setAlert({ type: "error", message: errorMsg });
        } finally {
            setSearchLoading(false);
        }
    };

    const handleCheckboxChange = (jobId) => {
        setSelectedJobIds((prevSelected) => {
            if (prevSelected.includes(jobId)) {
                return prevSelected.filter((id) => id !== jobId);
            } else {
                return [...prevSelected, jobId];
            }
        });
    };

    const isReadyToFinish = () => {
        if (selectedJobIds.length === 0) return false;

        const selectedJobs = jobs.filter((job) =>
            selectedJobIds.includes(job.job_id),
        );

        return selectedJobs.some(
            (job) =>
                job.status === "ส่งสำเร็จ" ||
                job.status === "จบงาน" ||
                job.status === "ส่งของแล้ว" ||
                job.status === "บัญชีรับงานแล้ว" ||
                job.status === "จัดส่งสำเร็จ",
        );
    };

    const handleConfirmOpen = () => {
        if (selectedJobIds.length === 0) {
            setAlert({
                type: "warning",
                message: "กรุณาเลือกรายการ Job ที่ต้องการจบงาน",
            });
            return;
        }

        const dataToFinish = jobs
            .filter((job) => selectedJobIds.includes(job.job_id))
            .map((job) => ({
                job_id: job.job_id,
                serial_id: job.serial_id,
                pid: job.pid,
            }));

        setJobsToFinishConfirm(dataToFinish);
        setOpenConfirmDialog(true);
    };

    const handleFinishJob = async (confirmed) => {
        setOpenConfirmDialog(false);

        if (!confirmed || jobsToFinishConfirm.length === 0) {
            return;
        }

        setFinishLoading(true);
        setAlert(null);

        try {
            const response = await axios.post(route("sendJobs.finish"), {
                jobs_to_finish: jobsToFinishConfirm,
            });

            if (response.data.success) {
                setCurrentView("history");
                setSelectedJobIds([]);
                const emptyFilters = {
                    shop: filters.shop,
                    group_job: "",
                    job_id: "",
                    serial_id: "",
                    pid: "",
                    start_date: "",
                    end_date: "",
                    status: "",
                };
                setFilters(emptyFilters);
                reset();

                await fetchHistoryJobs(emptyFilters);

                setAlert({ type: "success", message: response.data.message });
            } else {
                setAlert({ type: "warning", message: response.data.message });
            }
        } catch (error) {
            let errorMessage =
                error.response?.data?.message ||
                error.message ||
                "เกิดข้อผิดพลาดในการจบงาน";
            if (
                errorMessage.includes(
                    "การตอบกลับ API ไม่ใช่รูปแบบ Response ที่คาดหวัง",
                ) ||
                errorMessage.includes("API ภายนอกไม่มีสถานะตอบกลับ") ||
                errorMessage.includes("ไม่พบผลลัพธ์การเรียก API ที่ชัดเจน") ||
                errorMessage.includes("การเชื่อมต่อล้มเหลว/หมดเวลา")
            ) {
                errorMessage =
                    "ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ";
            }

            setAlert({ type: "error", message: errorMessage });
        } finally {
            setFinishLoading(false);
            setJobsToFinishConfirm([]);
        }
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            if (
                currentView === "all_current" ||
                currentView === "close_current"
            ) {
                setSelectedJobIds(filteredJobs.map((job) => job.job_id));
            }
        } else {
            setSelectedJobIds([]);
        }
    };

    const statusTabs = [
        {
            id: "all",
            label: "ทั้งหมด",
            icon: <Info className="w-4 h-4" />,
        },
        {
            id: "processing",
            label: "กําลังดำเนินการ",
            statuses: [
                "send",
                "เปิดออเดอร์แล้ว",
                "รอเปิดSO",
                "พร้อมส่ง",
                "แพ็คสินค้าเสร็จ",
                "กำลังจัดสินค้า",
                "กำลังส่ง",
                "เตรียมส่ง",
                "รอปิดงานซ่อม",
                "กำลังซ่อม",
                "พักงานซ่อม",
                "รอรับงานซ่อม",
            ],
            color: "text-indigo-600 border-indigo-600 bg-indigo-50",
            countColor: "bg-indigo-100 text-indigo-600",
        },
        {
            id: "ready_to_close",
            label: "รอปิดงาน (จัดส่งสำเร็จ)",
            statuses: ["บัญชีรับงานแล้ว", "ส่งของแล้ว"],
            color: "text-green-600 border-green-600 bg-green-50",
            countColor: "bg-green-100 text-green-600",
        },
        {
            id: "completed",
            label: "สำเร็จ",
            statuses: ["success"],
            color: "text-green-600 border-green-600 bg-green-50",
            countColor: "bg-green-100 text-green-600",
        },
        {
            id: "canceled",
            label: "ยกเลิกแล้ว",
            statuses: ["canceled"],
            color: "text-indigo-600 border-indigo-600 bg-indigo-50",
            countColor: "bg-indigo-100 text-indigo-600",
        },
    ];

    const filteredJobs = jobs.filter((job) => {
        if (activeTab === "all") return true;
        const currentTabConfig = statusTabs.find((tab) => tab.id === activeTab);
        return currentTabConfig?.statuses.includes(job.status);
    });

    const getTabCount = (tabId) => {
        if (tabId === "all") return jobs.length;
        const tabConfig = statusTabs.find((tab) => tab.id === tabId);
        return jobs.filter((job) => tabConfig?.statuses.includes(job.status))
            .length;
    };

    return (
        <AuthenticatedLayout>
            {openConfirmDialog && (
                <AlertDialogQuestion
                    open={openConfirmDialog}
                    setOpen={setOpenConfirmDialog}
                    title="ยืนยันการปิดงานส่งกลับจากพัมคินฯ"
                    text={`คุณต้องการยืนยันการปิดงานส่งกลับจากพัมคิน จำนวน ${jobsToFinishConfirm.length} รายการ ใช่หรือไม่?`}
                    onPassed={handleFinishJob}
                />
            )}
            <Head
                title={
                    currentView === "history"
                        ? "ประวัติการปิดงาน"
                        : "จบงานส่งซ่อมไปยังพัมคิน"
                }
            />
            <div className="py-5">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        {currentView === "history"
                            ? "📜 ประวัติการปิดงาน (History)"
                            : "🛠️ ตรวจสอบสถานะส่งซ่อมพัมคินฯ"}
                    </h2>

                    {/* View Switch */}
                    <div className="mb-4">
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => handleViewChange("all_current")}
                                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${currentView === "all_current"
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                🎯 งานที่รอปิดทั้งหมด
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewChange("history")}
                                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${currentView === "history"
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                📜 ประวัติการจบงาน (Success)
                            </button>
                        </div>
                    </div>

                    {/* การกรองร้านค้าสำหรับ Admin */}
                    {isAdmin && (
                        <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Typography variant="body2" fontWeight="bold">
                                🔍 เลือกร้านค้า:
                            </Typography>
                            <Box sx={{ minWidth: 300, flex: 1, maxWidth: 500 }}>
                                <Autocomplete
                                    options={shops || []}
                                    getOptionLabel={(option) =>
                                        `[${option.is_code_cust_id}] ${option.shop_name}`
                                    }
                                    value={
                                        shops?.find(
                                            (s) => s.is_code_cust_id === filters.shop
                                        ) || null
                                    }
                                    onChange={(e, newValue) => {
                                        handleShopChange(
                                            newValue ? newValue.is_code_cust_id : ""
                                        );
                                    }}
                                    size="small"
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="ร้านค้าทั้งหมด" />
                                    )}
                                />
                            </Box>
                        </div>
                    )}

                    {/* ฟอร์มสำหรับค้นหา (แสดงเฉพาะในโหมด 'close_current' เท่านั้น) */}
                    {currentView === "close_current" && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
                            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                                ค้นหางานที่รอปิด
                            </h3>

                            {/* Mode Switch */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    เลือกโหมดการค้นหา:
                                </label>
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleModeChange("individual")
                                        }
                                        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${searchMode === "individual"
                                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        ซีเรียลและเลข Job (กำหนด)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleModeChange("group")
                                        }
                                        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${searchMode === "group"
                                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        เลข Group Job (ใบส่งซ่อม)
                                    </button>
                                </div>
                            </div>
                            <hr className="my-4" />
                            {/* Form */}
                            <form onSubmit={handleSearch}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    {/* โหมด ค้นหาด้วยซีเรียลและเลข Job */}
                                    {searchMode === "individual" && (
                                        <>
                                            <div className="md:col-span-2">
                                                <label
                                                    htmlFor="jobId"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    เลขที่ Job (Job ID){" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    id="jobId"
                                                    type="text"
                                                    value={data.job_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "job_id",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="กรอก Job ID"
                                                    required={
                                                        searchMode ===
                                                        "individual"
                                                    }
                                                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    disabled={
                                                        searchLoading ||
                                                        finishLoading
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="serialId"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    เลขที่ Serial (Serial ID){" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    id="serialId"
                                                    type="text"
                                                    value={data.serial_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "serial_id",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="กรอก Serial ID"
                                                    required={
                                                        searchMode ===
                                                        "individual"
                                                    }
                                                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    disabled={
                                                        searchLoading ||
                                                        finishLoading
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* โหมด ค้นหาด้วย Group Job */}
                                    {searchMode === "group" && (
                                        <div className="md:col-span-3">
                                            <label
                                                htmlFor="groupJob"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                เลขที่ Group Job (PK){" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                id="groupJob"
                                                type="text"
                                                value={data.group_job}
                                                onChange={(e) =>
                                                    setData(
                                                        "group_job",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="กรอก Group Job"
                                                required={
                                                    searchMode === "group"
                                                }
                                                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                disabled={
                                                    searchLoading ||
                                                    finishLoading
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* ปุ่มค้นหาและล้างค่า */}
                                    <div className="flex space-x-2 md:col-span-1">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            disabled={
                                                searchLoading || finishLoading
                                            }
                                        >
                                            {searchLoading ? (
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                            ) : (
                                                "🔍 ค้นหางาน"
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetAll}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            disabled={
                                                searchLoading || finishLoading
                                            }
                                        >
                                            ล้างค่า
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                    {(currentView === "all_current" ||
                        currentView === "history") && (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4 p-6">
                                <h3 className="text-lg font-semibold mb-2 border-b flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                        ></path>
                                    </svg>
                                    ตัวกรองค้นหา{" "}
                                    {currentView === "history"
                                        ? "(ประวัติ)"
                                        : "(งานปัจจุบัน)"}
                                </h3>
                                <form onSubmit={handleFilterSubmit}>
                                    <div className="grid grid-cols-2 md:grid-cols-8 gap-4 items-end">
                                        {/* วันที่เริ่มต้น */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                วันที่เริ่มต้น
                                            </label>
                                            <input
                                                type="date"
                                                value={filters.start_date}
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        start_date: e.target.value,
                                                    })
                                                }
                                                className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            />
                                        </div>

                                        {/* วันที่สิ้นสุด */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                วันที่สิ้นสุด
                                            </label>
                                            <input
                                                type="date"
                                                value={filters.end_date}
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        end_date: e.target.value,
                                                    })
                                                }
                                                className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            />
                                        </div>

                                        {/* Group Job */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                เลขที่ Group Job (PK)
                                            </label>
                                            <input
                                                type="text"
                                                value={filters.group_job}
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        group_job: e.target.value,
                                                    })
                                                }
                                                placeholder="ระบุบางส่วนของ Group Job"
                                                className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            ></input>
                                        </div>

                                        {/* Job ID */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                เลขที่ Job (Job ID)
                                            </label>
                                            <input
                                                type="text"
                                                value={filters.job_id}
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        job_id: e.target.value,
                                                    })
                                                }
                                                placeholder="ระบุบางส่วนของ Job ID"
                                                // เพิ่ม max-w-xs ตรงนี้
                                                className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            />
                                        </div>

                                        {/* Serial ID */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                เลขที่ Serial (Serial ID)
                                            </label>
                                            <input
                                                type="text"
                                                value={filters.serial_id}
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        serial_id: e.target.value,
                                                    })
                                                }
                                                placeholder="ระบุบางส่วนของ Serial"
                                                // เพิ่ม max-w-xs ตรงนี้
                                                className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            />
                                        </div>

                                        {/* Product ID (PID) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                รหัสสินค้า (PID)
                                            </label>
                                            <input
                                                type="text"
                                                value={filters.pid}
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        pid: e.target.value,
                                                    })
                                                }
                                                placeholder="ระบุรหัสสินค้า"
                                                // เพิ่ม max-w-xs ตรงนี้
                                                className="mt-1 p-2 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            />
                                        </div>

                                        {/* Buttons: ย้ายมาอยู่แถวใหม่ หรือให้ชิดซ้ายต่อจาก input ตัวสุดท้าย */}
                                        <div className="flex space-x-2 md:col-span-2">
                                            <button
                                                type="submit"
                                                disabled={searchLoading}
                                                className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {searchLoading
                                                    ? "กำลังค้นหา..."
                                                    : "ค้นหา"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleResetFilter}
                                                disabled={searchLoading}
                                                className="inline-flex justify-center items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            >
                                                ล้างค่า
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                    {/* Alert Dialog Popup */}
                    <Dialog
                        open={!!alert} // แปลง object alert ให้เป็น boolean (มีค่า=true, null=false)
                        onClose={() => setAlert(null)} // กดพื้นหลังเพื่อปิด
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        fullWidth
                        maxWidth="xs" // ขนาดความกว้าง (xs, sm, md, lg)
                    >
                        {alert && (
                            <>
                                <DialogTitle
                                    id="alert-dialog-title"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        bgcolor:
                                            alert.type === "success"
                                                ? "#edf7ed"
                                                : alert.type === "error"
                                                    ? "#fdeded"
                                                    : "#e5f6fd",
                                        color:
                                            alert.type === "success"
                                                ? "#1e4620"
                                                : alert.type === "error"
                                                    ? "#5f2120"
                                                    : "#014361",
                                    }}
                                >
                                    {/* แสดงไอคอนตามประเภท */}
                                    {alert.type === "success" && (
                                        <CheckCircle color="success" />
                                    )}
                                    {alert.type === "error" && (
                                        <ErrorIcon color="error" />
                                    )}
                                    {alert.type === "warning" && (
                                        <Warning color="warning" />
                                    )}
                                    {alert.type !== "success" &&
                                        alert.type !== "error" &&
                                        alert.type !== "warning" && (
                                            <Info color="info" />
                                        )}

                                    <Typography
                                        variant="h6"
                                        component="span"
                                        fontWeight="bold"
                                    >
                                        {alert.type === "success"
                                            ? "สำเร็จ"
                                            : alert.type === "error"
                                                ? "ข้อผิดพลาด"
                                                : "แจ้งเตือน"}
                                    </Typography>
                                </DialogTitle>

                                <DialogContent sx={{ mt: 2 }}>
                                    <DialogContentText
                                        id="alert-dialog-description"
                                        sx={{ color: "text.primary" }}
                                    >
                                        {alert.message}
                                    </DialogContentText>
                                </DialogContent>

                                <DialogActions>
                                    <Button
                                        onClick={() => setAlert(null)}
                                        variant="contained"
                                        color={
                                            alert.type === "success"
                                                ? "success"
                                                : alert.type === "error"
                                                    ? "error"
                                                    : "primary"
                                        }
                                        autoFocus
                                    >
                                        ตกลง
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Dialog>

                    {/* ตารางแสดงผลลัพธ์และปุ่มจบงาน */}
                    {jobs.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                                    <h3 className="text-xl font-semibold border-b pb-2 w-full sm:w-auto">
                                        {currentView === "history"
                                            ? "รายการประวัติการปิดงาน (" +
                                            filteredJobs.length +
                                            ")"
                                            : "รายการงานทั้งหมด (" +
                                            filteredJobs.length +
                                            ")"}
                                    </h3>

                                    {(currentView === "close_current" ||
                                        currentView === "all_current") &&
                                        isReadyToFinish() && (
                                            <button
                                                type="button"
                                                onClick={handleConfirmOpen}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                disabled={
                                                    selectedJobIds.length ===
                                                    0 ||
                                                    finishLoading ||
                                                    searchLoading
                                                }
                                            >
                                                {finishLoading ? (
                                                    <>
                                                        <svg
                                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                                                                5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 
                                                                3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        กำลังจบงาน...
                                                    </>
                                                ) : (
                                                    `ปิดงาน ${selectedJobIds.length} รายการ`
                                                )}
                                            </button>
                                        )}
                                </div>

                                {/* Tap สถานะ */}
                                <div className="mb-4 border-b border-gray-200">
                                    <nav
                                        className="-mb-px flex space-x-4 overflow-x-auto"
                                        aria-label="Tabs"
                                    >
                                        {statusTabs.map((tab) => {
                                            const count = getTabCount(tab.id);
                                            // ซ่อน Tab หากไม่มีข้อมูลใน Tab นั้น (ยกเว้น Tab All)
                                            if (tab.id !== "all" && count === 0)
                                                return null;

                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setActiveTab(tab.id);
                                                        setSelectedJobIds([]); // เคลียร์ checkbox เมื่อเปลี่ยน tab
                                                    }}
                                                    className={`
                                                        whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200
                                                        ${activeTab === tab.id
                                                            ? tab.color ||
                                                            "border-blue-500 text-blue-600 bg-blue-50/50"
                                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                        }
                                                    `}
                                                >
                                                    {tab.label}
                                                    <span
                                                        className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium 
                                                        ${activeTab === tab.id
                                                                ? tab.countColor ||
                                                                "bg-blue-100 text-blue-600"
                                                                : "bg-gray-100 text-gray-900"
                                                            }`}
                                                    >
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>

                                <div className="overflow-x-auto overflow-y-auto mb-4 max-h-[45vh] border rounded-lg shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                {/* คอลัมน์ Checkbox */}
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {(currentView ===
                                                        "close_current" ||
                                                        currentView ===
                                                        "all_current") && (
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selectedJobIds.length ===
                                                                    filteredJobs.length &&
                                                                    filteredJobs.length >
                                                                    0
                                                                }
                                                                onChange={
                                                                    toggleSelectAll
                                                                }
                                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                disabled={
                                                                    finishLoading
                                                                }
                                                            />
                                                        )}
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Group Job
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Job ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Serial ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    รหัสสินค้า (PID)
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ชื่อสินค้า
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ticket / ASS No.
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    สถานะ
                                                </th>
                                                {(currentView ===
                                                    "close_current" ||
                                                    currentView ===
                                                    "all_current") && (
                                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            ตรวจสอบสถานะ
                                                        </th>
                                                    )}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    วันที่
                                                    {currentView === "history"
                                                        ? "ปิดงาน"
                                                        : "ส่งซ่อม"}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredJobs.map((job) => {
                                                const isChecking =
                                                    statusCheckingJobId ===
                                                    job.job_id;
                                                const displayStatus =
                                                    job.status;
                                                let statusClasses =
                                                    "bg-gray-100 text-gray-800";
                                                if (
                                                    displayStatus ===
                                                    "success" ||
                                                    displayStatus ===
                                                    "บัญชีรับงานแล้ว" ||
                                                    displayStatus ===
                                                    "ส่งของแล้ว"
                                                ) {
                                                    statusClasses =
                                                        "bg-green-100 text-green-800";
                                                } else if (
                                                    displayStatus === "send" ||
                                                    displayStatus ===
                                                    "กำลังส่ง" ||
                                                    displayStatus ===
                                                    "เตรียมส่ง"
                                                ) {
                                                    statusClasses =
                                                        "bg-indigo-100 text-indigo-700";
                                                } else if (
                                                    displayStatus ===
                                                    "รอปิดงานซ่อม" ||
                                                    displayStatus ===
                                                    "กำลังซ่อม" ||
                                                    displayStatus ===
                                                    "พักงานซ่อม" ||
                                                    displayStatus ===
                                                    "รอรับงานซ่อม"
                                                ) {
                                                    statusClasses =
                                                        "bg-yellow-100 text-yellow-800";
                                                } else if (
                                                    displayStatus === "canceled"
                                                ) {
                                                    statusClasses =
                                                        "bg-red-100 text-red-800";
                                                }
                                                return (
                                                    <tr
                                                        key={job.job_id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {currentView ===
                                                                "close_current" ||
                                                                currentView ===
                                                                "all_current" ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedJobIds.includes(
                                                                        job.job_id,
                                                                    )}
                                                                    onChange={() =>
                                                                        handleCheckboxChange(
                                                                            job.job_id,
                                                                        )
                                                                    }
                                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                    disabled={
                                                                        finishLoading
                                                                    }
                                                                />
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    -
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {job.group_job}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <Link
                                                                href={route(
                                                                    "repair.index",
                                                                    {
                                                                        job_id: job.job_id,
                                                                        typedm:
                                                                            job.typedm ||
                                                                            null,
                                                                        modelfg:
                                                                            job.modelfg ||
                                                                            null,
                                                                        layout:
                                                                            job.layout ||
                                                                            null,
                                                                    },
                                                                )}
                                                            >
                                                                {job.job_id}
                                                            </Link>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {job.serial_id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {job.pid}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {job.p_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                                            {job.ticket_code
                                                                ? job.ticket_code
                                                                : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                            <span
                                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}
                                                            >
                                                                {displayStatus}
                                                            </span>
                                                        </td>
                                                        {(currentView ===
                                                            "close_current" ||
                                                            currentView ===
                                                            "all_current") && (
                                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                    {(job.status ===
                                                                        "send" ||
                                                                        job.status ===
                                                                        "เปิดออเดอร์แล้ว" ||
                                                                        job.status ===
                                                                        "รอเปิดSO" ||
                                                                        job.status ===
                                                                        "พร้อมส่ง" ||
                                                                        job.status ===
                                                                        "แพ็คสินค้าเสร็จ" ||
                                                                        job.status ===
                                                                        "กำลังจัดสินค้า" ||
                                                                        job.status ===
                                                                        "กำลังส่ง" ||
                                                                        job.status ===
                                                                        "เตรียมส่ง" ||
                                                                        job.status ===
                                                                        "รอปิดงานซ่อม" ||
                                                                        job.status ===
                                                                        "กำลังซ่อม" ||
                                                                        job.status ===
                                                                        "พักงานซ่อม" ||
                                                                        job.status ===
                                                                        "รอรับงานซ่อม") && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    checkJobStatusAndRefresh(
                                                                                        job,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isChecking ||
                                                                                    finishLoading
                                                                                }
                                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-gray-700 bg-yellow-200 hover:bg-yellow-300 disabled:opacity-50"
                                                                            >
                                                                                {isChecking ? (
                                                                                    <svg
                                                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        fill="none"
                                                                                        viewBox="0 0 24 24"
                                                                                    >
                                                                                        <circle
                                                                                            className="opacity-25"
                                                                                            cx="12"
                                                                                            cy="12"
                                                                                            r="10"
                                                                                            stroke="currentColor"
                                                                                            strokeWidth="4"
                                                                                        ></circle>
                                                                                        <path
                                                                                            className="opacity-75"
                                                                                            fill="currentColor"
                                                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                                        ></path>
                                                                                    </svg>
                                                                                ) : (
                                                                                    <Refresh className="w-4 h-4 mr-1" />
                                                                                )}
                                                                                {isChecking
                                                                                    ? "กำลังเช็ค..."
                                                                                    : "ตรวจสอบ"}
                                                                            </button>
                                                                        )}
                                                                    {(job.status ===
                                                                        "จัดส่งสำเร็จ" ||
                                                                        job.status ===
                                                                        "ส่งสำเร็จ" ||
                                                                        job.status ===
                                                                        "จบงาน" ||
                                                                        job.status ===
                                                                        "ส่งของแล้ว" ||
                                                                        job.status ===
                                                                        "บัญชีรับงานแล้ว") && (
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                                                <span className="w-2 h-2 mr-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                                                                                รอปิดงาน
                                                                            </span>
                                                                        )}
                                                                    {job.status ===
                                                                        "ยกเลิกคำสั่งซื้อ" && (
                                                                            <span className="text-gray-400">
                                                                                -
                                                                            </span>
                                                                        )}
                                                                </td>
                                                            )}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(
                                                                currentView ===
                                                                    "history"
                                                                    ? job.updated_at
                                                                    : job.created_at,
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
