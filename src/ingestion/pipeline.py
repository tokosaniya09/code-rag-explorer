def run_ingestion(repo_path: str):
    parser = CodeParser()
    embedder = CodeEmbedder()
    store = QdrantStore()

    all_chunks = []

    for root, _, files in os.walk(repo_path):
        for file in files:
            if file.endswith(".java"):
                full_path = os.path.join(root, file)
                print(f"Parsing: {full_path}")

                methods = parser.get_methods(full_path)

                for m in methods:
                    m["vector"] = embedder.generate(m["text"])
                    all_chunks.append(m)

    if all_chunks:
        store.upsert_methods(all_chunks)

if __name__ == "__main__":
    data = run_ingestion("./data/my-java-project")
    print(f"Succesfully processed {len(data)} method blocks.")