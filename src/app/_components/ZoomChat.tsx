import { Message, parseMessages } from "../_data/parseMessages";

function Emojis({ reactions }: { reactions: Reaction[] }) {
  if (!reactions.length) {
    return <></>;
  }

  const reactionGroups: Record<string, string[]> = {};

  reactions.forEach((reaction) => {
    if (!reactionGroups[reaction.emoji]) {
      reactionGroups[reaction.emoji] = [];
    }
    reactionGroups[reaction.emoji].push(reaction.author);
  });

  return (
    <div className="flex flex-row gap-2 p-2">
      {Object.entries(reactionGroups).map(([emoji, authors]) => (
        <div key={emoji} title={authors.join(", ")}>
          {emoji} {authors.length > 1 ? authors.length : ""}
        </div>
      ))}
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <div className="mb-2">
      <p className="text-slate-400 text-xs mb-1">{message.author}</p>
      <div className="mb-2">
        <div className="bg-slate-100 p-2 rounded-md w-full">
          <p className="overflow-hidden [overflow-wrap:anywhere]">
            {message.textLines.map((line, i) => (
              <span key={`${message.id}-${i}`}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>
        <Emojis reactions={message.reactions} />
      </div>
      {message.replies.length > 0 && (
        <div className="ml-4 mt-2">
          {message.replies.map((reply) => (
            <ChatMessage key={reply.id} message={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

function needsTimestamp(message: Message, i: number, messages: Message[]) {
  if (i === 0) {
    return true;
  }
  const previous = messages[i - 1];
  const tsRegex = /(\d\d):(\d\d):(\d\d)/;
  const currentTimestamp = tsRegex.exec(message.timestamp);
  if (!currentTimestamp) {
    return false;
  }
  const previousTimestamp = tsRegex.exec(previous.timestamp);
  if (!previousTimestamp) {
    return false;
  }
  const [_, currentHour, currentMinute] = currentTimestamp;
  const [__, previousHour, previousMinute] = previousTimestamp;
  return currentHour != previousHour || currentMinute != previousMinute;
}

function Timestamp({ timestamp }: { timestamp: string }) {
  return (
    <div className="text-slate-500 font-medium my-4 mx-auto">
      {timestamp.substring(0, 5)}
    </div>
  );
}

export default function ZoomChat({ text }: { text: string }) {
  const messages: Message[] = parseMessages(text);

  return (
    <div className="flex flex-col items-start justify-center p-10">
      {messages.map((message, i, messages) => (
        <div key={message.id}>
          {needsTimestamp(message, i, messages) ? (
            <Timestamp timestamp={message.timestamp} />
          ) : (
            <></>
          )}
          <ChatMessage key={message.id} message={message} />
        </div>
      ))}
    </div>
  );
}
