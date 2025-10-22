# F1GPT - RAG Chat Bot

A sophisticated RAG (Retrieval-Augmented Generation) chatbot built with Next.js, LangChain.js, and OpenAI. This application provides intelligent responses by combining retrieval of relevant information with generative AI capabilities.

## 🚀 Features

- **RAG Architecture**: Combines document retrieval with AI generation for accurate responses
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Real-time Chat**: Interactive chat experience with streaming responses
- **Document Processing**: Intelligent document parsing and vector storage
- **OpenAI Integration**: Powered by OpenAI's GPT models

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: LangChain.js, OpenAI API
- **Database**: Vector database for document storage

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key
- Git (for cloning the repository)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rag-chat-bot.git
cd rag-chat-bot/nextjs-f1gpt
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your environment variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
# Add other required environment variables
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Screenshots

<img width="1919" height="1026" alt="Image" src="https://github.com/user-attachments/assets/bfb41aa0-56c6-44af-8bab-4cf68bbdb583" />

<img width="1906" height="1025" alt="Image" src="https://github.com/user-attachments/assets/38104949-eae1-41e2-8de3-b6e31e4902a6" />

<img width="1894" height="865" alt="Image" src="https://github.com/user-attachments/assets/67cb2300-a6fa-41c5-b0ed-d0ec9b370855" />


## 📁 Project Structure

```
nextjs-f1gpt/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── components/
│   │   ├── Bubble.tsx           # Chat bubble component
│   │   ├── LoadingBubble.tsx    # Loading animation
│   │   ├── PromptSuggestionButton.tsx
│   │   └── PromptSuggestionsRow.tsx
│   ├── assets/                   # Static assets
│   ├── global.css               # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── scripts/
│   └── loadDb.ts                # Database loading script
└── README.md
```

## 🔧 API Routes

The application includes the following API endpoints:

- `/api/chat` - Main chat endpoint for processing user messages and generating responses

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [LangChain.js](https://js.langchain.com/) for the AI orchestration
- [OpenAI](https://openai.com/) for the powerful AI models


## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/rag-chat-bot/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the maintainers    -->    widushanp@gmail.com

---

**Repository**: [https://github.com/widushan/RAG-Chat-Bot.git](https://github.com/yourusername/rag-chat-bot)


