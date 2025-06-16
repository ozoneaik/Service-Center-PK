import {Accordion, AccordionDetails, AccordionSummary, Chip, Divider, Grid2, Stack, Typography} from "@mui/material";
import TableSpList from "@/Pages/HistoryRepair/TableSpList.jsx";
import {useEffect, useState} from "react";
import ListBehavior from "@/Pages/HistoryRepair/ListBehavior.jsx";
import SkeletonLoading from "@/Components/SkeletonLoading.jsx";

const HeadTitle = ({endService}) => (
    <Stack direction='column' spacing={3}>
        <Stack direction='row' spacing={1}>
            <Typography color='#f05f29' variant='h6' fontWeight='bold'>{endService}</Typography>
        </Stack>
    </Stack>
)

export default function ListHistoryRepair({serial_id}) {
    // const [history, setHistory] = useState(detail?.history ?? []);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData().finally(()=>setLoading(false))
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true)
            const {data, status} = await axios.get(route('history.detail',{serial_id}))
            setHistory(data.history)
        }catch (error) {
            console.log(error)
        }
    }
    return (
        <>
            {loading ? (
                <SkeletonLoading/>
            ): (
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='column' spacing={2}>
                            {history.map((item, index) => (
                                <Accordion variant='outlined' key={index}>
                                    <AccordionSummary
                                        expandIcon={'🔽'}
                                        aria-controls="panel1-content"
                                        id='panel1-header'
                                    >
                                        <Stack direction='column' spacing={3}>
                                            <HeadTitle endService={item.endservice}/>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack direction={{xs: 'column', md: 'row'}} spacing={1} mb={2}>
                                            <Typography fontWeight='bold' color='#f05f29'>หมายเหตุ</Typography>
                                            <Typography>{item.remark}</Typography>
                                        </Stack>
                                        <Stack direction={{xs: 'column', md: 'row'}} spacing={1} mb={2}>
                                            <Typography fontWeight='bold' color='#f05f29'>สถานะ</Typography>
                                            {/*<Chip color={item.status === 'success' ? 'success' : 'secondary'} size='small'*/}
                                            {/*      label={item.status === 'success' ? 'ปิดงานซ่อมแล้ว' : 'กำลังดำเนินการซ่อม'}/>*/}
                                            <Chip size='small' label={item.status}/>
                                        </Stack>
                                        <ListBehavior behavior={item.behavior}/>
                                        <Divider/>
                                        <TableSpList sparePart={item.sparepart}/>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    </Grid2>
                </Grid2>
            )}
        </>
    )
}
