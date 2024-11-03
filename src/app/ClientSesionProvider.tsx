
"use client";  // This makes the component a client component

import { SessionProvider } from "next-auth/react";

const ClientSessionProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
};

export default ClientSessionProvider;
