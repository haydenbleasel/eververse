import { MemoizedReactMarkdown } from '@/components/markdown';
import { Prose } from '@repo/design-system/components/prose';

const docs = `
Use the Eververse API to interact with your Eververse data programmatically. The Eververse API is organized around REST. Our API has predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.

The Eververse API doesn’t support bulk updates. You can work on only one object per request.

## Getting Started

To get started, create a new API Key in your Settings, then read about how to make requests for the resources you need to access using our HTTP APIs.

## Authentication

You'll need to authenticate your requests to access any of the endpoints in the Eververse API. You can do this by providing your API Key in the \`Authorization\` header.

## Errors

Eververse uses conventional HTTP response codes to indicate the success or failure of an API request. In general:

- Codes in the \`2xx\` range indicate success.
- Codes in the \`4xx\` range indicate an error that failed given the information provided (e.g. a required parameter was omitted).
- Codes in the \`5xx\` range indicate an error with Eververse’s servers (these are rare).

## Endpoints

### Get Changelog

\`\`\`bash
curl --request GET \\
  --url https://api.eververse.ai/changelog \\
  --header 'Authorization: Bearer <token>'
\`\`\`

Example response:

\`\`\`json
{
  "data": [
    {
      "id": "<string>",
      "title": "<string>",
      "description": "<string>",
      "publishAt": "<string>",
      "slug": {}
    }
  ]
}
\`\`\`

### Create a feature

\`\`\`bash
curl --request POST \\
  --url https://api.eververse.ai/feature \\
  --header 'Authorization: Bearer <token>' \\
  --header 'Content-Type: application/json' \\
  --data '{
  "title": "<string>",
  "text": "<string>",
  "custom": [
    {
      "key": "<string>",
      "value": "<string>"
    }
  ]
}'
\`\`\`

### Create Feedback

\`\`\`bash
curl --request POST \\
  --url https://api.eververse.ai/feedback \\
  --header 'Authorization: Bearer <token>' \\
  --header 'Content-Type: application/json' \\
  --data '{
  "title": "<string>",
  "text": "<string>",
  "user": {
    "name": "<string>",
    "email": "<string>"
  },
  "organization": {
    "name": "<string>",
    "domain": "<string>"
  }
}'
\`\`\`
`;

export const APIDocumentation = () => (
  <Prose className="prose-sm">
    <MemoizedReactMarkdown>{docs}</MemoizedReactMarkdown>
  </Prose>
);
