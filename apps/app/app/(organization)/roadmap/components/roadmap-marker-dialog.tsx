import { createMarker } from '@/actions/roadmap-event/create';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { handleError } from '@repo/design-system/lib/handle-error';
import { formatDate } from '@repo/lib/format';
import { useState } from 'react';

type RoadmapMarkerDialogProperties = {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly date: Date | undefined;
};

export const RoadmapMarkerDialog = ({
  open,
  setOpen,
  date,
}: RoadmapMarkerDialogProperties) => {
  const [markerName, setMarkerName] = useState('');
  const [loading, setLoading] = useState(false);
  const disabled = loading || !markerName.trim();

  const onClick = async () => {
    if (disabled || !date) {
      return;
    }

    setLoading(true);

    try {
      await createMarker(markerName, date);

      setOpen(false);
      setMarkerName('');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={
        date ? `Create a marker on ${formatDate(date)}` : 'Create a marker'
      }
      description="Markers are a way to highlight important points in your timeline."
      cta="Create marker"
      onClick={onClick}
      disabled={disabled}
    >
      <Input
        placeholder="Product beta launch"
        value={markerName}
        onChangeText={setMarkerName}
        required
      />
    </Dialog>
  );
};
