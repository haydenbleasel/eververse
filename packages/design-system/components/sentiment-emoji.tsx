import { Tooltip } from "./precomposed/tooltip";

type SentimentEmojiProperties = {
  readonly value: string;
  readonly description?: string | null;
  readonly className?: string;
};

export const SentimentEmoji = ({
  value,
  description,
  className,
}: SentimentEmojiProperties) => {
  let emoji = "😐";

  if (value === "NEGATIVE") {
    emoji = "😔";
  }

  if (value === "ANGRY") {
    emoji = "😡";
  }

  if (value === "CONFUSED") {
    emoji = "🤔";
  }

  if (value === "INFORMATIVE") {
    emoji = "🧠";
  }

  if (description) {
    return (
      <Tooltip content={description}>
        <p className={className}>{emoji}</p>
      </Tooltip>
    );
  }

  return <p className={className}>{emoji}</p>;
};
