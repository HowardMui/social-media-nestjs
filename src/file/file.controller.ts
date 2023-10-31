import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileService } from './file.service';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('upload')
  @ApiOperation({
    summary:
      'Upload a file. Return file name and support Sizes if upload successfully. Login Only',
  })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1000000,
            message: 'File cannot over 1Mb',
          }),
          new FileTypeValidator({
            fileType: /.(jpg|jpeg|png|svg|gif)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileService.uploadImage(file);
  }
}
