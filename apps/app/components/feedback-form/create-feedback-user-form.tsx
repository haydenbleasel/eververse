import { createFeedbackUser } from '@/actions/feedback-user/create';
import type { User } from '@repo/backend/auth';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { emailRegex } from '@repo/lib/email';
import { useState } from 'react';
import type { FormEventHandler } from 'react';

type CreateFeedbackUserFormProperties = {
  readonly onChange: (userId: User['id']) => void;
};

export const CreateFeedbackUserForm = ({
  onChange,
}: CreateFeedbackUserFormProperties) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const disabled = !name.trim() || !email.trim() || loading;

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!emailRegex.test(email) || loading) {
      return;
    }

    setLoading(true);

    try {
      const { error, id } = await createFeedbackUser({
        name,
        email,
      });

      if (error) {
        throw new Error(error);
      }

      if (!id) {
        throw new Error('Something went wrong');
      }

      onChange(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Name"
        placeholder="Jane Smith"
        value={name}
        onChangeText={setName}
        maxLength={191}
      />
      <Input
        label="Email"
        placeholder="jane@acme.com"
        type="email"
        pattern={emailRegex.source}
        value={email}
        onChangeText={setEmail}
        maxLength={191}
      />
      <Button type="submit" disabled={disabled}>
        Create user
      </Button>
    </form>
  );
};
