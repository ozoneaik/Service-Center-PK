import { Stack, MenuItem, FormControl, Select, Avatar } from "@mui/material";

export default function RpsSelectRepairMain({ repairMainList, repairManSelected, setRepairManSelected, JOB }) {
    return (
        <Stack>
            <FormControl fullWidth>
                <Select
                    disabled={JOB.status !== 'pending'}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={repairManSelected}
                    onChange={(e) => setRepairManSelected(e.target.value)}
                >
                    <MenuItem disabled>เลือก</MenuItem>
                    {repairMainList.map((repair_man, index) => (
                        <MenuItem key={index} value={repair_man.id}>
                            Id:{repair_man.id} {repair_man.technician_name} ({repair_man.technician_phone})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    );
}
