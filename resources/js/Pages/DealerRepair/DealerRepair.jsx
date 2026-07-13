import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head, router } from "@inertiajs/react";
import {
    Autocomplete,
    Box,
    Button,
    Container,
    Grid2,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Search, Store } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AlertDialog } from "@/Components/AlertDialog.js";
import { ErrorMessage } from "@/assets/ErrorMessage.js";
import ProductDetail from "@/Components/ProductDetail.jsx";
import ButtonList from "@/Pages/NewRepair/ButtonList.jsx";
import { PathDetail } from "@/Components/PathDetail.jsx";
import { SelectSku } from "@/Pages/NewRepair/SelectSku.jsx";
import { SelectAccessory } from "@/Pages/NewRepair/SelectAccessory";
import ListHistoryRepair from "@/Pages/HistoryRepair/ListHistoryRepair.jsx";
import DealerRpMain from "@/Pages/DealerRepair/DealerRpMain.jsx";

const menuNames = {
    1: "แจ้งซ่อม",
    2: "ดูประวัติการซ่อม",
};

export default function DealerRepair({
    auto_sn, auto_pid, auto_job_sn, auto_dealer_code = null,
    selected_dealer = null, is_sale = false,
}) {
    const [SN, setSN] = useState("");
    const [PID, setPID] = useState("");
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState(null);
    const [menuSel, setMenuSel] = useState(0);
    const [showPidForm, setShowPidForm] = useState(false);
    const [miniSize, setMiniSize] = useState(false);
    const [autoJobSn, setAutoJobSn] = useState(auto_job_sn || null);

    // sale: dealer list fetched async
    const [dealerList, setDealerList] = useState([]);
    const [dealerListLoading, setDealerListLoading] = useState(false);
    const [selectedDealerCode, setSelectedDealerCode] = useState(selected_dealer || null);
    const selectedDealerInfo = dealerList.find(d => d.is_code_cust_id === selectedDealerCode) || null;

    const [comboSets, setComboSets] = useState();
    const [openSelSku, setOpenSelSku] = useState(false);
    const [skumainOptions, setSkumainOptions] = useState();
    const [openSelSkumain, setOpenSelSkumain] = useState(false);
    const [pendingSearch, setPendingSearch] = useState({ sn: "", pid: "" });

    const [accSets, setAccSets] = useState();
    const [openSelAcc, setOpenSelAcc] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (!is_sale) return;
        setDealerListLoading(true);
        axios.get(route("dealerRepair.dealer.list"))
            .then(({ data }) => setDealerList(data.dealers || []))
            .finally(() => setDealerListLoading(false));
    }, []);

    useEffect(() => {
        if (auto_sn) {
            const sn = auto_sn;
            const pid = auto_pid || "";
            setSN(sn);
            if (pid) {
                setPID(pid);
                setShowPidForm(sn === "9999");
            }
            handleSearch(null, sn, pid).then(() => setMenuSel(1));
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const querySn = params.get("sn");
        const queryPid = params.get("pid");

        if (querySn) {
            setSN(querySn);
            let targetPid = "";
            if (queryPid && queryPid !== "undefined") {
                targetPid = queryPid;
                setPID(targetPid);
                setShowPidForm(true);
            }
            handleSearch(null, querySn, targetPid);
        }
    }, []);

    useEffect(() => {
        if (menuSel !== 0) {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [menuSel]);

    const handleSearch = async (e, autoSn = null, autoPid = null, selectedSkumain = null) => {
        if (e) {
            e.preventDefault();
            setAutoJobSn(null);
        }

        const currentSn = autoSn || SN;
        const currentPid = autoPid || PID;
        if (!currentSn) return;

        setLoading(true);
        setDetail(null);

        if (currentSn.startsWith("JOB-")) {
            const params = { job_id: currentSn };
            if (is_sale && selectedDealerCode) params.dealer_code = selectedDealerCode;
            router.get(route("dealerRepair.index", params));
            return;
        }

        try {
            const { data } = await axios.post(route("dealerRepair.search"), {
                SN: currentSn,
                PID: currentPid,
                ...(selectedSkumain ? { selected_skumain: selectedSkumain } : {}),
            });

            if (data.needs_selection) {
                setPendingSearch({ sn: currentSn, pid: currentPid });
                setSkumainOptions(data.options || []);
                setOpenSelSkumain(true);
                return;
            }

            const combo_set = data.data.combo_set ?? data.is_combo ?? false;
            const insurance_expire = data.data.data_from_api?.insurance_expire || null;
            const buy_date = data.data.buy_date || null;
            const addWarranty = data.data.warranty_expire;
            let expire_date = data.data.expire_date || insurance_expire || null;

            if (!expire_date && buy_date) {
                const sku0 = data.data.sku_list?.[0];
                const m = parseInt(sku0?.warrantyperiod || sku0?.warranty_period || "", 10);
                if (!isNaN(m) && m > 0) {
                    const d = new Date(buy_date);
                    d.setMonth(d.getMonth() + m);
                    expire_date = d.toISOString().split("T")[0];
                }
            }

            const power_accessories = data.data.data_from_api?.power_accessories || null;
            const has_accessories =
                power_accessories &&
                ((power_accessories.battery?.length > 0) || (power_accessories.charger?.length > 0));

            if (combo_set) {
                setOpenSelSku(true);
                setComboSets(
                    (data.data.sku_list || []).map((item) => ({
                        ...item, warranty_status: addWarranty, expire_date, buy_date,
                    }))
                );
            } else if (has_accessories) {
                const main_sku = data.data.sku_list[0];
                const acc_list = [
                    { ...main_sku, warranty_status: addWarranty, expire_date, buy_date, display_type: "main", display_name: "ตัวเครื่องหลัก", target_serial: main_sku.serial_id || main_sku.serial },
                    ...(power_accessories.battery || []).map((bat, idx) => ({
                        ...main_sku, pid: bat.accessory_sku, pname: bat.product_name, display_type: "battery",
                        display_name: `แบตเตอรี่ ก้อนที่ ${idx + 1}`, target_serial: bat.serial_label,
                        warrantyperiod: bat.warranty_period, warrantycondition: bat.warranty_condition,
                        warrantynote: bat.warranty_note, warranty_status: addWarranty, expire_date, buy_date,
                    })),
                    ...(power_accessories.charger || []).map((chg, idx) => ({
                        ...main_sku, pid: chg.accessory_sku, pname: chg.product_name, display_type: "charger",
                        display_name: `แท่นชาร์จ ${idx + 1}`, target_serial: chg.serial_label,
                        warrantyperiod: chg.warranty_period, warrantycondition: chg.warranty_condition,
                        warrantynote: chg.warranty_note, warranty_status: addWarranty, expire_date, buy_date,
                    })),
                ];
                setAccSets(acc_list);
                setOpenSelAcc(true);
            } else {
                const sku_item = { ...data.data.sku_list[0], warranty_status: addWarranty, expire_date, buy_date };
                setDetail(sku_item);
            }

            setSN("");
            setPID("");
        } catch (error) {
            AlertDialog({
                title: "เกิดข้อผิดพลาด",
                text: ErrorMessage({ status: error.status, message: error.response?.data?.message }),
            });
        } finally {
            setMiniSize(false);
            setLoading(false);
            setMenuSel(0);
            setShowPidForm(false);
        }
    };

    const handleSkumainSelect = (option) => {
        setOpenSelSkumain(false);
        handleSearch(null, pendingSearch.sn, pendingSearch.pid, option.skumain || option.pid);
    };

    const handleDealerChange = (_, newValue) => {
        setSelectedDealerCode(newValue?.is_code_cust_id || null);
        setDetail(null);
        setSN("");
        setPID("");
        setMenuSel(0);
    };

    const searchDisabled = is_sale && !selectedDealerCode;

    return (
        <AuthenticatedLayout>
            <Head title="แจ้งซ่อม (ร้านค้า)" />

            {openSelSkumain && (
                <SelectSku sku_list={skumainOptions} open={openSelSkumain} setOpen={setOpenSelSkumain} onSelect={handleSkumainSelect} />
            )}
            {openSelSku && (
                <SelectSku sku_list={comboSets} open={openSelSku} setOpen={setOpenSelSku} onSelect={(sku) => setDetail(sku)} />
            )}
            {openSelAcc && (
                <SelectAccessory accessoryList={accSets} open={openSelAcc} setOpen={setOpenSelAcc} onSelect={(item) => setDetail(item)} />
            )}

            <Container sx={{ mt: 3 }}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            แจ้งซ่อมสินค้า (ร้านค้า)
                        </Typography>
                    </Grid2>

                    {is_sale && (
                        <Grid2 size={12}>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: "primary.50" }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <Store fontSize="small" color="primary" />
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        เลือกร้านค้าที่ต้องการแจ้งซ่อมแทน
                                    </Typography>
                                </Stack>
                                <Autocomplete
                                    options={dealerList}
                                    loading={dealerListLoading}
                                    getOptionLabel={(o) => `${o.shop_name} (${o.is_code_cust_id})`}
                                    value={dealerList.find(d => d.is_code_cust_id === selectedDealerCode) || null}
                                    onChange={handleDealerChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            placeholder={dealerListLoading ? "กำลังโหลดรายการร้านค้า..." : "พิมพ์ชื่อร้านหรือรหัสร้านเพื่อค้นหา"}
                                        />
                                    )}
                                />
                            </Paper>
                        </Grid2>
                    )}

                    <Grid2 size={12}>
                        <Box bgcolor="white">
                            <SearchSnComponent
                                SN={SN} setSn={setSN}
                                PID={PID} setPID={setPID}
                                loading={loading}
                                showPidForm={showPidForm}
                                setShowPidForm={setShowPidForm}
                                onPassed={(e) => handleSearch(e)}
                                disabled={searchDisabled}
                            />
                        </Box>
                    </Grid2>

                    {detail !== null && (
                        <>
                            <Grid2 size={12}>
                                {!miniSize && (
                                    <ProductDetail
                                        serial={detail.target_serial || detail.serial || detail.serial_id}
                                        imagesku={detail.imagesku || detail.image_sku}
                                        pname={detail.pname || detail.p_name}
                                        pid={detail.pid}
                                        warranty_status={detail.warranty_status || detail.warranty}
                                        warrantycondition={detail.warrantycondition || detail.warranty_condition || ""}
                                        warrantynote={detail.warrantynote || detail.warranty_note || ""}
                                        warrantyperiod={detail.warrantyperiod || detail.warranty_period || ""}
                                        expire_date={detail.expire_date}
                                        buy_date={detail.buy_date}
                                    />
                                )}
                                <Button fullWidth onClick={() => setMiniSize(!miniSize)}>
                                    {!miniSize ? "ย่อรายละเอียดสินค้า" : "แสดงรายละเอียดสินค้า"}
                                </Button>
                            </Grid2>

                            <span ref={scrollRef} />

                            <Grid2 size={12}>
                                <ButtonList menuSel={menuSel} setMenuSel={setMenuSel} />
                            </Grid2>

                            {menuSel !== 0 && (
                                <Grid2 size={12}>
                                    <PathDetail
                                        name={menuNames[menuSel] || "อื่นๆ"}
                                        Sn={detail.target_serial || detail.serial || detail.serial_id}
                                        job_id={detail.job_id}
                                        jobStatus={detail.status}
                                    />
                                    {menuSel === 1 && (
                                        <DealerRpMain
                                            productDetail={detail}
                                            serial_id={autoJobSn || detail.serial_id || detail.serial}
                                            dealerCode={is_sale ? selectedDealerCode : auto_dealer_code}
                                            overrideDealerInfo={is_sale ? selectedDealerInfo : null}
                                        />
                                    )}
                                    {menuSel === 2 && (
                                        <ListHistoryRepair
                                            serial_id={detail.serial || detail.serial_id}
                                        />
                                    )}
                                </Grid2>
                            )}
                        </>
                    )}
                </Grid2>
            </Container>
        </AuthenticatedLayout>
    );
}

