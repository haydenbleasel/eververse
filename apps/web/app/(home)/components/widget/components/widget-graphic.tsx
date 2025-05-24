'use client';

import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from '@repo/design-system/components/ui/kibo-ui/code-block';

const code = [
  {
    language: 'javascript',
    filename: 'widget.js',
    code: `<script>
  (function() {
    window.EververseWidgetId = 'YOUR_WIDGET_ID';
    window.EververseWidgetDarkMode = true;
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'widget.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>`,
  },
];

export const WidgetGraphic = () => (
  <CodeBlock
    data={code}
    defaultValue={code[0].language}
    className="dark border-none"
  >
    <CodeBlockBody>
      {(item) => (
        <CodeBlockItem
          key={item.language}
          value={item.language}
          className="[&_.shiki]:!bg-transparent dark:[&_.shiki]:!bg-transparent [&_.shiki_code]:!text-base"
        >
          <CodeBlockContent
            language={item.language as BundledLanguage}
            themes={{
              light: 'vitesse-light',
              dark: 'vitesse-dark',
            }}
          >
            {item.code}
          </CodeBlockContent>
        </CodeBlockItem>
      )}
    </CodeBlockBody>
  </CodeBlock>
);
