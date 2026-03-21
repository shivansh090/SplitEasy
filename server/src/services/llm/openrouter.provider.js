const LLMProvider = require('./llm.provider');
const { EXPENSE_PARSE_PROMPT, PERSONAL_EXPENSE_PARSE_PROMPT } = require('./prompts');
const { llmModel } = require('../../config/env');

class OpenRouterProvider extends LLMProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.model = llmModel;
    this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    console.log(`OpenRouter provider initialized with model: ${this.model}`);
  }

  async _callLLM(prompt) {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const startTime = Date.now();
      console.log(`[OpenRouter] Attempt ${attempt + 1}/${maxRetries + 1} | model: ${this.model} | prompt length: ${prompt.length} chars`);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
          console.log(`[OpenRouter] Aborting after 60s — no response received`);
          controller.abort();
        }, 60000);

        const body = JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          provider: {
            sort: 'price',
            allow_fallbacks: false,
          },
        });

        console.log(`[OpenRouter] Sending POST to ${this.baseUrl} (body: ${body.length} bytes)...`);

        const res = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://spliteasy.app',
            'X-Title': 'SplitEasy',
          },
          body,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[OpenRouter] Response received in ${elapsed}s | status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
          const errBody = await res.text();
          console.error(`[OpenRouter] Error body: ${errBody.slice(0, 500)}`);
          const error = new Error(`OpenRouter API error ${res.status}: ${errBody}`);
          error.status = res.status;
          throw error;
        }

        const data = await res.json();
        console.log('[OpenRouter] Response model:', data.model, '| usage:', JSON.stringify(data.usage));

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
          console.error('[OpenRouter] Full response:', JSON.stringify(data).slice(0, 500));
          throw new Error(`OpenRouter returned empty response`);
        }

        console.log(`[OpenRouter] LLM output (${text.length} chars): ${text.slice(0, 200)}...`);

        // Try parsing the full text as JSON first (handles arrays and objects)
        const trimmed = text.trim();
        try {
          return JSON.parse(trimmed);
        } catch { /* not clean JSON, try extraction */ }

        // Extract JSON array [...] or object {...} from surrounding text
        const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try { return JSON.parse(arrayMatch[0]); } catch { /* fall through */ }
        }

        const objMatch = trimmed.match(/\{[\s\S]*\}/);
        if (objMatch) {
          try { return JSON.parse(objMatch[0]); } catch { /* fall through */ }
        }

        throw new Error(`LLM did not return valid JSON. Raw: ${trimmed.slice(0, 300)}`);
      } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.error(`[OpenRouter] Attempt ${attempt + 1} failed after ${elapsed}s:`, {
          name: error.name,
          message: error.message,
          cause: error.cause ? {
            message: error.cause.message,
            code: error.cause.code,
            errno: error.cause.errno,
          } : 'none',
          status: error.status,
          stack: error.stack?.split('\n').slice(0, 3).join(' | '),
        });

        lastError = error;

        if (error.name === 'AbortError') {
          lastError = new Error(`LLM request timed out after ${elapsed}s`);
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

  async parseExpense(message, groupMembers, senderName) {
    console.log(`[OpenRouter] parseExpense called | sender: ${senderName} | members: ${groupMembers.join(', ')}`);
    const prompt = EXPENSE_PARSE_PROMPT
      .replace('{{MESSAGE}}', message)
      .replace('{{MEMBERS}}', JSON.stringify(groupMembers))
      .replace('{{SENDER}}', senderName);
    return this._callLLM(prompt);
  }

  async parsePersonalExpense(message, senderName, recentExpenses = []) {
    const expSummary = recentExpenses.length > 0
      ? JSON.stringify(recentExpenses.map((e) => ({ _id: e._id, description: e.description, amount: e.amount, category: e.category, date: e.expenseDate || e.createdAt })))
      : 'none';
    const today = new Date().toISOString().split('T')[0];
    console.log(`[OpenRouter] parsePersonalExpense called | sender: ${senderName} | message: "${message.slice(0, 100)}" | recent: ${recentExpenses.length}`);
    const prompt = PERSONAL_EXPENSE_PARSE_PROMPT
      .replace('{{MESSAGE}}', message)
      .replace('{{TODAY}}', today)
      .replace('{{SENDER}}', senderName)
      .replace('{{RECENT_EXPENSES}}', expSummary);
    return this._callLLM(prompt);
  }
}

module.exports = OpenRouterProvider;
