import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Box, Button, Container, Grid2, InputAdornment, Stack, TextField, Typography} from "@mui/material";
import {Search} from '@mui/icons-material';
import {useState} from "react";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {ErrorMessage} from "@/assets/ErrorMessage.js";
import ProductDetail from "@/Components/ProductDetail.jsx";
import ButtonList from "@/Pages/NewRepair/ButtonList.jsx";
import {PathDetail} from "@/Components/PathDetail.jsx";
import RpMain from "@/Pages/NewRepair/ReportRepair/RpMain.jsx";

const menuNames = {
    1: 'แจ้งซ่อม',
    2: 'ดูประวัติการซ่อม',
    3: 'คู่มือ',
    4 : 'วิดีโอที่เกี่ยวข้อง'
};

export default function Repair({DATA}) {
    const [SN, setSN] = useState('');
    const [PID, setPID] = useState('');
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState(DATA);
    const [menuSel, setMenuSel] = useState(0);
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setDetail(null);
        try {
            const {data, status} = await axios.post(route('repair.search'), {SN, PID});
            console.log(data, status)
            setDetail(data.data);
            setSN('');
        } catch (error) {
            console.log(error)
            const errorMessage = error.response.data.message;
            const errorStatus = error.status;
            AlertDialog({
                title: 'เกิดข้อผิดพลาด',
                text: ErrorMessage({status: errorStatus, message: errorMessage})
            });
        } finally {
            setLoading(false);
            setMenuSel(0);
        }

    }
    return (
        <AuthenticatedLayout>
            <Head title={'แจ้งซ่อม'}/>
            <Container sx={{mt: 3}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Box bgcolor={'white'}>
                            <SearchSnComponent
                                {...{SN, setSn: setSN, PID, setPID, loading}}
                                onPassed={(e) => handleSearch(e)}
                            />
                        </Box>
                    </Grid2>
                    {typeof detail === 'object' && detail !== null && (
                        <>
                            <Grid2 size={12}>
                                <ProductDetail
                                    serial={detail.serial || detail.serial_id}
                                    imagesku={detail.imagesku || detail.image_sku}
                                    pname={detail.pname || detail.p_name}
                                    pid={detail.pid}
                                    warranty_status={detail.warranty_status}
                                    warrantycondition={detail.warrantycondition}
                                    warrantynote={detail.warrantynote}
                                    warrantyperiod={detail.warrantyperiod}
                                />
                            </Grid2>
                            <Grid2 size={12}>
                                <ButtonList {...{menuSel, setMenuSel}}/>
                            </Grid2>
                            {menuSel !== 0 && (
                                <Grid2 size={12}>
                                    <PathDetail
                                        name={menuNames[menuSel] || 'อื่นๆ'}
                                        Sn={detail.serial || detail.serial_id}
                                    />
                                    {menuSel === 1 && <RpMain serial_id={detail.serial_id || detail.serial}/>}
                                </Grid2>
                            )}
                        </>
                    )}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    )
}

const SearchSnComponent = ({SN, setSn, onPassed, PID, setPID, loading}) => {
    const [showPidForm, setShowPidForm] = useState(false);
    const handleChangeSN = (e) => {
        const value = e.target.value;
        setSn(value);
        if (value === '9999') setShowPidForm(true)
        else setShowPidForm(false)
    }
    return (
        <form onSubmit={(e) => onPassed(e)}>
            <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                <Stack direction="column" spacing={2} width='100%'>
                    <TextField disabled={loading}
                        slotProps={{
                            input: {startAdornment: (<InputAdornment position={'start'}>S/N :</InputAdornment>)}
                        }}
                        value={SN || ''} onChange={(e) => handleChangeSN(e)}
                        focused placeholder={'ค้นหาหมายเลขซีเรียล หากไม่ทราบกรุณากรอก 9999 เพื่อระบุรหัสสินค้า'} fullWidth required
                    />
                    {showPidForm && (<TextField disabled={loading}
                        slotProps={{
                            input: {startAdornment: (<InputAdornment position={'start'}>PID</InputAdornment>)}
                        }}
                        value={PID || ''} onChange={(e) => setPID(e.target.value)}
                        placeholder={'กรอกรหัสสินค้า'} fullWidth required
                    />)}
                </Stack>
                <Button loading={loading} type={"submit"} startIcon={<Search/>} variant='contained'>
                    ค้นหา
                </Button>
            </Stack>
        </form>
    )
}
