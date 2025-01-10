type EmojiProps = {
  id: string;
  size: string;
};

export const Emoji = (
  props: EmojiProps // @ts-expect-error "Web Component"
) => <em-emoji {...props} />;
