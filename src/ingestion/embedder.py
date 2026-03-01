import torch
from transformers import AutoTokenizer, AutoModel

class CodeEmbedder: 
    def __init__(self, model_name='microsoft/unixcoder-base'):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(self.device)
    
    def generate(self, code_snippet: str):
        """Converts code text into a 768-dimensional vector."""

        tokens = [self.tokenizer.cls_token, "<encode-only>", self.tokenizer.sep_token] + tokens + [self.tokenizer.sep_token]

        ids = self.tokenizer.convert_tokens_to_ids(tokens)
        input_ids = torch.tensor([ids]).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_ids)
            embedding = outputs.last_hidden_state[0, 0, :]

        return embedding.cpu().numpy().tolist()