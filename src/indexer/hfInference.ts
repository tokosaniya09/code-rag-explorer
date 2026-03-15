import * as dotenv from 'dotenv';
dotenv.config();

import { HfInference } from '@huggingface/inference';

console.log(">>> Checking Token Length:", process.env.HF_TOKEN?.length);

export class CloudEmbedder {
    private hf: HfInference;
    private model = "sentence-transformers/all-MiniLM-L6-v2";

    constructor() {
        this.hf = new HfInference(process.env.HF_TOKEN);
    }

    async getEmbeddings(text: string): Promise<number[]> {
        try {
            const output = await this.hf.featureExtraction({
                model: this.model,
                inputs: text,
            });
            return (output as number[][]).flat();
        } catch (error) {
            console.error("Hugging Face Detailed Error:", JSON.stringify(error));
            throw error;
        }
    }
}