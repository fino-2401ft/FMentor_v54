import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, realtimeDB } from "../config/Firebase";
import { User, UserRole, Mentor } from "../models/User";
import { ref, get, set } from "firebase/database";

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
                try {
                    // Retry up to 7 times with 1.5s delay
                    let retryCount = 0;
                    const maxRetries = 7;
                    let userData = null;

                    while (retryCount < maxRetries && !userData) {
                        const userRef = ref(realtimeDB, `users/${user.uid}`);
                        const snapshot = await get(userRef);
                        if (snapshot.exists()) {
                            userData = snapshot.val();
                            break;
                        }
                        retryCount++;
                        console.log(`Retry ${retryCount}/${maxRetries} for user ${user.uid}`);
                        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5s before retry
                    }

                    if (userData) {
                        if (userData.role === UserRole.Mentor) {
                            setCurrentUser(Mentor.fromJSON(userData));
                        } else {
                            setCurrentUser(User.fromJSON(userData));
                        }
                    } else {
                        // Fallback: Create a basic user if data is not found
                        const fallbackUser = new User(
                            user.uid,
                            user.email?.split("@")[0] || "Unknown",
                            user.email || "",
                            "",
                            UserRole.Mentee,
                            true
                        );
                        // Save fallback user to Firebase to prevent future issues
                        const userRef = ref(realtimeDB, `users/${user.uid}`);
                        await set(userRef, fallbackUser.toJSON());
                        setCurrentUser(fallbackUser);
                        console.warn(`User ${user.uid} not found in database after ${maxRetries} retries, saved fallback data`);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
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