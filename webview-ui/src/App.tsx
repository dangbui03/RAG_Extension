import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';

// If you're in TypeScript, declare the VS Code API:
declare global {
  interface Window {
    acquireVsCodeApi?: any;
  }
}

const App: React.FC = () => {
  // The original code uses document.getElementById(...) a lot,
  // but we'll store some of the data in React state:
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  // We'll keep the entire "chatContent" as a single HTML string:
  const [chatContent, setChatContent] = useState<string>('');

  // VS Code API reference
  const vscode = useRef<any>(null);

  // On mount, acquire the VS Code API and request model population
  useEffect(() => {
    if (window.acquireVsCodeApi) {
      vscode.current = window.acquireVsCodeApi();
      vscode.current.postMessage({ command: 'populateModels' });
    }
  }, []);

  // Listen for messages from the VS Code extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      if (message.command === 'populateModels') {
        // Update the list of models
        if (Array.isArray(message.models)) {
          setModels(message.models);
          setSelectedModel(message.models[0] || '');
        } else {
          setModels(['No models found']);
          setSelectedModel('');
        }
      }
      else if (message.type === 'update') {
        // The extension sent an updated AI response in Markdown
        const rawMarkdown = message.content || 'No response received.';
        const renderedHtml = marked.parse(rawMarkdown);

        // Replace the last <div id="response"> with the new HTML
        setChatContent((prev) =>
          prev.replace(
            /(<div id="response"[^>]*>)([\s\S]*?)(<\/div>)/,
            `$1${renderedHtml}$3`
          )
        );

        // Clear the question text (like original code)
        setQuestion('');

        // Scroll to bottom
        const bottom = document.getElementById('theEnd');
        if (bottom) {
          const pos = bottom.getBoundingClientRect();
          window.scroll({
            top: pos.top,
            left: 0,
            behavior: 'smooth',
          });
        }
      }
      else if (message.type === 'updateDone') {
        // Mark the last response as "done"
        setChatContent((prev) =>
          prev.replace(
            /(<div id="response"[^>]*>)([\s\S]*?)(<\/div>)/,
            `<div id="response-done">$2</div><div style="height: 10px;"></div>`
          )
        );

        // Re-enable the textarea
        const questionEl = document.getElementById('question') as HTMLTextAreaElement;
        if (questionEl) {
          questionEl.disabled = false;
          questionEl.focus();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle changing the selected model
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  // Handle keypress in the question textarea
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return; // Shift+Enter for new line

    e.preventDefault(); // Prevent newline
    const trimmed = question.trim();
    if (!trimmed) {
      // Mimic the snippet: set a warning in #response if question is empty
      alert('⚠️ Please enter a question.');
      return;
    }

    // Append question + model + "Please wait..." to the chat
    setChatContent((prev) =>
      prev +
      `<div class="grid justify-items-end">
         <div class="question-sent-box bg-gray-700 text-left p-2 rounded-md w-fit">
           ${trimmed}
         </div>
       </div>
       <div>${selectedModel}</div>
       <div id="response" class="bg-gray-700 text-left p-2 rounded-md w-fit">Please wait...</div>`
    );

    // Disable textarea
    const questionEl = document.getElementById('question') as HTMLTextAreaElement;
    if (questionEl) {
      questionEl.disabled = true;
    }

    // Send the message to the extension
    vscode.current?.postMessage({
      command: 'askQuestion',
      text: trimmed,
      model: selectedModel,
    });

    // Reset question input
    setQuestion('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-5">
      {/* Header */}
      <header style={{ position: 'sticky', top: 0 }}>
        <select
          id="model"
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-3 text-sm cursor-pointer focus:border-blue-500"
          value={selectedModel}
          onChange={handleModelChange}
        >
          {models.length === 0 && (
            <option value="">Loading models...</option>
          )}
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </header>

      {/* Title */}
      <h3 className="text-center text-yellow-300 text-xl mb-4">Chat with AI</h3>

      {/* Chat content */}
      <div
        id="chatContent"
        dangerouslySetInnerHTML={{ __html: chatContent }}
      />

      {/* Input section */}
      <div className="w-full bg-gray-800 p-4 rounded-lg shadow-lg mt-5">
        <div className="input-section space-y-4">
          <textarea
            id="question"
            rows={2}
            placeholder="Type your question..."
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-3 text-sm outline-none focus:border-blue-500"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className="flex justify-end">
            <p>Press Enter to send, or use Shift+Enter for a new line</p>
          </div>
          {/* This is where we scroll to the end */}
          <div id="theEnd"></div>
        </div>
      </div>
    </div>
  );
};

export default App;
