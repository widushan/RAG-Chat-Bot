import { Message } from "ai"

type BubbleProps = {
    message: Message
}

const Bubble = ({ message }: BubbleProps) => {

    const { content, role } = message

    return (
        <div className={`${role} bubble`}>{message.content}</div>
    )
}

export default Bubble