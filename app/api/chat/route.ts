import { NextApiRequest, NextApiResponse } from 'next';
import { SignatureV4 } from '@smithy/signature-v4';
import { HttpRequest } from '@smithy/protocol-http';
import { Sha256 } from '@aws-crypto/sha256-js';

interface HeaderBag {
  [key: string]: string;
}

// NextApiRequest의 headers를 AWS SDK에서 요구하는 형식으로 변환하는 함수
const convertHeaders = (headers: NextApiRequest['headers']): HeaderBag => {
    const convertedHeaders: HeaderBag = {};
    Object.keys(headers).forEach((key) => {
        const value = headers[key];
        if (typeof value === 'string') {
            convertedHeaders[key] = value;
        } else if (Array.isArray(value)) {
            convertedHeaders[key] = value.join(','); // 배열인 경우 ','로 결합
        }
    });
    return convertedHeaders;
};

const getAuthHeaders = async (req: NextApiRequest, region: string, apiKey: string, secretKey: string) => {
    const signer = new SignatureV4({
        service: 'bedrock',
        region: region,
        credentials: {
            accessKeyId: apiKey,
            secretAccessKey: secretKey,
        },
        sha256: Sha256,
    });

    const headers = convertHeaders(req.headers);  // 헤더 변환
    const request = new HttpRequest({
        method: req.method!.toUpperCase(),
        headers, // AWS SDK에서 요구하는 형식으로 변환된 headers
        protocol: 'https',
        hostname: `bedrock.${region}.amazonaws.com`,
        path: '/',
    });

    const signedRequest = await signer.sign(request);
    return signedRequest.headers;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const apiKey = localStorage.getItem('aws_api_key');
        const secretKey = localStorage.getItem('aws_secret_key');
        const region = localStorage.getItem('aws_region');
        
        if (!apiKey || !secretKey || !region) {
            return res.status(400).json({ error: 'API key, Secret key, and region must be set in settings.' });
        }

        const headers = await getAuthHeaders(req, region, apiKey, secretKey);
        const response = await fetch(`https://bedrock.${region}.amazonaws.com`, {
            method: 'POST',
            headers: {
                ...headers,  // 서명된 요청 헤더 사용
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: 'Your input to the Bedrock model',  // 원하는 입력 값을 넣습니다.
            }),
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error calling AWS Bedrock API', details: error });
    }
}
