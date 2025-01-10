'use client';

type GreetingProps = {
  firstName: string | null;
};

export const Greeting = ({ firstName }: GreetingProps) => {
  const date = new Date();
  const hours = date.getHours();
  let noun = 'day';

  if (hours < 12) {
    noun = 'morning';
  } else if (hours < 18) {
    noun = 'afternoon';
  } else {
    noun = 'evening';
  }

  const greeting = firstName ? `Good ${noun}, ${firstName}` : `Good ${noun}`;

  return <h1 className="m-0 font-semibold text-4xl">{greeting}</h1>;
};
