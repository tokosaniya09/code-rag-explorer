import { HfInference } from '@huggingface/inference';
import * as dotenv from 'dotenv';

dotenv.config();

export class CloudEmbedder {
    private hf = new HfInference(process.env.HF_TOKEN);
    // UniXcoder is excellent for mapping natural language to logic
    private model = "microsoft/unixcoder-base"; 

    async getEmbeddings(text: string): Promise<number[]> {
        try {
            const output = await this.hf.featureExtraction({
                model: this.model,
                inputs: text,
            });
            // The API returns a multi-dimensional array; we flatten it for Chroma
            return (output as number[][]).flat();
        } catch (error) {
            console.error("Hugging Face API Error:", error);
            throw error;
        }
    }
}