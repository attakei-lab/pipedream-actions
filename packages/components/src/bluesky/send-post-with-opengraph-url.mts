import { axios } from "@pipedream/platform";
import { defineAction } from "@pipedream/types";

const ENDPOINT = "https://bsky.social";
const API = {
  createRecord: "/xrpc/com.atproto.repo.createRecord",
  uploadBlob: "/xrpc/com.atproto.repo.uploadBlob",
};

type OGData = {
  title: string;
  description: string;
  image: string;
};

export default defineAction({
  name: "Bluesky/Send post with OpenGraph URL.",
  version: "0.1.1",
  key: "bluesky_send-post-with-opengraph-url",
  description: "Send post into Bluesky Social with link card from URL.",
  type: "action",
  methods: {},
  props: {
    bodyText: {
      type: "string",
      label: "Message text",
    },
    linkUrl: {
      type: "string",
      label: "URL to link",
    },
    bluesky: {
      type: "app",
      app: "bluesky",
    },
  },
  async run(options) {
    if (!options) {
      throw new Error("Argument is required");
    }
    const { $ } = options;
    // Fetch Open Graph data.
    const apiUrl = `https://api.dub.co/metatags?url=${this.linkUrl}`;
    const ogData: OGData = await fetch(apiUrl).then((resp) => resp.json());
    if (!ogData.image) {
      throw new Error("This action require image URL");
    }
    // Upload blob.
    const resp = await fetch(ogData.image);
    const imageBuf = await resp.arrayBuffer();
    const blobResp = await axios($, {
      url: `${ENDPOINT}${API.uploadBlob}`,
      method: "post",
      data: imageBuf,
      headers: {
        Authorization: `Bearer ${this.bluesky.$auth.oauth_access_token}`,
      },
    });
    // Send message with ref to blob.
    return await axios($, {
      url: `${ENDPOINT}${API.createRecord}`,
      method: "post",
      data: {
        repo: this.bluesky.$auth.did,
        collection: "app.bsky.feed.post",
        record: {
          text: this.bodyText,
          createdAt: new Date().toISOString(),
          embed: {
            $type: "app.bsky.embed.external",
            external: {
              uri: this.linkUrl,
              title: ogData.title,
              description: ogData.description,
              thumb: blobResp.blob,
            },
          },
        },
      },
      headers: {
        Authorization: `Bearer ${this.bluesky.$auth.oauth_access_token}`,
        "Content-Type": "application/json",
      },
    });
  },
});
