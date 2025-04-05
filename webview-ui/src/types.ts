export interface AIModel {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  recommended?: boolean;
}

export interface ChatMessage {
  id: string;
  user_prompt: string;
  ai_answer?: string;
  model: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const mockChats: Chat[] = [
  {
    id: "1",
    title: `Chat 1`,
    messages: [
      {
        id: "1",
        user_prompt: `Hi nguaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        \`\`\`javascript
        function greet(name) {
        return "Hello, " + name + "!";
        }
        console.log(greet("World"));
        \`\`\`
        hi
        \`\`\`javascript
        function greet(name) {
        return "Hello, " + name + "!";
        }
        console.log(greet("World"));
        \`\`\`
        dkkkkkk\nkkkkk\n\n dddddd
         \`\`\`javascript
        function greet(name) {
        return "Hello, " + name + "!";
        }
        console.log(greet("World"));
        \`\`\``,
        ai_answer: `
Hello! Here's some code:

\`\`\`javascript
function greet(name) {
return "Hello, " + name + "!";
}
console.log(greet("World"));
\`\`\`

And some text.
  `,
        // content: "hi",
        model: "Grok",
        timestamp: new Date(),
      },
      {
        id: "2",
        user_prompt: "Hi",
        ai_answer: `
Hello! Here's some code:
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!" + "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsssssssssssssssssssssssssssssssssssssssssssssss";
}
console.log(greet("World"));
\`\`\`
And some text.
        `,
        // content: "Hello",
        model: "Grok",
        timestamp: new Date(),
      },
    ],
    // model: "Grok",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Chat 2",
    messages: [
      {
        id: "1",
        user_prompt: "Hi béo",
        ai_answer: "Hello!",
        // content: "hi",
        model: "Grok",
        timestamp: new Date(),
      },
    ],
    // model: "Grok",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Chat 3",
    messages: [
      {
        id: "1",
        user_prompt: "Hi there",
        ai_answer: "Hello!",
        // content: "hi",
        model: "Grok",
        timestamp: new Date(),
      },
    ],
    // model: "Grok",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Chat 4",
    messages: [
      {
        id: "1",
        user_prompt: "Hi there",
        ai_answer: "Hello!",
        // content: "hi",
        model: "Grok",
        timestamp: new Date(),
      },
    ],
    // model: "Grok",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    title: "Chat 5",
    messages: [
      {
        id: "1",
        user_prompt: "Hi there",
        ai_answer: "Hello!",
        // content: "hi",
        model: "Grok",
        timestamp: new Date(),
      },
    ],
    // model: "Grok",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    title: "Chat 6",
    messages: [
      {
        id: "1",
        user_prompt: "Hi there",
        ai_answer: "Hello!",
        // content: "hi",
        model: "Grok",
        timestamp: new Date(),
      },
    ],
    // model: "Grok",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
