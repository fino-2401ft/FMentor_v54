export class Enrollment {
  private enrollmentId: string;
  private courseId: string;
  private menteeId: string;
  private enrollmentDate: number;
  private progress: number;
  private completedLessons: string[]; // Thêm trường mới

  constructor(
    enrollmentId: string,
    courseId: string,
    menteeId: string,
    enrollmentDate: number,
    progress: number,
    completedLessons: string[] = [] // Mặc định là mảng rỗng
  ) {
    this.enrollmentId = enrollmentId;
    this.courseId = courseId;
    this.menteeId = menteeId;
    this.enrollmentDate = enrollmentDate;
    this.progress = progress;
    this.completedLessons = completedLessons;
  }

  // Getters
  getEnrollmentId(): string {
    return this.enrollmentId;
  }

  getCourseId(): string {
    return this.courseId;
  }

  getMenteeId(): string {
    return this.menteeId;
  }

  getEnrollmentDate(): number {
    return this.enrollmentDate;
  }

  getProgress(): number {
    return this.progress;
  }

  getCompletedLessons(): string[] {
    return this.completedLessons;
  }

  // Setters
  setEnrollmentId(enrollmentId: string): void {
    this.enrollmentId = enrollmentId;
  }

  setCourseId(courseId: string): void {
    this.courseId = courseId;
  }

  setMenteeId(menteeId: string): void {
    this.menteeId = menteeId;
  }

  setEnrollmentDate(enrollmentDate: number): void {
    this.enrollmentDate = enrollmentDate;
  }

  setProgress(progress: number): void {
    this.progress = progress;
  }

  setCompletedLessons(completedLessons: string[]): void {
    this.completedLessons = completedLessons;
  }

  toJSON(): object {
    return {
      enrollmentId: this.enrollmentId,
      courseId: this.courseId,
      menteeId: this.menteeId,
      enrollmentDate: this.enrollmentDate,
      progress: this.progress,
      completedLessons: this.completedLessons, // Thêm vào JSON
    };
  }

  static fromJSON(data: any): Enrollment {
    return new Enrollment(
      data.enrollmentId,
      data.courseId,
      data.menteeId,
      data.enrollmentDate,
      data.progress,
      data.completedLessons || [] // Xử lý trường hợp không có completedLessons
    );
  }
}