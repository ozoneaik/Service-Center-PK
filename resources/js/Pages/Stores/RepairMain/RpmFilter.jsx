import { useForm } from "@inertiajs/react";
import { Search, Sort } from "@mui/icons-material";
import { Button, Stack, TextField } from "@mui/material";

export default function RpmFilter() {
    const { data, setData, get, processing, errors } = useForm({
        technician_name: '',
        technician_nickname: '',
        technician_phone: '',
    });
    
    return (
        <Stack direction='row' spacing={1}>
            <TextField size="small" value={data.technician_name} placeholder="ชื่อเล่น" />
            <TextField size="small" placeholder="ชื่อจริง" />
            <TextField size="small" placeholder="เบอร์โทรศัพท์" />
            <Button variant="contained" size="small" color="secondary" startIcon={<Sort />}>
                ล้างการกรอง
            </Button>
            <Button variant="contained" size="small" startIcon={<Search />}>
                ค้นหา
            </Button>
        </Stack>
    )
}