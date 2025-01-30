import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {Head} from "@inertiajs/react";
import {Accordion, AccordionDetails, AccordionSummary, Divider, Grid2, Stack, Typography} from "@mui/material";
import ProductDetail from "@/Components/ProductDetail.jsx";
import TableSpList from "@/Pages/HistoryRepair/TableSpList.jsx";
import {useState} from "react";
import ListBehavior from "@/Pages/HistoryRepair/ListBehavior.jsx";

const HeadTitle = ({endService, Remark}) => (
    <Stack direction='column' spacing={3}>
        <Stack direction='row' spacing={1}>
            <Typography component="span" variant='subtitle2' color='gray'>เมื่อ :</Typography>
            <Typography color='#f05f29' variant='subtitle2'>{endService}</Typography>
        </Stack>
        <Typography component="span" fontSize={18} fontWeight='bold'>หมายเหตุ : {Remark}</Typography>
    </Stack>
)

export default function ListHistoryRepair({detail}) {
    const [history, setHistory] = useState(detail.history);
    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                ประวัติการซ่อม
            </h2>
        }>
            <Head title="ประวัติการซ่อม"/>

            <div className="bg-white mt-4 p-4 ">
                <Stack direction='column' spacing={2}>
                    <ProductDetail {...detail} />
                </Stack>
            </div>
            <div className=" mt-4 p-4 ">
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
                                            <HeadTitle endService={item.endservice} Remark={item.remark}/>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography fontWeight='bold' color='#f05f29'>อาการ</Typography>
                                        <ListBehavior behavior={item.behavior}/>
                                        <Divider/>
                                        <TableSpList sparePart={item.sparepart}/>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    </Grid2>
                </Grid2>
            </div>
        </AuthenticatedLayout>
    )
}
