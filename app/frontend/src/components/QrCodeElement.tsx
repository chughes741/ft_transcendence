import { Label } from '@mui/icons-material';
import { Button, InputLabel } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';

type VerifyQRCodeResponse = {
  message: string;
  success: boolean;
};

function VerifyQRCode() {
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [code, setCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [secret, setSecret] = useState<string | null>(null);

  const handleGetQRCode = async () => {
    try {
      const url = "/auth/qrCode";
      console.log("Click to get QRCODE wtf")
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      setQRCode(data['qrcode']);
      setSecret(data['secret']);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerifyQRCode = async () => {
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
      
      if (data.success) {
        setErrorMessage('');
        alert('QR code verified!');
        // Enable user here
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Box>Verify QR Code</Box>
      {qrCode && <img src={qrCode} alt="QR Code" />}
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