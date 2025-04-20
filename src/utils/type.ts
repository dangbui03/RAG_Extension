import { FileModel, AdditionalOptions } from "../../webview-ui/src/share/types";
export class MyError extends Error {
  type: ErrorType;

  constructor(message: string, type: ErrorType) {
    super(message); // Pass the message to the base Error class
    this.type = type;
    // Ensure the name of this error matches the class name
    this.name = this.constructor.name;

    // Maintain proper stack trace (only works in V8 engines like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export enum ErrorType {
  INFO = 1,
  ERROR = 2,
  WARNING = 3,
}

// Define interfaces for the API request and response
export interface RagRequest {
  version_name: string;
  query: string;
  model: string;
  file_list?: FileModel[];
  additional_options?: AdditionalOptions;
}

export interface RagResponse {
  model: string;
  response: string;
  retrieved_data: any[];
}