function SearchSnComponent({ SN, setSn, PID, setPID, loading, showPidForm, setShowPidForm, onPassed, disabled }) {
    const handleChangeSN = (e) => {
        const value = e.target.value;
        setSn(value);
        setShowPidForm(value === "9999");
    };

    return (
        <form onSubmit={onPassed}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Stack direction="column" spacing={2} width="100%">
                    <TextField
                        disabled={loading || disabled}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start">S/N :</InputAdornment> } }}
                        value={SN || ""}
                        onChange={handleChangeSN}
                        focused={!disabled}
                        placeholder={disabled ? "กรุณาเลือกร้านค้าก่อน" : "ค้นหาหมายเลขซีเรียล หรือ หมายเลข Job หากไม่ทราบกรุณากรอก 9999 เพื่อระบุรหัสสินค้า"}
                        fullWidth
                        required
                    />
                    {showPidForm && (
                        <TextField
                            disabled={loading || disabled}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">PID</InputAdornment> } }}
                            value={PID || ""}
                            onChange={(e) => setPID(e.target.value)}
                            placeholder="กรอกรหัสสินค้า"
                            fullWidth
                            required
                        />
                    )}
                </Stack>
                <Button disabled={disabled} loading={loading} type="submit" startIcon={<Search />} variant="contained">
                    ค้นหา
                </Button>
            </Stack>
        </form>
    );
}
