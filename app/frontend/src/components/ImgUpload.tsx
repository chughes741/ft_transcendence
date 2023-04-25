import { Box, Input, Button, InputAdornment } from "@mui/material";
import { IconButton } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useState } from "react";
import { useRootViewModelContext } from "src/root.context";
import { PageState } from "src/root.model";
import { headers } from "./Login42";
import { socket } from "src/contexts/WebSocket.context";
import { createBrowserHistory } from "history";
import { ProfileEntity } from "kingpong-lib";

function ImgUpload() {
  const [file, setFile] = useState(null);
  const { self, setSelf, setSessionToken, setPageState, setFullscreen } =
    useRootViewModelContext();
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const history = createBrowserHistory();

  const handleUpload = async () => {
    console.debug("handleUpload Clicked");

    if (file) {
      //
      //     REPLACE WITH CONTEXT USERNAME HERE
      const newdata = { username: self.username };

      //--------------------- End of Username
      const formData = new FormData();
      formData.append("file", file);
      formData.append("newData", JSON.stringify(newdata));

      const response = await fetch("/imgtransfer/upload", {
        method: "POST",
        headers,
        body: formData
      });
      const data = await response.json();
      if (data.statusCode && data.statusCode === 401) {
        //UNAUTHORIZED EXCEPTION
        //MUST FLUSH THE session TOKEN and bring back to login page
        await fetch(`/auth/deleteToken?socketId=${socket.id}`, {
          method: "POST",
          headers
        });
        setSessionToken("");
        setPageState(PageState.Auth);
        history.push("/auth");
        setFullscreen(true);
        setSelf({ username : "", avatar: "", createdAt: "", status: 0});
        return;
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
