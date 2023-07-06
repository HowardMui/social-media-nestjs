import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaSrcService } from '../src/prisma-src/prisma-src.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaSrcService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // add pipes same as main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    // await app.listen(8001);

    prisma = app.get(PrismaSrcService);
    await prisma.cleanDb();
    // pactum.request.setBaseUrl(
    //   'http://localhost:3333',
    // );
  });

  afterAll(() => {
    app.close();
  });

  it.todo('First todo');
  it.todo('Second todo');
  // it.todo('Third todo');
  console.log('test dev');

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
});
