import { Delete, Edit } from "@mui/icons-material";
import { Stack, Button, Typography, CardContent, Card, CardActions } from "@mui/material";

export default function RpmListMobileView({ repair_mans, onSoftDelete, handleOnUpdate }) {
    return (
        <Stack spacing={2}>
            {repair_mans.map((repair_man) => (
                <Card key={repair_man.id}>
                    <CardContent>
                        <Typography variant="h6">
                            {repair_man.technician_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {repair_man.technician_nickname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {repair_man.technician_phone || 'ไม่มีข้อมูล'}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            onClick={() => handleOnUpdate(repair_man.id)}
                            fullWidth variant="outlined"
                            size="small"
                            color="warning"
                            startIcon={<Edit />}
                        >
                            แก้ไข
                        </Button>
                        <Button
                            onClick={() => onSoftDelete(repair_man)}
                            fullWidth
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                        >
                            ลบ
                        </Button>
                    </CardActions>
                </Card>
            ))}
        </Stack>
    )
}