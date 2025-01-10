import { Container } from '@repo/design-system/components/container';
import { Prose } from '@repo/design-system/components/prose';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { ContactForm } from './components/contact-form';

const title = 'Contact';
const description =
  "Let us know what's on your mind. We'll get back to you as soon as possible.";

export const metadata: Metadata = createMetadata({
  title,
  description,
});

const Contact = () => (
  <section>
    <Container className="grid gap-8 border-x sm:grid-cols-2 sm:gap-24 sm:divide-x">
      <div className="flex flex-col gap-1 py-4 sm:p-8">
        <Prose className="max-w-md">
          <h1 className="mt-0 mb-4 font-semibold text-3xl tracking-tighter sm:text-5xl">
            {title}
          </h1>
          <p className="mt-0 text-lg">{description}</p>
        </Prose>
      </div>
      <div className="py-4 sm:p-8">
        <ContactForm />
      </div>
    </Container>
  </section>
);

export default Contact;
