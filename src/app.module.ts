import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MaterialsController } from './materials/materials.controller.js';
import { MaterialsService } from './materials/materials.service.js';

@Module({
  imports: [],
  controllers: [AppController, MaterialsController],
  providers: [AppService, MaterialsService],
})
export class AppModule {}
