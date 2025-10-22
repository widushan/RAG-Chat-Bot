"use client"
import Image from "next/image"
import f1GPTLogo from "./assets/f1GPTLogo.png"
import { useChat } from "ai/react"
import { Message } from "ai"
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRaw from "./components/PromptSuggestionsRow"


const Home = () => {

    const {append, isLoading, messages, input, handleInputChange, handleSubmit} = useChat()

    const noMessages = !messages || messages.length === 0

    const handlePrompt = ( promptText ) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        }
        append(msg)
    }

    return (
        <main>
            <Image src={f1GPTLogo} alt="F1GPT Logo" width={200} height={75} />
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                    <p className="starter-text">
                        The Ultimate place for Formula One super fans! 
                        Ask F1GPT anything about the fantastic topic of F1 racing and it will come back with the most up-to-date answers.
                        We hope you enjoy!
                    </p>
                    <br />
                    <PromptSuggestionsRaw onPromptClick={handlePrompt} />
                    </>
                ) : (
                    <>
                    { messages.map((message, index) => <Bubble key={`message-${index}`} message={message} />) }
                    { isLoading && <LoadingBubble /> }
                    </>
                )}
                
            </section>

            <form onSubmit={handleSubmit}>
                <input className="question-box" type="text" placeholder="Ask F1GPT anything..." value={input} onChange={handleInputChange} />
                <button type="submit">Send</button>
            </form>

        </main>
    )
}


export default Home
