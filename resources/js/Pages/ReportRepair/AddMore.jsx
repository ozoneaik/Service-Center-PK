import {Alert, Button, Stack} from "@mui/material";
import {useEffect, useState} from "react";
import Progress from "@/Components/Progress.jsx";
import {AlertDialog} from "@/Components/AlertDialog.js";

export const AddMore = ({detail, setDetail}) => {
    const [loading, setLoading] = useState(false);
    const [remark, setRemark] = useState(detail.selected.remark);
    const onSubmit = async (e) => {
        e.preventDefault();
        AlertDialog({
            icon: 'question',
            title: 'ยืนยันการบันทึกข้อมูล',
            text: 'กดตกลงเพื่อบันทึกหรืออัพเดทช้อมูล',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        const {data, status} = await axios.post('/remark/storeOrUpdate', {
                            remark: remark,
                            serial_id: detail.serial,
                            job_id: detail.job.job_id
                        })
                        AlertDialog({
                            icon: 'success',
                            title: 'สำเร็จ',
                            text: data.message,
                            onPassed: () => {
                                setDetail(prevDetail => ({
                                    ...prevDetail,
                                    selected: {
                                        ...prevDetail.selected,
                                        remark
                                    }
                                }));
                            }
                        })
                    } catch (error) {
                        AlertDialog({
                            title: 'เกิดข้อผิดพลาด',
                            text: error.response.data.message,
                            onPassed: () => console.log('onPassed')
                        })
                    }
                } else {
                    console.log('no confirm')
                }
            }
        })

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
                            <Button variant='outlined'>ยกเลิก</Button>
                            <Button disabled={detail.job.status === 'success' || remark === ''} type='submit'
                                    color='primary' variant='contained'>บันทึก</Button>
                        </Stack>
                    </Stack>
                </form>
            )}
        </>
    )
}
