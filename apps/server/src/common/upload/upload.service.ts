import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  /**
   * 保存上传的图片
   */
  saveImage(file: Express.Multer.File) {
    const fileUrl = `/uploads/images/${file.filename}`;
    return {
      url: fileUrl,
      name: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    };
  }

  /**
   * 保存上传的文件
   */
  saveFile(file: Express.Multer.File) {
    const fileUrl = `/uploads/files/${file.filename}`;
    return {
      url: fileUrl,
      name: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    };
  }
}
