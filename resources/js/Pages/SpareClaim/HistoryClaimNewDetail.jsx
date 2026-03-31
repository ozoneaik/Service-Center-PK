// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
// import { Head, router } from "@inertiajs/react";
// import {
//     Box,
//     Button,
//     Card,
//     CardContent,
//     Chip,
//     Container,
//     Divider,
//     Grid2,
//     Stack,
//     Step,
//     StepLabel,
//     Stepper,
//     Typography,
//     useMediaQuery,
// } from "@mui/material";
// import { ArrowBack } from "@mui/icons-material";
// import React from "react";

// const steps = [
//     "กำลังตรวจสอบเอกสารเคลม",
//     "อนุมัติคำสั่งส่งเคลม",
//     "กำลังจัดเตรียมสินค้า",
//     "อยู่ระหว่างจัดส่ง",
//     "จัดส่งสำเร็จ",
// ];

// const getActiveStep = (status) => {
//     switch (status) {
//         case "pending":
//         case "รอรับงานซ่อม":
//         case "พักงานซ่อม":
//         case "กำลังซ่อม":
//         case "รอปิดงานซ่อม":
//             return 0;
//         case "approved":
//         case "เปิดออเดอร์แล้ว":
//         case "รอเปิดSO":
//             return 1;
//         case "กำลังจัดเตรียมสินค้า":
//         case "กำลังจัดสินค้า":
//         case "แพ็คสินค้าเสร็จ":
//         case "พร้อมส่ง":
//             return 2;
//         case "อยู่ระหว่างจัดส่ง":
//         case "กำลังส่ง":
//         case "เตรียมส่ง":
//             return 3;
//         case "จัดส่งสำเร็จ":
//         case "บัญชีรับงานแล้ว":
//         case "ส่งของแล้ว":
//             return 4;
//         default:
//             return 0;
//     }
// };

// export default function HistoryClaimNewDetail({ list, claim_id, claim }) {
//     const isMobile = useMediaQuery("(max-width:600px)");
//     console.log(list);

//     const handleError = (e) => {
//         e.target.src = defaultImage;
//     };
//     const activeStep = getActiveStep(claim.status);

