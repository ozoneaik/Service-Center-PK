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
import axios from "axios";
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

    // [เพิ่ม] Auto-load เมื่อมี job_id ส่งมาใน URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const jobIdParam = params.get('job_id');
        if (jobIdParam) {
            setSN(jobIdParam); // set ค่าให้ input
            executeSearch(jobIdParam, ''); // สั่งค้นหาทันที
        }
    }, []);

    useEffect(() => {
        if (menuSel !== 0 && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [menuSel]);

    const executeSearch = async (snValue, pidValue) => {
        setLoading(true);
        setDetail(null);
        setMenuSel(0);

        try {
            // CASE 1: ค้นหาด้วย Job ID (MJ-XXXXX)
            if (snValue.trim().toUpperCase().startsWith('MJ-')) {
                const jobId = snValue.trim();
                const res = await axios.post(route('repair.sale.search.job'), { job_id: jobId });

                if (res.data.found && res.data.job && res.data.job.job_detail) {
                    const jobData = res.data.job.job_detail;

                    // Map ข้อมูล
                    const jobDetailFormatted = {
                        pid: jobData.pid,
                        pname: jobData.p_name,
                        p_name: jobData.p_name,
                        pbaseunit: jobData.p_base_unit,
                        pCatName: jobData.p_cat_name,
                        pSubCatName: jobData.p_sub_cat_name,
                        facmodel: jobData.fac_model,
                        imagesku: jobData.image_sku,
                        warrantyperiod: jobData.warranty_period,
                        warrantycondition: jobData.warranty_condition,
                        warrantynote: jobData.warranty_note,
                        warranty: jobData.warranty,
                        expire_date: jobData.insurance_expire,
                        serial_id: jobData.serial_id,
                        serial: jobData.serial_id,
                        job_id: jobData.job_id,
                        status_mj: jobData.status_mj,

                        shop_under_sale_name: jobData.shop_under_sale_name,
                        shop_under_sale_id: jobData.shop_under_sale_id,
                        shop_under_sale_phone: jobData.shop_under_sale_phone,
                        is_code_cust_id: jobData.is_code_cust_id,
                        service_center_name: jobData.service_center_name,
                        cust_name: jobData.cust_name,
                        cust_phone: jobData.cust_phone,
                        cust_address: jobData.cust_address,
                        delivery_type: jobData.delivery_type,
                        remark: jobData.remark,
                        symptom: jobData.symptom
                    };

                    setDetail(jobDetailFormatted);
                    setMenuSel(1); // เปิดหน้าแจ้งซ่อม
                } else {
                    throw new Error('ไม่พบข้อมูล Job ที่ระบุ');
                }
            }
            // CASE 2: ค้นหาด้วย SN/PID (Logic เดิม)
            else {
                const { data } = await axios.post(route('repair.sale.search'), { SN: snValue, PID: pidValue });
                const combo_set = data.data.combo_set ?? data.is_combo ?? false;
                const insurance_expire = data.data.data_from_api?.insurance_expire || null;
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
                // ถ้าค้นหาด้วย SN ปกติ ให้ล้างช่องค้นหา
                if (!snValue.startsWith('MJ-')) {
                    setSN('');
                    setPID('');
                }
            }
        }
        catch (error) {
            console.error("Search Error:", error);
            const errorMessage = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด';
            const errorStatus = error.response?.status || 'Error';

            // ถ้าเป็นการโหลดอัตโนมัติจาก URL แล้วไม่เจอ อาจจะไม่ต้อง Alert แรงมาก หรือ redirect กลับ
            AlertDialog({
                title: 'ข้อความแจ้งเตือน',
                text: ErrorMessage({ status: errorStatus, message: errorMessage })
            });
        }
        finally {
            setMiniSize(false);
            setLoading(false);
            setShowPidForm(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        executeSearch(SN, PID);
    };

    return (
        <AuthenticatedLayout>
            <Head title={'เซลล์แจ้งซ่อม'} />
            <section className="pb-5">
                <div className="p-3">
                    <button onClick={() => window.location.href = route('repair.sale.index')} className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center w-full md:w-auto transition duration-150 ease-in-out">
                        กลับหน้ารายการเซลล์แจ้งซ่อม
                    </button>
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