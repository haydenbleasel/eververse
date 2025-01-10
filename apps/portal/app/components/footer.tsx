import { Container } from '@repo/design-system/components/container';

export const Footer = () => (
  <Container className="py-4">
    <p className="text-muted-foreground text-sm">
      Powered by{' '}
      <a
        href="https://www.eververse.ai/"
        className="underline"
        target="_blank"
        rel="noreferrer"
      >
        Eververse
      </a>
    </p>
  </Container>
);
