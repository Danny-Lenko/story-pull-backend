import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
// import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @MessagePattern({ cmd: 'getHello' })
  // getHello() {
  //   console.log('AppController.getHello()');
  //   return this.appService.getHello();
  // }
}
