import React from 'react';
import ChatIcon from './ChatIcon';

const ChatMessages = ({ chat }) => {
  return (
    <div
      className={`message ${chat.role === 'model' ? 'bot' : 'user'}-message`}
    >
      {chat.role === 'model' && <ChatIcon />}
      <p className="message-text">{chat.text}</p>
    </div>
  );
};

export default ChatMessages;
