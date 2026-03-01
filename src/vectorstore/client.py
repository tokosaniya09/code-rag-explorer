class QdrantStore:
    def __init__(self, collection_name="code_chunks"):
        self.client = QdrantClient(path="qdrant_db")
        self.collection_name = collection_name
        self._ensure_collection()

    def _ensure_collection(self):
        """Creates the collection if it doesn't exist."""
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE)
            )
    
    def upsert_methods(self, methods: list):
        """
        Saves parsed methods and their vectors to the database.
        Each 'point' includes the vector and metadata (payload).
        """
        points = []
        for idx, m in enumerate(methods):
            points.append(PointStruct(
                id=idx,
                vector=m["vector"],
                payload=m["metadata"]
            ))
            points[-1].payload["code_content"] = m["text"]
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        print(f"Upserted {len(points)} methods to Qdrant collection '{self.collection_name}'.")

    def search(self, query_vector: list, limit=3):
        """Finds the most similar code blocks based on the query vector."""
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit
        )
        return results