/** Libraries */
import { useState } from "react";
import { Box, Input, Button, InputAdornment } from "@mui/material";
import { IconButton } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";

/** Providers */
import { useRootViewModelContext } from "src/root.context";

/**
 * ImgUpload
 */
function ImgUpload() {
  const [file, setFile] = useState(null);
  const { self } = useRootViewModelContext();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    console.log("handUpload Clicked", file);

    if (file) {
      /** REPLACE WITH CONTEXT USERNAME HERE */
      const newdata = { username: self.username };

      /** End of Username */
      const formData = new FormData();
      formData.append("file", file);
      formData.append("newData", JSON.stringify(newdata));

      fetch("/imgtransfer/upload", {
        method: "POST",
        body: formData
      })
        .then((response) => {
          if (response.ok) {
            console.log("Avatar uploaded successfully");
            response.text().then((text) => {
              console.log("File upload worked! Should be uploaded at: ", text);
            });
          } else {
            response.text().then((text) => {
              console.error("Error uploading avatar in response:", text);
            });
          }
        })
        .catch((error) => {
          console.error("Caught error uploading avatar:", error);
        });
    }
  };

  /** <form onSubmit={handleUpload}> </form> */
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
