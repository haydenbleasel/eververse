export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(date);

export const capitalize = (input: string): string => {
  if (input === 'ai') {
    return input.toUpperCase();
  }

  return input.charAt(0).toUpperCase() + input.slice(1);
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const base = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(base));

  return `${Number.parseFloat((bytes / base ** index).toFixed(2))} ${sizes[index]}`;
};
