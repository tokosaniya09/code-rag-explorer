import { ChromaClient } from 'chromadb';
import { CloudEmbedder } from './hfInference';

export class CodeVectorStore {
    private client = new ChromaClient();
    private embedder = new CloudEmbedder();
    private collectionName = "java-code-rag";

    async addCodeChunks(chunks: any[]) {
        const collection = await this.client.getOrCreateCollection({
            name: this.collectionName
        });

        for (const chunk of chunks) {
            const embedding = await this.embedder.getEmbeddings(chunk.content);
            
            await collection.add({
                ids: [`${chunk.metadata.source}-${chunk.metadata.startLine}`],
                embeddings: [embedding],
                metadatas: [chunk.metadata],
                documents: [chunk.content]
            });
        }
        console.log(`Indexed ${chunks.length} chunks successfully.`);
    }

    async search(query: string, limit: number = 3) {
        const collection = await this.client.getCollection({ name: this.collectionName });
        const queryEmbedding = await this.embedder.getEmbeddings(query);

        // HNSW algorithm ensures fast search even in large codebases
        return await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: limit
        });
    }
}