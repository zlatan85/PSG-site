type LlmOptions = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
};

const stubResponse = (prompt: string) => {
  const hint = prompt.split('\n').slice(0, 3).join(' ').slice(0, 120);
  return `Contenu temporaire (LLM non configure).\n\n${hint}\n\nSources:\n- https://example.com | Source | 2026-01-01`;
};

export const generateText = async ({ prompt, temperature = 0.4, maxTokens = 800 }: LlmOptions) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return stubResponse(prompt);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429 || response.status === 402 || response.status === 403) {
      return stubResponse(prompt);
    }
    throw new Error(`LLM request failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data?.choices?.[0]?.message?.content?.trim() || '';
};
