"use client";

import { useState, useEffect } from "react";
import Anthropic from '@anthropic-ai/sdk';
import { Configuration, OpenAIApi } from 'openai'; // OpenAI SDK의 설정 및 API 임포트
import { SiteHeader } from "@/components/site-header";
import { InputArea } from "@/components/inputarea";
import ChatSettings, { ChatSettingsType } from "@/components/chatSettings";
import SettingTab, { ApiKeys } from "@/components/settingTab";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type MessageContent = { type: 'text'; text: string } | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

interface Message {
  role: 'user' | 'assistant';
  content: MessageContent | MessageContent[];
}

interface Result {
  iteration: number;
  response: string;
}

const MODEL_OPTIONS = [
  { label: "Claude", value: "claude" },
  { label: "GPT-4 Vision", value: "gpt-4-vision" } // GPT-4 비전 추가
];

export default function IndexPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    google: ''
  });
  const [chatSettings, setChatSettings] = useState<ChatSettingsType>({
    systemPrompt: "", // 기본값 제거
    temperature: 0.7,
    topP: 1,
    maxTokens: 1024,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: "",
    iterations: 1
  });
  const [displaySetting, setDisplaySetting] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [userInput, setUserInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("claude"); // 모델 선택 상태 추가

  const claudeClient = new Anthropic({
    apiKey: apiKeys.anthropic,
  });

  const openAIConfig = new Configuration({
    apiKey: apiKeys.openai, // OpenAI API 키 설정
  });
  const openAIClient = new OpenAIApi(openAIConfig); // OpenAI 인스턴스 생성

  const handleInputChange = (value: string) => {
    setUserInput(value);
  };

  const handleSend = async () => {
    if (selectedModel === "claude" && !apiKeys.anthropic) {
      alert("Anthropic API 키를 설정해주세요.");
      setDisplaySetting(true);
      return;
    } else if (selectedModel === "gpt-4-vision" && !apiKeys.openai) {
      alert("OpenAI API 키를 설정해주세요.");
      setDisplaySetting(true);
      return;
    }

    if (!chatSettings.systemPrompt) {
      alert("시스템 프롬프트를 입력하세요.");
      return;
    }

    const newMessages: Message[] = [...messages];
    let userMessage: Message;

    if (uploadedImage) {
      const base64Image = await getBase64(uploadedImage);
      userMessage = {
        role: "user",
        content: [
          { type: "text", text: userInput || "이 이미지를 분석해주세요." },
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Image } }
        ]
      };
    } else {
      userMessage = { role: "user", content: { type: "text", text: userInput } };
    }

    newMessages.push(userMessage);
    setMessages(newMessages);

    try {
      if (selectedModel === "claude") {
        await sendToClaude(newMessages);
      } else if (selectedModel === "gpt-4-vision") {
        await sendToGPT4Vision(newMessages);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setResults([{ iteration: 1, response: "An unexpected error occurred" }]);
    }

    setUserInput("");
    setUploadedImage(null);
    setImagePreview(null);
  };

  const sendToClaude = async (newMessages: Message[]) => {
    try {
      const stream = await claudeClient.messages.stream({
        model: "claude-3-5-sonnet-20240620", // Claude 모델 설정
        max_tokens: chatSettings.maxTokens,
        messages: [
          { role: "assistant", content: chatSettings.systemPrompt }, // 시스템 프롬프트에 type 제거
          ...newMessages.map((msg) => ({
            role: msg.role,
            content: Array.isArray(msg.content)
              ? msg.content
                  .map(c => {
                    if ('text' in c) {
                      return c.text; // 텍스트 메시지의 경우
                    } else if ('source' in c && c.type === 'image') {
                      return "[Image]"; // 이미지 메시지의 경우, 이미지를 문자열로 표시 (필요시 다른 처리)
                    }
                  })
                  .join("\n")
              : 'text' in msg.content
              ? msg.content.text
              : "[Image]", // 텍스트 메시지 또는 이미지 처리
          }))
        ],
        temperature: chatSettings.temperature,
        top_p: chatSettings.topP,
      });
  
      let accumulatedResponse = '';
      for await (const messageStreamEvent of stream) {
        if (messageStreamEvent.type === 'content_block_delta') {
          const delta = messageStreamEvent.delta;
      
          // delta가 TextDelta 타입인지 확인 (text 속성이 있는지 확인)
          if ('text' in delta) {
            accumulatedResponse += delta.text; // text 속성이 있을 때만 추가
          } else {
            console.warn("Unknown delta type", delta);
          }
      
          setResults([{ iteration: 1, response: accumulatedResponse }]);
        }
      }
      const finalMessage = await stream.finalMessage();
      if (finalMessage.content.length > 0) {
        const contentBlock = finalMessage.content[0];
      
        // contentBlock에 text 속성이 있는지 확인
        if ('text' in contentBlock) {
          setResults([{ iteration: 1, response: contentBlock.text }]);
        } else {
          // text 속성이 없을 때는 다른 처리를 할 수 있습니다.
          console.warn("Content block does not contain text:", contentBlock);
          setResults([{ iteration: 1, response: "[Non-text content]" }]); // 비텍스트 콘텐츠에 대한 기본 처리
        }
      }
      if (finalMessage.content.length > 0) {
        const contentBlock = finalMessage.content[0];
      
        // contentBlock에 text 속성이 있는지 확인
        if ('text' in contentBlock) {
          newMessages.push({ 
            role: "assistant", 
            content: { type: "text", text: contentBlock.text } // 텍스트 메시지를 처리
          });
        } else {
          // text 속성이 없을 때는 다른 처리를 할 수 있습니다.
          console.warn("Content block does not contain text:", contentBlock);
          newMessages.push({ 
            role: "assistant", 
            content: { type: "text", text: "[Non-text content]" } // 비텍스트 콘텐츠에 대한 기본 처리
          });
        }
      
        setMessages(newMessages); // 최종 메시지 상태 업데이트
      }
      
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        console.error('API Error:', error.status, error.name, error.error);
      } else {
        console.error('Unexpected error:', error);
        setResults([{ iteration: 1, response: "An unexpected error occurred" }]);
      }
    }
  };
  
  // GPT-4 Vision API 호출을 처리하는 함수
  const sendToGPT4Vision = async (newMessages: Message[]) => {
    try {
      const response = await openAIClient.createChatCompletion({
        model: "gpt-4", // GPT-4 비전 모델 설정
        messages: [
          { role: "system", content: chatSettings.systemPrompt },
          ...newMessages.map((msg) => {
            // msg.content가 배열인지 단일 객체인지 확인
            const contentArray = Array.isArray(msg.content) ? msg.content : [msg.content];
  
            // 텍스트 콘텐츠를 추출
            const contentText = contentArray.map(c => {
              if ('text' in c) {
                return c.text; // 텍스트일 경우
              } else if ('source' in c && c.type === 'image') {
                return "[Image]"; // 이미지일 경우
              }
              return '';
            }).join("\n");
  
            return {
              role: msg.role,
              content: contentText // 추출된 텍스트 콘텐츠
            };
          })
        ],
        temperature: chatSettings.temperature,
        top_p: chatSettings.topP,
        max_tokens: chatSettings.maxTokens,
        functions: uploadedImage ? [{ name: "image_analysis", description: "Analyze uploaded images" }] : undefined, // 이미지 분석 함수 추가
        function_call: uploadedImage ? { name: "image_analysis" } : undefined
      });
  
      const responseText = response.data.choices[0].message?.content || "No response";
      setResults([{ iteration: 1, response: responseText }]);
      newMessages.push({ role: "assistant", content: { type: "text", text: responseText } });
      setMessages(newMessages);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      setResults([{ iteration: 1, response: "An error occurred with OpenAI" }]);
    }
  };
  

  const handleApiKeysChange = (newApiKeys: ApiKeys) => {
    setApiKeys(newApiKeys);
    localStorage.setItem('apiKeys', JSON.stringify(newApiKeys));
  };

  const handleChatSettingsChange = (newSettings: ChatSettingsType) => {
    setChatSettings(newSettings);
  };

  const handleSettingClick = () => {
    setDisplaySetting(true);
  };

  const handleHomeClick = () => {
    setDisplaySetting(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value); // 선택된 모델 업데이트
  };

  useEffect(() => {
    const savedApiKeys = localStorage.getItem('apiKeys');
    if (savedApiKeys) {
      setApiKeys(JSON.parse(savedApiKeys));
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <SiteHeader onSettingClick={handleSettingClick} onHomeClick={handleHomeClick} />
      <div className="flex-1 flex overflow-hidden">
        {displaySetting ? (
          <div className="w-full p-4">
            <SettingTab onApiKeyChange={handleApiKeysChange} apiKeys={apiKeys} />
          </div>
        ) : (
          <>
            <div className="w-2/3 flex flex-col p-4">
              <div className="mb-4 flex justify-between items-center">
                <select onChange={handleModelChange} value={selectedModel}>
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="ml-4"
                />
              </div>
              <div className="mb-4">
                <textarea
                  value={chatSettings.systemPrompt}
                  onChange={(e) => setChatSettings({...chatSettings, systemPrompt: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Enter system prompt"
                />
              </div>
              {imagePreview && (
                <div className="mb-4">
                  <Image src={imagePreview} alt="Uploaded" width={200} height={200} />
                </div>
              )}
              <InputArea 
                onSendMessage={handleInputChange} // 메시지를 처리하는 함수
                onSendImage={handleSend} // 이미지를 처리하는 함수
              />
              <Button onClick={handleSend} className="mt-4">Send</Button>
              <div className="mt-4 overflow-y-auto max-h-96">
                {results.map((result, index) => (
                  <div key={index} className="mb-4">
                    <strong>Response {result.iteration}:</strong>
                    <p>{result.response}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-1/3 border-l border-gray-200 overflow-auto p-4">
              <ChatSettings settings={chatSettings} onSettingsChange={handleChatSettingsChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
