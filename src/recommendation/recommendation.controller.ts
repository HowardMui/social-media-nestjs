import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  RecommendTagResponse,
  RecommendationPostFilter,
  RecommendationPostResponse,
  RecommendationTagFilter,
  RecommendationUserFilter,
  RecommendationUserResponse,
} from './dto';
import { RecommendationService } from './recommendation.service';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';
import { Request } from 'express';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  // * Combine all recommendations
  // @Get('')
  // @ApiOperation({
  //   summary:
  //     'Get recommendation list data (Posts, Users, Tags). App user only.',
  // })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.User)
  // @ApiResponse({
  //   status: 200,
  //   description: 'Successful response',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         oneOf: [
  //           {
  //             properties: {
  //               rows: {
  //                 type: 'array',
  //                 items: { $ref: getSchemaPath(PostResponse) },
  //               },
  //               limit: { type: 'number' },
  //               offset: { type: 'number' },
  //             },
  //           },
  //           {
  //             properties: {
  //               rows: {
  //                 type: 'array',
  //                 items: { $ref: getSchemaPath(GetUserListResponse) },
  //               },
  //               limit: { type: 'number' },
  //               offset: { type: 'number' },
  //             },
  //           },
  //           {
  //             properties: {
  //               rows: {
  //                 type: 'array',
  //                 items: { $ref: getSchemaPath(GetAllTagResponse) },
  //               },
  //               limit: { type: 'number' },
  //               offset: { type: 'number' },
  //             },
  //           },
  //         ],
  //       },
  // schema: {
  //   anyOf: refs(
  //     ListResponseWithoutCount<PostResponse>,
  //     ListResponseWithoutCount<GetAllTagResponse>,
  //     ListResponseWithoutCount<GetUserListResponse>,
  //   ),
  // },
  //       examples: {
  //         post: { value: { ...PostResponseExampleDTO } },
  //         users: { value: { ...UserResponseExampleDTO } },
  //         tags: { value: { ...PostResponseExampleDTO } },
  //       },
  //     },
  //   },
  // })
  // getRecommendationList(
  //   @Query() query: GetRecommendationQueryParamsWithFilter,
  // ) {
  //   return this.recommendationService.getRecommendationList(query);
  // }

  // * Allow guest to view

  // * Get recommend posts
  // @Get('/posts')
  // @ApiOkResponsePaginated(RecommendationPostResponse, true)
  // @ApiOperation({
  //   summary: 'Get recommended posts list data.',
  // })
  // getRecommendedPosts(@Query() query: RecommendationPostFilter) {
  //   return this.recommendationService.getRecommendationPostList(query);
  // }

  @Get('/users')
  @ApiOperation({
    summary: 'Get recommended users list data.',
  })
  @ApiOkResponsePaginated(RecommendationUserResponse, true)
  getRecommendedUsers(
    @Query() query: RecommendationUserFilter,
    @Req() req: Request,
  ) {
    return this.recommendationService.getRecommendationUserList(
      query,
      req?.user ? req?.user['userId'] : undefined,
    );
  }

  @Get('/tags')
  @ApiOperation({
    summary: 'Get recommended tags list data.',
  })
  @ApiOkResponsePaginated(RecommendTagResponse, true)
  getRecommendedTags(
    @Query() query: RecommendationTagFilter,
    @Req() req: Request,
  ) {
    return this.recommendationService.getRecommendationTagList(
      query,
      req?.user ? req?.user['userId'] : undefined,
    );
  }
}
