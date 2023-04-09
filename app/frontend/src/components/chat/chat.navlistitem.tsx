import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Box from "@mui/material/Box";

function chatNavListItem() {
  return (
    <Box>
      <AvatarGroup max={4}>
        <Avatar
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
        />
        <Avatar
          alt="Travis Howard"
          src="/static/images/avatar/2.jpg"
        />
        <Avatar
          alt="Cindy Baker"
          src="/static/images/avatar/3.jpg"
        />
        <Avatar
          alt="Agnes Walker"
          src="/static/images/avatar/4.jpg"
        />
        <Avatar
          alt="Trevor Henderson"
          src="/static/images/avatar/5.jpg"
        />
      </AvatarGroup>
    </Box>
  );
}
