import { get, ref } from "firebase/database";
import { realtimeDB } from "../config/Firebase";

export enum UserRole {
    Mentor = "Mentor",
    Mentee = "Mentee",
  }

  export class User {
    private userId: string;
    private username: string;
    private email: string;
    private avatarUrl: string;
    private role: UserRole;
    private online: boolean;

    constructor(
      userId: string,
      username: string,
      email: string,
      avatarUrl: string,
      role: UserRole,
      online: boolean
    ) {
      this.userId = userId;
      this.username = username;
      this.email = email;
      this.avatarUrl = avatarUrl;
      this.role = role;
      this.online = online;
    }

    // Getters
    getUserId(): string {
      return this.userId;
    }

    getUsername(): string {
      return this.username;
    }

    getEmail(): string {
      return this.email;
    }

    getAvatarUrl(): string {
      return this.avatarUrl;
    }

    getRole(): UserRole {
      return this.role;
    }

    getOnline(): boolean {
      return this.online;
    }

    // Setters
    setUserId(userId: string): void {
      this.userId = userId;
    }

    setUsername(username: string): void {
      this.username = username;
    }

    setEmail(email: string): void {
      this.email = email;
    }

    setAvatarUrl(avatarUrl: string): void {
      this.avatarUrl = avatarUrl;
    }

    setRole(role: UserRole): void {
      this.role = role;
    }

    setOnline(online: boolean): void {
      this.online = online;
    }

    toJSON(): object {
      return {
        userId: this.userId,
        username: this.username,
        email: this.email,
        avatarUrl: this.avatarUrl,
        role: this.role,
        online: this.online,
      };
    }

    static fromJSON(data: any): User {
      return new User(
        data.userId,
        data.username,
        data.email,
        data.avatarUrl,
        data.role,
        data.online
      );
    }

      public static async getMentorNameById(mentorId: string): Promise<string> {
        try {
            const mentorRef = ref(realtimeDB, `users/${mentorId}`);
            const snapshot = await get(mentorRef);

            if (snapshot.exists()) {
                const mentorData = snapshot.val();
                return mentorData.username || "Unknown";
            } else {
                return "Unknown";
            }
        } catch (error) {
            console.error("Error getting mentor name:", error);
            return "Unknown";
        }
    }
  }

//Mentor
export class Mentor extends User {
  private expertise: string[];

  constructor(
    userId: string,
    username: string,
    email: string,
    password: string,
    avatarUrl: string,
    role: UserRole = UserRole.Mentor,
    online: boolean,
    expertise: string[]
  ) {
    super(userId, username, email, avatarUrl, role, online);
    this.expertise = expertise;
  }

  // Getter
  getExpertise(): string[] {
    return this.expertise;
  }

  // Setter
  setExpertise(expertise: string[]): void {
    this.expertise = expertise;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      expertise: this.expertise,
    };
  }

  static fromJSON(data: any): Mentor {
    return new Mentor(
      data.userId,
      data.username,
      data.email,
      data.password,
      data.avatarUrl,
      data.role,
      data.online,
      data.expertise
    );
  }

}