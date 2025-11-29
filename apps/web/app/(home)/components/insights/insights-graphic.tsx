import { useWindowSize } from "@react-hookz/web";
import { LoadingCircle } from "@repo/design-system/components/loading-circle";
import { SentimentEmoji } from "@repo/design-system/components/sentiment-emoji";
import { cn } from "@repo/design-system/lib/utils";
import { ArrowRightIcon, SearchIcon } from "lucide-react";
import {
  domAnimation,
  domMax,
  LazyMotion,
  m,
  useDragControls,
  useInView,
} from "motion/react";
import Image from "next/image";
import type { ComponentProps, FC } from "react";
import { useEffect, useRef, useState } from "react";

const feedback: {
  title: string;
  description: string;
  sentiment: ComponentProps<typeof SentimentEmoji>["value"];
  left: string;
  top: string;
  image: string;
}[] = [
  {
    title: "Can't figure out how to upgrade plan",
    description:
      "I would like to subscribe to the premium plan, but I can’t find the button to do so.",
    sentiment: "CONFUSED",
    left: "5%",
    top: "-8%",
    image: "/example-user-1.jpg",
  },
  {
    title: "Pricing is stupidly expensive",
    description:
      "The Premium plan is way too expensive. I would be willing to pay $10/month, but not $20/month.",
    sentiment: "ANGRY",
    left: "20%",
    top: "32%",
    image: "/example-user-2.jpg",
  },
  {
    title: "Lack of Apple Pay is a dealbreaker",
    description:
      "We can’t use this because it doesn’t support Apple Pay. We need to be able to accept payments from our customers.",
    sentiment: "NEGATIVE",
    left: "35%",
    top: "15%",
    image: "/example-user-3.jpg",
  },
  {
    title: "Not sure how to subscribe",
    description:
      "I would like to subscribe to the premium plan, but I can’t find the button to do so.",
    sentiment: "CONFUSED",
    left: "3%",
    top: "53%",
    image: "/example-user-4.jpg",
  },
  {
    title: "Really hate the new billing system",
    description:
      "The new billing system is really confusing. I can’t figure out how to cancel my subscription. Also, I was charged twice last month.",
    sentiment: "NEGATIVE",
    left: "50%",
    top: "65%",
    image: "/example-user-5.jpg",
  },
  {
    title: "Why don't you support coupon codes?",
    description:
      "Seriously it's not that hard to implement. I would like to be able to offer discounts to my customers.",
    sentiment: "ANGRY",
    left: "10%",
    top: "85%",
    image: "/example-user-6.jpg",
  },
];

const DraggableFeedback: FC<(typeof feedback)[0]> = ({
  title,
  description,
  sentiment,
  left,
  top,
  image,
}) => {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <m.div
      animate={{ scale: 1 }}
      className={cn(
        "absolute flex w-[60%] shrink-0 items-center gap-3 rounded-full border bg-card p-3",
        dragging ? "cursor-grabbing" : "cursor-grab"
      )}
      drag
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      dragControls={controls}
      initial={{ scale: 0.5 }}
      onDragEnd={() => setDragging(false)}
      onDragStart={() => setDragging(true)}
      style={{ left, top }}
      transition={{ bounce: 0.5, type: "spring" }}
    >
      <div className="relative shrink-0">
        <Image
          alt=""
          className="rounded-full"
          height={32}
          src={image}
          width={32}
        />
        <div className="-bottom-1 -right-1 absolute text-sm">
          <SentimentEmoji value={sentiment} />
        </div>
      </div>
      <div className="grid">
        <p className="truncate font-medium text-foreground text-sm">{title}</p>
        <p className="truncate text-muted-foreground text-xs">{description}</p>
      </div>
    </m.div>
  );
};

export const InsightsGraphic: FC = () => {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reference = useRef<HTMLDivElement>(null);
  const inView = useInView(reference, { once: true, amount: "all" });
  const windowSize = useWindowSize();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (windowSize.width > 480) {
      setSearchText("show me all negative billing feedback");
    } else {
      setSearchText("negative billing feedback");
    }
  }, [windowSize.width]);

  const handleAnimationEnd = (index: number) => {
    if (index !== searchText.length - 1) {
      return;
    }

    setTimeout(() => {
      setReady(true);
    }, 500);
  };

  const handleSearch = () => {
    setReady(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setLoaded(true);
    }, 1000);
  };

  if (!inView) {
    return <div ref={reference} />;
  }

  if (!loaded) {
    return (
      <LazyMotion features={domAnimation}>
        <div className="not-prose flex h-full w-full items-center justify-center p-3">
          <div className="relative flex w-full items-center gap-3 rounded-full bg-card px-4 py-2 lg:w-fit">
            <SearchIcon className="shrink-0 text-muted-foreground" size={16} />
            <p className="truncate">
              {[...searchText].map((char, index) => (
                <m.span
                  animate={{ opacity: 1 }}
                  className="text-foreground text-sm"
                  initial={{ opacity: 0 }}
                  key={index}
                  onAnimationComplete={() => handleAnimationEnd(index)}
                  transition={{
                    delay: 1 + index * 0.05,
                    duration: 0.01,
                  }}
                >
                  {char}
                </m.span>
              ))}
            </p>
            {loading ? (
              <div className="shrink-0 p-1">
                <LoadingCircle />
              </div>
            ) : (
              <m.button
                animate={{ opacity: ready ? 1 : 0 }}
                className="shrink-0 cursor-pointer rounded-full bg-violet-600 p-1"
                initial={{ opacity: 0 }}
                onClick={handleSearch}
              >
                <ArrowRightIcon className="text-foreground" size={16} />
              </m.button>
            )}
          </div>
        </div>
      </LazyMotion>
    );
  }

  return (
    <div className="not-prose h-full w-full">
      <LazyMotion features={domMax}>
        {feedback.map((item, index) => (
          <DraggableFeedback {...item} key={index} />
        ))}
      </LazyMotion>
    </div>
  );
};
