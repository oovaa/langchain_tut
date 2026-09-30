import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { ChromaClient } from 'chromadb';
import type { Document } from 'langchain';

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_API_KEY,
  model: 'BAAI/bge-large-en-v1.5',
  provider: 'hf-inference',
});

const chormaClient = new ChromaClient({
  host: process.env.CHROMA_HOST ?? 'localhost',
  port: 8000,
  ssl: false,
});

export const vectorStore = new Chroma(embeddings, {
  collectionName: 'documents_collection',
  index: chormaClient,
});

export const store = async (chunks: Document[]) => {
  await vectorStore.addDocuments(chunks);
};

export const deleteChunksByDocId = async (value: string) => {
  await vectorStore.delete({ filter: { docId: value } });
};

export const deleteChunksByUserId = async (value: string) => {
  await vectorStore.delete({ filter: { userId: value } });
};

// ok so we delete documents based on the chunkud not the user and we retireive based on the user ID

export const retrieverByUser = (userId: string) => {
  return vectorStore.asRetriever({ k: 5, filter: { userId } });
};

export const retrieverByRole = (role: string) => {
  return vectorStore.asRetriever({ k: 5, filter: { roles: { $contains: role } } });
};

export const deleteByRole = async (role: string) => {
  await vectorStore.delete({ filter: { roles: { $contains: role } } });
};
