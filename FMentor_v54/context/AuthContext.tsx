// context/AuthContext.ts
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, realtimeDB } from "../config/Firebase";
import { User, UserRole, Mentor } from "../models/User";
import { ref, get } from "firebase/database";

const AuthContext = createContext<{
    currentUser: User | null;
    loading: boolean;
    setCurrentUser: (user: User | null) => void;
}>({
    currentUser: null,
    loading: true,
    setCurrentUser: () => { }, 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = ref(realtimeDB, `users/${user.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    if (userData.role === UserRole.Mentor) {
                        setCurrentUser(Mentor.fromJSON(userData));
                    } else {
                        setCurrentUser(User.fromJSON(userData));
                    }
                } else {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, loading, setCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
