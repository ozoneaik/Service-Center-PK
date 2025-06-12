import {Button, Checkbox, CircularProgress, FormControlLabel, Stack} from "@mui/material";
import {useEffect, useState} from "react";
import {Save} from "@mui/icons-material";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

export default function RpBehaviorForm({listBehavior, JOB,setStepForm}) {

    const [behaviors, setBehaviors] = useState(listBehavior || []);
    const [loading, setLoading] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    useEffect(() => {
        fetchData().finally(() => setLoading(false))
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true)
            const {data, status} = await axios.get(route('repair.after.behaviour.index', {
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

    const handleCheckboxChange = (index, checked) => {
        const updatedBehaviors = behaviors.map((behavior, i) =>
            i === index ? {...behavior, selected: checked} : behavior
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
                        const {data, status} = await axios.post(route('repair.after.behaviour.store', {
                            behaviors: behaviors_selected,
                            job_id: JOB.job_id,
                            serial_id: JOB.serial_id
                        }));
                        AlertDialog({
                            icon: 'success',
                            text: data.message,
                            onPassed: () => setStepForm(1)
                        })
                    } catch (error) {
                        AlertDialog({
                            text: error.response.data?.message || error.message,
                        })
                    }
                }
            }
        })
    }

    return (
        <>
            {loading ? (<CircularProgress/>) : (
                <>
                    <Stack spacing={2}>
                        {Object.entries(
                            behaviors.reduce((groups, behaviour, index) => {
                                const groupKey = behaviour.behaviorname || 'ไม่ระบุกลุ่ม';
                                if (!groups[groupKey]) {
                                    groups[groupKey] = [];
                                }
                                groups[groupKey].push({...behaviour, originalIndex: index});
                                return groups;
                            }, {})
                        ).map(([behaviorName, groupBehaviors]) => (
                            <div key={behaviorName}>
                                <h4 style={{color: '#d26c19', fontSize: '16px', fontWeight: 'bold'}}>
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
                    <Stack direction='row' justifyContent='end'>
                        <Button
                            onClick={handleOnSubmit} loading={loadingForm}
                            variant='contained' startIcon={<Save/>}
                        >
                            บันทึก
                        </Button>
                    </Stack>
                </>
            )}
        </>
    )
}
