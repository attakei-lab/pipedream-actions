#!/usr/bin/env node
/**
 * Install Pipedream CLI into project root.
 */
import os from "node:os";

import AdmZip from "adm-zip";

const CLI_URL = {
  "Linux-x86_64": "https://cli.pipedream.com/linux/amd64/latest/pd.zip",
  "Linux-i386": "https://cli.pipedream.com/linux/386/latest/pd.zip",
  "Linux-arm": "https://cli.pipedream.com/linux/arm/latest/pd.zip",
  "Linux-arm64": "https://cli.pipedream.com/linux/arm64/latest/pd.zip",
  "Darwin-x86_64": "https://cli.pipedream.com/darwin/amd64/latest/pd.zip",
  "Windows_NT-x86_64": "https://cli.pipedream.com/windows/amd64/latest/pd.zip",
};

// Main
(async () => {
  const osName = os.type();
  const cpuName = os.machine();
  const id = `${osName}-${cpuName}`;
  if (!Object.keys(CLI_URL).includes(id)) {
    console.error(`Script does not support for ${osName} x ${cpuName}.`);
    return;
  }
  const url = CLI_URL[id];
  await fetch(url)
    .then((resp) => resp.blob())
    .then((body) => {
      const zip = new AdmZip(body);
      zip.extractAllTo(".");
    });
})();
