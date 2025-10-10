export enum NotificationType {
  Like = "Like",
  Comment = "Comment",
}

export class Notification {
  private notificationId: string;
  private userId: string;
  private type: NotificationType;
  private postId: string;
  private commentId?: string; 
  private timestamp: number;
  private read: boolean;

  constructor(
    notificationId: string,
    userId: string,
    type: NotificationType,
    postId: string,
    commentId: string | null = null,
    timestamp: number = Date.now(),
    read: boolean = false
  ) {
    this.notificationId = notificationId;
    this.userId = userId;
    this.type = type;
    this.postId = postId;
    this.commentId = commentId || undefined;
    this.timestamp = timestamp;
    this.read = read;
  }

  getNotificationId(): string { return this.notificationId; }
  getUserId(): string { return this.userId; }
  getType(): NotificationType { return this.type; }
  getPostId(): string { return this.postId; }
  getCommentId(): string | undefined { return this.commentId; }
  getTimestamp(): number { return this.timestamp; }
  isRead(): boolean { return this.read; }

  setRead(read: boolean): void { this.read = read; }

  toJSON(): object {
    return {
      notificationId: this.notificationId,
      userId: this.userId,
      type: this.type,
      postId: this.postId,
      commentId: this.commentId,
      timestamp: this.timestamp,
      read: this.read,
    };
  }

  static fromJSON(data: any): Notification {
    return new Notification(
      data.notificationId,
      data.userId,
      data.type,
      data.postId,
      data.commentId || null,
      data.timestamp || 0,
      data.read || false
    );
  }
}