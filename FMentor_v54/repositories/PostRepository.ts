import { ref, set, get, push, update, remove, onValue, off } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { CloudinaryUtils } from "../utils/CloudinaryUtils";
import { NotificationRepository } from "./NotificationRepository";
import { NotificationType } from "../models/Notification";

export class PostRepository {
  static async createPost(authorId: string, content: string, mediaUri?: string): Promise<string> {
    try {
      const postId = push(ref(realtimeDB, "posts")).key || `post_${Date.now()}`;
      let mediaUrl = "";
      if (mediaUri) {
        mediaUrl = await CloudinaryUtils.uploadImage(mediaUri);
      }
      const post = new Post(postId, authorId, content, mediaUrl, mediaUrl ? 'image' : 'none');
      const postRef = ref(realtimeDB, `posts/${postId}`);
      await set(postRef, post.toJSON());
      return postId;
    } catch (error: any) {
      console.error("Error creating post:", error.message);
      throw error;
    }
  }

  static async updatePost(postId: string, content: string, mediaUri?: string): Promise<void> {
    try {
      const postRef = ref(realtimeDB, `posts/${postId}`);
      let mediaUrl = "";
      if (mediaUri) {
        mediaUrl = await CloudinaryUtils.uploadImage(mediaUri);
      }
      await update(postRef, { content, mediaUrl, mediaType: mediaUrl ? 'image' : 'none' });
    } catch (error: any) {
      console.error("Error updating post:", error.message);
      throw error;
    }
  }

  static async deletePost(postId: string, authorId: string): Promise<void> {
    try {
      const postRef = ref(realtimeDB, `posts/${postId}`);
      const snapshot = await get(postRef);
      if (!snapshot.exists()) {
        throw new Error("Post not found");
      }
      const postData = snapshot.val();
      if (postData.authorId !== authorId) {
        throw new Error("Unauthorized to delete this post");
      }
      await remove(postRef);
    } catch (error: any) {
      console.error("Error deleting post:", error.message);
      throw error;
    }
  }

  static getPosts(callback: (posts: Post[]) => void): () => void {
    const postsRef = ref(realtimeDB, "posts");
    const listener = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const postsData = snapshot.val();
        const posts = Object.values(postsData)
          .map((data: any) => Post.fromJSON(data))
          .sort((a, b) => b.getTimestamp() - a.getTimestamp());
        callback(posts as Post[]);
      } else {
        callback([]);
      }
    });
    return () => off(postsRef, 'value', listener);
  }

  static async likePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = ref(realtimeDB, `posts/${postId}`);
      const snapshot = await get(postRef);
      if (snapshot.exists()) {
        const postData = snapshot.val();
        if (userId !== postData.authorId) {
          await NotificationRepository.createNotification(postData.authorId, NotificationType.Like, postId);
        }
      }
      const likeRef = ref(realtimeDB, `posts/${postId}/likes/${userId}`);
      await set(likeRef, true);
    } catch (error: any) {
      console.error("Error liking post:", error.message);
      throw error;
    }
  }

  static async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const likeRef = ref(realtimeDB, `posts/${postId}/likes/${userId}`);
      await remove(likeRef);
    } catch (error: any) {
      console.error("Error unliking post:", error.message);
      throw error;
    }
  }

  static async addComment(postId: string, authorId: string, content: string): Promise<string> {
    try {
      const commentId = push(ref(realtimeDB, `comments/${postId}`)).key || `comment_${Date.now()}`;
      const comment = new Comment(commentId, postId, authorId, content);
      const commentRef = ref(realtimeDB, `comments/${postId}/${commentId}`);
      await set(commentRef, comment.toJSON());

      const postCommentRef = ref(realtimeDB, `posts/${postId}/comments/${commentId}`);
      await set(postCommentRef, true);

      const postRef = ref(realtimeDB, `posts/${postId}`);
      const snapshot = await get(postRef);
      if (snapshot.exists()) {
        const postData = snapshot.val();
        if (authorId !== postData.authorId) {
          await NotificationRepository.createNotification(postData.authorId, NotificationType.Comment, postId, commentId);
        }
      }

      return commentId;
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
      throw error;
    }
  }

  static async deleteComment(postId: string, commentId: string, authorId: string): Promise<void> {
    try {
      const commentRef = ref(realtimeDB, `comments/${postId}/${commentId}`);
      const snapshot = await get(commentRef);
      if (!snapshot.exists()) {
        throw new Error("Comment not found");
      }
      const commentData = snapshot.val();
      if (commentData.authorId !== authorId) {
        throw new Error("Unauthorized to delete this comment");
      }
      await remove(commentRef);

      const postCommentRef = ref(realtimeDB, `posts/${postId}/comments/${commentId}`);
      await remove(postCommentRef);
    } catch (error: any) {
      console.error("Error deleting comment:", error.message);
      throw error;
    }
  }

  static listenToPost(postId: string, callback: (post: Post | null) => void): () => void {
    const postRef = ref(realtimeDB, `posts/${postId}`);
    const listener = onValue(postRef, (snapshot) => {
      callback(snapshot.exists() ? Post.fromJSON(snapshot.val()) : null);
    });
    return () => off(postRef, 'value', listener);
  }
}