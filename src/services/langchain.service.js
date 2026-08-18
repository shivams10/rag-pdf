import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import { GOOGLE_API_KEY, QDRANT_API_KEY, QDRANT_URL } from "../config/env.js";
import {
  LANGCHAIN_COLLECTION_NAME,
  LANGCHAIN_EMBEDDING_MODEL,
  LANGCHAIN_GENERATION_MODEL,
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

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GOOGLE_API_KEY,
  model: LANGCHAIN_EMBEDDING_MODEL,
});

const model = new ChatGoogleGenerativeAI({
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

export async function ingestPdf(filePath) {
  const docs = await new PDFLoader(filePath).load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitDocuments(docs);
  await QdrantVectorStore.fromDocuments(chunks, embeddings, {
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
    collectionName: LANGCHAIN_COLLECTION_NAME,
  });
}

export async function answerQuestion(question) {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY,
      collectionName: LANGCHAIN_COLLECTION_NAME,
    },
  );
  const retriever = vectorStore.asRetriever({
    k: 3,
  });

  const formatDocs = (docs) =>
    docs.map((item) => item.pageContent).join("\n\n");
  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocs),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);
  return chain.invoke(question);
}
