import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, useForm } from "@inertiajs/react";
import { Button, Divider, Grid2, Stack, TextField, Typography } from "@mui/material";
import EmptyImage from "../../assets/Empty.png";
import { useState } from "react";
import { RepairDetail } from "@/Pages/Home/RepairDetail.jsx";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { AlertDialog } from "@/Dialogs/AlertDialog";

const Detail = ({ title, value, type = 'text', warrantyRegister }) => (
    <Typography fontWeight='bold'>
        {title}&nbsp;:&nbsp;
        <Typography fontWeight='normal' component="span" sx={{ color: "#f15721" }}>
            {type === 'text' ? value : type === 'date' ? value : 'hello'}
        </Typography>
        {warrantyRegister && (
            <a href={warrantyRegister} target="_blank">
                <FontAwesomeIcon style={{ marginLeft: 12 }} icon={faCircleInfo} size="xl" />
            </a>
        )}
    </Typography>
);

export default function Dashboard({ auth }) {
    const { data, setData, get, processing, errors, reset } = useForm({});
    const [loading, setLoading] = useState(false);
    const [serialNumber, setSerialNumber] = useState();
    const [btnSel, setBtnSel] = useState();
    const [detail, setDetail] = useState({});
    const [imageList, setImageList] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setDetail({});
        const res = await axios.get('/get-detail', {
            params: { serialNumber: serialNumber }
        })
        if (res.status === 200 && res.data.status === 'SUCCESS') {
            setDetail(res.data.assets[0]);
            const result = Object.entries(res.data.assets[0].listbehavior).map(([id, data]) => ({
                id,
                ...data
            }));
            const resultSP = Object.entries(res.data.assets[0].sp).map(([id, data]) => {
                // แยกข้อมูลที่ใช้ "|" เป็นตัวแบ่ง
                const [code, description, _, status] = data.split('|');
                
                return {
                    id,
                    code,
                    description,
                    status
                };
            });
            setDetail({ ...res.data.assets[0], listbehavior: result,sp : resultSP });
            console.log(resultSP);
            
        } else {
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: res.data.message,
                onPassed: (confirm) => {
                    alert(confirm);
                }
            })
        }
        setLoading(false);
    };
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="ตรวจสอบรับประกัน" />
            <div className="py-3">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-2">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-5">
                        <Stack spacing={2} mb={2}>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    required color="error" id="outlined-basic" fullWidth
                                    focused label="ซีเรียลนัมเบอร์" variant="outlined"
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                />
                            </form>
                            {
                                loading && <Typography>กำลังค้นหาข้อมูล...</Typography>}
                            {detail.pid && (
                                <>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={{ lg: 3, md: 12 }}>
                                            <img src={detail.imagesku || EmptyImage} alt="image" />
                                        </Grid2>
                                        <Grid2 size={9}>
                                            <Stack spacing={{ lg: 4, xs: 2 }}>
                                                <Typography fontWeight="bold" variant="h5">รายละเอียด</Typography>
                                                <Detail title={"ซีเรียลนัมเบอร์"} value={detail.serial} />
                                                <Detail title={"รหัสสินค้า"} value={detail.pid} />
                                                <Detail title={"ชื่อสินค้า"} value={detail.pname} />
                                                <Detail title={"วันที่ลงทะเบียนรับประกัน"} value={"12-12-2024"} type={'date'} warrantyRegister={'hello world'} />
                                                <Detail title={"วันที่หมดอายุรับประกัน"} value={"12-12-2024"} />
                                                <Detail title={"สถานะรับประกัน"} value={"สำเร็จ"} />
                                                <Detail title={"เงื่อนไขรับประกันสินค้า"} value={"ไม่มี"} />
                                            </Stack>
                                        </Grid2>
                                        <Grid2 size={12}>

                                            <Stack
                                                direction={{ lg: 'row', xs: 'column' }}
                                                spacing={{ lg: 4, xs: 1 }}
                                                justifyContent={{ lg: 'center', xs: 'flex-start' }}
                                            >
                                                <Button
                                                    onClick={() => setBtnSel(1)}
                                                    variant={btnSel === 1 ? 'contained' : 'outlined'}
                                                >
                                                    แจ้งซ่อม
                                                </Button>
                                                <Button
                                                    onClick={() => setBtnSel(2)}
                                                    variant={btnSel === 2 ? 'contained' : 'outlined'}
                                                >
                                                    ที่กำลังดำเนินการ
                                                </Button>
                                                <Button
                                                    onClick={() => setBtnSel(3)}
                                                    variant={btnSel === 3 ? 'contained' : 'outlined'}
                                                >
                                                    ดูประวัติการซ่อม
                                                </Button>
                                            </Stack>

                                        </Grid2>
                                    </Grid2>
                                    <Divider />
                                    {btnSel === 1 && (
                                        <RepairDetail
                                            imageList={imageList}
                                            setImageList={setImageList}
                                            detail={detail}
                                            setDetail={setDetail}
                                            listbehavior={detail.listbehavior}
                                            sp={detail.sp}
                                        />
                                    )}
                                </>
                            )}
                        </Stack>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
