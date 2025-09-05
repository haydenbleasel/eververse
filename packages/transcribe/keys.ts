import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v3';

export const keys = () =>
  createEnv({
    server: {
      ASSEMBLYAI_API_KEY: z.string().min(1),
    },
    runtimeEnv: {
      ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
    },
  });
