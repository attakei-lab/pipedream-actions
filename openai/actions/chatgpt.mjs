import fetch from "node-fetch";

export default {
  key: "openai-shortcut-chatgpt",
  name: "Completions text by OpenAI",
  description: "For creation ChatGPT like answer by OpenAI API",
  version: "0.1.0",
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
  async run({ $ }) {
    const apiUrl = "https://api.openai.com/v1/completions";
    const payload = {
      model: "text-davinci-003",
      prompt: this.text,
      max_tokens: 4000,
      temperature: 0,
    };
    const options = {
      method: "post",
      body: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
    };

    const result = await fetch(apiUrl, options).then((res) => res.json());
    $.export("$summary", "Successfully api");
    return {
      raw: result,
      text: result.choices[0].text.trim(),
    };
  },
};
