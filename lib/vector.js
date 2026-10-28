import { QdrantClient } from '@qdrant/js-client-rest';

// Embedding model: all-MiniLM-L6-v2 (384-dim sentence embeddings), run locally via ONNX.
// Similarity metric: cosine (vectors are L2-normalised). Store: Qdrant collections "resumes", "jobs".
const client = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333' });
const DIM = 384;
let extractor, ready = false;

export async function embed(text) {
  const { pipeline } = await import('@xenova/transformers');
  extractor ||= await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const out = await extractor(String(text).slice(0, 2000), { pooling: 'mean', normalize: true });
  return Array.from(out.data);
}

export async function ensureCollections() {
  if (ready) return;
  const { collections } = await client.getCollections();
  for (const name of ['resumes', 'jobs']) {
    if (!collections.find((c) => c.name === name))
      await client.createCollection(name, { vectors: { size: DIM, distance: 'Cosine' } });
  }
  ready = true;
}

export async function upsertVector(collection, id, text, payload) {
  await ensureCollections();
  const vector = await embed(text);
  await client.upsert(collection, { wait: true, points: [{ id, vector, payload }] });
}

export async function searchVector(collection, text, limit = 8) {
  await ensureCollections();
  const vector = await embed(text);
  return client.search(collection, { vector, limit, with_payload: true });
}
