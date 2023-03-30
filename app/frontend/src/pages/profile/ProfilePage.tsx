/** Module Imports */
import { Helmet } from "react-helmet";
import { Box, Stack } from "@mui/material";

/** Component Imports */
import SideBar from "src/components/SideBar";
import "src/pages/profile/styles/ProfilePage.css";
import { ProfileHeader } from "./components/ProfileHeader";
import { MatchHistory } from "./components/MatchHistory";

/**
 * Loads profile page
 */
export default function ProfilePage() {
  return (
    <>
      <Box className="profile-page">
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
