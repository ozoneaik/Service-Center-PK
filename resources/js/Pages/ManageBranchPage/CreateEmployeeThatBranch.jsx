import {
    Button,
    Card,
    FormControl,
    FormLabel,
    Grid2,
    InputLabel,
    MenuItem,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import Select from "@mui/material/Select";
import {useRef} from "react";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";
import {usePage} from "@inertiajs/react";

export default function CreateEmployeeThatBranch({listEmployeeThatBranch}) {
    const name = useRef(null);
    const password = useRef(null)
    const password_confirmation = useRef(null)
    const email = useRef(null);
    const role = useRef(null);
    const onSubmit = (e) => {
        e.preventDefault()
        const formData = {
            name : name.current.value,
            password : password.current.value,
            password_confirmation : password_confirmation.current.value,
            email : email.current.value,
            role : role.current.value,
        }
        AlertDialogQuestion({
            text : 'กดตกลงเพื่อสร้างผู้ใช้ใหม่',
            onPassed : async (confirm) => {
                confirm && await createEmployee(formData);
            }
        })
    }

    const createEmployee = async (formData) => {
        let Status,Message;
        let newEmp;
        try {
            const {data, status} = await axios.post('/emp/store',{...formData});
            Message = data.message;
            Status = status;
            newEmp = data.newEmp;
        }catch (error){
            Message = error.response.data.message;
            Status = error.response.status;
        }finally {
            AlertDialog({
                icon : Status === 200 ? 'success' : 'error',
                title : Status === 200 ? 'สำเร็จ' : 'ไม่สำเร็จ',
                text : Message,
                onPassed : () => {
                    Status === 200 && window.location.reload();
                }
            })
        }
    }
    return (
        <Card sx={{p: 2}}>
            <form onSubmit={onSubmit}>
                <Grid2 container spacing={2}>
                    <Grid2 size={12}>
                        <Typography variant='h6'>เพิ่มผู้ใช้</Typography>
                    </Grid2>
                    <Grid2 size={{lg: 6, md: 6, sm: 12}}>
                        <FormLabel htmlFor="name" required>
                            ชื่อ-นามสกุล
                        </FormLabel>
                        <TextField
                            id='name'
                            fullWidth
                            required
                            inputRef={name}
                            type='text'
                            variant="outlined"
                            size='small'
                            placeholder='ex.มานี มานะ'
                        />
                    </Grid2>
                    <Grid2 size={{lg : 6, md :6,sm : 12}}>
                        <FormLabel htmlFor="email" required>
                            อีเมล
                        </FormLabel>
                        <TextField
                            id='email'
                            fullWidth
                            required
                            inputRef={email}
                            placeholder='ex.user001@local.com'
                            type='email'
                            size='small'
                        />
                    </Grid2>
                    <Grid2 size={{lg : 6, md :6,sm : 12}}>
                        <FormLabel htmlFor="pasword" required>
                            รหัสผ่าน
                        </FormLabel>
                        <TextField
                            id='pasword'
                            fullWidth
                            required
                            inputRef={password}
                            placeholder='ex.1234'
                            type='password'
                            size='small'
                        />
                    </Grid2>

                    <Grid2 size={{lg : 6, md :6,sm : 12}}>
                        <FormLabel htmlFor="password_confirmation" required>
                            ยืนยันรหัสผ่าน
                        </FormLabel>
                        <TextField
                            id='password_confirmation'
                            fullWidth
                            required
                            inputRef={password_confirmation}
                            placeholder='ex.1234'
                            type='password'
                            size='small'
                        />
                    </Grid2>
                    <Grid2 size={12}>
                        <FormLabel htmlFor="password_confirmation" required>
                            สิทธิ์
                        </FormLabel>
                        <Select
                            fullWidth
                            required
                            inputRef={role}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            size='small'
                            defaultValue='user'
                        >
                            <MenuItem value={'admin'}>ผู้ดูแลระบบ</MenuItem>
                            <MenuItem value={'user'}>ผู้ใช้</MenuItem>
                        </Select>
                    </Grid2>
                    <Grid2 size={12}>
                        <Stack direction='row-reverse' spacing={2}>
                            <Button type='submit' fullWidth variant='contained'>สร้าง</Button>
                        </Stack>
                    </Grid2>

                </Grid2>
            </form>
        </Card>
    )
}
