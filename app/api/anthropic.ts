// /pages/api/anthropic.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk'; // Anthropic SDK를 사용한다고 가정

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { prompt } = req.body;

    // 민감한 API Key는 서버에서만 사용
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not set in the environment variables' });
    }

    const claudeClient = new Anthropic({
        apiKey,
    });

    try {
        const response = await claudeClient.completions.create({
            model: 'claude-3-5-sonnet-20240620',
            prompt: prompt,
            max_tokens_to_sample: 1000, // 필수 필드로 추가됨
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error from Anthropic API', details: error });
    }
}
