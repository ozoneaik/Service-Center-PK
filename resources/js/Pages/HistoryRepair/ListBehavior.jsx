import {Chip, Stack, Typography} from "@mui/material";

export default function ListBehavior({ behavior }) {
    return (
        <Stack direction={{xs : 'column' , md : 'row'}} spacing={1} mb={2}>
            <Typography fontWeight='bold' color='#f05f29'>อาการ</Typography>
            {behavior.map((item, index) => (
                <div key={index}>
                    <Typography>{item.behaviorname}/</Typography>
                </div>
            ))}
        </Stack>
    );
}
