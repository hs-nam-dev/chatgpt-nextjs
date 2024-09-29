import React, { useState } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  onSendImage: (file: File) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, onSendImage }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSendClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 기본적인 폼 제출 방지
    if (inputValue) {
      onSendMessage(inputValue);
      setInputValue(''); // 메시지 전송 후 입력 필드 리셋
    }
    if (selectedFile) {
      onSendImage(selectedFile);
      setSelectedFile(null); // 이미지 전송 후 선택 파일 초기화
      // 파일 선택 UI 리셋 (선택한 파일의 상태도 리셋)
      (document.getElementById('fileInput') as HTMLInputElement).value = '';
    }
  };

  return (
    <div className="input-area">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Type a message..."
      />
      <input
        id="fileInput" // 파일 인풋 필드에 ID 추가
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button onClick={handleSendClick}>Send</button>
    </div>
  );
};
