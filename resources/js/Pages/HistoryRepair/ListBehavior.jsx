import { Chip, Stack } from "@mui/material";

export default function ListBehavior({ behavior }) {
    return (
        <Stack direction="row" spacing={2} mb={2}>
            {behavior.map((item, index) => (
                <Chip
                    color="primary"
                    key={index}
                    label={item[Object.keys(item)[0]]}
                />
            ))}
        </Stack>
    );
}
