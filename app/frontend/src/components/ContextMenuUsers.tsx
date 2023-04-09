import React from "react";
import { useChatViewModelContext } from "../pages/chat/contexts/ChatViewModelContext";
import ContextMenu from "./ContextMenu";
import { usePageStateContext } from "../contexts/PageStateContext";
import { PageState } from "../views/root.model";
import { Paper } from "@mui/material";

export default function ContextMenuUsers() {
  const {
    contextMenuUsersPosition,
    contextMenuUsersVisible,
    setContextMenuUsersVisible
  } = useChatViewModelContext();

  const { setPageState } = usePageStateContext();
  const isOwner = false;

  return (
    <>
      <Paper />
      <ContextMenu
        setContextMenuVisible={setContextMenuUsersVisible}
        contextMenuVisible={contextMenuUsersVisible}
        position={contextMenuUsersPosition}
        options={[
          {
            label: "View profile",
            onClick: () => {
              console.log("View Profile");
              setPageState(PageState.Profile);
            }
          },
          {
            label: "Invite to game",
            onClick: () => {
              console.log("Invite to game");
              setPageState(PageState.Game);
            }
          },
          {
            label: "Dm",
            onClick: () => {
              console.log("Send a dm");
            }
          },
          ...(isOwner
            ? [
                {
                  label: "Owner related stuff",
                  submenu: [
                    {
                      label: "Kick user",
                      onClick: () => {
                        console.log(
                          "kick User",
                          "pop a modal asking for how long and a reason"
                        );
                      }
                    },
                    {
                      label: "Ban user",
                      onClick: () => {
                        console.log(
                          "Ban user",
                          "pop a modal asking are you sure"
                        );
                      }
                    },
                    {
                      label: "Mute user",
                      onClick: () =>
                        console.log(
                          "Mute User",
                          "Pop a modal asking for how long and why"
                        )
                    }
                  ]
                }
              ]
            : [])
        ]}
      />
    </>
  );
}
