import { database } from '@repo/backend/database';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const GET = async (request: NextRequest): Promise<Response> => {
  const authorization = request.headers.get('Authorization');
  const key = authorization?.split('Bearer ')[1];

  if (!key) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = await database.apiKey.findFirst({
    where: { key },
    select: {
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    organization: apiKey.organization.name,
  });
};
