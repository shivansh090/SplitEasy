const LLMProvider = require('./llm.provider');
const { EXPENSE_PARSE_PROMPT } = require('./prompts');
const { llmModel } = require('../../config/env');

class OpenRouterProvider extends LLMProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.model = llmModel;
    this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    console.log(`OpenRouter provider initialized with model: ${this.model}`);
  }

  async parseExpense(message, groupMembers, senderName) {
    const prompt = EXPENSE_PARSE_PROMPT
      .replace('{{MESSAGE}}', message)
      .replace('{{MEMBERS}}', JSON.stringify(groupMembers))
      .replace('{{SENDER}}', senderName);

    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://spliteasy.app',
            'X-Title': 'SplitEasy',
          },
          body: JSON.stringify({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            provider: {
              sort: 'price',
              allow_fallbacks: false,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const errBody = await res.text();
          const error = new Error(`OpenRouter API error ${res.status}: ${errBody}`);
          error.status = res.status;
          throw error;
        }

        const data = await res.json();
        console.log('[OpenRouter] Response model:', data.model, '| usage:', data.usage);

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error(`OpenRouter returned empty response: ${JSON.stringify(data)}`);
        }

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`LLM did not return valid JSON. Raw: ${text.slice(0, 200)}`);
        }

        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        const cause = error.cause || error;
        console.error(`[OpenRouter] Attempt ${attempt + 1}/${maxRetries + 1} failed:`, {
          message: error.message,
          cause: cause?.message || cause?.code || String(cause),
          status: error.status,
        });

        lastError = error;

        if (error.name === 'AbortError') {
          lastError = new Error('LLM request timed out (30s)');
          throw lastError;
        }

        const isRetryable = error.status === 429 ||
          error.status === 502 ||
          error.status === 503 ||
          error.message?.includes('fetch failed');

        if (isRetryable && attempt < maxRetries) {
          const wait = (attempt + 1) * 3000;
          console.log(`[OpenRouter] Retrying in ${wait / 1000}s...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }

        throw error;
      }
    }
    throw lastError;
  }
}

module.exports = OpenRouterProvider;
