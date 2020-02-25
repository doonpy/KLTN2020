abstract class ChatBotBase {
    /**
     * @param message
     */
    public abstract sendMessage(message: string): void;
}

export default ChatBotBase;
