export class AIProvider {
  async generateText(_params) {
    throw new Error("Not implemented");
  }

  async streamText(params, onToken) {
    const result = await this.generateText(params);
    if (result?.text && typeof onToken === "function") {
      onToken(result.text);
    }
    return result;
  }

  async moderateContent(_text) {
    return { allowed: true };
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export { withTimeout };
