import {Checkbox, FormControlLabel, Stack} from "@mui/material";
import {useState} from "react";

export default function RpBehaviorForm({listBehavior}) {

    const [behaviors, setBehaviors] = useState(listBehavior || []);

    const handleCheckboxChange = (index, checked) => {
        const updatedBehaviors = behaviors.map((behavior, i) =>
            i === index ? { ...behavior, selected: checked } : behavior
        );
        setBehaviors(updatedBehaviors);
    };

    const handleOnSubmit = () => {
        const behaviors_selected = behaviors.filter(behavior => behavior.selected);
        console.log(behaviors_selected);
    }

    return (
        <>
            <Stack spacing={2}>
                <button onClick={handleOnSubmit}>check</button>
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
        </>
    )
}
