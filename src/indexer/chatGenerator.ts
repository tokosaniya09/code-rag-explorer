import * as dotenv from 'dotenv';
dotenv.config();

import { HfInference } from '@huggingface/inference';

export class ChatGenerator {
    private hf = new HfInference(process.env.HF_TOKEN);
    private model = "meta-llama/Meta-Llama-3-8B-Instruct"; 

    async generateAnswer(query: string, codeContext: string) {
        const prompt = `
        System: You are an expert Java Architect. Answer based ONLY on the provided code.
        Context: ${codeContext}
        Question: ${query}
        Answer:`;

        const response = await this.hf.textGeneration({
            model: this.model,
            inputs: prompt,
            parameters: { max_new_tokens: 500, temperature: 0.1 }
        });

        return response.generated_text;
    }
}