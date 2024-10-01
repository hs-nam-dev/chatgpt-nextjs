import React, { useState, useEffect } from 'react';

// ApiKeys 타입 정의
export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
}

interface SettingTabProps {
  apiKeys: ApiKeys;
}

const SettingTab: React.FC<SettingTabProps> = ({ apiKeys }) => {
  const [localApiKeys, setLocalApiKeys] = useState<ApiKeys>(apiKeys);
  const [isMasked, setIsMasked] = useState({
    openai: true,
    anthropic: true,
    google: true,
  });
  const [isEditable, setIsEditable] = useState({
    openai: false,
    anthropic: false,
    google: false,
  });
  const [isInputActive, setIsInputActive] = useState({
    openai: false,
    anthropic: false,
    google: false,
  });

  useEffect(() => {
    setLocalApiKeys(apiKeys);
  }, [apiKeys]);

  // 입력 필드의 값이 변경되면 호출
  const handleInputChange = (key: keyof ApiKeys) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalApiKeys({ ...localApiKeys, [key]: event.target.value });
    setIsInputActive({ ...isInputActive, [key]: true }); // 입력 중이면 저장 버튼 활성화
    setIsMasked({ ...isMasked, [key]: false }); // 입력 중에는 마스킹 해제
  };

  // 저장 버튼 클릭 시 호출되는 함수
  const handleSave = (key: keyof ApiKeys) => {
    const updatedKeys = { ...localApiKeys };
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    setIsMasked({ ...isMasked, [key]: true }); // 저장 후 마스킹 처리
    setIsEditable({ ...isEditable, [key]: true }); // 저장 후 편집 불가
    setIsInputActive({ ...isInputActive, [key]: false }); // 저장 후 입력 비활성화
    alert(`${key.toUpperCase()} API 키가 저장되었습니다.`);
  };

  // 삭제 버튼 클릭 시 API 키 삭제 및 필드 초기화
  const handleDelete = (key: keyof ApiKeys) => {
    const updatedKeys = { ...localApiKeys, [key]: '' };
    setLocalApiKeys(updatedKeys);
    setIsMasked({ ...isMasked, [key]: false });
    setIsEditable({ ...isEditable, [key]: false }); // 삭제 후 다시 편집 가능
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    alert(`${key.toUpperCase()} API 키가 삭제되었습니다.`);
  };

  // 마스킹 상태에서 표시할 값을 반환하는 함수
  const getMaskedValue = (key: keyof ApiKeys) => {
    return isMasked[key] && localApiKeys[key] ? '**********************' : localApiKeys[key];
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">API Key 등록</h2>
      <p className="mb-6 text-gray-600">
        본인의 API 키를 등록해야 플레이 그라운드를 정상적으로 사용할 수 있습니다.
      </p>

      {/* OpenAI API Key */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key:</label>
        <div className="flex">
          <input
            type={isMasked.openai ? 'password' : 'text'} // 저장 중일 때는 값 그대로 표시
            value={getMaskedValue('openai')}
            onChange={handleInputChange('openai')}
            className="flex-1 p-2 border rounded-lg w-full"
            placeholder="Enter OpenAI API Key"
            disabled={isEditable.openai} // 저장 후에는 편집 불가
          />
          {isInputActive.openai ? (
            <button
              onClick={() => handleSave('openai')}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              저장
            </button>
          ) : (
            <button
              onClick={() => handleDelete('openai')}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* Anthropic API Key */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Anthropic API Key:</label>
        <div className="flex">
          <input
            type={isMasked.anthropic ? 'password' : 'text'} // 저장 중일 때는 값 그대로 표시
            value={getMaskedValue('anthropic')}
            onChange={handleInputChange('anthropic')}
            className="flex-1 p-2 border rounded-lg w-full"
            placeholder="Enter Anthropic API Key"
            disabled={isEditable.anthropic} // 저장 후에는 편집 불가
          />
          {isInputActive.anthropic ? (
            <button
              onClick={() => handleSave('anthropic')}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              저장
            </button>
          ) : (
            <button
              onClick={() => handleDelete('anthropic')}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* Google API Key */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Google API Key:</label>
        <div className="flex">
          <input
            type={isMasked.google ? 'password' : 'text'} // 저장 중일 때는 값 그대로 표시
            value={getMaskedValue('google')}
            onChange={handleInputChange('google')}
            className="flex-1 p-2 border rounded-lg w-full"
            placeholder="Enter Google API Key"
            disabled={isEditable.google} // 저장 후에는 편집 불가
          />
          {isInputActive.google ? (
            <button
              onClick={() => handleSave('google')}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              저장
            </button>
          ) : (
            <button
              onClick={() => handleDelete('google')}
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingTab;
