import { useState } from 'react';
import './App.css';

const App = () => {
  const [showChatbot, setShowChatbot] = useState(true);
  console.log(showChatbot);
  return (
    <div className="container show-chatbot">
      <button id="cb-toggler" onClick={() => setShowChatbot((prev) => !prev)}>
        <span className="material-symbols-rounded">Mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>
    </div>
  );
};

export default App;
