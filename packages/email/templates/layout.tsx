import {
  Body,
  Container,
  Hr,
  Img,
  Section,
  Tailwind,
} from '@react-email/components';
import type { ReactNode } from 'react';

type EmailLayoutProps = {
  children: ReactNode;
  siteUrl: string;
};

export const EmailLayout = ({ children, siteUrl }: EmailLayoutProps) => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const returnUrl = `${protocol}://${siteUrl}`;

  return (
    <Tailwind>
      <Body className="bg-[#f6f9fc] font-sans">
        <Container className="mx-auto mb-16 bg-white py-5 pb-12">
          <Section className="px-12">
            <Img
              src={new URL('/logo.png', returnUrl).toString()}
              width="36"
              height="36"
              alt="Eververse"
            />
            <Hr className="my-5 border-[#e6ebf1]" />
            {children}
          </Section>
        </Container>
      </Body>
    </Tailwind>
  );
};
