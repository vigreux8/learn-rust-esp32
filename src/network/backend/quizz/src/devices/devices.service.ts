import { Injectable } from '@nestjs/common';
import { QuizzService } from '../quizz/quizz.service';

@Injectable()
export class DevicesService {
  constructor(private readonly quizz: QuizzService) {}

  lookupDevice(adresse_mac: string) {
    return this.quizz.lookupDevice(adresse_mac);
  }

  registerDevice(adresse_mac: string, pseudot: string) {
    return this.quizz.registerDevice(adresse_mac, pseudot);
  }
}
