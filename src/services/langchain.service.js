import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import { GOOGLE_API_KEY, QDRANT_API_KEY, QDRANT_URL } from "../config/env.js";
import {
  LANGCHAIN_COLLECTION_NAME,
  LANGCHAIN_EMBEDDING_MODEL,
  LANGCHAIN_GENERATION_MODEL,
  LANGCHAIN_CHUNK_SIZE,
  LANGCHAIN_CHUNK_OVERLAP,
  LANGCHAIN_RETRIEVER_TOP_K,
} from "../constants/index.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getPdfBufferFromS3 } from "./s3.service.js";

const qdrantConfig = {
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
  collectionName: LANGCHAIN_COLLECTION_NAME,
};

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GOOGLE_API_KEY,
  model: LANGCHAIN_EMBEDDING_MODEL,
});

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: GOOGLE_API_KEY,
  model: LANGCHAIN_GENERATION_MODEL,
});

const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the question using only the context below. If the answer isn't in the context, say you don't know.
    Context:
    {context}

    Question:
    {question}
  `);

const formatDocs = (docs) =>
  docs.map(({ pageContent }) => pageContent).join("\n\n");

export async function ingestPdf(s3Key) {
  const buffer = await getPdfBufferFromS3(s3Key)
  const docs = await new PDFLoader(new Blob([buffer])).load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: LANGCHAIN_CHUNK_SIZE,
    chunkOverlap: LANGCHAIN_CHUNK_OVERLAP,
  });
  const chunks = await splitter.splitDocuments(docs);
  chunks.forEach((chunk) => {
    chunk.metadata.documentId = s3Key;
  });
  await QdrantVectorStore.fromDocuments(chunks, embeddings, qdrantConfig);
}

// Cached so each question doesn't reconnect to Qdrant; the retriever filter
// (scoped per-document below) is what keeps answers isolated per PDF.
let vectorStorePromise = null;

function getVectorStore() {
  if (!vectorStorePromise) {
    vectorStorePromise = (async () => {
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        qdrantConfig,
      );
      // Qdrant Cloud requires an explicit index before a field can be used
      // in a filter; this is a no-op if the index already exists.
      await vectorStore.client.createPayloadIndex(
        qdrantConfig.collectionName,
        { field_name: "metadata.documentId", field_schema: "keyword" },
      );
      return vectorStore;
    })().catch((err) => {
      vectorStorePromise = null;
      throw err;
    });
  }
  return vectorStorePromise;
}

export async function answerQuestion(question, documentId) {
  const vectorStore = await getVectorStore();
  const retriever = vectorStore.asRetriever({
    k: LANGCHAIN_RETRIEVER_TOP_K,
    filter: {
      must: [{ key: "metadata.documentId", match: { value: documentId } }],
    },
  });

  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocs),
      question: new RunnablePassthrough(),
    },
    prompt,
    chatModel,
    new StringOutputParser(),
  ]);

  return chain.invoke(question);
}
