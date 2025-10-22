import OpenAI from "openai"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { DataAPIClient } from "@datastax/astra-db-ts"

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY
} = process.env

// Initialize OpenAI only if API key is available
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY
}) : null

// Initialize Astra DB client only if credentials are available
const client = ASTRA_DB_APPLICATION_TOKEN && ASTRA_DB_API_ENDPOINT 
  ? new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
  : null
const db = client && ASTRA_DB_API_ENDPOINT ? client.db(ASTRA_DB_API_ENDPOINT) : null

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const latestMessage = messages[messages.length - 1].content

    let docContext = ""

    // Only proceed with embedding and database query if services are available
    if (openai && db && ASTRA_DB_COLLECTION) {
      try {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: latestMessage,
          encoding_format: "float"
        })

        const collection = await db.collection(ASTRA_DB_COLLECTION)
        const cursor = collection.find(null, {
          sort: {
            $vector: embedding.data[0].embedding
          },
          limit: 10
        })

        const documents = await cursor.toArray()
        const docsMap = documents?.map(doc => doc.text)
        docContext = JSON.stringify(docsMap)
      }
      catch (err) {
        console.log("Error querying db...")
        docContext = ""
      }
    } 

    const template = {
      role: "system",
      content: `You are an AI assistant who knows everything about Formula One. 
      Use the below context to augment what you know about Formula One racing. 
      The context will provide you with the most recent page data from wikipedia, the official F1 website and others.
      If the context doesn't include the information you need answer based on your existing knowledge 
      and don't mention the source of your information or what the context does or doesn't include.
      Format responses using markdown where applicable and don't return images.
      ------------------
      START CONTEXT
      ${docContext}
      END CONTEXT
      ------------------
      QUESTION: ${latestMessage}
      ------------------
    `
    }
    if (!openai) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [template, ...messages]
    })

    const stream = OpenAIStream(response as any)
    return new StreamingTextResponse(stream)





  } catch (err) {
      throw err
  }

}

