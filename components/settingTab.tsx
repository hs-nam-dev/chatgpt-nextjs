import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
}

interface SettingTabProps {
  onApiKeyChange: (keys: ApiKeys) => void;
  apiKeys: ApiKeys;
}

const SettingTab: React.FC<SettingTabProps> = ({ onApiKeyChange, apiKeys }) => {
  const [localApiKeys, setLocalApiKeys] = useState<ApiKeys>(apiKeys);

  useEffect(() => {
    setLocalApiKeys(apiKeys);
  }, [apiKeys]);

  const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
    const newApiKeys = { ...localApiKeys, [provider]: value };
    setLocalApiKeys(newApiKeys);
  };

  const handleSave = () => {
    onApiKeyChange(localApiKeys);
    alert('API 키가 저장되었습니다.');
  };

  const handleDelete = (provider: keyof ApiKeys) => {
    const newApiKeys = { ...localApiKeys, [provider]: '' };
    setLocalApiKeys(newApiKeys);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">API Key 등록</h2>
      <p>본인의 API 키를 등록해야 플레이 그라운드를 정상적으로 사용이 가능합니다.</p>

      {Object.entries(localApiKeys).map(([provider, value]) => (
        <div key={provider} className="space-y-2">
          <Label htmlFor={`${provider}-api-key`}>{provider.charAt(0).toUpperCase() + provider.slice(1)} API Key</Label>
          <div className="flex space-x-2">
            <Input
              id={`${provider}-api-key`}
              type="password"
              value={value}
              onChange={(e) => handleApiKeyChange(provider as keyof ApiKeys, e.target.value)}
              placeholder={`Enter your ${provider} API key`}
            />
            <Button onClick={() => handleDelete(provider as keyof ApiKeys)} variant="destructive">
              삭제
            </Button>
          </div>
        </div>
      ))}

      <Button onClick={handleSave} className="w-full">저장</Button>
    </div>
  );
};

export default SettingTab;