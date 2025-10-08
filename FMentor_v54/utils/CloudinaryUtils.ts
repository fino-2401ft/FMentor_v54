// src/utils/CloudinaryUtils.ts
export const CloudinaryUtils = {
  async uploadImage(fileUri: string): Promise<string> {
    const CLOUD_NAME = "dlkmlhk4k"; 
    const UPLOAD_PRESET = "ml_default"; 
    const data = new FormData();
    data.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const json = await res.json();
      if (json.secure_url) return json.secure_url;
      throw new Error(json.error?.message || "Image upload failed");
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Network request failed: Could not upload image");
    }
  },

  async uploadVideo(fileUri: string): Promise<string> {
    const CLOUD_NAME = "dlkmlhk4k"; 
    const UPLOAD_PRESET = "ml_default"; 
    const data = new FormData();
    data.append("file", {
      uri: fileUri,
      type: "video/mp4",
      name: "lesson_video.mp4",
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      const json = await res.json();
      if (json.secure_url) return json.secure_url;
      throw new Error(json.error?.message || "Video upload failed");
    } catch (error) {
      console.error("Video upload error:", error);
      throw new Error("Network request failed: Could not upload video");
    }
  },
};