import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { CsrfService } from './services/csrf.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [ConfigModule],
  providers: [CsrfService, HttpExceptionFilter, UploadService],
  exports: [CsrfService, HttpExceptionFilter, UploadService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .exclude(
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/register', method: RequestMethod.POST },
        { path: 'api/auth/refresh', method: RequestMethod.POST },
        { path: 'api/health(.*)', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
