import { useEffect, useRef, useState } from 'react';
import './App.css';
import ChatIcon from './components/ChatIcon';
import ChatForm from './components/ChatForm';
import ChatMessages from './components/ChatMessages';

const BACKEND_URL = 'http://localhost:8000/chat';

const App = () => {
  const [showChatbot, setShowChatbot] = useState(true);
  // console.log(showChatbot);

  const [chatHistory, setChatHistory] = useState([]);

  const chatBodyRef = useRef();

  const generateChatResponse = async (history) => {
    // console.log(history);

    const updatedHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== '생각중 ...'),
        { role: 'model', text },
      ]);
    };

    const formattedHistory = history.map(({ role, text }) => ({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text: text }],
    }));

    // 접촉사고 법적 처리 절차에 대해 알려주세요
    // 사기피해 법적 처리 절차에 대해 알려주세요

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents: formattedHistory }),
    };

    try {
      const response = await fetch(BACKEND_URL, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message || '요청 오류가 발생했습니다.');
      }
      // console.log(data);
      updatedHistory(data.candidates[0].content.parts[0].text.trim());
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(chatHistory);

  // generateChatResponse();

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatHistory]);

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

        <div className="cb-body" ref={chatBodyRef}>
          <div className="message bot-message">
            <ChatIcon />
            <p className="message-text">
              Hello! I'm Chat-bot. <br />
              How can I help you today?
            </p>
          </div>

          {chatHistory.map((chat, idx) => (
            <ChatMessages key={idx} chat={chat} />
          ))}
        </div>

        <div className="cb-footer">
          <ChatForm
            generateChatResponse={generateChatResponse}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
