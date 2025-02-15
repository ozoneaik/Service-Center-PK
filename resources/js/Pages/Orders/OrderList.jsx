import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {
    Button,
    Container,
    Grid2,
    Stack,
    Table, TableBody, TableCell, TableHead, TableRow,
    Typography
} from "@mui/material";
import {useRef} from "react";
import {ImagePreview} from "@/Components/ImagePreview.jsx";

export default function OrderList() {
    const search = useRef(null);
    return (
        <AuthenticatedLayout>
            <Container style={{marginTop: 10}}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Stack direction='row' spacing={1}>
                            <input ref={search} style={{padding: 10, width: '100%'}} placeholder={'ค้นหา serial'}/>
                            <Button variant='contained'>search</Button>
                        </Stack>
                    </Grid2>
                    <Grid2 size={{lg : 5,md : 6}}>
                        <ImagePreview width='100%'
                                      src={'https://images.pumpkin.tools/A%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%20%e0%b9%81%e0%b8%a5%e0%b8%b0%20%e0%b9%80%e0%b8%84%e0%b8%a3%e0%b8%b7%e0%b9%88%e0%b8%ad%e0%b8%87%e0%b8%a1%e0%b8%b7%e0%b8%ad%e0%b9%84%e0%b8%9f%e0%b8%9f%e0%b9%89%e0%b8%b2%e0%b9%84%e0%b8%a3%e0%b9%89%e0%b8%aa%e0%b8%b2%e0%b8%a2/44341/44341-HG954-DM01.jpg'}/>
                    </Grid2>
                    <Grid2 size={{lg : 7,md : 6}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>joker</TableCell>
                                    <TableCell>joker</TableCell>
                                    <TableCell>joker</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[1,2,34,4].map((item,index) => (
                                    <TableRow key={index}>
                                        <TableCell>joker</TableCell>
                                        <TableCell>joker</TableCell>
                                        <TableCell>joker</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid2>
                </Grid2>
            </Container>

        </AuthenticatedLayout>
    )
}
