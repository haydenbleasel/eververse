# Build Troubleshooting

## WasmHash._updateWithBuffer Build Error

If you encounter an intermittent build error like:

```
TypeError: Cannot read properties of undefined (reading 'length')
    at WasmHash._updateWithBuffer
```

This is typically caused by webpack cache corruption. The following webpack configuration has been added to prevent this issue:

### Automatic Prevention

The Next.js configuration in `packages/next-config/index.ts` now includes:

- WASM experiments configuration for better WebAssembly handling
- Infrastructure logging to reduce build noise
- Stats configuration to prevent console buffer overflow
- Webpack build worker for better stability

### Manual Workaround (if needed)

If you still encounter this issue, you can manually clear the build cache:

```bash
# Clear Next.js build cache for all apps
for d in apps/*/; do rm -rf "$d/.next"; done

# Or clear specific app cache
rm -rf apps/app/.next
rm -rf apps/web/.next
rm -rf apps/portal/.next

# Then rebuild
pnpm run build
```

### Additional Troubleshooting

If the issue persists:

1. Clear node_modules and reinstall dependencies:
   ```bash
   rm -rf node_modules
   rm -rf apps/*/node_modules
   rm -rf packages/*/node_modules
   pnpm install
   ```

2. Clear turbo cache:
   ```bash
   pnpm turbo clean
   ```

3. Check for any conflicting webpack plugins or configurations in your local environment.