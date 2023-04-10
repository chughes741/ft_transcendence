import { Box } from '@mui/material';
import { read } from 'fs';
import { useState, useContext } from 'react';
import { WebSocketContext } from 'src/contexts/WebSocketContext';
import { json } from 'stream/consumers';

function ImgUpload() {
  const [file, setFile] = useState(null);
  const [ImgUrl, setImgUrl] = useState('');

  const socket = useContext(WebSocketContext);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    console.log("handUpload Clicked", file);
    
    if (file) {
      //setImgUrl(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append('file', file);
      console.log("Before fetch");

      fetch('upload', {
        method: 'POST',
        body: formData
      });
    }
  }

    //<form onSubmit={handleUpload}> </form> 
    return (
      <>
        <Box className='ImgComponent'>

          <input type="file" accept='image/*' onChange={handleFileChange} />
          <button type='submit' onClick={handleUpload}>Choose File</button>
          <Box className='profileImage'>
            {{ ImgUrl } && <img src={file} alt='uploaded image' />}
          </Box>

        </Box>
      </>
    );
  }

  export default ImgUpload;