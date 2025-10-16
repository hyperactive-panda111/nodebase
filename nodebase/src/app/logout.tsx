'use client';

import  { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => {
    return (
        <Button onClick={() => authClient.signOut()}>
            Logout
        </Button>
    )
}