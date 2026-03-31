# custom-searchengine-for-cf

## Installation
Note: You’ll find much better instructions in Cloudflare’s official documentation.
1. Set up a Cloudflare Worker and a Cloudflare KV Store
2. Add a binding to the KV Store in the Worker (The default name is “SHORTCUTS”)
3. Deploy `worker.js` to the Worker
