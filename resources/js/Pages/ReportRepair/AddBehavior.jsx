import {useEffect, useState} from "react";
import {Button, Grid2, Stack, Typography} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Progress from "@/Components/Progress.jsx";
import {AlertDialog} from "@/Components/AlertDialog.js";

export const AddBehavior = ({detail,setDetail}) => {
    const [loading, setLoading] = useState(false);
    const [groupedBehavior, setGroupedBehavior] = useState([]);
    const [selected, setSelected] = useState(detail.selected.behavior);

    useEffect(() => {
        setLoading(true);
        const grouped = detail.listbehavior.reduce((acc, item) => {
            const existingGroup = acc.find(group => group.behaviorname === item.behaviorname);
            if (existingGroup) {
                existingGroup.list.push({
                    subcatalog: item.subcatalog,
                    catalog: item.catalog,
                    causename: item.causename,
                    causecode: item.causecode
                });
            } else {
                acc.push({
                    behaviorname: item.behaviorname,
                    list: [{
                        subcatalog: item.subcatalog,
                        catalog: item.catalog,
                        causename: item.causename,
                        causecode: item.causecode,
                    }]
                });
            }
            return acc;
        }, []);
        setGroupedBehavior(grouped);
        setLoading(false);
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(selected)
        AlertDialog({
            icon: 'question',
            title: 'ยืนยันการบันทึกข้อมูล',
            text: 'กดตกลงเพื่อบันทึกหรืออัพเดทช้อมูล',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        const {data, status} = await axios.post('/behavior/store', {
                            serial_id: detail.serial,
                            list: selected,
                            job_id: detail.job.job_id
                        });
                        console.log(data, status)
                        setSelected(data.request);
                        AlertDialog({
                            icon: 'success',
                            title: 'สำเร็จ',
                            text: data.message,
                            showCancelButton: false,
                            onPassed: () => {}
                        })
                        setDetail(prevDetail => ({
                            ...prevDetail,
                            selected: {
                                ...prevDetail.selected,
                                behavior: selected
                            }
                        }));
                    } catch (error) {
                        AlertDialog({
                            title: `เกิดข้อผิดพลาด`,
                            text: error.response.data.message + ` (code : ${error.status})`,
                            showCancelButton: false,
                            onPassed: (confirm) => console.log(confirm)
                        });
                    }
                } else console.log('ยกเลิกแล้ว');
            }
        })

        setLoading(false)

    }
    const handleChange = (cause, event, group) => {
        const checked = event.target.checked;
        const newValue = {
            behaviorname: group.behaviorname,
            ...cause
        }
        setSelected(prevSelected =>
            checked
                ? [...prevSelected, newValue]  // ถ้า checked = true, เพิ่ม cause เข้าไป
                : prevSelected.filter(item =>
                    !(item.behaviorname === newValue.behaviorname && item.causecode === newValue.causecode) // ใช้ value-based comparison
                ) // ถ้า unchecked, เอา cause ออก
        );
    }
    return (
        <>
            {!loading ? (
                <>
                    {groupedBehavior.map((group, index) => (
                        <Stack direction='column' key={index}>
                            <Typography variant='h6' color='#f15922' fontWeight='bold'>{group.behaviorname}</Typography>
                            <Grid2 container>
                                {group.list.map((cause, i) => (
                                    <Grid2 size={{xs: 12, md: 4, lg: 3}} key={i}>
                                        <FormControlLabel
                                            key={i}
                                            control={
                                                <Checkbox
                                                    checked={selected.some(item =>
                                                        item.behaviorname === group.behaviorname && item.causecode === cause.causecode
                                                    )}
                                                    onChange={(e) => handleChange(cause, e, group)}
                                                />
                                            }
                                            label={cause.causename}
                                        />
                                    </Grid2>
                                ))}
                            </Grid2>
                        </Stack>
                    ))}
                    <form onSubmit={onSubmit}>
                        < Stack direction='row' justifyContent='end' spacing={2}>
                            <Button variant='outlined'>ยกเลิก</Button>
                            <Button variant='contained'  disabled={detail.job.status === 'success'} color='primary' type='submit'>บันทึก</Button>
                        </Stack>
                    </form>
                </>
            ) : <Progress/>}
        </>
    );
};
