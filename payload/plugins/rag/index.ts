import { Plugin } from 'payload';
import {
  knowledgeDocs,
  knowledgeDocsUpload,
} from './collections/knowledge-docs';
import { ragPluginConfig } from './type';

export const ragPlugin =
  (config: ragPluginConfig = {}): Plugin =>
  (payloadConfig) => {
    payloadConfig.collections = [
      ...(payloadConfig.collections ?? []),
      knowledgeDocs,
      knowledgeDocsUpload,
    ];
    return payloadConfig;
  };
