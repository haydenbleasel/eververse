import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
} from "novel";
import { suggestionItems } from "../slash-command";

export const CommandMenu = () => (
  <EditorCommand className="not-prose z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-background px-1 py-2 shadow-md transition-all">
    <EditorCommandEmpty className="px-2 text-muted-foreground">
      No results
    </EditorCommandEmpty>
    <EditorCommandList>
      {suggestionItems.map((item) => (
        <EditorCommandItem
          className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-secondary aria-selected:bg-secondary"
          key={item.title}
          onCommand={(value) => item.command?.(value)}
          value={item.title}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background">
            {item.icon}
          </div>
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-muted-foreground text-xs">{item.description}</p>
          </div>
        </EditorCommandItem>
      ))}
    </EditorCommandList>
  </EditorCommand>
);
