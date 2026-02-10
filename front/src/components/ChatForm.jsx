import React, { useRef } from 'react';

const ChatForm = ({ generateChatResponse }) => {
  const inputRef = useRef();

  // console.log(inputRef);

  const handleSubmit = (e) => {
    e.preventDefault();

    const userMessage = inputRef.current.value.trim(); // 앞뒤 공백 제거

    if (!userMessage) return;

    inputRef.current.value = '';

    generateChatResponse([{ role: 'user', text: userMessage }]);
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type Your Message..."
        className="message-input"
        ref={inputRef}
        required
      />
      <button className="material-symbols-rounded">arrow_upward</button>
    </form>
  );
};

export default ChatForm;
