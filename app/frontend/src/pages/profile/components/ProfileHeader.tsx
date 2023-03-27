/** Module Imports */
import { Avatar, Paper, Stack } from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import { styled } from "@mui/material/styles";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));

/**
 * Creates profile page header
 */
export function ProfileHeader() {
  return (
    <>
      <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>
    </>
  );
}
