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
    // await app.listen(3333);

    prisma = app.get(PrismaSrcService);
    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: any = {
      email: 'test1@test.co',
      password: '123',
    };

    describe('signup', () => {
      it('should signup', async () => {
        return await request(app.getHttpServer())
          .post('/auths/signup')
          .send(dto)
          .expect(201);
      });
    });
    describe('signin', () => {
      it('should signin', async () => {
        return await request(app.getHttpServer())
          .post('/auths/signin')
          .send(dto)
          .expect(200);
      });
    });
  });
});
