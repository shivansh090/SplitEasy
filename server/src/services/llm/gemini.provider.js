const { GoogleGenAI } = require('@google/genai');
const LLMProvider = require('./llm.provider');
const { EXPENSE_PARSE_PROMPT } = require('./prompts');
const { geminiModel } = require('../../config/env');

class GeminiProvider extends LLMProvider {
  constructor(apiKey) {
    super();
    this.ai = new GoogleGenAI({ apiKey });
    console.log(`Gemini provider initialized with model: ${geminiModel}`);
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
        const response = await Promise.race([
          this.ai.models.generateContent({
            model: geminiModel,
            contents: prompt,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('LLM request timed out')), 15000)
          ),
        ]);

        const text = response.text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('LLM did not return valid JSON');
        }
        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        lastError = error;
        const isRateLimit = error.status === 429 ||
          error.message?.includes('429') ||
          error.message?.includes('quota') ||
          error.message?.includes('retry');

        if (isRateLimit && attempt < maxRetries) {
          const wait = (attempt + 1) * 3000;
          console.log(`Rate limited, retrying in ${wait / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }
}

module.exports = GeminiProvider;
