import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import type { Document } from '@langchain/core/documents';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { ChromaClient } from 'chromadb';

const simulationPdf = './simulatipon.pdf';
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 700,
  chunkOverlap: 0,
});
export const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_API_KEY,
  model: 'BAAI/bge-large-en-v1.5',
  provider: 'hf-inference',
});

const chormaClient = new ChromaClient({
  host: process.env.CHROMA_HOST ?? 'localhost',
  port: 8000,
  ssl: false,
});

const vectorStore = new Chroma(embeddings, {
  collectionName: 'documents_collection',
  index: chormaClient,
});

async function load_spllit(path: string, fileId: string, userId: string) {
  // const loader = new PDFLoader(path);
  // const loaded = await loader.load();
  // loaded.map((m) => (m.metadata.id = id));
  // const texts = await splitter.splitDocuments(loaded);
  // return texts;
  //
  const loader = new PDFLoader(path);
  const loaded = await loader.load();
  const chunks = await splitter.splitDocuments(loaded);

  // Flatten and sanitize metadata: remove nested objects (like 'pdf' and 'loc')
  return chunks.map((chunk) => {
    return {
      ...chunk,
      metadata: {
        source: typeof chunk.metadata.source === 'string' ? chunk.metadata.source : path,
        pageNumber: chunk.metadata.loc?.pageNumber ?? 1,
        fileId: fileId,
        userId: userId,
      },
    };
  });
}

async function getRetriver(chunks: Document<Record<string, any>>[]) {
  await vectorStore.addDocuments(chunks);
  return vectorStore.asRetriever(3);
}
//
// const chunks = await load_spllit(simulationPdf, 'tanentId', 'user1');
// const chunks2 = await load_spllit('./PostgreSQLNotesForProfessionals.pdf', 'psql', 'user2');
//
// await getRetriver(chunks);
// const retreiver = await getRetriver(chunks2);
//
// const result = await retreiver.invoke('simulation');
//
// console.log(result);
//
import { ChatCohere } from '@langchain/cohere';
import { createAgent } from 'langchain';

const llm = new ChatCohere({
  model: 'command-a-03-2025',
  temperature: 0,
  maxRetries: 2,
  // other params...
});

// console.log((await llm.invoke('hi there')).content);

const agent = createAgent({
  model: llm,
});

console.log(
  await agent.invoke({
    messages: [
      { role: 'system', content: 'you are a helpful assistant' },
      { role: 'user', content: "What's the weather in San Francisco?" },
    ],
  }),
);
