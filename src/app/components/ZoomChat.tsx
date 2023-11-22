type Reaction = {
  id: string;
  emoji: string;
  author: string;
  timestamp: string;
  snippet: string;
};

type Message = {
  id: string;
  textLines: string[];
  author: string;
  timestamp: string;
  replies: Message[];
  reactions: Reaction[];
  isReply: boolean;
  replySnippet?: string;
};

function parseMessages(text: string): Message[] {
  const messageRegex = /(\d\d:\d\d:\d\d) From (.*) To Everyone/;
  const reactionRegex = /Reacted to "(.*)" with (.*)/;
  const replyRegex = /Replying to "(.*)"/;

  const lines = text.split("\n");

  const messages = [];
  const reactions = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let result = messageRegex.exec(line);
    if (result) {
      let [_, timestamp, author] = result;
      let textLines = [];
      let peek = i + 1 < lines.length && lines[i + 1];
      let id = `line-${i}`;
      while (peek && !messageRegex.test(peek)) {
        i++;
        let content = peek.trim();
        let reactionResult = reactionRegex.exec(content);
        if (reactionResult) {
          let [__, snippet, emoji] = reactionResult;
          reactions.push({
            id,
            snippet,
            emoji,
            author,
            timestamp,
          });
          // we assume if we found a reaction that we don't have a message and we don't keep peeking
          break;
        } else {
          textLines.push(content);
        }
        peek = i + 1 < lines.length && lines[i + 1];
      }
      if (textLines.length) {
        let message: Message = {
          id,
          timestamp,
          author,
          textLines,
          replies: [],
          reactions: [],
          isReply: false,
        };
        messages.push(message);
      }
    }
  }

  const replies: Message[] = [];
  messages.forEach((message) => {
    const replyResult = replyRegex.exec(message.textLines[0]);
    if (replyResult) {
      message.isReply = true;
      message.replySnippet = replyResult[1];
      message.textLines.shift(); // throwaway
      message.textLines = message.textLines.filter(
        (line) => line.trim().length
      );
      replies.push(message);
    }
  });

  const messagesBySnippet: Record<string, Message> = {};
  messages.forEach((message) => {
    let firstLine = message.textLines[0];
    let reactionSnippet =
      firstLine.length > 20 ? `${firstLine.substring(0, 20)}...` : firstLine;
    let replySnippet =
      firstLine.length > 18 ? `${firstLine.substring(0, 18)}...` : firstLine;
    let reactionSnippetHack =
      firstLine.length > 20 ? `${firstLine.substring(0, 20)}…` : firstLine;
    let reactionSnippetHack2 =
      firstLine.length > 17 ? `${firstLine.substring(0, 17)}...` : firstLine;
    let reactionSnippetHack3 =
      firstLine.length > 19 ? `${firstLine.substring(0, 19)}...` : firstLine;
    messagesBySnippet[reactionSnippet] = message;
    messagesBySnippet[replySnippet] = message;
    messagesBySnippet[reactionSnippetHack] = message;
    messagesBySnippet[reactionSnippetHack2] = message;
    messagesBySnippet[reactionSnippetHack3] = message;
  });

  replies.forEach((reply) => {
    const message = messagesBySnippet[reply.replySnippet!];
    if (message) {
      message.replies.push(reply);
    } else {
      console.warn("no message found for reply:", reply.replySnippet);
    }
  });

  reactions.forEach((reaction) => {
    const message = messagesBySnippet[reaction.snippet] as Message;
    if (message) {
      message.reactions.push(reaction);
    } else {
      console.warn("no message found for reaction:", reaction.snippet);
    }
  });

  return messages.filter((message) => !message.isReply);
}

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
        <div className="bg-slate-100 p-2 rounded-md">
          <p>
            {message.textLines.map((line) => (
              <>
                {line}
                <br />
              </>
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
  const messages = parseMessages(text);

  return (
    <div className="flex flex-col items-start justify-center p-10 max-w-md sm:max-w-sm mx-auto">
      {messages.map((message, i, messages) => (
        <>
          {needsTimestamp(message, i, messages) ? (
            <Timestamp timestamp={message.timestamp} />
          ) : (
            <></>
          )}
          <ChatMessage key={message.id} message={message} />
        </>
      ))}
    </div>
  );
}
