import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Box, Button, Container, Grid2, InputAdornment, Stack, TextField} from "@mui/material";
import {Search} from '@mui/icons-material';
import {useEffect, useRef, useState} from "react";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {ErrorMessage} from "@/assets/ErrorMessage.js";
import ProductDetail from "@/Components/ProductDetail.jsx";
import ButtonList from "@/Pages/NewRepair/ButtonList.jsx";
import {PathDetail} from "@/Components/PathDetail.jsx";
import RpMain from "@/Pages/NewRepair/RpMain.jsx";
import {SelectSku} from "@/Pages/NewRepair/SelectSku.jsx";

const menuNames = {
    1: 'แจ้งซ่อม',
    2: 'ดูประวัติการซ่อม',
    3: 'คู่มือ',
    4: 'วิดีโอที่เกี่ยวข้อง'
};

export default function Repair({DATA}) {
    const [SN, setSN] = useState('');
    const [PID, setPID] = useState('');
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState(DATA);
    const [menuSel, setMenuSel] = useState(0);

    const [miniSize, setMiniSize] = useState(false);


    const [comboSets, setComboSets] = useState();
    const [openSelSku, setOpenSelSku] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (menuSel !== 0) {
            scrollRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [menuSel]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setDetail(null);
        try {
            const {data, status} = await axios.post(route('repair.search'), {SN, PID});
            const combo_set = data.data.combo_set;
            const addWarranty = data.data.warranty_expire; // เก็บสถานะรับประกัน
            if (combo_set) {
                setOpenSelSku(true);
                let sku_list = data.data.sku_list;
                sku_list = sku_list.map((item) => {
                    return {...item, warranty_status: addWarranty}
                })
                setComboSets(sku_list)
            } else {
                let sku_list = data.data.sku_list[0];
                sku_list = {...sku_list, warranty_status: addWarranty}
                setDetail(sku_list);
            }

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
            setMiniSize(false);
            setLoading(false);
            setMenuSel(0);
        }

    }

    return (
        <AuthenticatedLayout>
            <Head title={'แจ้งซ่อม'}/>
            {openSelSku &&
                <SelectSku
                    sku_list={comboSets} open={openSelSku} setOpen={setOpenSelSku}
                    onSelect={(sku) => setDetail(sku)}
                />
            }
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
                                {!miniSize && (
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
                                )}
                                <Button fullWidth onClick={()=>setMiniSize(!miniSize)}>
                                    {!miniSize ? 'ย่อรายละเอียดสินค้า' : 'แสดงรายละเอียดสินค้า'}
                                </Button>
                            </Grid2>
                            <span ref={scrollRef}></span>
                            <Grid2 size={12}>
                                <ButtonList {...{menuSel, setMenuSel}} />
                            </Grid2>
                            {menuSel !== 0 && (
                                <Grid2 size={12}>
                                    <PathDetail
                                        name={menuNames[menuSel] || 'อื่นๆ'}
                                        Sn={detail.serial || detail.serial_id}
                                    />
                                    {menuSel === 1 &&
                                        <RpMain productDetail={detail} serial_id={detail.serial_id || detail.serial}/>}
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
                               focused placeholder={'ค้นหาหมายเลขซีเรียล หากไม่ทราบกรุณากรอก 9999 เพื่อระบุรหัสสินค้า'}
                               fullWidth required
                    />
                    {showPidForm && (<TextField disabled={loading}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position={'start'}>
                                                                PID
                                                            </InputAdornment>)
                                                    }
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
