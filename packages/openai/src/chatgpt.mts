import { axios } from "@pipedream/platform";
import { defineAction } from "@pipedream/types";

export default defineAction({
  key: "openai-shortcut-chatgpt",
  name: "Completions text by OpenAI",
  description: "For creation ChatGPT like answer by OpenAI API",
  version: "0.1.2",
  type: "action",
  props: {
    apiKey: {
      type: "string",
      label: "API Key",
      secret: true,
    },
    text: {
      type: "string",
      label: "Target text",
    },
  },
  async run(options) {
    if (!options) {
      throw new Error("Argument is required");
    }
    const { $ } = options;
    const config = {
      url: "https://api.openai.com/v1/completions",
      method: "post",
      data: {
        model: "text-davinci-003",
        prompt: this.text,
        max_tokens: 3000,
        temperature: 0,
      },
      headers: {
        authorization: `Bearer ${this.apiKey}`,
      },
    };
    const result = await axios(this, config);
    $.export("$summary", "Successfully api");
    return {
      raw: result,
      text: result.choices[0].text.trim(),
    };
  },
});
