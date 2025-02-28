import {Button, Card, FormControl, InputLabel, MenuItem, Stack, TextField, Typography} from "@mui/material";
import Select from "@mui/material/Select";
import {useRef} from "react";
import {AlertDialog, AlertDialogQuestion} from "@/Components/AlertDialog.js";

export default function CreateEmployeeThatBranch({listEmployeeThatBranch}) {
    const name = useRef(null);
    const password = useRef(null)
    const confirmPassword = useRef(null)
    const email = useRef(null);
    const role = useRef(null);
    const onSubmit = (e) => {
        e.preventDefault()
        const formData = {
            name : name.current.value,
            password : password.current.value,
            confirm_password : confirmPassword.current.value,
            email : email.current.value,
            role : role.current.value
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
                <Stack direction='column' spacing={3}>
                    <Typography variant='h6'>เพิ่มผู้ใช้</Typography>
                    <TextField
                        required
                        inputRef={name}
                        placeholder='ex.สมศรี มานี'
                        label="ชื่อ-นามสกุล" type='text'
                        variant="outlined" size='small'
                    />
                    <TextField
                        required
                        inputRef={email}
                        placeholder='ex.user001@local.com'
                        label="อีเมล" type='email'
                        size='small' variant="outlined"
                    />
                    <TextField
                        required
                        inputRef={password}
                        placeholder='ex.1234'
                        label="รหัสผ่าน" type='password'
                        size='small' variant="outlined"
                    />
                    <TextField
                        required
                        inputRef={confirmPassword}
                        placeholder='ex.1234'
                        label="ยืนยันรหัสผ่าน" type='password'
                        size='small' variant="outlined"
                    />
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">สิทธิ์</InputLabel>
                        <Select
                            required
                            inputRef={role}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            size='small' variant='outlined'
                            label="สิทธิ์" defaultValue='user'
                        >
                            <MenuItem value={'admin'}>ผู้ดูแลระบบ</MenuItem>
                            <MenuItem value={'user'}>ผู้ใช้</MenuItem>
                        </Select>
                    </FormControl>
                    <Stack direction='row-reverse' spacing={2}>
                        <Button type='submit' variant='contained'>สร้าง</Button>
                    </Stack>
                </Stack>
            </form>
        </Card>
    )
}
