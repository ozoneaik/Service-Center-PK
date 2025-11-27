import {
    Box, Button, Checkbox, CircularProgress, FormControlLabel, Grid2, Stack, TextField, useMediaQuery
} from "@mui/material";
import { useEffect, useState } from "react";
import { Save } from "@mui/icons-material";
import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog.js";

export default function RpBehaviorForm({ listBehavior, JOB, setStepForm }) {

    const [behaviors, setBehaviors] = useState(listBehavior || []);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        fetchData().finally(() => setLoading(false))
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data, status } = await axios.get(route('repair.after.behaviour.index', {
                serial_id: JOB.serial_id, job_id: JOB.job_id
            }));
            const behaviors_selected = data.behaviors;
            const updatedBehaviors = (listBehavior || []).map((behavior) => {
                const isSelected = behaviors_selected.some(selected => selected.cause_code === behavior.causecode);
                return {
                    ...behavior,
                    selected: isSelected
                };
            });

            setBehaviors(updatedBehaviors);
        } catch (error) {
            console.log(error)
        }
    }

    const handleOnChangeSearch = (e) => {
        const { value } = e.target;
        setSearch(value);
    }

    const handleCheckboxChange = (index, checked) => {
        const updatedBehaviors = behaviors.map((behavior, i) =>
            i === index ? { ...behavior, selected: checked } : behavior
        );
        setBehaviors(updatedBehaviors);
    };

    const handleOnSubmit = () => {
        const behaviors_selected = behaviors.filter(behavior => behavior.selected);
        AlertDialogQuestion({
            text: 'กดตกลงเพื่อบันทึกอาการ/สาเหตุ',
            onPassed: async (confirm) => {
                if (confirm) {
                    try {
                        setLoadingForm(true)
                        // const {data, status} = await axios.post(route('repair.after.behaviour.store', {
                        //     behaviors: behaviors_selected,
                        //     job_id: JOB.job_id,
                        //     serial_id: JOB.serial_id
                        // }));
                        const { data, status } = await axios.post(
                            route('repair.after.behaviour.store'),
                            {
                                behaviors: behaviors_selected,
                                job_id: JOB.job_id,
                                serial_id: JOB.serial_id
                            }
                        );
                        AlertDialog({
                            icon: 'success',
                            text: data.message,
                            onPassed: () => setStepForm(1)
                        })
                    } catch (error) {
                        AlertDialog({
                            text: error.response.data?.message || error.message,
                        })
                    } finally {
                        setLoadingForm(false)
                    }
                } else console.log('ยกเลิกบันทึกฟอร์ม');
            }
        })
    }

    // ฟังก์ชันสำหรับกรองข้อมูลตามการค้นหา
    const filteredBehaviors = behaviors.filter(behavior => {
        const searchTerm = search.toLowerCase();
        const behaviorName = (behavior.behaviorname || '').toLowerCase();
        const causeName = (behavior.causename || '').toLowerCase();

        return behaviorName.includes(searchTerm) || causeName.includes(searchTerm);
    });

    return (
        <Grid2 container spacing={2}>
            {loading ? <CircularProgress /> : (
                <>
                    <Grid2 size={12}>
                        <TextField
                            fullWidth size='small' placeholder='ค้นหาจากชื่อกลุ่มหรือรายการอาการ'
                            onChange={handleOnChangeSearch} value={search}
                        />
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack spacing={2}>
                            {Object.entries(
                                filteredBehaviors.reduce((groups, behaviour, index) => {
                                    const groupKey = behaviour.behaviorname || 'ไม่ระบุกลุ่ม';
                                    if (!groups[groupKey]) {
                                        groups[groupKey] = [];
                                    }
                                    // หา originalIndex จาก behaviors array เดิม
                                    const originalIndex = behaviors.findIndex(b => b.causecode === behaviour.causecode);
                                    groups[groupKey].push({ ...behaviour, originalIndex });
                                    return groups;
                                }, {})
                            ).map(([behaviorName, groupBehaviors]) => (
                                <div key={behaviorName}>
                                    <h4 style={{ color: '#d26c19', fontSize: '16px', fontWeight: 'bold' }}>
                                        {behaviorName}
                                    </h4>
                                    <Stack direction='row' flexWrap='wrap' spacing={1}>
                                        {groupBehaviors.map((behaviour) => (
                                            <FormControlLabel
                                                key={`behavior-${behaviour.originalIndex}-${behaviour.causecode}`}
                                                control={
                                                    <Checkbox
                                                        checked={behaviour.selected || false}
                                                        onChange={(e) => {
                                                            handleCheckboxChange(behaviour.originalIndex, e.target.checked)
                                                        }}
                                                    />
                                                }
                                                label={behaviour.causename || 'ไม่ระบุชื่อ'}
                                            />
                                        ))}
                                    </Stack>
                                </div>
                            ))}
                        </Stack>
                    </Grid2>
                </>
            )}
            <Box
                position="fixed" bottom={0} left={0} p={2}
                width="100%" zIndex={1000} bgcolor="white" boxShadow={3}
            >
                <Stack direction='row' justifyContent='end'>
                    <Button
                        fullWidth={isMobile} size='large'
                        disabled={JOB.status !== 'pending'}
                        onClick={handleOnSubmit} loading={loadingForm}
                        variant='contained' startIcon={<Save />}
                    >
                        {JOB.status === 'success' ? 'ปิดงานซ่อมแล้ว' : 'บันทึก'}
                    </Button>
                </Stack>
            </Box>
        </Grid2>
    )
}
