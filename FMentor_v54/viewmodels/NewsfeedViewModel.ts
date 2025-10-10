import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { PostRepository } from "../repositories/PostRepository";
import { Post } from "../models/Post";

export const useNewsfeedViewModel = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mediaUri, setMediaUri] = useState<string | undefined>(undefined);
  const [isPosting, setIsPosting] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = PostRepository.getPosts((newPosts: Post[]) => {
      setPosts(newPosts);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const post = async () => {
    if (!currentUser || !content.trim()) return false;
    setIsPosting(true);
    try {
      const postId = await PostRepository.createPost(
        currentUser.getUserId(),
        content.trim(),
        mediaUri || undefined
      );
      setContent("");
      setMediaUri(undefined);
      setIsPosting(false);
      setIsEditing(false);
      setEditingPost(null);
      return true;
    } catch (error: any) {
      console.error("Error posting:", error.message);
      setIsPosting(false);
      return false;
    }
  };

  const editPost = async () => {
    if (!editingPost || !content.trim()) return false;
    setIsPosting(true);
    try {
      await PostRepository.updatePost(
        editingPost.getPostId(),
        content.trim(),
        mediaUri || undefined
      );
      setContent("");
      setMediaUri(undefined);
      setEditingPost(null);
      setIsPosting(false);
      setIsEditing(false);
      return true;
    } catch (error: any) {
      console.error("Error editing post:", error.message);
      setIsPosting(false);
      return false;
    }
  };

  const deletePost = async (postId: string, authorId: string) => {
    try {
      await PostRepository.deletePost(postId, authorId);
    } catch (error: any) {
      console.error("Error deleting post:", error.message);
      throw error;
    }
  };

  const likePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      await PostRepository.likePost(postId, currentUser.getUserId());
    } catch (error: any) {
      console.error("Error liking post:", error.message);
    }
  };

  const unlikePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      await PostRepository.unlikePost(postId, currentUser.getUserId());
    } catch (error: any) {
      console.error("Error unliking post:", error.message);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!currentUser || !content.trim()) return "";
    try {
      const commentId = await PostRepository.addComment(
        postId,
        currentUser.getUserId(),
        content.trim()
      );
      return commentId;
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
      return "";
    }
  };

  const deleteComment = async (postId: string, commentId: string, authorId: string) => {
    try {
      await PostRepository.deleteComment(postId, commentId, authorId);
    } catch (error: any) {
      console.error("Error deleting comment:", error.message);
      throw error;
    }
  };

  const selectPostForEdit = (post: Post) => {
    setEditingPost(post);
    setContent(post.getContent());
    setMediaUri(post.getMediaUrl());
    setIsEditing(true);
  };

  return {
    posts,
    loading,
    content,
    setContent,
    mediaUri,
    setMediaUri,
    isPosting,
    editingPost,
    isEditing,
    post,
    editPost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    deleteComment,
    selectPostForEdit,
  };
};