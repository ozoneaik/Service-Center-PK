import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head, useForm} from "@inertiajs/react";
import {Box, Button, Card, Divider, Grid2, Input, Stack, TextField, Typography, useStepContext} from "@mui/material";
import EmptyImage from "../../assets/Empty.png";
import {useState} from "react";
import {RepairDetail} from "@/Pages/Home/RepairDetail.jsx";

const Detail = ({title, value, type = 'text'}) => (
    <Typography fontWeight='bold'>
        {title}&nbsp;:&nbsp;
        <Typography fontWeight='normal' component="span" sx={{color: "#f15721"}}>
            {type === 'text' ? value : type === 'date' ? value : 'hello'}
        </Typography>
    </Typography>
);

export default function Dashboard({auth}) {
    const {data, setData, post, processing, errors, reset} = useForm({
        serialNumber: "",
    });
    const [btnSel, setBtnSel] = useState();
    const [detail, setDetail] = useState({
        pictureUrl : 'https://images.dcpumpkin.com/images/product/500/50175.jpg'
    });
    const [imageList, setImageList] = useState('joker');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(data.serialNumber);
    };
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="ตรวจสอบรับประกัน"/>
            <div className="py-3">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-2">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-5">
                        <Stack spacing={2} mb={2}>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    required color="error" id="outlined-basic" fullWidth
                                    focused label="ซีเรียลนัมเบอร์" variant="outlined"
                                    onChange={(e) => setData("serialNumber", e.target.value)}
                                />
                            </form>
                            <Grid2 container spacing={2}>
                                <Grid2 size={{lg: 3, md: 12}}>
                                    <img src={detail.pictureUrl || EmptyImage} alt="image"/>
                                </Grid2>
                                <Grid2 size={9}>
                                    <Stack spacing={{lg: 4, xs: 2}}>
                                        <Typography fontWeight="bold" variant="h5">รายละเอียด</Typography>
                                        <Detail title={"ซีเรียลนัมเบอร์"} value={"165156465468431468"}/>
                                        <Detail title={"รหัสสินค้า"} value={"50176"}/>
                                        <Detail title={"ชื่อสินค้า"} value={"J-Series เจียรมือ4\" J-G9530"}/>
                                        <Detail title={"วันที่ลงทะเบียนรับประกัน"} value={"12-12-2024"} type={'date'}/>
                                        <Detail title={"วันที่หมดอายุรับประกัน"} value={"12-12-2024"}/>
                                        <Detail title={"สถานะรับประกัน"} value={"สำเร็จ"}/>
                                        <Detail title={"เงื่อนไขรับประกันสินค้า"} value={"ไม่มี"}/>
                                    </Stack>
                                </Grid2>
                                <Grid2 size={12}>

                                    <Stack
                                        direction={{lg: 'row', xs: 'column'}}
                                        spacing={{lg: 4, xs: 1}}
                                        justifyContent={{lg: 'center', xs: 'flex-start'}}
                                    >
                                        <Button
                                            onClick={() => setBtnSel(1)}
                                            variant={btnSel === 1 ? 'contained' : 'outlined'} color='primary'
                                        >
                                            แจ้งซ่อม
                                        </Button>
                                        <Button
                                            onClick={() => setBtnSel(2)}
                                            variant={btnSel === 2 ? 'contained' : 'outlined'} color='warning'
                                        >
                                            ที่กำลังดำเนินการ
                                        </Button>
                                        <Button
                                            onClick={() => setBtnSel(3)}
                                            variant={btnSel === 3 ? 'contained' : 'outlined'} color='success'
                                        >
                                            ดูประวัติการซ่อม
                                        </Button>
                                    </Stack>

                                </Grid2>
                            </Grid2>
                            <Divider/>
                        </Stack>


                        {btnSel === 1 && (
                            <RepairDetail imageList={imageList} setImageList={setImageList}/>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
