import { useState } from 'react';
import './App.css';
import ChatIcon from './components/ChatIcon';
import ChatForm from './components/ChatForm';
import ChatMessages from './components/ChatMessages';

const BACKEND_URL = 'http://localhost:8000/chat';

const generateChatResponse = async (history) => {
  console.log(history);

  const formattedHistory = history.map(({ role, text }) => ({
    role: role === 'user' ? 'user' : 'model',
    parts: [{ text: text }],
  }));

  const options = {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify({ contents: formattedHistory }),
  };
};

// generateChatResponse();

const App = () => {
  const [showChatbot, setShowChatbot] = useState(true);
  console.log(showChatbot);
  return (
    <div className={`container ${showChatbot ? 'show-chatbot' : ''}`}>
      <button id="cb-toggler" onClick={() => setShowChatbot((prev) => !prev)}>
        <span className="material-symbols-rounded">Mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>

      <div className="cb-popup">
        <div className="cb-header">
          <div className="header-info">
            <ChatIcon />
            <h2 className="logo-text">Agent Chatbot</h2>
          </div>
          <button className="material-symbols-rounded arrow-icon">
            Keyboard_arrow_down
          </button>
        </div>

        <div className="cb-body">
          <div className="message bot-message">
            <ChatIcon />
            <p className="message-text">
              Hello! I'm Chat-bot. <br />
              How can I help you today?
            </p>
          </div>

          <ChatMessages />
        </div>

        <div className="cb-footer">
          <ChatForm generateChatResponse={generateChatResponse} />
        </div>
      </div>
    </div>
  );
};

export default App;
