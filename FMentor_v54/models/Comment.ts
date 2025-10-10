export class Comment {
  private commentId: string;
  private postId: string;
  private authorId: string;
  private content: string;
  private timestamp: number;

  constructor(
    commentId: string,
    postId: string,
    authorId: string,
    content: string,
    timestamp: number = Date.now()
  ) {
    this.commentId = commentId;
    this.postId = postId;
    this.authorId = authorId;
    this.content = content;
    this.timestamp = timestamp;
  }

  getCommentId(): string { return this.commentId; }
  getPostId(): string { return this.postId; }
  getAuthorId(): string { return this.authorId; }
  getContent(): string { return this.content; }
  getTimestamp(): number { return this.timestamp; }

  toJSON(): object {
    return {
      commentId: this.commentId,
      postId: this.postId,
      authorId: this.authorId,
      content: this.content,
      timestamp: this.timestamp,
    };
  }

  static fromJSON(data: any): Comment {
    return new Comment(
      data.commentId,
      data.postId,
      data.authorId,
      data.content || '',
      data.timestamp || 0
    );
  }
}