//     return (
//         <AuthenticatedLayout>
//             <Head title={`รายละเอียดเอกสารเคลม ${claim_id}`} />
//             <Container maxWidth="false" sx={{ bgcolor: "white", p: 2 }}>
//                 <Grid2 container spacing={2}>
//                     <Grid2 size={12}>
//                         <Stack
//                             direction="row"
//                             justifyContent="space-between"
//                             alignItems="center"
//                         >
//                             <Stack
//                                 direction="row"
//                                 spacing={1}
//                                 alignItems="center"
//                             >
//                                 <Button
//                                     size="small"
//                                     color="primary"
//                                     variant="outlined"
//                                     onClick={() =>
//                                         router.get(route("spareClaim.history"))
//                                     }
//                                 >
//                                     <ArrowBack />
//                                 </Button>
//                                 <Typography fontWeight="bold" fontSize={20}>
//                                     เอกสารเคลม {claim_id}
//                                 </Typography>
//                             </Stack>
//                             <StatusClaim status={claim.status} />
//                         </Stack>
//                     </Grid2>
//                     <Grid2 size={12}>
//                         <Stepper activeStep={activeStep} alternativeLabel>
//                             {steps.map((label) => (
//                                 <Step key={label}>
//                                     <StepLabel>{label}</StepLabel>
//                                 </Step>
//                             ))}
//                         </Stepper>
//                     </Grid2>
//                     <Grid2 size={12}>
//                         <Typography>
//                             รายการอะไหล่ {list.length} รายการ
//                         </Typography>
//                     </Grid2>
//                     <Grid2 size={12}>
//                         <Stack spacing={2}>
//                             {list.map((item, index) => {
//                                 const spImage =
//                                     import.meta.env.VITE_IMAGE_SP_NEW +
//                                     item.sp_code +
//                                     ".jpg";
//                                 const defaultImage = import.meta.env
//                                     .VITE_IMAGE_PID;
//                                 return (
//                                     <Card key={index} variant="outlined">
//                                         <CardContent>
//                                             <Stack
//                                                 direction={
//                                                     isMobile ? "column" : "row"
//                                                 }
//                                                 justifyContent="start"
//                                                 spacing={2}
//                                             >
//                                                 <Box width={80} height={80}>
//                                                     <img
//                                                         width="100%"
//                                                         height="100%"
//                                                         src={spImage}
//                                                         onError={handleError}
//                                                     />
//                                                     {item.id}
//                                                 </Box>
//                                                 <Stack spacing={1} width="100%">
//                                                     <Box sx={detailBoxStyle}>
//                                                         <Typography
//                                                             variant="subtitle2"
//                                                             sx={{
//                                                                 fontWeight:
//                                                                     "bold",
//                                                                 color: "text.secondary",
//                                                             }}
//                                                         >
//                                                             รหัส/ชื่ออะไหล่
//                                                         </Typography>
//                                                         <Typography
//                                                             variant="body2"
//                                                             sx={{
//                                                                 fontWeight:
//                                                                     "bold",
//                                                             }}
//                                                         >
//                                                             {item.sp_code}{" "}
//                                                             {item.sp_name}
//                                                         </Typography>
//                                                     </Box>
//                                                     <Divider sx={{ my: 1 }} />
//                                                     <Box sx={detailBoxStyle}>
//                                                         <Typography
//                                                             variant="subtitle2"
//                                                             sx={{
//                                                                 fontWeight:
//                                                                     "bold",
//                                                                 color: "text.secondary",
//                                                             }}
//                                                         >
//                                                             job แจ้งซ่อม เลขที่
//                                                         </Typography>
//                                                         <Typography
//                                                             variant="body2"
//                                                             sx={{
//                                                                 fontWeight:
//                                                                     "bold",
//                                                             }}
//                                                         >
//                                                             {item.job_id}
//                                                         </Typography>
//                                                     </Box>
//                                                     <Box sx={detailBoxStyle}>
//                                                         <Typography
//                                                             variant="subtitle2"
//                                                             sx={{
//                                                                 fontWeight:
//                                                                     "bold",
//                                                                 color: "text.secondary",
//                                                             }}
//                                                         >
//                                                             ประเภทการเคลม
//                                                         </Typography>
//                                                         <Typography
//                                                             variant="body2"
//                                                             sx={{
//                                                                 fontWeight:
//                                                                     "bold",
//                                                             }}
//                                                         >
//                                                             {item.claim_remark ||
//                                                                 item.remark_noclaim ||
//                                                                 "เคลมปกติ"}
//                                                         </Typography>
//                                                     </Box>
//                                                     <Box sx={detailBoxStyle}>
//                                                         <Typography
//                                                             variant="subtitle2"
//                                                             sx={{
//                                                                 fontWeight:
//                                                                     "bold",
//                                                                 color: "text.secondary",
//                                                             }}
//                                                         >
//                                                             จำนวน
//                                                         </Typography>
//                                                         <Chip
//                                                             color="primary"
//                                                             label={
//                                                                 item.qty +
//                                                                 " " +
//                                                                 item.unit
//                                                             }
//                                                             variant="body2"
//                                                             sx={{
//                                                                 fontWeight:
//                                                                     "bold",
//                                                             }}
//                                                             size="small"
//                                                         />
//                                                     </Box>
//                                                 </Stack>
//                                             </Stack>
//                                         </CardContent>
//                                     </Card>
//                                 );
//                             })}
//                         </Stack>
//                     </Grid2>
//                 </Grid2>
//             </Container>
//         </AuthenticatedLayout>
//     );
// }

// const getClaimStatusParams = (s) => {
//     switch (s) {
//         case "pending":
//             return { status: "secondary", label: "กำลังตรวจสอบคำขอเคลม" };
//         case "รอรับงานซ่อม":
//         case "พักงานซ่อม":
//         case "กำลังซ่อม":
//         case "รอปิดงานซ่อม":
//             return { status: "secondary", label: "กำลังตรวจสอบคำขอเคลม" };

//         case "เปิดออเดอร์แล้ว":
//         case "รอเปิดSO":
//         case "approved":
//             return { status: "success", label: "อนุมัติคำสั่งส่งเคลม" };

//         case "rejected":
//             return { status: "error", label: "ไม่อนุมัติ" };

//         case "กำลังจัดสินค้า":
//         case "แพ็คสินค้าเสร็จ":
//         case "พร้อมส่ง":
//         case "กำลังจัดเตรียมสินค้า":
//             return { status: "info", label: "กำลังจัดเตรียมสินค้า" };

