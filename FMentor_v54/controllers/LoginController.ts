import { useState } from "react";
import { auth } from "../config/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { User } from "../models/User";
import { useAuth } from "../context/AuthContext";

export const LoginController = () => {
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setCurrentUser(User.fromJSON(user)); // ✅ dùng hàm có sẵn của anh
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  return { email, setEmail, password, setPassword, handleLogin };
};

export default LoginController;
