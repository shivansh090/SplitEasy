class LLMProvider {
  async parseExpense(message, groupMembers, senderName) {
    throw new Error('parseExpense() must be implemented by subclass');
  }

  async parsePersonalExpense(message, senderName, recentExpenses) {
    throw new Error('parsePersonalExpense() must be implemented by subclass');
  }
}

module.exports = LLMProvider;
