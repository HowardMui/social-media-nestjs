import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiOkResponsePaginated = <DataDto extends Type<any>>(
  dataDto: DataDto,
  noCount?: boolean,
) =>
  applyDecorators(
    ApiExtraModels(dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          //   { $ref: getSchemaPath(CustomResWithQueryType) },
          noCount
            ? {
                properties: {
                  rows: {
                    type: 'array',
                    items: { $ref: getSchemaPath(dataDto) },
                  },
                  limit: { type: 'number' },
                  offset: { type: 'number' },
                },
              }
            : {
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
