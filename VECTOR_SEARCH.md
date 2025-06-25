# Vector Embeddings and Semantic Search

This repository now includes comprehensive vector embeddings functionality for AI-powered semantic search across feedback, features, releases, and changelog entries.

## Features

### Automatic Vectorization
- **Database Webhooks**: Automatically generate embeddings when new content is created
- **Batch Processing**: Process existing content that doesn't have embeddings yet
- **Multiple Content Types**: Support for feedback, features, releases, and changelog entries

### Semantic Search
- **Cross-Content Search**: Search across all content types simultaneously
- **Type-Specific Search**: Filter search by specific content type
- **Similarity Scoring**: Results ranked by semantic similarity
- **Content Snippets**: Search results include content previews

## API Endpoints

### Database Webhooks (Automatic)
These webhooks are triggered automatically when new content is created:

- `POST /webhooks/database/feedback/vectorize` - Vectorize new feedback
- `POST /webhooks/database/features/vectorize` - Vectorize new features  
- `POST /webhooks/database/changelog/vectorize` - Vectorize new changelog entries
- `POST /webhooks/database/release/vectorize` - Vectorize new releases

### Search API
```typescript
// Search across all content types
GET /search/vector?q=search_query&limit=10&threshold=0.7

// Search specific content type
GET /search/vector?q=search_query&type=feedback&limit=10&threshold=0.7
```

### Batch Processing
```typescript
// Process existing content without embeddings
POST /admin/vectorize-batch
{
  "organizationId": "org_id",
  "type": "feedback", // or "feature", "changelog", "release"
  "limit": 10
}
```

## Usage in Application Code

### Server Actions
```typescript
import { searchWithVector } from '@/actions/search/vector';

const results = await searchWithVector('user authentication issues', 'feedback');
```

### Direct API Usage
```typescript
import { vectorSearch, vectorSearchByType } from '@repo/backend/vector-search';

// Search across all content
const results = await vectorSearch(query, organizationId);

// Search specific type
const feedbackResults = await vectorSearchByType(query, organizationId, 'feedback');
```

## Implementation Details

### Embedding Generation
- Uses OpenAI's `text-embedding-3-small` model
- Combines title and content for comprehensive embeddings
- Handles empty content gracefully

### Database Storage
- Embeddings stored as vector type in PostgreSQL
- Uses pgvector extension for efficient similarity search
- Vector columns already exist in schema: `feedback.vector`, `feature.vector`, `changelog.vector`, `release.vector`

### Search Algorithm
- Cosine similarity using PostgreSQL's `<=>` operator
- Configurable similarity thresholds
- Results sorted by similarity score

### Content Enhancement
- Search results include content snippets (200 chars)
- Creation timestamps for result ordering
- Fallback handling for content retrieval errors

## Example Search Results

```typescript
{
  id: "feedback_123",
  title: "Login Issues with Google SSO",
  similarity: 0.89,
  type: "feedback",
  snippet: "Users are experiencing problems when trying to log in using Google single sign-on. The authentication flow seems to hang...",
  createdAt: "2024-01-15T10:30:00Z"
}
```

## Configuration

### Similarity Thresholds
- Default: `0.7` (70% similarity)
- Range: `0.0` to `1.0`
- Higher values = more precise matches
- Lower values = broader matches

### Result Limits
- Default: `10` results
- Configurable per request
- Performance optimized for up to 100 results

## Performance Considerations

- Embedding generation: ~1-2 seconds per item
- Search queries: Sub-second response times
- Batch processing: Processes items sequentially to avoid rate limits
- Vector index automatically maintained by PostgreSQL

## Future Enhancements

- Hybrid search combining vector and full-text search
- Custom embedding models for domain-specific content
- Real-time embedding updates for content modifications
- Advanced filtering and faceted search capabilities