export class Course {
  private courseId: string;
  private courseName: string;
  private mentorId: string;
  private chatGroupId: string;
  private likeCount: number;
  private coverImage: string;

  constructor(
    courseId: string,
    courseName: string,
    mentorId: string,
    chatGroupId: string,
    likeCount: number,
    coverImage: string
  ) {
    this.courseId = courseId;
    this.courseName = courseName;
    this.mentorId = mentorId;
    this.chatGroupId = chatGroupId;
    this.likeCount = likeCount;
    this.coverImage = coverImage;
  }

  // Getters
  getCourseId(): string {
    return this.courseId;
  }

  getCourseName(): string {
    return this.courseName;
  }

  getMentorId(): string {
    return this.mentorId;
  }

  getChatGroupId(): string {
    return this.chatGroupId;
  }

  getLikeCount(): number {
    return this.likeCount;
  }

  getCoverImage(): string {
    return this.coverImage;
  }

  // Setters
  setCourseId(courseId: string): void {
    this.courseId = courseId;
  }

  setCourseName(courseName: string): void {
    this.courseName = courseName;
  }

  setMentorId(mentorId: string): void {
    this.mentorId = mentorId;
  }

  setChatGroupId(chatGroupId: string): void {
    this.chatGroupId = chatGroupId;
  }

  setLikeCount(likeCount: number): void {
    this.likeCount = likeCount;
  }

  setCoverImage(coverImage: string): void {
    this.coverImage = coverImage;
  }

  toJSON(): object {
    return {
      courseId: this.courseId,
      courseName: this.courseName,
      mentorId: this.mentorId,
      chatGroupId: this.chatGroupId,
      likeCount: this.likeCount,
      coverImage: this.coverImage,
    };
  }

  static fromJSON(data: any): Course {
    return new Course(
      data.courseId,
      data.courseName,
      data.mentorId,
      data.chatGroupId,
      data.likeCount,
      data.coverImage
    );
  }
}