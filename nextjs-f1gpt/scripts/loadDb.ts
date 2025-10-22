import { DataAPIClient } from "@datastax/astra-db-ts"
import OpenAI from "openai"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import "dotenv/config"

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"


const {
    ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_API_ENDPOINT, 
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY 
} = process.env;


const openai = new OpenAI({apiKey: OPENAI_API_KEY})

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.formula1.com/',
    'https://www.statsf1.com/en/default.aspx?utm_source=chatgpt.com',
    'https://motorsportstats.com/series/fia-formula-one-world-championship/summary/2025',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_Grand_Prix_winners',
    'https://en.wikipedia.org/wiki/2026_Formula_One_World_Championship',
    'https://en.wikipedia.org/wiki/Portal:Formula_One',
    'https://f1.fandom.com/wiki/Formula_1_Wiki',
    'https://en.wikipedia.org/wiki/History_of_Formula_One',
    'https://en.wikipedia.org/wiki/Formula_One_Group',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_Grands_Prix'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)

const db = client.db(ASTRA_DB_API_ENDPOINT)

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100
});

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric
    },
    keyspace: ASTRA_DB_NAMESPACE
  });
  console.log(res)
};



const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION, { keyspace: ASTRA_DB_NAMESPACE });
  for await (const url of f1Data) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float"
      });
      const vector = embedding.data[0].embedding;
      const res = await collection.insertOne({
      $vector: vector,
      text: chunk
      });
      console.log(res);

    }
  }
};


const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true
    },
    gotoOptions: {
      waitUntil: "domcontentloaded"
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    }
  });
  const html = await loader.scrape();
  return html.replace(/<[^>]*>?/gm, '');
};


createCollection().then(() => loadSampleData())
