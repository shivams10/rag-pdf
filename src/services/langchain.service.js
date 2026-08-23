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
  await QdrantVectorStore.fromDocuments(chunks, embeddings, qdrantConfig);
}

// Cached so each question doesn't reconnect to Qdrant and rebuild the chain;
// the retriever still queries Qdrant live, so newly ingested docs are picked up.
let ragChainPromise = null;

async function buildRagChain() {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    qdrantConfig,
  );
  const retriever = vectorStore.asRetriever({ k: LANGCHAIN_RETRIEVER_TOP_K });

  return RunnableSequence.from([
    {
      context: retriever.pipe(formatDocs),
      question: new RunnablePassthrough(),
    },
    prompt,
    chatModel,
    new StringOutputParser(),
  ]);
}

function getRagChain() {
  if (!ragChainPromise) {
    ragChainPromise = buildRagChain().catch((err) => {
      ragChainPromise = null;
      throw err;
    });
  }
  return ragChainPromise;
}

export async function answerQuestion(question) {
  const chain = await getRagChain();
  return chain.invoke(question);
}
