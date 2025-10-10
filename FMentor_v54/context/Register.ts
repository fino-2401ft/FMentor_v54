import { useState } from "react";
import { auth, realtimeDB } from "../config/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { User, UserRole } from "../models/User";
import { CloudinaryUtils } from "../utils/CloudinaryUtils";

const RegisterController = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const handleRegister = async () => {
    if (password !== rePassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Check if username or email already exists
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

      // Upload avatar to Cloudinary if selected
      let avatarUrl = "";
      if (avatarUri) {
        avatarUrl = await CloudinaryUtils.uploadImage(avatarUri);
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Create new user with avatarUrl
      const newUser = new User(
        userId,
        username,
        email,
        avatarUrl,
        UserRole.Mentee,
        false
      );

      // Save user to Firebase
      const userRef = ref(realtimeDB, `users/${userId}`);
      await set(userRef, newUser.toJSON());

      alert("Registration successful!");
      console.log("Registration successful and user saved to DB!");
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      alert("Registration failed: " + error.message);
    }
  };

  return { username, setUsername, email, setEmail, password, setPassword, rePassword, setRePassword, avatarUri, setAvatarUri, handleRegister };
};

export default RegisterController;