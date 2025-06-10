import {useEffect, useState} from "react"
import {Button, Checkbox, CircularProgress, FormControlLabel, Grid2, Stack} from "@mui/material";
import {AlertDialog} from "@/Components/AlertDialog.js";
import {Save} from "@mui/icons-material";
import axios from 'axios';

export default function RpBehavior({job_id, list_behavior}) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [behaviors, setBehaviors] = useState(list_behavior || []);

    useEffect(() => {
        if (job_id && list_behavior?.length > 0) {
            fetchData().finally(() => {
                setLoading(false);
            });
        }
    }, [job_id, list_behavior]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const {data, status} = await axios.get(route('repair.behaviour.detail', {job_id}));
            console.log('Fetch data:', data, status);

            const behaviours_select = data.behaviour?.length > 0 ? data.behaviour : [];
            console.log('Behaviors count:', list_behavior?.length || 0);

            if (behaviours_select.length > 0) {
                const updatedBehaviors = list_behavior.map((behaviour) => ({
                    ...behaviour,
                    selected: behaviours_select.some(select => select.cause_code === behaviour.causecode)
                }));
                setBehaviors(updatedBehaviors);
            } else {
                setBehaviors(list_behavior || []);
            }

        } catch (error) {
            console.error('Fetch error:', error);
            let message = error.response ? error.response.data.message : error.message;
            AlertDialog({
                text: error.status === 500 ? 'เกิดข้อผิดพลาด server' : message,
            });
        }
    };

    const handleCheckboxChange = (index, checked) => {
        const updatedBehaviors = behaviors.map((behavior, i) =>
            i === index ? { ...behavior, selected: checked } : behavior
        );
        setBehaviors(updatedBehaviors);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Get selected behaviors
            const selectedBehaviors = behaviors.filter(behavior => behavior.selected);

            // Prepare data for API
            const saveData = {
                job_id: job_id,
                behaviors: selectedBehaviors.map(behavior => ({
                    cause_code: behavior.causecode,
                    cause_name: behavior.causename,
                    behaviorname : behavior.behaviorname,
                    catalog : behavior.catalog,
                    sub_catalog : behavior.subcatalog,
                }))
            };

            console.log('saveData', saveData);

            const {data, status} = await axios.post(route('repair.behaviour.store'), saveData);

            if (status === 200) {
                AlertDialog({
                    icon : 'success',
                    text: 'บันทึกข้อมูลสำเร็จ',
                });
            }

        } catch (error) {
            console.error('Save error:', error);
            let message = error.response ? error.response.data.message : error.message;
            AlertDialog({
                text: error.status === 500 ? 'เกิดข้อผิดพลาดในการบันทึก' : message,
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <CircularProgress />
            </div>
        );
    }

    // Show empty state if no behaviors
    if (!behaviors || behaviors.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                ไม่มีข้อมูลพฤติกรรมการซ่อม
            </div>
        );
    }

    return (
        <Grid2 container spacing={2}>
            <Grid2 size={12}>
                <Stack spacing={2}>
                    {Object.entries(
                        behaviors.reduce((groups, behaviour, index) => {
                            const groupKey = behaviour.behaviorname || 'ไม่ระบุกลุ่ม';
                            if (!groups[groupKey]) {
                                groups[groupKey] = [];
                            }
                            groups[groupKey].push({ ...behaviour, originalIndex: index });
                            return groups;
                        }, {})
                    ).map(([behaviorName, groupBehaviors]) => (
                        <div key={behaviorName}>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                color: '#d26c19',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}>
                                {behaviorName}
                            </h4>
                            <Stack direction='row' flexWrap='wrap' spacing={1} sx={{ paddingLeft: 2 }}>
                                {groupBehaviors.map((behaviour) => (
                                    <FormControlLabel
                                        key={`behavior-${behaviour.originalIndex}-${behaviour.causecode}`}
                                        control={
                                            <Checkbox
                                                checked={behaviour.selected || false}
                                                onChange={(e) => handleCheckboxChange(behaviour.originalIndex, e.target.checked)}
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
            <Grid2 size={12}>
                <Stack direction='row' justifyContent='end' spacing={2}>
                    <Button
                        variant='contained'
                        startIcon={<Save/>}
                        onClick={handleSave}
                        disabled={saving}
                        loading={saving}
                    >
                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                    </Button>
                </Stack>
            </Grid2>
        </Grid2>
    );
}
