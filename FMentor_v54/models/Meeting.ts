export class Meeting {
  private meetingId: string;
  private courseId: string;
  private mentorId: string;
  private active: boolean;
  private participants: string[];
  private startTime: number;

  constructor(
    meetingId: string,
    courseId: string,
    mentorId: string,
    active: boolean = true,
    participants: string[] = [],
    startTime: number = Date.now()
  ) {
    this.meetingId = meetingId;
    this.courseId = courseId;
    this.mentorId = mentorId;
    this.active = active;
    this.participants = participants;
    this.startTime = startTime;
  }

  getMeetingId(): string { return this.meetingId; }
  getCourseId(): string { return this.courseId; }
  getMentorId(): string { return this.mentorId; }
  isActive(): boolean { return this.active; }
  getParticipants(): string[] { return this.participants; }
  getStartTime(): number { return this.startTime; }

  setActive(active: boolean): void { this.active = active; }
  addParticipant(userId: string): void {
    if (!this.participants.includes(userId)) {
      this.participants.push(userId);
    }
  }
  removeParticipant(userId: string): void {
    this.participants = this.participants.filter(id => id !== userId);
  }

  toJSON(): object {
    return {
      meetingId: this.meetingId,
      courseId: this.courseId,
      mentorId: this.mentorId,
      active: this.active,
      participants: this.participants,
      startTime: this.startTime,
    };
  }

  static fromJSON(data: any): Meeting {
    return new Meeting(
      data.meetingId,
      data.courseId,
      data.mentorId,
      data.active,
      data.participants || [],
      data.startTime
    );
  }
}