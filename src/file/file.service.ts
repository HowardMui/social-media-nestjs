import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class FileService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });

  constructor(private readonly configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File) {
    try {
      const randomName = randomBytes(16).toString('hex');
      const uploadToS3 = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'social-media-apps-uploader',
          Key: `original/howard_social_media_app_${randomName}.${
            file.mimetype.split('/')[1]
          }`,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      if (uploadToS3) {
        return {
          fileName: `howard_social_media_app_${randomName}.${
            file.mimetype.split('/')[1]
          }`,
          supportSizes: ['320', '768', '1280', 'original'],
        };
      } else {
        return HttpStatus.BAD_REQUEST;
      }
    } catch (err) {
      console.log(err);
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
