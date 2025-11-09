import { SetMetadata } from '@nestjs/common';

export const Statistique = (...args: string[]) => SetMetadata('statistique', args);
