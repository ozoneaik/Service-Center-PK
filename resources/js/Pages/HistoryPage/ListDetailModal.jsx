import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Table, TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";

export const ListDetailModal = ({list,open, setOpen}) => {
    return (
        <Dialog
            maxWidth='lg'
            fullWidth='true'
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                ประวัติการซ่อม
            </DialogTitle>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                helloworld
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {list.map((item,index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    helloworld
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>

                <Button>
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    )
}
