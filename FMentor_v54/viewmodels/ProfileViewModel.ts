import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserRepository } from "../repositories/UserRepository";
import { User } from "../models/User";

export const ProfileViewModel = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [username, setUsername] = useState(currentUser?.getUsername() || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(currentUser?.getAvatarUrl() || null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = () => {
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (newPassword && (newPassword.length < 6)) {
      setError("New password must be at least 6 characters long");
      return false;
    }
    if (newPassword && newPassword !== reNewPassword) {
      setError("New password and re-password do not match");
      return false;
    }
    if (newPassword && !currentPassword) {
      setError("Current password is required to change password");
      return false;
    }
    return true;
  };

  const updateProfile = async () => {
    if (!currentUser) {
      setError("No user logged in");
      return false;
    }

    if (!validateInputs()) {
      setIsUpdating(false);
      return false;
    }

    setIsUpdating(true);
    setError(null);
    try {
      // Check if username is taken
      const isTaken = await UserRepository.isUsernameTaken(username, currentUser.getUserId());
      if (isTaken) {
        setError("Username already exists!");
        setIsUpdating(false);
        return false;
      }

      // Upload new avatar if changed
      let avatarUrl = currentUser.getAvatarUrl();
      if (avatarUri && avatarUri !== avatarUrl) {
        avatarUrl = await UserRepository.uploadAvatar(avatarUri);
      }

      // Update profile in Firebase
      await UserRepository.updateUserProfile(currentUser.getUserId(), username, avatarUrl);

      // Update password if provided
      if (newPassword) {
        await UserRepository.updateUserPassword(currentUser.getUserId(), currentPassword, newPassword);
      }

      // Update currentUser in AuthContext
      const updatedUser = await UserRepository.getUser(currentUser.getUserId());
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }

      setIsUpdating(false);
      return true;
    } catch (error: any) {
      setError(error.message);
      setIsUpdating(false);
      return false;
    }
  };

  const logout = async () => {
    if (!currentUser) {
      setError("No user logged in");
      return false;
    }

    setIsUpdating(true);
    setError(null);
    try {
      await UserRepository.logout(currentUser.getUserId());
      setCurrentUser(null);
      setIsUpdating(false);
      return true;
    } catch (error: any) {
      setError(error.message);
      setIsUpdating(false);
      return false;
    }
  };

  return {
    username,
    setUsername,
    avatarUri,
    setAvatarUri,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    reNewPassword,
    setReNewPassword,
    isUpdating,
    error,
    updateProfile,
    logout,
  };
};