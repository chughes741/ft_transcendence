import React, { useState } from "react";
import { ArrowBack, ArrowBackIosNew } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useRootViewModelContext } from "src/root.context";
import { socket } from "src/contexts/WebSocket.context";
import { PageState } from "src/root.model";

interface Props {
    enabled: boolean;
}

export default function TwoFactorButton({ enabled }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { self, setSelf, sessionToken, setSessionToken, setPageState, history, setFullscreen } = useRootViewModelContext();

    const onToggle = async () => {

        //TRY is needed to catch error : Unauthorized Exception

        console.log("SESSION TOKEN 2FA", sessionToken)
        setIsLoading(true);
        const socketId = socket.id;
        console.log("SOCKETID in TOKEN 2FA", socket.id)
        const url = `/auth/update2FA?username=${self.username}`;
        console.log("Update 2FA for", self.username)
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "client-id": socketId,
                "client-token": sessionToken,
            }
        });
        const data = await response.json();
        if (data.statusCode && data.statusCode === 401) //UNAUTHORIZED EXCEPTION
        {
            //MUST FLUSH THE session TOKEN and bring back to login page
            setSessionToken("")
            setPageState(PageState.Auth);
            history.push('/auth');
            setFullscreen(true);
            setSelf(null);
            return ;
        }
        console.log(data);
        setIsLoading(false);
    }

    const handleClick = async () => {
        setIsLoading(true);
        await onToggle();
        setIsLoading(false);
    };

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