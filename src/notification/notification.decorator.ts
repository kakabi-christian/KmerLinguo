import { SetMetadata } from '@nestjs/common';

export const Notification = (...args: string[]) => SetMetadata('notification', args);
