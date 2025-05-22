'use client';

import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import { QueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createFeedback } from '@/actions/feedback/create';
import { staticify } from '@/lib/staticify';
import { createClient } from '@repo/backend/auth/client';
import type {
  FeedbackOrganization,
  FeedbackUser,
} from '@repo/backend/prisma/client';
import { Dropzone } from '@repo/design-system/components/dropzone';
import type { EditorInstance } from '@repo/editor';
import {
  AudioLinesIcon,
  LanguagesIcon,
  UndoIcon,
  VideoIcon,
} from 'lucide-react';
import type { KeyboardEventHandler } from 'react';
import { FeedbackOrganizationPicker } from './feedback-organization-picker';
import { FeedbackUserPicker } from './feedback-user-picker';
import { useFeedbackForm } from './use-feedback-form';

const Editor = dynamic(
  async () => {
    const Module = await import(
      /* webpackChunkName: "editor" */
      '@/components/editor'
    );

    return Module.Editor;
  },
  {
    ssr: false,
  }
);

type FeedbackFormProperties = {
  readonly users: Pick<
    FeedbackUser,
    'email' | 'feedbackOrganizationId' | 'id' | 'imageUrl' | 'name'
  >[];
  readonly organizations: Pick<
    FeedbackOrganization,
    'domain' | 'id' | 'name'
  >[];
  readonly userEmail: string | undefined;
  readonly isSubscribed: boolean;
};

const types = [
  {
    id: 'text',
    label: 'Text',
    description: 'Write your feedback in a text editor.',
    icon: LanguagesIcon,
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Upload an audio file and transcribe it with AI.',
    icon: AudioLinesIcon,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Upload a video file and transcribe it with AI.',
    icon: VideoIcon,
  },
];

