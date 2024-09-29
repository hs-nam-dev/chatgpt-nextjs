import React from 'react';
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export interface ChatSettingsType {
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string;
  iterations: number;
}

interface ChatSettingsProps {
  settings: ChatSettingsType;
  onSettingsChange: (newSettings: ChatSettingsType) => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ settings, onSettingsChange }) => {
  const handleChange = (key: keyof ChatSettingsType, value: string | number) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <textarea
          id="systemPrompt"
          value={settings.systemPrompt}
          onChange={(e) => handleChange('systemPrompt', e.target.value)}
          placeholder="Enter system prompt"
          className="w-full h-32 p-2 border rounded-md resize-vertical"
        />
      </div>

      <div>
        <Label htmlFor="iterations">Iterations</Label>
        <Input
          id="iterations"
          type="number"
          value={settings.iterations}
          onChange={(e) => handleChange('iterations', parseInt(e.target.value, 10))}
          min={1}
          max={10}
        />
      </div>

      <div>
        <Label>Temperature: {settings.temperature.toFixed(2)}</Label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[settings.temperature]}
          onValueChange={(value) => handleChange('temperature', value[0])}
        />
      </div>

      <div>
        <Label>Top P: {settings.topP.toFixed(2)}</Label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[settings.topP]}
          onValueChange={(value) => handleChange('topP', value[0])}
        />
      </div>

      <div>
        <Label>Max Tokens: {settings.maxTokens}</Label>
        <Slider
          min={1}
          max={2048}
          step={1}
          value={[settings.maxTokens]}
          onValueChange={(value) => handleChange('maxTokens', value[0])}
        />
      </div>

      <div>
        <Label>Frequency Penalty: {settings.frequencyPenalty.toFixed(2)}</Label>
        <Slider
          min={0}
          max={2}
          step={0.01}
          value={[settings.frequencyPenalty]}
          onValueChange={(value) => handleChange('frequencyPenalty', value[0])}
        />
      </div>

      <div>
        <Label>Presence Penalty: {settings.presencePenalty.toFixed(2)}</Label>
        <Slider
          min={0}
          max={2}
          step={0.01}
          value={[settings.presencePenalty]}
          onValueChange={(value) => handleChange('presencePenalty', value[0])}
        />
      </div>

      <div>
        <Label htmlFor="stopSequences">Stop Sequences</Label>
        <Input
          id="stopSequences"
          value={settings.stopSequences}
          onChange={(e) => handleChange('stopSequences', e.target.value)}
          placeholder="Enter stop sequences"
        />
      </div>
    </div>
  );
};

export default ChatSettings;