// import * as React from 'react';

// function App() {
//   const [question, setQuestion] = React.useState('');
//   const [answer, setAnswer] = React.useState('');

//   // This function will post a message to the extension side.
//   // The extension will call Ollama, then return the result.
//   const handleAsk = () => {
//     vscodeApi.postMessage({
//       type: 'ask-ollama',
//       question,
//     });
//   };

//   // Listen for messages coming back from the extension
//   React.useEffect(() => {
//     window.addEventListener('message', (event) => {
//       const message = event.data;
//       if (message.type === 'ollama-response') {
//         setAnswer(message.answer);
//       }
//     });
//   }, []);

//   return (
//     <div className="p-4">
//       <h1 className="text-xl mb-4">Ollama Q&A</h1>
//       <div className="mb-4">
//         <input
//           className="border rounded p-2 w-full"
//           type="text"
//           placeholder="Ask a question..."
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//         />
//       </div>
//       <button
//         className="bg-blue-500 text-white py-2 px-4 rounded"
//         onClick={handleAsk}
//       >
//         Ask Ollama
//       </button>

//       {answer && (
//         <div className="mt-4 p-2 border rounded bg-gray-100">
//           <strong>Answer:</strong> {answer}
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;