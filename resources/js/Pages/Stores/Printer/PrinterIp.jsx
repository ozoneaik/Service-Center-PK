import { AlertDialog, AlertDialogQuestion } from "@/Components/AlertDialog";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import {LocalPrintshop, Save, TextSnippet } from "@mui/icons-material";
import {
    Container, Typography, Card, CardContent,
    Button, Grid2, TextField, FormControl, FormLabel, Stack
} from "@mui/material";

export default function PrinterIp({ ip_address_store }) {

    const { data, setData, post, errors, processing } = useForm({
        printer_ip: ip_address_store?.printer_ip || '',
        pc_ip: ip_address_store?.pc_ip || '',
        is_code_cust_id: ip_address_store?.is_code_cust_id || '',
    });

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    }

    const handleOnSubmit = (e) => {
        e.preventDefault();
        AlertDialogQuestion({
            text: 'กดตกลงเพื่อบันทึกข้อมูล',
            onPassed: (confirm) => {
                if (confirm) {
                    post(route('printerIp.storeOrUpdate'), {
                        onSuccess: (e) => {
                            AlertDialog({
                                icon: 'success',
                                text: 'บันทึกสําเร็จ',
                            })
                        }
                    });
                } else console.log('ยกเลิกการบันทึก');
            }
        })

    }

    return (
        <AuthenticatedLayout>
            <Head title="จัดการเครื่องปริ้นต์" />
            <Container maxWidth="false" sx={{ bgcolor: "white", p: 3 }}>
                <form onSubmit={handleOnSubmit}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <Typography fontWeight='bold' fontSize={20}>
                                ข้อมูลเครื่องปริ้นต์
                            </Typography>
                        </Grid2>

                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography fontWeight='bold' fontSize={16}>
                                        ip เครื่องคอมพิวเดอร์
                                    </Typography>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="pc_ip">
                                            ip address
                                        </FormLabel>
                                        <TextField
                                            size="small" value={data.pc_ip}
                                            name='pc_ip' type="text" onChange={handleOnChange}
                                        />
                                    </FormControl>
                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography fontWeight='bold' fontSize={16}>
                                        ip เครื่องปริ้นต์
                                    </Typography>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="printer_ip">
                                            ip address
                                        </FormLabel>
                                        <TextField
                                            size="small" value={data.printer_ip}
                                            name='printer_ip' type="text" onChange={handleOnChange}
                                        />
                                    </FormControl>
                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={12}>
                            <Stack direction='row' justifyContent='center' spacing={2}>
                                <Button
                                    loading={processing} startIcon={<Save />}
                                    variant="contained" type="submit"
                                >
                                    บันทึก / อัพเดท
                                </Button>
                                <Button
                                    loading={processing} startIcon={<TextSnippet />}
                                    variant="contained" color="warning"
                                >
                                    ทดสอบการ print
                                </Button>
                                <Button
                                    loading={processing} startIcon={<LocalPrintshop />}
                                    variant="contained" color="secondary"
                                >
                                    เปิดโปรแกรม printer
                                </Button>
                            </Stack>
                        </Grid2>
                        <Grid2 size={12}>
                            <iframe
                                src="https://maze-journey-c18.notion.site/ebd/256be7c3c04680a3b771ec01614c85b3"
                                width="100%" height="600" style={{border : 'none'}}
                            />
                        </Grid2>
                    </Grid2>
                </form>
            </Container>
        </AuthenticatedLayout>
    );
}