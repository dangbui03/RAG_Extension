export interface AIModel {
    id: string;
    name: string;
    provider: string;
    description?: string;
    tags?: string[];
    performance?: "optimized" | "standard" | "high";
    recommended?: boolean;
    private?: boolean;
    protected?: boolean;
  };  

export interface ChatMessage {
    id: string;
    role: "system" | "user" | "assistant";
    content: string;
    timestamp: Date;
    status?: "sending" | "sent" | "error";
  };

export interface Chat {
    id: string;
    title: string;
    messages: ChatMessage[];
    model: AIModel;
    createdAt: Date;
    updatedAt: Date;
  };