'use client';

import { MemoizedReactMarkdown } from '@/components/markdown';
import { useChat } from '@ai-sdk/react';
import type { Initiative, Organization } from '@repo/backend/prisma/client';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Prose } from '@repo/design-system/components/prose';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import { DefaultChatTransport } from 'ai';
import { SparklesIcon, XIcon } from 'lucide-react';
import { type KeyboardEventHandler, useState } from 'react';

type InitiativeQuestionCardProps = {
  initiativeId: Initiative['id'];
  organizationId: Organization['id'];
};

export const InitiativeQuestionCard = ({
  initiativeId,
  organizationId,
}: InitiativeQuestionCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/initiatives/chat',
      body: {
        initiativeId,
        organizationId,
      },
    }),
    onError: handleError,
  });

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage({ text: input });
      setIsOpen(true);
    }
  };

  return (
    <div>
      <StackCard
        title="Ask a question"
        icon={SparklesIcon}
        className="p-0"
        variant="primary"
      >
        <Input
          placeholder="What would you like to know?"
          value={input}
          onChangeText={setInput}
          className="h-auto rounded-none border-none p-3 text-primary shadow-none placeholder:text-primary/50"
          onKeyDown={handleKeyDown}
        />
      </StackCard>
      <div className="relative">
        {isOpen && (
          <div className="absolute top-1 right-0 left-0 z-10 max-h-80 overflow-y-auto rounded-lg border bg-background shadow-lg">
            <div className="sticky top-0 flex items-center justify-between border-b bg-background/90 p-3">
              <p className="m-0 font-medium text-sm">Chat</p>
              <div className="-m-2">
                <Button
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                >
                  <XIcon size={16} className="text-muted-foreground" />
                </Button>
              </div>
            </div>
            <Prose className="flex flex-col gap-3 p-3 prose-p:last:mb-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'max-w-[80%] rounded-lg p-2 text-sm',
                    message.role === 'user'
                      ? 'self-end bg-primary/10 text-primary'
                      : 'self-start bg-secondary text-foreground'
                  )}
                >
                  <MemoizedReactMarkdown>
                    {message.parts
                      .filter((part) => part.type === 'text')
                      .map((part) => part.text)
                      .join('')}
                  </MemoizedReactMarkdown>
                </div>
              ))}
            </Prose>
          </div>
        )}
      </div>
    </div>
  );
};
