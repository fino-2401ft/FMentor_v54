// controllers/RegisterController.ts
import { useState } from "react";
import { auth, realtimeDB } from "../config/Firebase"; // Sử dụng auth từ Firebase.ts
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { User, UserRole } from "../models/User";

const RegisterController = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const handleRegister = async () => {

    if (password !== rePassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Check if username or email already existed?
      const usersRef = ref(realtimeDB, "users");
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        for (const userId in users) {
          const user = users[userId];
          if (user.email === email) {
            alert("Email already exists!");
            return;
          }
          if (user.username === username) {
            alert("Username already exists!");
            return;
          }
        }
      }

      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const newUser = new User(
        userId,
        username,
        email,
        "", 
        UserRole.Mentee, 
        false 
      );

      const userRef = ref(realtimeDB, `users/${userId}`);
      await set(userRef, newUser.toJSON());

      // Alert Successfully
      alert("Registration successful!");
      console.log("Registration successful and user saved to DB!");
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      alert("Registration failed: " + error.message);
    }
  };

  return { username, setUsername, email, setEmail, password, setPassword, rePassword, setRePassword, handleRegister };
};

export default RegisterController;