# Code RAG Explorer

An industry-grade Retrieval-Augmented Generation (RAG) system designed to navigate and understand complex Java codebases. 

## Overview
Unlike standard RAG systems that treat code as plain text, this explorer uses **AST-based parsing** to preserve logical structures (classes, methods). It enables semantic search across a repository, allowing developers to ask natural language questions about architectural patterns and implementation details.

## Tech Stack
- **Parser:** Tree-sitter (Java grammar)
- **Embeddings:** UniXcoder (cross-modal code representation)
- **Vector Database:** Qdrant
- **Orchestration:** Python 3.11+
- **Infrastructure:** Docker

## Project Structure
- `src/ingestion/`: Logic for AST parsing and vector generation.
- `src/vectorstore/`: Database interface and persistence layer.
- `data/`: Source repository storage for indexing.

## Setup
1. **Environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

1. **Indexing:**
Place your Java project in data/my-java-repo/ and run:

Bash
python src/ingestion/pipeline.py