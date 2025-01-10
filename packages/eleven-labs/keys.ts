import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      ELEVENLABS_API_KEY: z.string().min(1),
    },
    runtimeEnv: {
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    },
  });
