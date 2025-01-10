import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const GET = (request: Request): ImageResponse => {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title');
  const description = searchParams.get('description');

  return new ImageResponse(
    <div tw="bg-gray-100 w-full h-full flex items-center justify-center flex-col">
      <div tw="flex w-96 h-96 bg-white rounded-lg shadow-lg flex items-center justify-center flex-col" />
      <div tw="mt-16 flex flex-col items-center">
        <p tw="font-semibold text-xl text-gray-900">{title}</p>
        <p tw="text-lg text-gray-600">{description}</p>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
};
