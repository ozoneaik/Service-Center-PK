import {useState, useEffect} from "react";
import {
    Dialog, DialogContent, DialogTitle, TextField, Button,
    FormControlLabel, Checkbox, Box, Grid2, Typography, InputAdornment, Stack
} from "@mui/material";
import {router, usePage} from '@inertiajs/react';
import LoginIcon from "@mui/icons-material/Login";
import {AccountCircle, AlternateEmail, Password, Edit} from "@mui/icons-material";

const isAdminOnly = (item) =>
    item.menu_name === 'เซลล์แจ้งซ่อม' || item.redirect_route === 'repair.sale.index' ||
    item.menu_name === 'บัญชีรับอะไหล่' || item.redirect_route === 'accounting.return.index' ||
    (item.redirect_route && item.redirect_route.startsWith('dealerRepair.')) ||
    item.redirect_route === 'sale.dealer.jobs.index';

export default function ModalEditUser({open, setOpen, user, onSave, listMenu}) {
    const { auth } = usePage().props;
    const currentUserRole = auth.user.role;
    const [userData, setUserData] = useState({
        user_code: '', name: '', email: '', role: '', admin_that_branch: false,
        password: '', password_confirmation: '', access_menu: []
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUserData({
                ...user,
                password: '',
                password_confirmation: '',
                access_menu: user.access_menu || []
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const {name, value, checked, type} = e.target;
        setUserData({
            ...userData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.put(route('storeUsers.update'), userData, {
            onSuccess: () => {
                setOpen(false);
                onSave('success');
                setLoading(false);
            },
            onError: (errors) => {
                setErrors(errors);
                onSave('error');
                setLoading(false);
            },
        });
    };

    // ตรวจสอบว่า menu นั้นๆ ถูกเลือกหรือไม่
    const isMenuChecked = (menuId) => {
        return userData.access_menu.some(access => access.menu_code === menuId);
    }

    const handleMenuChange = (menuId, checked) => {
        const menuItem = listMenu.find(m => m.id === menuId);
        let newAccessMenu = [...userData.access_menu];

        if (checked) {
            newAccessMenu.push({ user_code: userData.user_code, menu_code: menuId });
            // auto-add root when first child in group is checked
            if (menuItem && !menuItem.main_menu) {
                const groupRoot = listMenu.find(m => m.group === menuItem.group && m.main_menu && !m.redirect_route);
                if (groupRoot && !newAccessMenu.some(a => a.menu_code === groupRoot.id)) {
                    newAccessMenu.push({ user_code: userData.user_code, menu_code: groupRoot.id });
                }
            }
        } else {
            newAccessMenu = newAccessMenu.filter(a => a.menu_code !== menuId);
            // auto-remove root when all visible children in group are unchecked
            if (menuItem && !menuItem.main_menu) {
                const groupRoot = listMenu.find(m => m.group === menuItem.group && m.main_menu && !m.redirect_route);
                if (groupRoot) {
                    const visibleGroupChildren = listMenu.filter(m =>
                        m.group === menuItem.group && !m.main_menu &&
                        (!isAdminOnly(m) || currentUserRole === 'admin')
                    );
                    const anyChildLeft = visibleGroupChildren.some(m => newAccessMenu.some(a => a.menu_code === m.id));
                    if (!anyChildLeft) newAccessMenu = newAccessMenu.filter(a => a.menu_code !== groupRoot.id);
                }
            }
        }

        setUserData({ ...userData, access_menu: newAccessMenu });
    };

    const handleSelectAllInGroup = (groupId, items, checked) => {
        const groupRoot = listMenu.find(m => m.group === groupId && m.main_menu && !m.redirect_route);
        let newAccessMenu = [...userData.access_menu];
        const targets = [...items];
        if (groupRoot) targets.push(groupRoot);

        if (checked) {
            targets.forEach(item => {
                if (!newAccessMenu.some(a => a.menu_code === item.id))
                    newAccessMenu.push({ user_code: userData.user_code, menu_code: item.id });
            });
        } else {
            const removeIds = targets.map(m => m.id);
            newAccessMenu = newAccessMenu.filter(a => !removeIds.includes(a.menu_code));
        }
        setUserData({ ...userData, access_menu: newAccessMenu });
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
            <DialogTitle sx={{backgroundColor: 'primary.main', color: 'white'}}>
                <Stack direction='row' spacing={2} alignItems='center'>
                    <Edit/>&nbsp;
                    แก้ไข {user.name}
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{mt: 2}}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LoginIcon/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="user_code" label="รหัสผู้ใช้" fullWidth disabled
                                value={userData.user_code} onChange={handleChange}
                                error={!!errors.user_code} helperText={errors.user_code}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircle/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="name" label="ชื่อ" fullWidth required
                                value={userData.name} onChange={handleChange}
                                error={!!errors.name} helperText={errors.name}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AlternateEmail/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="email" label="อีเมล" fullWidth type="email" required
                                value={userData.email} onChange={handleChange}
                                error={!!errors.email} helperText={errors.email}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="admin_that_branch"
                                        checked={userData.admin_that_branch}
                                        onChange={handleChange}
                                    />
                                }
                                label="เจ้าของร้าน"
                            />
                            {errors.admin_that_branch && (
                                <Typography variant="caption" color="error" display="block">
                                    {errors.admin_that_branch}
                                </Typography>
                            )}
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <Typography variant="subtitle2" sx={{mb: 1}}>
                                เปลี่ยนรหัสผ่าน (เว้นว่างถ้าไม่ต้องการเปลี่ยน)
                            </Typography>
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Password/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="password" label="รหัสผ่านใหม่" type="password" fullWidth
                                value={userData.password} onChange={handleChange}
                                error={!!errors.password} helperText={errors.password}
                            />
                        </Grid2>

                        <Grid2 size={{xs: 12}}>
                            <TextField
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Password/>
                                            </InputAdornment>
                                        )
                                    }
                                }} size='small'
                                name="password_confirmation" label="ยืนยันรหัสผ่านใหม่" type="password" fullWidth
                                value={userData.password_confirmation} onChange={handleChange}
                                error={!!errors.password_confirmation} helperText={errors.password_confirmation}
                            />
                        </Grid2>

                        {!userData.admin_that_branch && (
                            <Grid2 size={12}>
                                <Typography variant="subtitle2" sx={{mb: 1.5}}>สิทธิ์การเข้าถึงเมนู</Typography>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {(() => {
                                        const grouped = {};
                                        listMenu.forEach(item => {
                                            if (!grouped[item.group]) grouped[item.group] = [];
                                            grouped[item.group].push(item);
                                        });

                                        return Object.entries(grouped).map(([groupId, items]) => {
                                            const header = items.find(item => item.main_menu);
                                            const subItems = items.filter(item => !item.main_menu);

                                            const visibleSubItems = subItems.filter(item =>
                                                !isAdminOnly(item) || currentUserRole === 'admin'
                                            );
                                            const showHeaderCheckbox = header?.redirect_route &&
                                                (!isAdminOnly(header) || currentUserRole === 'admin');

                                            if (!showHeaderCheckbox && visibleSubItems.length === 0) return null;

                                            const isStandalone = header?.redirect_route && subItems.length === 0;
                                            const allChecked = visibleSubItems.length > 0 && visibleSubItems.every(m => isMenuChecked(m.id));
                                            const someChecked = visibleSubItems.some(m => isMenuChecked(m.id));

                                            return (
                                                <Box
                                                    key={groupId}
                                                    sx={{border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden'}}
                                                >
                                                    {!isStandalone && (
                                                        <Box sx={{px: 1.5, py: 0.5, bgcolor: 'grey.100', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                                {header?.menu_name}
                                                            </Typography>
                                                            <FormControlLabel
                                                                sx={{mr: 0}}
                                                                labelPlacement="start"
                                                                label={<Typography variant="caption" color="text.secondary">เลือกทั้งหมด</Typography>}
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={allChecked}
                                                                        indeterminate={someChecked && !allChecked}
                                                                        onChange={(e) => handleSelectAllInGroup(parseInt(groupId), visibleSubItems, e.target.checked)}
                                                                    />
                                                                }
                                                            />
                                                        </Box>
                                                    )}
                                                    <Box sx={{px: 1, py: 0.5, display: 'flex', flexWrap: 'wrap'}}>
                                                        {showHeaderCheckbox && (
                                                            <FormControlLabel
                                                                label={<Typography variant="body2">{header.menu_name}</Typography>}
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={isMenuChecked(header.id)}
                                                                        onChange={(e) => handleMenuChange(header.id, e.target.checked)}
                                                                    />
                                                                }
                                                            />
                                                        )}
                                                        {visibleSubItems.map((item, index) => (
                                                            <FormControlLabel
                                                                key={index}
                                                                label={<Typography variant="body2">{item.menu_name}</Typography>}
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={isMenuChecked(item.id)}
                                                                        onChange={(e) => handleMenuChange(item.id, e.target.checked)}
                                                                    />
                                                                }
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            );
                                        });
                                    })()}
                                </Box>
                            </Grid2>
                        )}

                        <Grid2 size={{xs: 12}} sx={{mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                            <Button variant="outlined" onClick={() => setOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" variant="contained" color="primary" disabled={loading}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </Grid2>
                    </Grid2>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
