import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { SelectSku } from "../SelectSku";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Container, Grid2, InputAdornment, Paper, Stack, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import { ErrorMessage } from "@/assets/ErrorMessage";
import { AlertDialog } from "@/Components/AlertDialog";
import ProductDetail from "@/Components/ProductDetail";
import ButtonList from "../ButtonList";
import { PathDetail } from "@/Components/PathDetail";
import RpMain from "../RpMain";
import ListHistoryRepair from "@/Pages/HistoryRepair/ListHistoryRepair";
import RepairSaleMain from "./RepairSaleMain";
const menuNames = {
    1: 'แจ้งซ่อม',
    2: 'ดูประวัติการซ่อม',
    3: 'คู่มือ',
    4: 'วิดีโอที่เกี่ยวข้อง'
};
export default function CreateRepair({ DATA }) {
    const [SN, setSN] = useState('');
    const [PID, setPID] = useState('');
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState(DATA);
    const [menuSel, setMenuSel] = useState(0);
    const [showPidForm, setShowPidForm] = useState(false);

    const [miniSize, setMiniSize] = useState(false);


    const [comboSets, setComboSets] = useState();
    const [openSelSku, setOpenSelSku] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (menuSel !== 0) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [menuSel]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setDetail(null);
        if (SN.startsWith('JOB-')) {
            router.get(route('repair.sale.index', { job_id: SN }));
        } else {
            try {
                const { data, status } = await axios.post(route('repair.sale.search'), { SN, PID });

                // flag combo: รองรับทั้งของใหม่/เก่า
                const combo_set = data.data.combo_set ?? data.is_combo ?? false;

                const insurance_expire = data.data.data_from_api.insurance_expire || null;
                const buy_date = data.data.buy_date || null;
                const addWarranty = data.data.warranty_expire;
                const expire_date = data.data.expire_date || insurance_expire || null;

                if (combo_set) {
                    setOpenSelSku(true);
                    let sku_list = data.data.sku_list || [];
                    sku_list = sku_list.map((item) => ({
                        ...item,
                        warranty_status: addWarranty,
                        expire_date,
                        buy_date,
                    }));
                    setComboSets(sku_list);
                } else {
                    let sku_item = data.data.sku_list[0];
                    sku_item = {
                        ...sku_item,
                        warranty_status: addWarranty,
                        expire_date,
                        buy_date,
                    };
                    setDetail(sku_item);
                }

                setSN('');
                setPID('');
            } catch (error) {
                const errorMessage = error.response.data.message;
                const errorStatus = error.status;
                AlertDialog({
                    title: 'เกิดข้อผิดพลาด',
                    text: ErrorMessage({ status: errorStatus, message: errorMessage })
                });
            } finally {
                setMiniSize(false);
                setLoading(false);
                setMenuSel(0);
                setShowPidForm(false);
            }
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title={'แจ้งซ่อม'} />
            <section className="pb-5">
                <div className="p-3">
                    <h2 className="text-lg font-medium text-gray-900">แจ้งซ่อมสำหรับเซลล์</h2>
                </div>
                {openSelSku &&
                    <SelectSku
                        sku_list={comboSets} open={openSelSku} setOpen={setOpenSelSku}
                        onSelect={(sku) => setDetail(sku)}
                    />
                }
                <Container sx={{ mt: 3 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Box bgcolor={'white'}>
                                <SearchSnComponent
                                    {...{ SN, setSn: setSN, PID, setPID, loading, showPidForm, setShowPidForm }}
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
                                            warranty_status={detail.warranty_status || detail.warranty}
                                            warrantycondition={detail.warrantycondition || detail.warranty_condition || ''}
                                            warrantynote={detail.warrantynote || detail.warranty_note || ''}
                                            warrantyperiod={detail.warrantyperiod || detail.warranty_period || ''}
                                            expire_date={detail.expire_date}
                                            buy_date={detail.buy_date}
                                        />
                                    )}
                                    <Button fullWidth onClick={() => setMiniSize(!miniSize)}>
                                        {!miniSize ? 'ย่อรายละเอียดสินค้า' : 'แสดงรายละเอียดสินค้า'}
                                    </Button>
                                </Grid2>
                                <span ref={scrollRef}></span>
                                <Grid2 size={12}>
                                    <ButtonList {...{ menuSel, setMenuSel }} />
                                </Grid2>
                                {menuSel !== 0 && (
                                    <Grid2 size={12}>
                                        <PathDetail
                                            name={menuNames[menuSel] || 'อื่นๆ'}
                                            Sn={detail.serial || detail.serial_id}
                                            job_id={detail.job_id} jobStatus={detail.status}
                                        />
                                        {menuSel === 1 &&
                                            <RepairSaleMain productDetail={detail} serial_id={detail.serial_id || detail.serial} />}
                                        {menuSel === 2 &&
                                            <ListHistoryRepair serial_id={detail.serial || detail.serial_id} />}
                                    </Grid2>
                                )}
                            </>
                        )}
                    </Grid2>
                </Container>
            </section>
        </AuthenticatedLayout>
    )
}

const SearchSnComponent = ({ SN, setSn, onPassed, PID, setPID, loading, showPidForm, setShowPidForm }) => {

    const handleChangeSN = (e) => {
        const value = e.target.value;
        setSn(value);
        if (value === '9999') setShowPidForm(true)
        else setShowPidForm(false)
    }
    return (
        <form onSubmit={(e) => onPassed(e)}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Stack direction="column" spacing={2} width='100%'>
                    <TextField disabled={loading}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position={'start'}>
                                        S/N :
                                    </InputAdornment>
                                )
                            }
                        }}
                        value={SN || ''} onChange={(e) => handleChangeSN(e)}
                        focused
                        placeholder={'ค้นหาหมายเลขซีเรียล หรือ หมายเลข Job หากไม่ทราบกรุณากรอก 9999 เพื่อระบุรหัสสินค้า'}
                        fullWidth required
                    />
                    {showPidForm && (
                        <TextField disabled={loading}
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
                <Button loading={loading} type={"submit"} startIcon={<Search />} variant='contained'>
                    ค้นหา
                </Button>
            </Stack>
        </form>
    )
}