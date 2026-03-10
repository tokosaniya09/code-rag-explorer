require("dotenv").config();
const { HfInference } = require("@huggingface/inference");

async function verify() {
    const hf = new HfInference(process.env.HF_TOKEN);
    try {
        await hf.featureExtraction({
            model: "microsoft/unixcoder-base",
            inputs: "public class Test {}",
        });
        console.log("✅ CLOUD: Hugging Face connection is active.");
    } catch (e) {
        console.log("❌ CLOUD: Connection failed. Check your .env file.");
        console.error(e);
    }
}
verify();
