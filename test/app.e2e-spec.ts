import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3000);

    prismaService = app.get(PrismaService);
    await prismaService.cleanDB();
    pactum.request.setBaseUrl('http://127.0.0.1:3000');
  })

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'user1@gmail.com',
      password: '1234'
    }
    describe('Signup', () => {
      it('Should throw exception if email is empty', () => {
        return pactum.spec()
        .post('/auth/signup')
        .withBody({ password: dto.password })
        .expectStatus(400)
      });
      it('Should throw exception if password is empty', () => {
        return pactum.spec()
        .post('/auth/signup')
        .withBody({ email: dto.email })
        .expectStatus(400)
      });
      it('Should throw exception if no body is provided', () => {
        return pactum.spec()
        .post('/auth/signup')
        .withBody({})
        .expectStatus(400)
      });
      it('Should signup', () => {
        return pactum.spec()
        .post('/auth/signup')
        .withBody(dto)
        .expectStatus(201)
      });
    });

    describe('Signin', () => {
      it('Should throw exception if email is empty', () => {
        return pactum.spec()
        .post('/auth/signin')
        .withBody({ password: dto.password })
        .expectStatus(400)
      });
      it('Should throw exception if password is empty', () => {
        return pactum.spec()
        .post('/auth/signin')
        .withBody({ email: dto.email })
        .expectStatus(400)
      });
      it('Should throw exception if no body is provided', () => {
        return pactum.spec()
        .post('/auth/signin')
        .withBody({})
        .expectStatus(400)
      });
      it('Should signin', () => {
        return pactum.spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('userAccessToken', 'access_token')
      });
    })
  });

  describe('User', () => {
    describe('Get me/current user', () => {
      it('Should get current user', () => {
        return pactum.spec()
        .get('/users/me')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .expectStatus(200)
      })
    });

    describe('Edit user', () => {
      it('Should edit user', () => {
        const dto: EditUserDto = {
          email: 'user1-updated@gmail.com',
          firstname: "userOne"
        }
        return pactum.spec()
        .patch('/users')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.firstname)
        .expectBodyContains(dto.email)
      })
    });
  });

  describe('Bookmark', () => {

    describe('Get empty bookmarks', () => {
      it('Should get empty bookmarks', () => {
        return pactum.spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .expectStatus(200)
        .expectBody([])
      })
    });
    describe('Create bookmark', () => {
      it('Should create bookmark', () => {
        const dto: CreateBookmarkDto = {
          title: 'First Bookmark',
          link: 'Link1'
        }
        return pactum.spec()
        .post('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('bookmarkId', 'id')
      })
    });
    
    describe('Get bookmarks', () => {
      it('Should get empty bookmarks', () => {
        return pactum.spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .expectStatus(200)
        .expectJsonLength(1)
      })
    });

    describe('Get bookmark by id', () => {
      it('Should get bookmark by id', () => {
        return pactum.spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
      })
    });

    describe('Edit bookmark', () => {
      it('Should edit bookmark', () => {
        const dto: EditBookmarkDto = {
          title: 'updated title',
          description: 'Updated bookmark description'
        }
        return pactum.spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.description)
      })
    });

    describe('Delete bookmark', () => {
      it('Should delete bookmark', () => {
        return pactum.spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .expectStatus(204)
      });

      it('Should get empty bookmarks', () => {
        return pactum.spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}'
        })
        .expectStatus(200)
        .expectBody([])
      })
    });
  });
})