import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type InitiativeUpdateTemplateProperties = {
  readonly title: string;
  readonly name: string;
  readonly html: string;
  readonly date: Date;
};

export const InitiativeUpdateTemplate = ({
  title,
  name,
  html,
  date,
}: InitiativeUpdateTemplateProperties) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Initiative update from {name}</Preview>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto py-12">
          <Img
            src="https://www.eververse.ai/logo.png"
            className="mx-auto h-12 w-12"
            alt="Logo"
          />
          <Text className="my-6 text-center font-semibold text-2xl text-gray-950">
            {title}
          </Text>
          <Section className="rounded-md bg-gray-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <div
                className="text-gray-950"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <Hr className="my-4" />
              <Text className="m-0 text-gray-500">
                From {name} on{' '}
                {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                }).format(date)}
              </Text>
            </Section>
          </Section>
          <Text className="m-0 mt-4 text-center text-gray-500">
            Powered by{' '}
            <Link
              className="text-inherit underline"
              href="https://www.eververse.ai"
            >
              Eververse
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);
