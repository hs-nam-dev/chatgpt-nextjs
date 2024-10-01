"use client";

import { useState } from "react";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { fromEnv } from "@aws-sdk/credential-providers";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import SettingTab from "@/components/settingTab";
import ChatSettings from "@/components/chatSettings";

// Custom type definitions
interface ContentBlock {
  type: string;
  text?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: ContentBlock[];
}

interface Result {
  iteration: number;
  response: string;
}

interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
  awsAccessKey: string;
  awsSecretKey: string;
  awsSessionToken: string;
  awsRegion: string;
}

const MODEL_OPTIONS = [
  { label: "Claude", value: "claude" },
  { label: "GPT-4 Vision", value: "gpt-4-vision" }
];

export default function IndexPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSettings, setChatSettings] = useState({
    systemPrompt: "",
    temperature: 0.25,
    topP: 1,
    maxTokens: 256,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: "",
    iterations: 2
  });
  const [results, setResults] = useState<Result[]>([]);
  const [userInput, setUserInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude");
  const [displaySetting, setDisplaySetting] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    google: '',
    awsAccessKey: "",
    awsSecretKey: "",
    awsSessionToken: "",
    awsRegion: "us-west-1",
  });

  const [loading, setLoading] = useState(false);

  // Bedrock 클라이언트 초기화
  const bedrockClient = new BedrockRuntimeClient({
    region: apiKeys.awsRegion,
    credentials: fromEnv(),
  });

  // Claude API 호출 함수
  const callClaudeAPI = async () => {
    if (!userInput) {
      alert("프롬프트를 입력하세요.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const input = {
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          prompt: `Human: ${userInput}\n\nAssistant:`,
          max_tokens_to_sample: 1000,
          temperature: chatSettings.temperature,
          top_p: chatSettings.topP,
        }),
      };

      const command = new InvokeModelCommand(input);
      const response = await bedrockClient.send(command);

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      console.log('Full response object:', responseBody);

      setResults([{ 
        iteration: 1, 
        response: responseBody.completion || "결과가 없습니다."
      }]);

    } catch (error) {
      console.error("Claude API 호출 중 오류 발생:", error);
      setResults([{ iteration: 1, response: "API 호출 중 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeysChange = (newApiKeys: ApiKeys) => {
    setApiKeys(newApiKeys);
    localStorage.setItem('apiKeys', JSON.stringify(newApiKeys));
  };

  const handleChatSettingsChange = (newSettings: typeof chatSettings) => {
    setChatSettings(newSettings);
  };

  return (
    <div className="flex flex-col h-screen">
      <SiteHeader onSettingClick={() => setDisplaySetting(true)} onHomeClick={() => setDisplaySetting(false)} />
      <div className="flex-1 flex overflow-hidden">
        {displaySetting ? (
          <div className="w-full p-4">
            <SettingTab apiKeys={apiKeys} />
          </div>
        ) : (
          <div className="flex-1 p-4 flex">
            <div className="w-2/3 p-4">
              <div>
                <h3 className="text-lg font-bold mb-2">프롬프트 반복 테스트</h3>
                <textarea
                  value={chatSettings.systemPrompt}
                  onChange={(e) => setChatSettings({ ...chatSettings, systemPrompt: e.target.value })}
                  className="w-full h-40 p-2 border rounded-lg mb-4"
                  placeholder="SYSTEM"
                />
                <div className="flex items-center mb-4">
                  <label className="mr-2">모델:</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="border p-2 rounded-lg"
                  >
                    {MODEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-96 border rounded-lg mb-4 p-4 overflow-y-auto bg-gray-100">
                History Area
              </div>

              <div className="flex items-center">
                <input
                  type="text"
                  className="border flex-1 p-2 rounded-lg mr-4"
                  placeholder="Enter user message..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <Button onClick={callClaudeAPI} disabled={loading}>
                  {loading ? "실행 중..." : "추가"}
                </Button>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-2">반복 결과</h3>
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2">Iteration</th>
                      <th className="border border-gray-300 p-2">Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.iteration}>
                        <td className="border border-gray-300 p-2 text-center">{result.iteration}</td>
                        <td className="border border-gray-300 p-2">{result.response}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="w-1/3 border-l p-4">
              <ChatSettings settings={chatSettings} onSettingsChange={handleChatSettingsChange} />
              <div className="mt-4">
                <Button onClick={callClaudeAPI} className="w-full" disabled={loading}>
                  {loading ? "실행 중..." : "실행하기"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}