import {useEffect, useState} from "react";
import {Box, Button, Grid2, Stack, Typography} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export const AddBehavior = ({detail, setDetail}) => {
    const [loading, setLoading] = useState(false);
    const [listBehavior, setListBehavior] = useState(detail.listbehavior);
    const [groupedBehavior, setGroupedBehavior] = useState([]);

    useEffect(() => {
        setLoading(true);
        const grouped = listBehavior.reduce((acc, item) => {
            const existingGroup = acc.find(group => group.behaviorname === item.behaviorname);
            if (existingGroup) {
                existingGroup.list.push({
                    causename: item.causename,
                    causecode: item.causecode
                });
            } else {
                acc.push({
                    behaviorname: item.behaviorname,
                    list: [{
                        causename: item.causename,
                        causecode: item.causecode
                    }]
                });
            }
            return acc;
        }, []);
        setGroupedBehavior(grouped);
        setLoading(false);
    }, []);
    return (
        <>

            {groupedBehavior.map((group, index) => (
                <Stack direction='column' key={index}>
                    <Typography variant='h6' color='#f15922' fontWeight='bold'>{group.behaviorname}</Typography>
                    <Grid2 container>
                        {group.list.map((cause, i) => (
                            <Grid2 size={{xs: 12,md : 4, lg: 3}} key={i}>
                                <FormControlLabel key={i} control={<Checkbox/>} label={cause.causename}/>
                            </Grid2>
                        ))}
                    </Grid2>
                </Stack>
            ))}
            <Stack direction='row' justifyContent='end' spacing={2}>
                <Button variant='contained' color='primary'>บันทึก</Button>
                <Button variant='contained' color='secondary'>ยกเลิก</Button>
            </Stack>
        </>
    );
};
