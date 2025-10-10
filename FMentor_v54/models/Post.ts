export class Post {
  private postId: string;
  private authorId: string;
  private content: string;
  private mediaUrl: string;
  private mediaType: 'image' | 'video' | 'none';
  private likes: string[];
  private comments: string[];
  private timestamp: number;

  constructor(
    postId: string,
    authorId: string,
    content: string,
    mediaUrl: string = '',
    mediaType: 'image' | 'video' | 'none' = 'none',
    likes: string[] = [],
    comments: string[] = [],
    timestamp: number = Date.now()
  ) {
    this.postId = postId;
    this.authorId = authorId;
    this.content = content;
    this.mediaUrl = mediaUrl;
    this.mediaType = mediaType;
    this.likes = likes;
    this.comments = comments;
    this.timestamp = timestamp;
  }

  getPostId(): string { return this.postId; }
  getAuthorId(): string { return this.authorId; }
  getContent(): string { return this.content; }
  getMediaUrl(): string { return this.mediaUrl; }
  getMediaType(): 'image' | 'video' | 'none' { return this.mediaType; }
  getLikes(): string[] { return this.likes; }
  getComments(): string[] { return this.comments; }
  getTimestamp(): number { return this.timestamp; }

  addLike(userId: string): void {
    if (!this.likes.includes(userId)) {
      this.likes.push(userId);
    }
  }
  removeLike(userId: string): void {
    this.likes = this.likes.filter(id => id !== userId);
  }
  addComment(commentId: string): void {
    if (!this.comments.includes(commentId)) {
      this.comments.push(commentId);
    }
  }
  removeComment(commentId: string): void {
    this.comments = this.comments.filter(id => id !== commentId);
  }

  toJSON(): object {
    return {
      postId: this.postId,
      authorId: this.authorId,
      content: this.content,
      mediaUrl: this.mediaUrl,
      mediaType: this.mediaType,
      likes: this.likes,
      comments: this.comments,
      timestamp: this.timestamp,
    };
  }

  static fromJSON(data: any): Post {
    return new Post(
      data.postId,
      data.authorId,
      data.content || '',
      data.mediaUrl || '',
      data.mediaType || 'none',
      Array.isArray(data.likes) ? data.likes : [],
      Array.isArray(data.comments) ? data.comments : [],
      data.timestamp || 0
    );
  }
}