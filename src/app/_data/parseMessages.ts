export type Reaction = {
  id: string;
  emoji: string;
  author: string;
  timestamp: string;
  snippet: string;
};

export type Message = {
  id: string;
  textLines: string[];
  author: string;
  timestamp: string;
  replies: Message[];
  reactions: Reaction[];
  isReply: boolean;
  replySnippet?: string;
};

export function parseMessages(text: string): Message[] {
  const messageRegex = /(\d\d:\d\d:\d\d) From (.*) To Everyone/i;
  const reactionRegex = /Reacted to "(.*)" with (.*)/i;
  const replyRegex = /Replying to "(.*)"/i;
  const unReactionRegex = /Removed a (.*) reaction from "(.*)"/i;

  const lines = text.split("\n");

  const messages = [];
  const reactions = [];
  const unreactions = [];

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
          let unReactionResult = unReactionRegex.exec(content);
          if (unReactionResult) {
            let [___, emoji, snippet] = unReactionResult;
            unreactions.push({
              id,
              snippet,
              emoji,
              author,
              timestamp,
            });
            // we assume if we found an ureaction that we don't have a message and we don't keep peeking
            break;
          } else {
            textLines.push(content);
          }
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
    } else {
      console.log(`"${line}"does not appear to be a message`);
    }
  }

  // console.log("finding replies out of messages", messages.length);
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

  // console.log("indexing messages", messages.length);
  const messagesBySnippet: Record<string, Message> = {};
  messages.forEach((message) => {
    let firstLine = message.textLines[0];
    // this is all rather hacky, but zoom summarizes and truncates messages differently, reasoning unclear!
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

  // console.log("aggregating replies", replies.length);
  replies.forEach((reply) => {
    const message = messagesBySnippet[reply.replySnippet!];
    if (message) {
      message.replies.push(reply);
    } else {
      console.warn("no message found for reply:", reply.replySnippet);
    }
  });

  // console.log("aggregating reactions", reactions.length);
  reactions.forEach((reaction) => {
    const message = messagesBySnippet[reaction.snippet] as Message;
    if (message) {
      message.reactions.push(reaction);
    } else {
      console.warn("no message found for reaction:", reaction.snippet);
    }
  });

  // console.log("observing unreactions", unreactions.length);
  unreactions.forEach((unreaction) => {
    const message = messagesBySnippet[unreaction.snippet] as Message;
    if (message) {
      for (let i = 0; i < message.reactions.length; i++) {
        const reaction = message.reactions[i];
        const removed =
          reaction.emoji === unreaction.emoji &&
          reaction.author === unreaction.author;
        if (removed) {
          message.reactions.splice(i, 1);
          // we found one, bail out of the loop:
          break;
        }
      }
    } else {
      console.warn("no message found for unreaction:", unreaction.snippet);
    }
  });

  return messages.filter((message) => !message.isReply);
}