//         case "กำลังส่ง":
//         case "เตรียมส่ง":
//         case "อยู่ระหว่างจัดส่ง":
//             return { status: "warning", label: "อยู่ระหว่างจัดส่ง" };

//         case "บัญชีรับงานแล้ว":
//         case "ส่งของแล้ว":
//         case "จัดส่งสำเร็จ":
//             return { status: "success", label: "จัดส่งสำเร็จ" };

//         default:
//             // สำหรับสถานะอื่นๆ เช่น เปิดออเดอร์แล้ว, รอเปิดSO, รอรับงานซ่อม ฯลฯ
//             return { status: "info", label: s || "ไม่สามารถระบุได้" };
//     }
// };

// const StatusClaim = ({ status }) => {
//     const status_formated = getClaimStatusParams(status);
//     return (
//         <Chip
//             size="small"
//             color={status_formated.status}
//             label={status_formated.label}
//         />
//     );
// };

// const detailBoxStyle = {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
// };


import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid2,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Typography,
    useMediaQuery,
    CircularProgress, // เพิ่ม CircularProgress
} from "@mui/material";
import { ArrowBack, Refresh } from "@mui/icons-material"; // เพิ่ม Refresh icon
import React, { useState } from "react"; // เพิ่ม useState
import axios from "axios"; // เพิ่ม axios

const steps = [
    "กำลังตรวจสอบเอกสารเคลม",
    "อนุมัติคำสั่งส่งเคลม",
    "กำลังจัดเตรียมสินค้า",
    "อยู่ระหว่างจัดส่ง",
    "จัดส่งสำเร็จ",
];

const getActiveStep = (status) => {
    switch (status) {
        case "pending":
        case "รอรับงานซ่อม":
        case "พักงานซ่อม":
        case "กำลังซ่อม":
        case "รอปิดงานซ่อม":
            return 0;
        case "approved":
        case "เปิดออเดอร์แล้ว":
        case "รอเปิดSO":
            return 1;
        case "กำลังจัดเตรียมสินค้า":
        case "กำลังจัดสินค้า":
        case "แพ็คสินค้าเสร็จ":
        case "พร้อมส่ง":
            return 2;
        case "อยู่ระหว่างจัดส่ง":
        case "กำลังส่ง":
        case "เตรียมส่ง":
            return 3;
        case "จัดส่งสำเร็จ":
        case "บัญชีรับงานแล้ว":
        case "ส่งของแล้ว":
            return 4;
        default:
            return 0;
    }
};

