import { CodeBlock } from '@repo/design-system/components/code-block';

const codeString = `const payload = {
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
}`;

export const APIGraphic = () => (
  <div className="not-prose h-full w-full">
    <CodeBlock language="javascript" code={codeString} />
  </div>
);
