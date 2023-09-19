import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
// import { CustomResWithQueryType } from '../common.dto';

export const ApiOkResponsePaginated = <DataDto extends Type<any>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          //   { $ref: getSchemaPath(CustomResWithQueryType) },
          {
            properties: {
              count: {
                type: 'number',
              },
              rows: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
              limit: { type: 'number' },
              offset: { type: 'number' },
            },
          },
        ],
      },
    }),
  );
