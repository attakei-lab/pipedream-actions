import crypto from "node:crypto";
import { defineAction } from "@pipedream/types";

const ENDPOINT = "https://api.x.com/2/tweets";

type Credentials = {
  api_key: string;
  api_key_secret: string;
  access_token: string;
  access_token_secret: string;
};

type OAuthParameter = {
  consumer_key: string;
  nonce: string;
  signature_method: "HMAC-SHA1";
  timestamp: string;
  token: string;
  version: "1.0";
};

function createSignature(
  endpoint: string,
  parameter: OAuthParameter,
  consumerSecret: string,
  tokenSecret: string,
): string {
  const paramsString = [
    `oauth_consumer_key=${encodeURIComponent(parameter.consumer_key)}`,
    `oauth_nonce=${encodeURIComponent(parameter.nonce)}`,
    `oauth_signature_method=${encodeURIComponent(parameter.signature_method)}`,
    `oauth_timestamp=${encodeURIComponent(parameter.timestamp)}`,
    `oauth_token=${encodeURIComponent(parameter.token)}`,
    `oauth_version=${encodeURIComponent(parameter.version)}`,
  ].join("&");
  const baseString = `POST&${encodeURIComponent(endpoint)}&${encodeURIComponent(paramsString)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmac_sha1 = crypto.createHmac("sha1", signingKey);
  return encodeURIComponent(hmac_sha1.update(baseString).digest("base64"));
}

function createHeader(parameter: OAuthParameter, signature: string): string {
  return [
    `oauth_consumer_key="${parameter.consumer_key}"`,
    `oauth_nonce="${parameter.nonce}"`,
    `oauth_signature="${signature}"`,
    `oauth_signature_method="${parameter.signature_method}"`,
    `oauth_timestamp="${parameter.timestamp}"`,
    `oauth_token="${parameter.token}"`,
    `oauth_version="1.0"`,
  ].join(", ");
}

export default defineAction({
  name: "Twitter/Send tweet",
  version: "0.1.0",
  key: "twitter_send-tweet",
  description: "Send tweet into X(Twitter).",
  type: "action",
  methods: {},
  props: {
    credentialsText: {
      type: "string",
      label: "Credentials JSON text",
      secret: true,
    },
    bodyText: {
      type: "string",
      label: "Tweet text",
    },
  },
  async run() {
    const credentials: Credentials = JSON.parse(this.credentialsText);
    const parameter: OAuthParameter = {
      consumer_key: credentials.api_key,
      nonce: Math.random().toString(36).substring(2, 16),
      signature_method: "HMAC-SHA1",
      timestamp: Math.floor(Date.now() / 1000).toString(),
      token: credentials.access_token,
      version: "1.0",
    };
    const signature = createSignature(
      ENDPOINT,
      parameter,
      credentials.api_key_secret,
      credentials.access_token_secret,
    );
    // Send request
    const payload = {
      text: this.bodyText,
    };
    return await fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        Authorization: `OAuth ${createHeader(parameter, signature)}`,
        "Content-Type": "application/json",
      },
    });
  },
});
