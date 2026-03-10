const { HfInference } = require("@huggingface/inference");
require("dotenv").config();

async function test() {
    const hf = new HfInference(process.env.HF_TOKEN);
    try {
        const result = await hf.featureExtraction({
            model: "microsoft/unixcoder-base",
            inputs: "public void test() {}",
        });
        console.log("✅ Success! Hugging Face is talking to your project.");
        console.log("Vector length:", result.length);
    } catch (e) {
        console.error("❌ Connection Failed. Check your HF_TOKEN in .env");
        console.error(e.message);
    }
}
test();
