import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Prose } from '@repo/design-system/components/prose';
import { reviews } from '@repo/lib/reviews';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import type { HTMLAttributes } from 'react';
import ProductHunt from './product-hunt.svg';

type ReviewsProperties = HTMLAttributes<HTMLDivElement>;

export const Reviews = (properties: ReviewsProperties) => (
  <section {...properties}>
    <Container className="border-x px-4 py-16">
      <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
        <div>
          <h2 className="mb-4 font-semibold text-3xl tracking-tighter sm:text-5xl">
            What people are saying
          </h2>
          <p className="mx-auto max-w-prose text-lg text-muted-foreground">
            See what others are saying about Eververse.
          </p>
        </div>
        <a
          href="https://www.producthunt.com/posts/eververse?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-eververse"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=447833&theme=light"
            alt="Eververse - Build&#0032;your&#0032;product&#0032;roadmap&#0032;at&#0032;lightspeed&#0044;&#0032;with&#0032;AI | Product Hunt"
            width={250}
            height={54}
            className="aspect-[250/54] h-[42px] w-auto"
            unoptimized
          />
        </a>
      </div>
      <div className="mt-16 gap-4 sm:columns-2 lg:columns-3">
        {reviews.map(({ author, avatar, link, source, text }) => (
          <div
            key={text}
            className="mb-4 inline-block w-full space-y-4 rounded-xl border bg-background p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Image
                src={avatar}
                alt={author}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
                unoptimized
              />
              <div>
                <p className="font-medium text-foreground">{author}</p>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <span>on</span>
                  <Link href={link} key={link}>
                    {source === 'producthunt' ? (
                      <Image
                        src={ProductHunt as StaticImageData}
                        alt="Product Hunt"
                        width={16}
                        height={16}
                        className="my-0 mr-1 inline h-4 w-4 rounded-full"
                      />
                    ) : null}
                    <span>
                      {source === 'producthunt' ? 'Product Hunt' : source}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <Prose>
              <p className="text-foreground">{text}</p>
            </Prose>
          </div>
        ))}
      </div>
    </Container>
  </section>
);
