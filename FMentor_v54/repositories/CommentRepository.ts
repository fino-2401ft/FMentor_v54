import { ref, set, get, remove, onValue, off } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Comment } from "../models/Comment";
import { PostRepository } from "./PostRepository";

export class CommentRepository {
  static async createComment(postId: string, authorId: string, content: string): Promise<string> {
    try {
      return await PostRepository.addComment(postId, authorId, content);
    } catch (error: any) {
      console.error("Error creating comment:", error.message);
      throw error;
    }
  }

  static async deleteComment(postId: string, commentId: string, authorId: string): Promise<void> {
    try {
      await PostRepository.deleteComment(postId, commentId, authorId);
    } catch (error: any) {
      console.error("Error deleting comment:", error.message);
      throw error;
    }
  }

  static async getComments(postId: string): Promise<Comment[]> {
    try {
      const commentsRef = ref(realtimeDB, `comments/${postId}`);
      const snapshot = await get(commentsRef);
      if (!snapshot.exists()) return [];
      const commentsData = snapshot.val();
      const comments = Object.values(commentsData)
        .map((data: any) => Comment.fromJSON(data))
        .sort((a, b) => b.getTimestamp() - a.getTimestamp());
      return comments as Comment[];
    } catch (error: any) {
      console.error("Error fetching comments:", error.message);
      throw error;
    }
  }

  static listenToComments(postId: string, callback: (comments: Comment[]) => void): () => void {
    const commentsRef = ref(realtimeDB, `comments/${postId}`);
    const listener = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        const comments = Object.values(commentsData)
          .map((data: any) => Comment.fromJSON(data))
          .sort((a, b) => b.getTimestamp() - a.getTimestamp());
        callback(comments as Comment[]);
      } else {
        callback([]);
      }
    });
    return () => off(commentsRef, 'value', listener);
  }
}