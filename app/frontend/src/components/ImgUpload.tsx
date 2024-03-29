import { Box, Tooltip, Icon } from "@mui/material";
import { IconButton } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import React, { useState } from "react";
import { useRootViewModelContext } from "src/root.context";
import { PageState } from "src/root.model";
import { headers } from "./Auth";
import { socket } from "src/contexts/WebSocket.context";
import { createBrowserHistory } from "history";
import "./ImgUpload.tsx.css";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { UserStatus } from "kingpong-lib";

function ImgUpload() {
  const [file, setFile] = useState(null); //Contains the img file
  const [color, setColor] = useState<boolean>(false);
  const { self, setSelf, setSessionToken, setPageState, setFullscreen } =
    useRootViewModelContext(); //Use context
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const history = createBrowserHistory();

  //Upload image on submit
  const handleUpload = async () => {
    if (file) {
      setColor(true);
      try {
        const formData = new FormData();
        formData.append("file", file); //Append the image
        //     REPLACE WITH CONTEXT USERNAME HERE
        const newdata = { username: self.username };
        formData.append("newData", JSON.stringify(newdata));
        //Post image in formData.
        const response = await fetch("/imgtransfer/upload", {
          method: "POST",
          headers,
          body: formData
        });

        const data = await response.json();
        if (response.ok) {
          self.avatar = data.URL;
          alert("Image successfully uploaded!");
          return;
        }
        alert("Image failed to upload!");
        //IF UnAuthorized : MUST FLUSH THE session TOKEN and bring back to login page
        if (data.statusCode && data.statusCode === 401) {
          //Deletes token in backend
          await fetch(`/auth/deleteToken?socketId=${socket.id}`, {
            method: "POST",
            headers
          });
          //Return to login
          setSessionToken("");
          setPageState(PageState.Auth);
          history.push("/auth");
          setFullscreen(true);
          setSelf({
            username: "",
            avatar: "",
            createdAt: "",
            status: UserStatus.ONLINE
          });
          return;
        }
      } catch (error) {
        console.debug(error);
      }
    }
  };

  const colorUploadIcon = color ? "#c1c1c1" : "#FFFFFF";

  return (
    <>
      <Box sx={{ alignSelf: "center", margin: "1rem", color: "#c1c1c1" }}>
        Change your profile picture
      </Box>
      <Box className="img-upload-container">
        <Box className="input-icon-upload">
          <Box className="icon-plus-input">
            <Tooltip
              title={"Choose a picture for your avatar"}
              arrow={true}
            >
              <IconButton
                disableRipple={true}
                sx={{
                  padding: "0 0.3rem",
                  width: "auto",
                  height: "auto",
                  cursor: "default",
                  color: "#348888"
                }}
              >
                <Icon>
                  <PhotoCamera />
                </Icon>
              </IconButton>
            </Tooltip>
            <input
              type="file"
              accept="image/*"
              className="custom-file-input"
              onChange={handleFileChange}
            />
          </Box>
          <Tooltip
            title="Upload"
            arrow={true}
          >
            <IconButton
              size={"large"}
              onClick={handleUpload}
              disableRipple={true}
              sx={{ marginLeft: "0.3rem", color: { colorUploadIcon } }}
            >
              <Icon>
                <UploadFileIcon />
              </Icon>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
}

export default ImgUpload;