export default function HistoryClaimNewDetail({ list, claim_id, claim }) {
    const isMobile = useMediaQuery("(max-width:600px)");
    const [loading, setLoading] = useState(false); // เพิ่ม State ควบคุม Loading ปุ่มเช็คสถานะ

    // ฟังก์ชันเช็คสถานะ (ดึงมาจากหน้าหลัก)
    const checkClaimStatus = async (id) => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                route("spareClaim.checkStatusClaim"),
                { claim_id: id },
            );
            const claimStatus = data.data.status;
            const statusDisplay = getClaimStatusParams(claimStatus).label;

            // รีโหลดข้อมูล claim ตัวใหม่มาแสดงผลทันที
            router.reload({ only: ["claim", "list"] });

            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "success",
                    title: "อัปเดตสถานะสำเร็จ",
                    text: `สถานะของ ${id} ถูกอัปเดตเป็น: ${statusDisplay}`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                alert(`สถานะของ ${id} ถูกอัปเดตเป็น: ${statusDisplay}`);
            }
        } catch (error) {
            console.error("Error checking status:", error);
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้";
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: errorMsg,
                });
            } else {
                alert(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleError = (e) => {
        e.target.src = import.meta.env.VITE_IMAGE_DEFAULT || ""; // ตรวจสอบ fallback image
    };
    const activeStep = getActiveStep(claim.status);

    return (
        <AuthenticatedLayout>
            <Head title={`รายละเอียดเอกสารเคลม ${claim_id}`} />
            <Container maxWidth="false" sx={{ bgcolor: "white", p: 2 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack
                            direction={isMobile ? "column" : "row"}
                            justifyContent="space-between"
                            alignItems={isMobile ? "flex-start" : "center"}
                            spacing={2}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    onClick={() =>
                                        router.get(route("spareClaim.history"))
                                    }
                                >
                                    <ArrowBack />
                                </Button>
                                <Typography fontWeight="bold" fontSize={20}>
                                    เอกสารเคลม {claim_id}
                                </Typography>
                            </Stack>

                            {/* ส่วนปุ่มอัปเดตสถานะ และ Chip */}
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                    color="info"
                                    size="small"
                                    onClick={() => checkClaimStatus(claim_id)}
                                    disabled={loading}
                                    startIcon={loading ? null : <Refresh />}
                                    variant="outlined"
                                >
                                    {loading ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        "เช็คสถานะ"
                                    )}
                                </Button>
                                <StatusClaim status={claim.status} />
                            </Stack>
                        </Stack>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Grid2>
                    <Grid2 size={12}>
                        <Typography>
                            รายการอะไหล่ {list.length} รายการ
                        </Typography>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack spacing={2}>
                            {list.map((item, index) => {
                                const spImage =
                                    import.meta.env.VITE_IMAGE_SP_NEW +
                                    item.sp_code +
                                    ".jpg";
                                return (
                                    <Card key={index} variant="outlined">
                                        <CardContent>
                                            <Stack
                                                direction={
                                                    isMobile ? "column" : "row"
                                                }
                                                justifyContent="start"
                                                spacing={2}
                                            >
                                                <Box width={80} height={80}>
                                                    <img
                                                        width="100%"
                                                        height="100%"
                                                        src={spImage}
                                                        onError={handleError}
                                                        style={{ objectFit: "contain" }}
                                                    />
                                                </Box>
                                                <Stack spacing={1} width="100%">
                                                    <Box sx={detailBoxStyle}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                color: "text.secondary",
                                                            }}
                                                        >
                                                            รหัส/ชื่ออะไหล่
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {item.sp_code}{" "}
                                                            {item.sp_name}
                                                        </Typography>
                                                    </Box>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Box sx={detailBoxStyle}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                color: "text.secondary",
                                                            }}
                                                        >
                                                            job แจ้งซ่อม เลขที่
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {item.job_id}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={detailBoxStyle}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                color: "text.secondary",
                                                            }}
                                                        >
                                                            ประเภทการเคลม
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {item.claim_remark ||
                                                                item.remark_noclaim ||
                                                                "เคลมปกติ"}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={detailBoxStyle}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                color: "text.secondary",
                                                            }}
                                                        >
                                                            จำนวน
                                                        </Typography>
                                                        <Chip
                                                            color="primary"
                                                            label={
                                                                item.qty +
                                                                " " +
                                                                item.unit
                                                            }
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                            }}
                                                            size="small"
                                                        />
                                                    </Box>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    </Grid2>
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}

const getClaimStatusParams = (s) => {
    switch (s) {
        case "pending":
            return { status: "secondary", label: "กำลังตรวจสอบคำขอเคลม" };
        case "รอรับงานซ่อม":
        case "พักงานซ่อม":
        case "กำลังซ่อม":
        case "รอปิดงานซ่อม":
            return { status: "secondary", label: "กำลังตรวจสอบคำขอเคลม" };

        case "เปิดออเดอร์แล้ว":
        case "รอเปิดSO":
        case "approved":
            return { status: "success", label: "อนุมัติคำสั่งส่งเคลม" };

        case "rejected":
            return { status: "error", label: "ไม่อนุมัติ" };

        case "กำลังจัดสินค้า":
        case "แพ็คสินค้าเสร็จ":
        case "พร้อมส่ง":
        case "กำลังจัดเตรียมสินค้า":
            return { status: "info", label: "กำลังจัดเตรียมสินค้า" };

        case "กำลังส่ง":
        case "เตรียมส่ง":
        case "อยู่ระหว่างจัดส่ง":
            return { status: "warning", label: "อยู่ระหว่างจัดส่ง" };

        case "บัญชีรับงานแล้ว":
        case "ส่งของแล้ว":
        case "จัดส่งสำเร็จ":
            return { status: "success", label: "จัดส่งสำเร็จ" };

        default:
            return { status: "info", label: s || "ไม่สามารถระบุได้" };
    }
};

const StatusClaim = ({ status }) => {
    const status_formated = getClaimStatusParams(status);
    return (
        <Chip
            size="small"
            color={status_formated.status}
            label={status_formated.label}
        />
    );
};

const detailBoxStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};