export const FeedbackForm = ({
  users,
  organizations,
  userEmail,
  isSubscribed,
}: FeedbackFormProperties) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<object | undefined>();
  const [feedbackUserId, setFeedbackUserId] = useState<string | null>(
    users.find(({ email }) => email === userEmail)?.id ?? null
  );
  const [feedbackOrganization, setFeedbackOrganization] = useState<
    string | null
  >(
    users.find(({ email }) => email === userEmail)?.feedbackOrganizationId ??
      null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [type, setType] = useState<string | undefined>(
    isSubscribed ? undefined : 'text'
  );
  const [audio, setAudio] = useState<File | undefined>();
  const [video, setVideo] = useState<File | undefined>();
  const disabled =
    !feedbackUserId ||
    loading ||
    !type ||
    !title.trim() ||
    (type === 'text' && !content) ||
    (type === 'audio' && !audio) ||
    (type === 'video' && !video);
  const { isOpen, toggle } = useFeedbackForm();
  const { hide } = useFeedbackForm();
  const queryClient = new QueryClient();

  useEffect(() => {
    if (!feedbackUserId) {
      return;
    }

    const user = users.find(({ id }) => id === feedbackUserId);

    if (user?.feedbackOrganizationId) {
      setFeedbackOrganization(user.feedbackOrganizationId);
    } else {
      setFeedbackOrganization('');
    }
  }, [feedbackUserId, users]);

  const handleCreateAudio = async () => {
    if (!audio) {
      throw new Error('Audio file is missing.');
    }

    const supabase = await createClient();

    const id = nanoid(36);
    const { data, error } = await supabase.storage
      .from('files')
      .upload(id, audio);

    if (error) {
      throw new Error(error.message);
    }

    const {
      data: { publicUrl },
    } = await supabase.storage.from('files').getPublicUrl(data.path);

    const response = await createFeedback({
      title,
      feedbackUserId,
      audioUrl: publicUrl,
    });

    if ('error' in response) {
      throw new Error(response.error);
    }

    return response.id ?? null;
  };

  const handleCreateVideo = async () => {
    if (!video) {
      throw new Error('Video file is missing.');
    }

    const supabase = await createClient();

    const id = nanoid(36);
    const { data, error } = await supabase.storage
      .from('files')
      .upload(id, video);

    if (error) {
      throw new Error(error.message);
    }

    const {
      data: { publicUrl },
    } = await supabase.storage.from('files').getPublicUrl(data.path);

    const response = await createFeedback({
      title,
      feedbackUserId,
      videoUrl: publicUrl,
    });

    if ('error' in response) {
      throw new Error(response.error);
    }

    return response.id ?? null;
  };

  const handleCreateText = async () => {
    const response = await createFeedback({
      title,
      content: staticify(content),
      feedbackUserId,
    });

    if ('error' in response) {
      throw new Error(response.error);
    }

    return response.id ?? null;
  };

  const handleCreate = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      let id: string | null = null;

      if (type === 'text') {
        id = await handleCreateText();
      } else if (type === 'audio') {
        id = await handleCreateAudio();
      } else if (type === 'video') {
        id = await handleCreateVideo();
      }

      if (!id) {
        throw new Error('Feedback ID is missing.');
      }

      hide();

      setTitle('');
      setContent(undefined);
      setType(undefined);
      setAudio(undefined);
      setVideo(undefined);
      setFeedbackUserId(null);
      setFeedbackOrganization(null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['feedback'] }),
        queryClient.invalidateQueries({ queryKey: ['feedbackUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['feedbackCompanies'] }),
      ]);

      router.push(`/feedback/${id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (editor?: EditorInstance | undefined) => {
    if (!editor) {
      return;
    }

    setContent(editor.getJSON());
  };

  const handleUndo = () => {
    setType(undefined);
    setAudio(undefined);
    setVideo(undefined);
    setContent(undefined);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={toggle}
      modal={false}
      title={
        <p className="font-medium text-muted-foreground text-sm tracking-tight">
          Create feedback
        </p>
      }
      cta="Create feedback"
      onClick={handleCreate}
      disabled={disabled}
      className="max-w-2xl"
      footer={
        <div className="flex items-center gap-2">
          <FeedbackUserPicker
            usersData={users.map((user) => ({
              value: user.id,
              label: user.name,
              image: user.imageUrl,
              email: user.email,
            }))}
            value={feedbackUserId}
            onChange={setFeedbackUserId}
          />
          {feedbackUserId ? (
            <FeedbackOrganizationPicker
              organizationsData={organizations.map((org) => ({
                value: org.id,
                label: org.name,
                image: org.domain,
              }))}
              value={feedbackOrganization}
              onChange={setFeedbackOrganization}
              feedbackUser={feedbackUserId}
            />
          ) : null}
        </div>
      }
    >
      {type && isSubscribed ? (
        <Button
          size="icon"
          onClick={handleUndo}
          variant="link"
          className="absolute top-1.5 right-8"
        >
          <UndoIcon size={14} className="text-muted-foreground" />
        </Button>
      ) : null}

      <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
        <Input
          placeholder="Add ability to customize dashboard"
          value={title}
          onChangeText={setTitle}
          className="border-none p-0 font-medium text-lg shadow-none focus-visible:ring-0"
          autoComplete="off"
          onKeyDown={handleKeyDown}
        />

        {!type && (
          <div className="grid w-full grid-cols-3 gap-4">
            {types.map((option) => (
              <button
                key={option.id}
                className={cn(
                  'space-y-2 rounded border bg-card p-4',
                  option.id === type ? 'bg-secondary' : 'bg-background'
                )}
                onClick={() => setType(option.id)}
                type="button"
              >
                <option.icon
                  size={24}
                  className="pointer-events-none mx-auto select-none text-muted-foreground"
                />
                <span className="pointer-events-none mt-2 block select-none font-medium text-sm">
                  {option.label}
                </span>
                <span className="pointer-events-none block select-none text-muted-foreground text-sm">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        )}

        {type === 'audio' && <Dropzone accept="audio/*" onChange={setAudio} />}

        {type === 'video' && <Dropzone accept="video/*" onChange={setVideo} />}

        {type === 'text' && (
          <div
            className={cn(
              'prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-h4:text-base prose-h5:text-base prose-h6:text-base',
              'prose-h1:font-medium prose-h2:font-medium prose-h3:font-medium prose-h4:font-medium prose-h5:font-medium prose-h6:font-medium',
              'prose-h1:mb-0.5 prose-h2:mb-0.5 prose-h3:mb-0.5 prose-h4:mb-0.5 prose-h5:mb-0.5 prose-h6:mb-0.5'
            )}
          >
            <Editor onUpdate={handleUpdate} />
          </div>
        )}
      </div>
    </Dialog>
  );
};
