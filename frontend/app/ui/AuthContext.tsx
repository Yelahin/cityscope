import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../lib/api/types";
import fetchApi, { ApiError } from "../lib/api/client";

interface AuthContextInterface {
    user: User | null | undefined;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export function AuthProvider ({children}: {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        fetchApi<User>("me/")
            .then(setUser)
            .catch((error) => {
                if (error instanceof ApiError && error.status === 401) {
                    setUser(null);
                    return;
                }
                setUser(null);
            });
    }, []);

    async function logout () {
        await fetchApi("logout/", {method: "POST"});
        setUser(null);
    }

    return (
        <AuthContext value={{ user, setUser, logout}}>
            {children}
        </AuthContext>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) { 
        throw new Error ("useAuth must be used within an AuthProvider");
    }

    return context;
}