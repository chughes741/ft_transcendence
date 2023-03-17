import { useEffect } from "react";
import "src/pages/ProfilePage.tsx.css";
import { useOutletContext } from "react-router-dom";
import SideBar from "src/components/SideBar";

type OuletContext = {
  name: string;
};

export default function ProfilePage() {
  const { name } = useOutletContext<OuletContext>();

  return (
    <>
      <div className="profile-page">
        <div className="sidebar-wrapper">
          <SideBar />
        </div>
        <div className="profile-wrapper">
          <div>Right of sidebar page </div>
        </div>
      </div>
    </>
  );
}
