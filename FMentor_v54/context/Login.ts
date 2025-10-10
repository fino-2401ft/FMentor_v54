import { useState } from "react";
import { auth, realtimeDB } from "../config/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, update } from "firebase/database";

export const LoginController = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = ref(realtimeDB, `users/${user.uid}`);
      await update(userRef, { isOnline: true });

      return true;
    } catch (error: any) {
      console.error("Login failed:", error.message);
      return false;
    }
  };

  return { email, setEmail, password, setPassword, handleLogin };
};

export default LoginController;