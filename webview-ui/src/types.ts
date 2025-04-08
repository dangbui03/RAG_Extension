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

export interface FileModel {
  fileName: string;
  fileExtension: string;
  fileContent: string;
}

export const versions = [
  "v13.0.0",
  "v13.0.1",
  "v13.0.2",
  "v13.0.3",
  "v13.0.4",
  "v13.0.5",
  "v13.0.6",
  "v13.0.7",
  "v13.1.0",
  "v13.1.1",
  "v13.1.2",
  "v13.1.3",
  "v13.1.4",
  "v13.1.5",
  "v13.1.6",
  "v13.2.0",
  "v13.2.1",
  "v13.2.2",
  "v13.2.3",
  "v13.2.4",
  "v13.3.0",
  "v13.3.1",
  "v13.3.2",
  "v13.3.3",
  "v13.3.4",
  "v13.4.0",
  "v13.4.1",
  "v13.4.10",
  "v13.4.11",
  "v13.4.12",
  "v13.4.13",
  "v13.4.14",
  "v13.4.15",
  "v13.4.16",
  "v13.4.17",
  "v13.4.18",
  "v13.4.2",
  "v13.4.3",
  "v13.4.4",
  "v13.4.5",
  "v13.4.6",
  "v13.4.7",
  "v13.4.8",
  "v13.4.9",
  "v13.5.0",
  "v13.5.1",
  "v13.5.2",
  "v13.5.3",
  "v13.5.4",
  "v13.5.5",
  "v13.5.6",
  "v13.5.7",
  "v13.5.8",
  "v14.0.0",
  "v14.0.1",
  "v14.0.2",
  "v14.0.3",
  "v14.0.4",
  "v14.1.0",
  "v14.1.1",
  "v14.1.2",
  "v14.1.3",
  "v14.1.4",
  "v14.2.0",
  "v14.2.1",
  "v14.2.10",
  "v14.2.11",
  "v14.2.12",
  "v14.2.13",
  "v14.2.14",
  "v14.2.15",
  "v14.2.16",
  "v14.2.17",
  "v14.2.18",
  "v14.2.19",
  "v14.2.2",
  "v14.2.20",
  "v14.2.21",
  "v14.2.22",
  "v14.2.3",
  "v14.2.4",
  "v14.2.5",
  "v14.2.6",
  "v14.2.7",
  "v14.2.8",
  "v14.2.9",
  "v15.0.0",
  "v15.0.1",
  "v15.0.2",
  "v15.0.3",
  "v15.0.4",
  "v15.1.0",
  "v15.1.1",
  "v15.1.2",
  "v15.1.3"
];

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
