import "src/pages/ProfilePage.tsx.css";
import SideBar from "src/components/SideBar";
import { Helmet } from "react-helmet";
import { Box, Stack } from "@mui/material";
import { ProfileHeader } from "./components/ProfileHeader";
import { MatchHistory } from "./components/MatchHistory";

export default function ProfilePage() {
  return (
    <>
      <Helmet>
        <title>King Pong | Profile</title>
      </Helmet>
      <div className="profile-page">
        <SideBar />
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Stack
            sx={{ width: "80%" }}
            spacing={2}
          >
            <ProfileHeader />
            <MatchHistory />
          </Stack>
        </Box>
      </div>
    </>
  );
}
