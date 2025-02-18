import {Accordion, AccordionDetails, AccordionSummary, Divider, Grid2, Stack, Typography} from "@mui/material";
import TableSpList from "@/Pages/HistoryRepair/TableSpList.jsx";
import {useState} from "react";
import ListBehavior from "@/Pages/HistoryRepair/ListBehavior.jsx";

const HeadTitle = ({endService}) => (
    <Stack direction='column' spacing={3}>
        <Stack direction='row' spacing={1}>
            <Typography color='#f05f29' variant='h6' fontWeight='bold'>{endService}</Typography>
        </Stack>
    </Stack>
)

export default function ListHistoryRepair({detail}) {
    const [history, setHistory] = useState(detail.history);
    return (
        <>
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Stack direction='column' spacing={2}>
                        {history.map((item, index) => (
                            <Accordion key={index}>
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
                                    <ListBehavior behavior={item.behavior}/>
                                    <Divider/>
                                    <TableSpList sparePart={item.sparepart}/>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                </Grid2>
            </Grid2>
        </>
    )
}
