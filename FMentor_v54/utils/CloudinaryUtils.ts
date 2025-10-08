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

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    if (json.secure_url) return json.secure_url;
    throw new Error(json.error?.message || "Upload image failed");
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
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    if (json.secure_url) return json.secure_url;
    throw new Error(json.error?.message || "Upload video failed");
  },
};
