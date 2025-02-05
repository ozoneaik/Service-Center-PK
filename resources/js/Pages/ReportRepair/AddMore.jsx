import {Alert, Button, Stack} from "@mui/material";
import {useEffect, useState} from "react";
import Progress from "@/Components/Progress.jsx";
import {AlertDialog} from "@/Components/AlertDialog.js";

export const AddMore = ({detail, setDetail}) => {
    const [loading, setLoading] = useState(true);
    const [remark, setRemark] = useState('');
    useEffect(() => {
        fetchRemark().then(() => setLoading(false));
    }, []);

    const fetchRemark = async () => {
        const {data, status} = await axios.get(`remark/show/${detail.serial}`);
        setRemark(data.data.remark)
    }
    const onSubmit = async (e) => {
        e.preventDefault();
        console.log(detail.serial, remark)
        try {
            const {data, status} = await axios.post('/remark/storeOrUpdate', {
                remark: remark,
                serial_id: detail.serial
            })
            AlertDialog({
                icon : 'success',
                title : 'สำเร็จ',
                text : data.message,
                onPassed : ()=>console.log('onPassed')
            })
        } catch (error) {
            AlertDialog({
                title : 'เกิดข้อผิดพลาด',
                text : error.response.data.message,
                onPassed : ()=>console.log('onPassed')
            })
        }
    }
    return (
        <>
            {loading ? (<Progress/>) : (
                <form onSubmit={onSubmit}>
                    <Stack direction='column' spacing={2}>
                        <textarea
                            value={remark}
                            style={{padding: 10, fontSize: 16}}
                            onChange={(e) => setRemark(e.target.value)}
                        />
                        <Stack direction='row' justifyContent='end' spacing={2}>
                            <Button color='secondary' variant='contained'>ยกเลิก</Button>
                            <Button disabled={remark === ''} type='submit' color='primary' variant='contained'>บันทึก</Button>
                        </Stack>

                    </Stack>
                </form>
            )}
        </>
    )
}
