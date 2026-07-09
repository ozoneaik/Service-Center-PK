import {Button, Stack} from "@mui/material";
import {Receipt} from "@mui/icons-material";
import {useState} from "react";
import {AlertDialog} from "@/Components/AlertDialog.js";

export default function RpWorkReceipt({ JOB, workReceiptRoute = 'repair.before.work.receipt' }) {

    const [loading, setLoading] = useState(false);

    const handleOnClick = async () => {
        try {
            setLoading(true)
            const {data} = await axios.post(route(workReceiptRoute, {job_id: JOB.job_id}));
            console.log(data, status)
            window.open(data.path, '_blank')
        } catch (error) {
            AlertDialog({
                text : error.response?.data?.message || error.message
            })
        } finally {
            setLoading(false);
        }
    }
    return (
        <Stack direction='row' spacing={2}>
            <Button
                loading={loading}
                startIcon={<Receipt/>} variant='contained'
                onClick={handleOnClick}
            >
                ใบรับงานสินค้า
            </Button>
        </Stack>
    )
}
