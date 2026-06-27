import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type E2EConfig = {
  routes: {
    home: string;
    signIn: string;
    myWallets: string;
    explorer: string;
  };
  auth: {
    credentialsApi: string;
    storageStatePath: string;
  };
};

const configFilePath = resolve(process.cwd(), 'e2e/config/config.dev.json');

function readConfigFile() {
  const configContent = readFileSync(configFilePath, 'utf8');
  return JSON.parse(configContent) as E2EConfig;
}

const config = readConfigFile();

export function getE2EConfig() {
  return config;
}

export function getAuthStatePath() {
  return resolve(process.cwd(), config.auth.storageStatePath);
}
