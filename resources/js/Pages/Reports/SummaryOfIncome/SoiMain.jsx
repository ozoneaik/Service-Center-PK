// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
// import {Head} from "@inertiajs/react";
// import {Card, CardContent, Container, Grid2} from "@mui/material";
// import {BarChart} from "@mui/x-charts";

import SoiList from "@/Pages/Admin/SummaryOfIncome/SoiList";

// const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
// const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
// const xLabels = [
//     'Page A',
//     'Page B',
//     'Page C',
//     'Page D',
//     'Page E',
//     'Page F',
//     'Page G',
// ];

// export default function SoiMain(){
//     return (
//         <AuthenticatedLayout>
//             <Head title='รายสรุปยอดรายรับ ศูนย์ซ่อม'/>
//             <Container maxWidth='false' sx={{bgcolor: 'white', p: 2}}>
//                 <Grid2 container spacing={2}>
//                     <Grid2 size={3} >
//                         <Card>
//                             <CardContent>
//                                 <BarChart
//                                     sx={{p : 0}}
//                                     height={300}
//                                     series={[
//                                         { data: pData, label: 'pv', id: 'pvId' },
//                                         { data: uData, label: 'uv', id: 'uvId' },
//                                     ]}
//                                     xAxis={[{ data: xLabels }]}
//                                     yAxis={[{ width: 50 }]}
//                                 />
//                             </CardContent>
//                         </Card>

//                     </Grid2>
//                     <Grid2 size={3}>
//                     </Grid2>
//                 </Grid2>
//             </Container>
//         </AuthenticatedLayout>
//     )
// }

export default function SoiMain() {
    return (
        <SoiList />
    )
}