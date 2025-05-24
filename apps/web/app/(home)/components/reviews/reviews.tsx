import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import type { HTMLAttributes } from 'react';
import { ProductHuntBadges } from './components/producthunt-badges';
import ProductHunt from './product-hunt.svg';

type ReviewsProperties = HTMLAttributes<HTMLDivElement>;

export const reviews = [
  {
    text: "Wow, you literally save a lot of product managers especially when you're a solo entrepreneur. Good job and congrats! 🎉",
    author: '@yamisun',
    link: 'https://www.producthunt.com/products/eververse?comment=3395752#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/3268646/fbcd7c49-c551-4327-9918-34290b23b514.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=120&h=120&fit=crop&dpr=2',
  },
  {
    text: "Amazing new product launch - you've built some genuinely amazing products over the years, and this in particular, makes me very excited. The RICE prioritisation, roadmap customisation and activity/collaboration features are *chefs kiss*. Highly recommend for product managers (and founders/marketers) to give Eververse a test-run!",
    author: '@dansiepen',
    link: 'https://www.producthunt.com/products/eververse?comment=3389848#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/74848/6ff9029c-a09f-483e-94a5-7001fdd9ce08.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
  {
    text: 'Love the execution. Such a slick looking product.',
    author: '@mikekerzhner',
    link: 'https://www.producthunt.com/products/eververse?comment=3391809#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/6659409/33524f69-297d-4419-8457-f5df664779ac.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
  {
    text: 'I tried your product and really loved the experience! It felt a bit between Resend and Linear, and I see them as the best standards in terms of user experience.',
    author: '@adrien_gaudon',
    link: 'https://www.producthunt.com/products/eververse?comment=3392139#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/2432144/0c7b3b00-a061-426d-ba69-ed1cf0b7e9ab.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
  {
    text: 'Congrats on the launch and thanks for letting me try out the beta! I love how many ways this can improve upon existing product processes. For me, one of the biggest values in using Eververse is being able to automatically collect and organize my insights, like user interviews and customer support inquiries, and eliminating a lot of otherwise tedious manual work.',
    author: '@brendanciccone',
    link: 'https://www.producthunt.com/products/eververse?comment=3391876#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/2756308/08743049-abdf-44bd-b20b-fa722ef653eb.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
  {
    text: "Nice work mate! Been following along your updates on LinkedIn as you've been building this. Impressed at how quickly you've been able to make such massive progress.",
    author: '@kaiforsyth',
    link: 'https://www.producthunt.com/products/eververse?comment=3390077#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/211816/85de1077-15a8-4f5e-b5d5-9a9594d552b6.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
  {
    text: 'great product, great stack! keep up your great work 👏👏',
    author: '@flomerian',
    link: 'https://www.producthunt.com/products/eververse?comment=3390025#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/25713/621b90ee-788e-42ec-8fa3-25dd2910482a.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
  {
    text: 'Looks fantastic Hayden! Great to see an "AI first" solution to the pains of product management',
    author: '@dean_mcpherson',
    link: 'https://www.producthunt.com/products/eververse?comment=3392484#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/248100/original.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
  {
    text: 'Deeply appreciative of your work, good luck with the product!',
    author: '@dimitrie_baitanciuc',
    link: 'https://www.producthunt.com/products/eververse?comment=3390751#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/1290555/f025f457-ba52-41ee-a015-0e902192a2a6.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
  {
    text: 'Love it, incredible!',
    author: '@sergio_gradyuk2',
    link: 'https://www.producthunt.com/products/eververse?comment=3391154#eververse',
    source: 'producthunt',
    avatar:
      'https://ph-avatars.imgix.net/1631032/01d56e47-bd88-43ad-9961-30f5971505d0.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=36&h=36&fit=crop&dpr=2',
  },
];

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
            <p>{text}</p>
          </div>
        ))}
      </div>
    </Container>
  </section>
);
