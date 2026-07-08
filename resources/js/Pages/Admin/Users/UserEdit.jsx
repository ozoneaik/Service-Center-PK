import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {Head, Link, useForm} from "@inertiajs/react";
import {
    Container,
    Grid2,
    TextField,
    Button,
    Typography,
    FormControlLabel,
    Switch,
    Card,
    CardContent,
    Box,
    Divider,
    Alert,
    Snackbar,
    Checkbox,
    Paper,
    Stack,
} from "@mui/material";
import {useMemo, useState} from "react";

export default function UserEdit({user, menu_access, list_all_menu}) {
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const {data, setData, put, processing, errors} = useForm({
        id: user.id,
        user_code: user.user_code,
        name: user.name,
        email: user.email,
        password: '',
        ConfirmPassword: '',
        role: user.role,
        is_code_cust_id: user.is_code_cust_id,
        shop_name: user.store_info?.shop_name ?? '',
        phone: user.store_info?.phone ?? '',
        admin_that_branch: user.admin_that_branch,
        address: user.store_info?.address ?? '',
        menu_access: menu_access || []
    });

    // สร้าง grouped menus โดยใช้ logic เดียวกับ AuthenticatedLayout
    const groupedMenus = useMemo(() => {
        const groups = {};
        list_all_menu.forEach((item) => {
            if (item.main_menu) {
                groups[item.group] = {header: item, children: []};
            }
        });
        list_all_menu.forEach((item) => {
            if (!item.main_menu && groups[item.group]) {
                groups[item.group].children.push(item);
            }
        });
        return Object.values(groups);
    }, [list_all_menu]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('userManage.update', user.id), {
            onSuccess: () => setOpenSnackbar(true),
        });
    };

    const isMenuChecked = (menuId) =>
        data.menu_access.some((a) => a.menu_code === menuId);

    const handleMenuChange = (menuId, checked) => {
        let next = [...data.menu_access];
        const parentGroup = groupedMenus.find(g => g.children.some(c => c.id === menuId));

        if (checked) {
            if (!next.some(a => a.menu_code === menuId)) {
                next.push({user_code: data.user_code, menu_code: menuId});
            }
            // auto-add header when first child in group is checked
            if (parentGroup && !next.some(a => a.menu_code === parentGroup.header.id)) {
                next.push({user_code: data.user_code, menu_code: parentGroup.header.id});
            }
        } else {
            next = next.filter((a) => a.menu_code !== menuId);
            // auto-remove header when all children in group are unchecked
            if (parentGroup) {
                const anyChildLeft = parentGroup.children.some(c => next.some(a => a.menu_code === c.id));
                if (!anyChildLeft) {
                    next = next.filter(a => a.menu_code !== parentGroup.header.id);
                }
            }
        }
        setData('menu_access', next);
    };

    // เลือก/ยกเลิกทั้งกลุ่ม (header + children)
    const handleGroupToggle = (group, checked) => {
        const ids = [group.header.id, ...group.children.map((c) => c.id)];
        let next = data.menu_access.filter((a) => !ids.includes(a.menu_code));
        if (checked) {
            ids.forEach((id) => next.push({user_code: data.user_code, menu_code: id}));
        }
        setData('menu_access', next);
    };

    const isGroupAllChecked = (group) =>
        [group.header, ...group.children].every((m) => isMenuChecked(m.id));

    const isGroupPartialChecked = (group) => {
        const all = [group.header, ...group.children];
        const checkedCount = all.filter((m) => isMenuChecked(m.id)).length;
        return checkedCount > 0 && checkedCount < all.length;
    };

    return (
        <AuthenticatedLayout>
            <Head title="แก้ไขผู้ใช้"/>
            <Container maxWidth="md" sx={{py: 3}}>
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h5" component="h1" gutterBottom>
                            แก้ไขข้อมูลผู้ใช้
                        </Typography>
                        <Divider sx={{mb: 3}}/>

                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Grid2 container spacing={3}>
                                <Grid2 size={{xs: 12, sm: 6}}>
                                    <TextField
                                        label="รหัสผู้ใช้"
                                        fullWidth
                                        value={data.user_code}
                                        disabled
                                    />
                                </Grid2>
                                <Grid2 size={{xs: 12, sm: 6}}>
                                    <TextField
                                        label="รหัสลูกค้า"
                                        fullWidth
                                        value={data.is_code_cust_id ?? ''}
                                        onChange={(e) => setData('is_code_cust_id', e.target.value)}
                                        error={!!errors.is_code_cust_id}
                                        helperText={errors.is_code_cust_id}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        label="ชื่อ"
                                        fullWidth
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        required
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        label="อีเมล"
                                        fullWidth
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        required
                                    />
                                </Grid2>
                                <Grid2 size={{xs: 12, md: 6}}>
                                    <TextField
                                        label="รหัสผ่านใหม่"
                                        fullWidth
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                    />
                                </Grid2>
                                <Grid2 size={{xs: 12, md: 6}}>
                                    <TextField
                                        required={!!data.password}
                                        label="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                                        fullWidth
                                        value={data.ConfirmPassword}
                                        onChange={(e) => setData('ConfirmPassword', e.target.value)}
                                        error={!!errors.ConfirmPassword}
                                        helperText={errors.ConfirmPassword}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        disabled
                                        label="เบอร์โทรศัพท์"
                                        fullWidth
                                        value={data.phone}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        disabled
                                        label="ที่อยู่"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={data.address}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={data.admin_that_branch}
                                                onChange={(e) => setData('admin_that_branch', e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="แอดมินประจำสาขา"
                                    />
                                </Grid2>

                                {!data.admin_that_branch && (
                                    <Grid2 size={12}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            สิทธิ์การเข้าถึงเมนู
                                        </Typography>
                                        <Stack spacing={2}>
                                            {groupedMenus.map((group, gi) => (
                                                <Paper key={gi} variant="outlined" sx={{p: 2}}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={isGroupAllChecked(group)}
                                                                indeterminate={isGroupPartialChecked(group)}
                                                                onChange={(e) => handleGroupToggle(group, e.target.checked)}
                                                                color="primary"
                                                            />
                                                        }
                                                        label={
                                                            <Typography fontWeight="bold">
                                                                {group.header.menu_name}
                                                            </Typography>
                                                        }
                                                    />
                                                    {group.children.length > 0 && (
                                                        <Box display="flex" flexWrap="wrap" pl={4} gap={1}>
                                                            {group.children.map((child, ci) => (
                                                                <FormControlLabel
                                                                    key={ci}
                                                                    control={
                                                                        <Checkbox
                                                                            checked={isMenuChecked(child.id)}
                                                                            onChange={(e) => handleMenuChange(child.id, e.target.checked)}
                                                                            size="small"
                                                                        />
                                                                    }
                                                                    label={child.menu_name}
                                                                />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Grid2>
                                )}

                                <Grid2 size={12} sx={{display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2}}>
                                    <Button variant="outlined" component={Link} href={route('userManage.list')}>
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" variant="contained" color="primary" disabled={processing}>
                                        บันทึกข้อมูล
                                    </Button>
                                </Grid2>
                            </Grid2>
                        </Box>
                    </CardContent>
                </Card>
            </Container>

            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="success">
                    บันทึกข้อมูลเรียบร้อยแล้ว
                </Alert>
            </Snackbar>
        </AuthenticatedLayout>
    );
}
