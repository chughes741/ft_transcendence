import { Box, Input, Button, InputAdornment } from "@mui/material";
import { IconButton } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useState } from "react";
import { useRootViewModelContext } from "src/root.context";
import { PageState } from "src/root.model";
import { headers } from "./Auth";
import { socket } from "src/contexts/WebSocket.context";
import { createBrowserHistory } from "history";

function ImgUpload() {
  const [file, setFile] = useState(null); //Contains the img file
  const { self, setSelf, setSessionToken, setPageState, setFullscreen } =
    useRootViewModelContext(); //Use context
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const history = createBrowserHistory();

  //Upload image on submitgit
  const handleUpload = async () => {
    if (file) {
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
          setSelf({ username: "", avatar: "", createdAt: "", status: 0 });
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  //<form onSubmit={handleUpload}> </form>
  return (
    <>
      <Box className="ImgComponent">
        <Input
          type="file"
          inputProps={{
            accept: "image/*",
            "aria-label": "Choose image",
            placeholder: "No image"
          }}
          onChange={handleFileChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton>
                <PhotoCamera />
              </IconButton>
            </InputAdornment>
          }
        />
        <Button
          type="submit"
          onClick={handleUpload}
        >
          Submit File
        </Button>
      </Box>
    </>
  );
}

export default ImgUpload;
