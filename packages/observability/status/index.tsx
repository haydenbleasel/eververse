import 'server-only';
import { keys } from '../keys';
import type { BetterStackResponse } from './types';

export const Status = async () => {
  let statusColor = 'bg-muted-foreground';
  let statusLabel = 'Unable to fetch status';

  try {
    const response = await fetch(
      'https://uptime.betterstack.com/api/v2/monitors',
      {
        headers: {
          Authorization: `Bearer ${keys().BETTERSTACK_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }

    const { data } = (await response.json()) as BetterStackResponse;
    const sites = data.filter((monitor) =>
      monitor.attributes.url.includes('eververse.ai')
    );

    const status =
      sites.filter((monitor) => monitor.attributes.status === 'up').length /
      sites.length;

    if (status === 0) {
      statusColor = 'bg-destructive';
      statusLabel = 'Degraded performance';
    } else if (status < 1) {
      statusColor = 'bg-warning';
      statusLabel = 'Partial outage';
    } else {
      statusColor = 'bg-success';
      statusLabel = 'All systems normal';
    }
  } catch {
    statusColor = 'bg-muted-foreground';
    statusLabel = 'Unable to fetch status';
  }

  return (
    <a
      className="flex items-center gap-3 font-medium text-sm"
      target="_blank"
      rel="noreferrer"
      href={keys().BETTERSTACK_URL}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusColor}`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${statusColor}`}
        />
      </span>
      <span className="text-muted-foreground">{statusLabel}</span>
    </a>
  );
};
