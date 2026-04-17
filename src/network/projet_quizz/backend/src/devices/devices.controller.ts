import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RegisterDeviceDto } from './dto/devices.dto';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Get('lookup')
  lookupDevice(@Query('adresse_mac') adresse_mac?: string) {
    return this.devices.lookupDevice(adresse_mac ?? '');
  }

  @Post('register')
  registerDevice(@Body() body: RegisterDeviceDto) {
    return this.devices.registerDevice(body.adresse_mac, body.pseudot);
  }
}
