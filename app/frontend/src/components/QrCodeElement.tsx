import { Button, InputLabel } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { PageState } from "src/root.model";
import { useRootViewModelContext } from 'src/root.context';

function VerifyQRCode() {
  const { 
    setPageState,
    setFullscreen,
   // sessionToken,
   // history
  } = useRootViewModelContext();

  const [qrCode, setQRCode] = useState<string | null>(null);
  const [code, setCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [secret, setSecret] = useState<string | null>(null);
//  const { setFullscreen } = useRootViewModelContext();

  setFullscreen(true);
  const handleGetQRCode = async (): Promise<boolean> => {
    try {
      const url = "/auth/qrCode";
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          //"client-id": socket.id,
          //"client-token": sessionToken,
        }
      });
      const data = await response.json();
      setQRCode(data['qrcode']);
      setSecret(data['secret']);
      return true;
    } catch (error) {
      return false;
    }

  };

  const handleVerifyQRCode = async (): Promise<boolean> => {

    try {
      console.log("Secret:", secret);
      const url = `/auth/verifyQrCode?secret=${secret}&code=${code}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log("THE DATA" ,data);
      if (data.validated) {
        setErrorMessage('');
        alert('QR code verified!');
        // Enable user here
        setFullscreen(false);
        setPageState(PageState.Home);
        return true;
      } else {
        // TODO
        //If false ... can't enter website. //TODO
        setErrorMessage(data.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <>
      <Box>Verify QR Code</Box>
      {qrCode && <img  width="128" height="128" src={qrCode} alt="QR Code" />}
      <Button onClick={handleGetQRCode}>Get QR Code</Button>
      <br />
      <InputLabel htmlFor="code">Enter your one-time password:</InputLabel>
      <input type="text" id="code" value={code} onChange={(e) => setCode(e.target.value)} />
      <br />
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <Button onClick={handleVerifyQRCode}>Verify QR Code</Button>
    </>
  );
}
export default VerifyQRCode;