export class Lesson {
  private lessonId: string;
  private courseId: string;
  private title: string;
  private content: string;
  private videoUrl?: string;

  constructor(
    lessonId: string,
    courseId: string,
    title: string,
    content: string,
    videoUrl?: string
  ) {
    this.lessonId = lessonId;
    this.courseId = courseId;
    this.title = title;
    this.content = content;
    this.videoUrl = videoUrl;
  }

  // Getters
  getLessonId(): string {
    return this.lessonId;
  }

  getCourseId(): string {
    return this.courseId;
  }

  getTitle(): string {
    return this.title;
  }

  getContent(): string {
    return this.content;
  }

  getVideoUrl(): string | undefined {
    return this.videoUrl;
  }

  // Setters
  setLessonId(lessonId: string): void {
    this.lessonId = lessonId;
  }

  setCourseId(courseId: string): void {
    this.courseId = courseId;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setContent(content: string): void {
    this.content = content;
  }

  setVideoUrl(videoUrl: string | undefined): void {
    this.videoUrl = videoUrl;
  }

  toJSON(): object {
    return {
      lessonId: this.lessonId,
      courseId: this.courseId,
      title: this.title,
      content: this.content,
      videoUrl: this.videoUrl,
    };
  }

  static fromJSON(data: any): Lesson {
    return new Lesson(
      data.lessonId,
      data.courseId,
      data.title,
      data.content,
      data.videoUrl
    );
  }
}