import { auth, realtimeDB } from "../config/Firebase";
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { ref, get, update, set } from "firebase/database";
import { User, UserRole } from "../models/User";
import { CloudinaryUtils } from "../utils/CloudinaryUtils";

export class UserRepository {
  static async isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      const usersRef = ref(realtimeDB, "users");
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        for (const userId in users) {
          if (userId !== excludeUserId && users[userId].username === username) {
            return true;
          }
        }
      }
      return false;
    } catch (error: any) {
      console.error("Error checking username:", error.message);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, username: string, avatarUrl: string): Promise<void> {
    try {
      const userRef = ref(realtimeDB, `users/${userId}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        throw new Error("User not found in database");
      }
      const currentData = snapshot.val();
      await update(userRef, {
        username,
        avatarUrl,
        email: currentData.email || "",
        role: currentData.role || UserRole.Mentee,
        isOnline: currentData.isOnline ?? true, // Gán mặc định true nếu isOnline undefined
      });
    } catch (error: any) {
      console.error("Error updating user profile:", error.message);
      throw error;
    }
  }

  static async updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently logged in");
      }

      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error("Error updating password:", error.message);
      throw error;
    }
  }

  static async uploadAvatar(avatarUri: string): Promise<string> {
    try {
      return await CloudinaryUtils.uploadImage(avatarUri);
    } catch (error: any) {
      console.error("Error uploading avatar:", error.message);
      throw error;
    }
  }

  static async logout(userId: string): Promise<void> {
    try {
      const userRef = ref(realtimeDB, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        await update(userRef, { isOnline: false });
      }
      await signOut(auth);
    } catch (error: any) {
      console.error("Error during logout:", error.message);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = ref(realtimeDB, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.role === UserRole.Mentor
          ? User.fromJSON(userData)
          : User.fromJSON(userData);
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching user:", error.message);
      throw error;
    }
  }
}