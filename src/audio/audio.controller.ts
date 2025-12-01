import { Controller, Get, Query } from '@nestjs/common';
import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private audioService: AudioService) {}

  @Get("convert")
  async convert(
    @Query("file") file: string,
    @Query("voice") voice: string = "alloy"
  ) {
    return this.audioService.convertToVoice(file, voice as any);
  }
}
