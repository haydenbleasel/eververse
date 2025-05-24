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
    filename: 'api.js',
    code: `const payload = {
  title: 'Make the logo bigger',                          // String, required
  text: 'The logo is too small, please make it bigger',   // String, required
  user: {                                                 // Object, optional 
    name: 'John Doe',                                     // String, required
    email: 'john@acme.com',                               // String, required
  },
  organization: {                                         // Object, optional
    name: 'Acme Inc',                                     // String, required
    domain: 'acme.com',                                   // String, required
  },
}
  
const response = await fetch('https://app.eververse.ai/••••••••', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer ••••••••••••\`,
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  throw new Error(response.statusText);
}`,
  },
];

export const APIGraphic = () => (
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
              light: 'nord',
              dark: 'nord',
            }}
          >
            {item.code}
          </CodeBlockContent>
        </CodeBlockItem>
      )}
    </CodeBlockBody>
  </CodeBlock>
);
