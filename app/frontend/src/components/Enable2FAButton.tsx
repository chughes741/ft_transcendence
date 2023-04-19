import React, { useState } from "react";
import { ArrowBack, ArrowBackIosNew } from "@mui/icons-material";
import { Button } from "@mui/material";

interface Props {
    enabled: boolean;
  }

export default function TwoFactorButton({enabled} : Props) {
    const [isLoading, setIsLoading] = useState(false);

    const onToggle = () =>  { 
        console.log("Toggled");
    }

    const handleClick = async () => {
        setIsLoading(true);
        await this.onToggle();
        setIsLoading(false);
    };

    return (
        <Button
            variant="contained"
            
            onClick={handleClick}
            startIcon={enabled ? <ArrowBack /> : <ArrowBackIosNew />}
            disabled={isLoading}
        >
            {enabled ? "Disable Two Factor" : "Enable Two Factor"}
        </Button>
    );
}