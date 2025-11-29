import {
  Body,
  Container,
  Hr,
  Img,
  Section,
  Tailwind,
} from "@react-email/components";
import type { ReactNode } from "react";

type EmailLayoutProps = {
  children: ReactNode;
  siteUrl: string;
};

export const EmailLayout = ({ children, siteUrl }: EmailLayoutProps) => (
  <Tailwind>
    <Body className="bg-[#f6f9fc] font-sans">
      <Container className="mx-auto mb-16 bg-white py-5 pb-12">
        <Section className="px-12">
          <Img
            alt="Eververse"
            height="36"
            src={new URL("/logo.png", siteUrl).toString()}
            width="36"
          />
          <Hr className="my-5 border-[#e6ebf1]" />
          {children}
        </Section>
      </Container>
    </Body>
  </Tailwind>
);
