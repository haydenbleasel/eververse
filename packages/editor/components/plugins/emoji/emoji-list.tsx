// @ts-nocheck

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { SuggestionList } from '../suggestion-list';

export const EmojiList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];

    if (item) {
      props.command({ name: item.name });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: (x) => {
        if (x.event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (x.event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (x.event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }),
    [upHandler, downHandler, enterHandler]
  );

  return (
    <SuggestionList
      items={props.items}
      onSelect={selectItem}
      selected={selectedIndex}
      render={(item) => (
        <div className="flex items-center gap-1">
          {item.fallbackImage ? (
            <img className="h-4" src={item.fallbackImage} align="absmiddle" />
          ) : (
            item.emoji
          )}
          :{item.name}:
        </div>
      )}
    />
  );
});

EmojiList.displayName = 'EmojiList';
