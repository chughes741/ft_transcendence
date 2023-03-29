/** Module Imports */
import { Helmet } from "react-helmet";
import { Box, Stack } from "@mui/material";

/** Component Imports */
import SideBar from "src/components/SideBar/SideBar";
import "src/pages/profile/styles/ProfilePage.css";
import { ProfileHeader } from "./components/ProfileHeader";
import { MatchHistory } from "./components/MatchHistory";

/**
 * Loads profile page
 */
export default function ProfilePage() {
  return (
    <>
      <Helmet>
        <title>King Pong | Profile</title>
      </Helmet>
      <Box className="profile-page">
        <SideBar />
        <Box className="profile-box">
          <Stack
            className="profile-stack"
            spacing={2}
          >
            <ProfileHeader />
            <MatchHistory />
          </Stack>
        </Box>
      </Box>
    </>
  );
}
