import { handleCannyImports } from './canny';
import { handleProductboardImports } from './productboard';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const GET = async (): Promise<Response> => {
  const productboardImportExists = await handleProductboardImports();

  if (productboardImportExists) {
    return new Response('OK', { status: 200 });
  }

  await handleCannyImports();

  return new Response('OK', { status: 200 });
};
