import {
    Button, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Divider, Stack, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ProductDetail from "@/Components/ProductDetail.jsx";
import ListHistoryRepair from "@/Pages/HistoryRepair/ListHistoryRepair.jsx";

export const ListDetailModal = ({ selected, open, setOpen }) => {
    console.log('selected in ListDetailModal:', selected);
    const [loading, setLoading] = useState(false)
    const [detail, setDetail] = useState([]);
    useEffect(() => {
        fetchData().finally(() => setLoading(false))
    }, []);
    const fetchData = async () => {
        setLoading(true)
        const { data, status } = await axios.get(`/history/detail/${selected.serial_id}`)
        console.log("data", data);
        setDetail(data)
    }
    return (
        <Dialog
            maxWidth='lg'
            fullWidth={true}
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            {/*<DialogTitle id="alert-dialog-title">*/}
            {/*    ประวัติการซ่อม*/}
            {/*</DialogTitle>*/}
            <DialogContent>
                <Stack direction='column' spacing={2}>
                    {/* <ProductDetail serial={selected.serial_id} pid={selected.pid} pname={selected.p_name}
                        imagesku={selected.image_sku} warranty_status={selected.warranty_status} warranty={false} buy_date={selected.buy_date} /> */}
                    <ProductDetail
                        serial={selected.serial_id}
                        pid={selected.pid}
                        pname={selected.p_name}
                        imagesku={selected.image_sku}
                        warranty={selected.warranty}
                        warranty_status={selected.warranty}
                        warrantycondition={selected.warranty_condition}
                        warrantynote={selected.warranty_note}
                        warrantyperiod={selected.warranty_period}
                        expire_date={selected.insurance_expire}
                        buy_date={selected.created_at ? selected.created_at.substring(0, 10) : ''}
                    />

                    <Divider />
                    <Typography fontWeight='bold' variant='h6' color='#f25822'>ประวัติการซ่อม</Typography>
                    {!loading ? (
                        <>
                            {/* <ListHistoryRepair detail={detail} /> */}
                            <ListHistoryRepair serial_id={selected.serial_id} detail={detail} />
                        </>
                    ) : <CircularProgress />}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='info' onClick={() => setOpen(false)}>
                    ปิด
                </Button>
            </DialogActions>
        </Dialog>
    )
}
