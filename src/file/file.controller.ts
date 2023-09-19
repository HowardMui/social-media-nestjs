import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('File')
@Controller('file')
export class FileController {
  @Post('upload')
  @ApiOperation({
    summary:
      'Upload a file. Return file name, url and support Sizes if upload successfully.',
  })
  @UseGuards(AuthGuard('jwt'))
  uploadFile(@Query() query: any, @Body() body: any) {
    // return req.user;
    // return this.userProfileService.getCurrentUserProfile(req.user['userId']);
  }

  @Post('resize')
  @ApiOperation({
    summary:
      'Resize an image. Return file name, url and support Sizes if upload successfully.',
  })
  @UseGuards(AuthGuard('jwt'))
  resizeImage(@Query() query: any, @Body() body: any) {
    return;
  }
}
