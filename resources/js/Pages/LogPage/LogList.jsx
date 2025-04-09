import React, {useEffect, useState} from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
    Box, Chip, TextField, InputAdornment, IconButton, Pagination, Stack, FormControl,
    Select, MenuItem, useTheme, Button, Avatar, Badge, Card, Grid, Tooltip, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import {Head, router} from '@inertiajs/react';
import {DateFormatTh} from "@/Components/DateFormat.jsx";

export default function LogList({Logs}) {
    // State for auto-refresh
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(20000);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());
    const [loading, setLoading] = useState(false);

    // Initialize auto-refresh
    useEffect(() => {
        let intervalId;

        if (autoRefresh) {
            intervalId = setInterval(() => {
                setLoading(true);
                router.get(route('logs.list'), {}, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setLastRefreshed(new Date());
                        setLoading(false);
                    }
                });
            }, refreshInterval);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [autoRefresh, refreshInterval]);

    const [searchQuery, setSearchQuery] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(100);

    // ข้อมูลจาก server
    const currentPage = Logs.current_page;
    const lastPage = Logs.last_page;
    const totalItems = Logs.total;

    // ฟังก์ชันสำหรับการค้นหา
    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        router.get(route('logs.list'), {search: searchQuery}, {
            preserveState: true,
            onSuccess: () => setLoading(false)
        });
    };

    // ฟังก์ชันสำหรับเปลี่ยนหน้า
    const handlePageChange = (event, value) => {
        setLoading(true);
        router.get(route('logs.list'), {page: value, per_page: rowsPerPage}, {
            preserveState: true,
            onSuccess: () => setLoading(false)
        });
    };

    // ฟังก์ชันสำหรับเปลี่ยนจำนวนรายการต่อหน้า
    const handleRowsPerPageChange = (event) => {
        const newRowsPerPage = event.target.value;
        setRowsPerPage(newRowsPerPage);
        setLoading(true);
        router.get(route('logs.list'), {page: 1, per_page: newRowsPerPage}, {
            preserveState: true,
            onSuccess: () => setLoading(false)
        });
    };

    // ฟังก์ชันรีเฟรชข้อมูลด้วยตนเอง
    const handleManualRefresh = () => {
        setLoading(true);
        router.get(route('logs.list'), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setLastRefreshed(new Date());
                setLoading(false);
            }
        });
    };

    const theme = useTheme();
    const pumpkinColor = theme.palette.pumpkinColor?.main || '#F15922';
    const pumpkinColorLight = theme.palette.pumpkinColor?.light || '#FF7E47';

    // คำนวณเวลาที่รีเฟรชล่าสุด
    const getTimeSinceLastRefresh = () => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - lastRefreshed) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds} วินาทีที่แล้ว`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
        } else {
            return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
        }
    };

    // สร้างสีสถานะแบบสุ่มสำหรับ Log
    const getRandomStatus = (id) => {
        const statuses = [
            {label: 'INFO', color: '#3498db'},
            // { label: 'DEBUG', color: '#2ecc71' },
            // { label: 'WARNING', color: '#f39c12' },
            // { label: 'ERROR', color: '#e74c3c' },
            // { label: 'CRITICAL', color: '#8e44ad' }
        ];

        // ใช้ ID เป็นตัวกำหนดประเภทแบบคงที่
        return statuses[id % statuses.length];
    };

    return (
        <Box sx={{
            bgcolor: '#f5f7fa',
            minHeight: '100vh',
            backgroundImage: 'linear-gradient(to bottom, rgba(245, 247, 250, 0.95), rgba(245, 247, 250, 0.95)), url("https://pixelcorner.fr/cdn/shop/articles/le-nyan-cat-618805.webp?v=1710261022&width=2048")',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed'
        }}>
            <Head title={'รายการ Log'}/>

            <Box sx={{
                width: '100%',
                minHeight: '100vh',
                padding: {xs: 2, md: 4},
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header Card */}
                <Card elevation={3} sx={{
                    mb: 3,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, #20202f 0%, #273c75 100%)`,
                    overflow: 'visible',
                    position: 'relative'
                }}>
                    <Box sx={{
                        p: {xs: 2, md: 4},
                        display: 'flex',
                        flexDirection: {xs: 'column', md: 'row'},
                        justifyContent: 'space-between',
                        alignItems: {xs: 'flex-start', md: 'center'}
                    }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{
                                bgcolor: pumpkinColor,
                                width: 56,
                                height: 56,
                                boxShadow: '0 4px 20px rgba(241, 89, 34, 0.5)'
                            }}>
                                <AnalyticsIcon fontSize="large"/>
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="white" gutterBottom component="div"
                                            sx={{mb: 0.5}}>
                                    รายการ Log
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" sx={{color: 'rgba(255,255,255,0.7)'}}>
                                    ข้อมูลทั้งหมด: <span
                                    style={{color: 'white', fontWeight: 'bold'}}>{totalItems}</span> รายการ
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack
                            direction={{xs: 'column', sm: 'row'}}
                            spacing={2}
                            mt={{xs: 2, md: 0}}
                            alignItems={{xs: 'flex-start', sm: 'center'}}
                        >
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<NotificationsIcon/>}
                                sx={{bgcolor: '#e74c3c', borderRadius: 2}}
                            >
                                แจ้งเตือน
                            </Button>

                            <Tooltip title={autoRefresh ? "ปิดการรีเฟรชอัตโนมัติ" : "เปิดการรีเฟรชอัตโนมัติ"}>
                                <Button
                                    variant="contained"
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    startIcon={<AutorenewIcon/>}
                                    sx={{
                                        bgcolor: autoRefresh ? '#27ae60' : '#7f8c8d',
                                        color: 'white',
                                        borderRadius: 2,
                                        '&:hover': {
                                            bgcolor: autoRefresh ? '#2ecc71' : '#95a5a6'
                                        }
                                    }}
                                >
                                    {autoRefresh ? 'อัตโนมัติ (เปิด)' : 'อัตโนมัติ (ปิด)'}
                                </Button>
                            </Tooltip>

                            <Tooltip title="รีเฟรชข้อมูล">
                                <span>
                                    <IconButton
                                        onClick={handleManualRefresh}
                                        sx={{
                                            color: 'white',
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.2)'
                                            }
                                        }}
                                        disabled={loading}
                                    >
                                        <RefreshIcon sx={{animation: loading ? 'spin 1s linear infinite' : 'none'}}/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    </Box>

                    <Box sx={{
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        p: 1.5,
                        px: {xs: 2, md: 4},
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <MoreTimeIcon sx={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', mr: 0.5}}/>
                            <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.7)'}}>
                                อัพเดทล่าสุด: {getTimeSinceLastRefresh()}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.5)'}}>
                                รีเฟรชทุก {refreshInterval / 1000} วินาที
                            </Typography>
                        </Box>
                    </Box>
                </Card>

                {/* Content Grid */}
                <Grid container spacing={3} sx={{mb: 3}}>
                    {/* ช่องค้นหา */}
                    <Grid item xs={12} md={8}>
                        <Card elevation={2} sx={{borderRadius: 3, p: 2, height: '100%'}}>
                            <form onSubmit={handleSearch}>
                                <TextField
                                    label="ค้นหารายละเอียด Log"
                                    placeholder="พิมพ์คำค้นหา..."
                                    variant="outlined"
                                    fullWidth
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon/>
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button
                                                    variant="contained"
                                                    type="submit"
                                                    sx={{
                                                        borderRadius: 2,
                                                        bgcolor: pumpkinColor,
                                                        '&:hover': {
                                                            bgcolor: pumpkinColorLight
                                                        }
                                                    }}
                                                >
                                                    ค้นหา
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{borderRadius: 2}}
                                />
                            </form>
                        </Card>
                    </Grid>

                    {/* สถิติการบันทึกล็อก */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{
                            borderRadius: 3,
                            p: 2,
                            height: '100%',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)'
                        }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1}}>
                                <Typography variant="subtitle1" fontWeight="bold">สถิติการบันทึก</Typography>
                                <Badge color="error" badgeContent={4} sx={{'.MuiBadge-badge': {fontSize: '0.7rem'}}}>
                                    <IconButton size="small">
                                        <FilterListIcon fontSize="small"/>
                                    </IconButton>
                                </Badge>
                            </Stack>
                            <Divider sx={{mb: 2}}/>
                            <Stack direction="row" justifyContent="space-around" spacing={1}>
                                <Box sx={{textAlign: 'center'}}>
                                    <Typography variant="body2" color="text.secondary">วันนี้</Typography>
                                    <Typography variant="h6" fontWeight="bold" color={pumpkinColor}>
                                        {Math.floor(totalItems * 0.3)}
                                    </Typography>
                                </Box>
                                <Box sx={{textAlign: 'center'}}>
                                    <Typography variant="body2" color="text.secondary">สัปดาห์นี้</Typography>
                                    <Typography variant="h6" fontWeight="bold" color={pumpkinColor}>
                                        {Math.floor(totalItems * 0.7)}
                                    </Typography>
                                </Box>
                                <Box sx={{textAlign: 'center'}}>
                                    <Typography variant="body2" color="text.secondary">ทั้งหมด</Typography>
                                    <Typography variant="h6" fontWeight="bold" color={pumpkinColor}>
                                        {totalItems}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

                {/* ตารางข้อมูล */}
                <Card
                    elevation={3}
                    sx={{
                        width: '100%',
                        mb: 2,
                        borderRadius: 3,
                        overflow: 'hidden',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}
                >
                    {loading && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            zIndex: 5,
                            background: `linear-gradient(90deg, transparent, ${pumpkinColor}, transparent)`,
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite linear'
                        }}/>
                    )}

                    <TableContainer sx={{flexGrow: 1}}>
                        <Table stickyHeader sx={{minWidth: 650}} aria-label="log table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={headerStyle} align="center" width="8%">ID</TableCell>
                                    <TableCell sx={headerStyle} align="left" width="50%">รายละเอียด</TableCell>
                                    <TableCell sx={headerStyle} align="center" width="18%">วันที่สร้าง</TableCell>
                                    <TableCell sx={headerStyle} align="center" width="18%">วันที่อัปเดต</TableCell>
                                    <TableCell sx={headerStyle} align="center" width="6%">จัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Logs.data.map((log) => {
                                    const status = getRandomStatus(log.id);
                                    return (
                                        <TableRow
                                            key={log.id}
                                            sx={{
                                                '&:nth-of-type(odd)': {bgcolor: 'rgba(0, 0, 0, 0.02)'},
                                                '&:last-child td, &:last-child th': {border: 0},
                                                '&:hover': {
                                                    backgroundColor: 'rgba(241, 89, 34, 0.05)',
                                                    boxShadow: 'inset 0 0 0 1px rgba(241, 89, 34, 0.1)'
                                                },
                                                transition: 'all 0.15s ease-in-out'
                                            }}
                                        >
                                            <TableCell align="center" sx={{fontWeight: 'medium'}}>
                                                <Chip
                                                    size="small"
                                                    label={log.id}
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="left">
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <Chip
                                                        size="small"
                                                        label={status.label}
                                                        sx={{
                                                            backgroundColor: status.color,
                                                            color: 'white',
                                                            mr: 1.5,
                                                            fontWeight: 'bold',
                                                            minWidth: '70px',
                                                            textAlign: 'center'
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontFamily: 'monospace', fontWeight: 500, fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {log.description}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" sx={{fontFamily: 'monospace'}}>
                                                <DateFormatTh date={log.created_at}/>
                                            </TableCell>
                                            <TableCell align="center" sx={{fontFamily: 'monospace'}}>
                                                <DateFormatTh date={log.updated_at}/>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="ดูรายละเอียด">
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            color: '#3498db',
                                                            '&:hover': {bgcolor: 'rgba(52, 152, 219, 0.1)'}
                                                        }}
                                                    >
                                                        <InfoIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="ลบข้อมูล">
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            color: '#e74c3c',
                                                            '&:hover': {bgcolor: 'rgba(231, 76, 60, 0.1)'}
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {Logs.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{py: 5}}>
                                            <Box sx={{textAlign: 'center'}}>
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    ไม่พบข้อมูล
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ไม่พบข้อมูล Log ตามเงื่อนไขที่ค้นหา
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Server-side Pagination */}
                    <Box sx={{
                        padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderTop: '1px solid rgba(224, 224, 224, 1)', bgcolor: 'rgba(245, 247, 250, 0.6)'
                    }}>
                        <Stack direction='row' alignItems='center'>
                            <Typography variant="body2" color="text.secondary" sx={{mr: 2}}>
                                รายการต่อหน้า:
                            </Typography>
                            <FormControl size="small" sx={{minWidth: 80}}>
                                <Select
                                    variant='outlined' value={rowsPerPage}
                                    onChange={handleRowsPerPageChange}
                                    displayEmpty sx={{borderRadius: 2}}
                                >
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                    <MenuItem value={50}>50</MenuItem>
                                    <MenuItem value={100}>100</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack spacing={2}>
                            <Pagination
                                count={lastPage}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                sx={{
                                    '.MuiPaginationItem-root': {fontWeight: 'medium'},
                                    '.Mui-selected': {bgcolor: pumpkinColor + ' !important', color: 'white'}
                                }}
                            />
                        </Stack>

                        <Box sx={{
                            px: 2, py: 0.75, borderRadius: 2, bgcolor: '#f0f2f5',
                            border: '1px solid rgba(0,0,0,0.08)'
                        }}>
                            <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                {Logs.from}-{Logs.to} จาก {totalItems} รายการ
                            </Typography>
                        </Box>
                    </Box>
                </Card>

                {/* Footer */}
                <Box sx={{textAlign: 'center', mt: 'auto', py: 2}}>
                    <Typography variant="caption" color="text.secondary">
                        © {new Date().getFullYear()} Log Management System
                    </Typography>
                </Box>
            </Box>

            {/* CSS for animations */}
            <style jsx global>{`
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
            `}</style>
        </Box>
    );
}


const headerStyle = {
    background: 'linear-gradient(135deg, #20202f 0%, #273c75 100%)',
    color: 'white',
    fontWeight: 'bold'
}
