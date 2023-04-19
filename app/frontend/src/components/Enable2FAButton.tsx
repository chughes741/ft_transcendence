import React, { useState } from "react";
import { ArrowBack, ArrowBackIosNew } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useRootViewModelContext } from "src/root.context";

interface Props {
    enabled: boolean;
}

export default function TwoFactorButton({ enabled }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { self } = useRootViewModelContext()

    const onToggle = async () => {
        setIsLoading(true)
        const url = `/auth/update2FA?username=${self.username}`;
        console.log("Update 2FA for" , self.username)
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        console.log("TRUE OR FALSE :   ", data);
        setIsLoading(false);
    
    }
/*
    const handleClick = async () => {
        setIsLoading(true);
        await onToggle();
        setIsLoading(false);
    };
*/
    return (
        <Button
            variant="contained"

            onClick={onToggle}
            startIcon={enabled ? <ArrowBack /> : <ArrowBackIosNew />}
            disabled={isLoading}
        >
            {enabled ? "Disable Two Factor" : "Enable Two Factor"}
        </Button>
    );
}