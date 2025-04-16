import dotenv from "dotenv";
import actionDef from "../dist/openai/chatgpt.mjs";

dotenv.config();

const $ = {
  export(val) {
    console.debug(val);
  },
};

(async () => {
  const action = Object.assign(actionDef, {});
  action.text = process.argv[2];
  action.apiKey = process.env.OPENAI_API_KEY;
  const result = await action.run({ $ });
  console.log(result);
})();
