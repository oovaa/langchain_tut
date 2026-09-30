import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { Document } from 'langchain';

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 700,
  chunkOverlap: 0,
});

export async function load_spllit(
  path: string,
  docId: string,
  userId: string,
  roles: string[],
): Promise<Document[]> {
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
        docId,
        userId,
        roles,
      },
    };
  });
}
