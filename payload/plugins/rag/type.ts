export type ragPluginConfig = {
  retrieval?: {
    threshold?: number;
    maxResults?: number;
  };
  embedding?: {
    chunkSize?: number;
    chunkOverlap?: number;
    model?: string;
  };
  queryRewrite?: {
    enabled?: boolean;
    model?: string;
  };
};
