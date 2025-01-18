import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Prose } from '@repo/design-system/components/prose';
import { reviews } from '@repo/lib/reviews';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import type { HTMLAttributes } from 'react';
import { ProductHuntBadges } from './components/producthunt-badges';
import ProductHunt from './product-hunt.svg';

type ReviewsProperties = HTMLAttributes<HTMLDivElement>;

export const Reviews = (properties: ReviewsProperties) => (
  <section {...properties}>
    <Container className="border-x px-4 py-16">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div>
          <h2 className="mb-4 font-semibold text-3xl tracking-tighter sm:text-5xl">
            Loved by the community
          </h2>
          <p className="mx-auto max-w-prose text-lg text-muted-foreground">
            See what others are saying about Eververse.
          </p>
        </div>
        <ProductHuntBadges />
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
