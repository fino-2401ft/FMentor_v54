enum DocumentType {
  PDF = "PDF",
  Image = "Image",
  Video = "Video",
  Code = "Code",
}

export class Document {
  documentId: string;
  courseId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  description?: string;
  lessonId?: string;
  uploadDate: number;
  uploaderId: string;

  constructor(
    documentId: string,
    courseId: string,
    fileName: string,
    fileType: string,
    fileUrl: string,
    uploadDate: number,
    uploaderId: string,
    description?: string,
    lessonId?: string
  ) {
    this.documentId = documentId;
    this.courseId = courseId;
    this.fileName = fileName;
    this.fileType = fileType;
    this.fileUrl = fileUrl;
    this.uploadDate = uploadDate;
    this.uploaderId = uploaderId;
    this.description = description;
    this.lessonId = lessonId;
  }
}
