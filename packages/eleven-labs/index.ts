import { keys } from './keys';

const voiceId = 'cgSgspJ2msm6clMCkdW9';
const modelId = 'eleven_turbo_v2_5';

export const generateSpeech = async (text: string) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': keys().ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      model_id: modelId,
      text: text,
    }),
  };

  const url = new URL(
    `/v1/text-to-speech/${voiceId}/stream`,
    'https://api.elevenlabs.io'
  );

  const response = await fetch(url, options);

  return response;
};
