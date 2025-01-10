import 'server-only';

export const getGravatarUrl = async (email: string): Promise<string> => {
  const trimmedEmail = email.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(trimmedEmail);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  const hashHex = hashArray
    .map((hashItem) => hashItem.toString(16).padStart(2, '0'))
    .join('');

  const url = new URL(`https://www.gravatar.com/avatar/${hashHex}`);

  const parameters = new URLSearchParams({
    d: 'identicon',
    s: '200',
  });

  url.search = parameters.toString();

  return url.toString();
};
