import {ensureDokuBackend} from './doku-production';
import {randomUUID} from 'node:crypto';
import {readFile, writeFile, rename} from 'node:fs/promises';
import {join} from 'node:path';
import {requestMasterScript} from './master-products';
import {defaultIntegrations, integrationProviders, validateIntegrations, type IntegrationDocument} from './integrations';

const localFile = join(process.cwd(), '.qa-integrations-settings.json');
let pendingSave: Promise<unknown> = Promise.resolve();

export async function readIntegrationSettings(): Promise<IntegrationDocument> {
  if (process.env.NODE_ENV === 'development') {
    try {
      const stored = JSON.parse(await readFile(localFile, 'utf8'));
      return {revision:String(stored.revision),settings:validateIntegrations(stored.settings)};
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code==='ENOENT') return defaultIntegrations();
      throw new Error('Pengaturan integrasi lokal belum dapat dibaca.');
    }
  }
  const result = await requestMasterScript('integrationSettings', {operation:'read'});
  if (result.success!==true) throw new Error('Pengaturan integrasi belum dapat dimuat.');
  return result.document ? {revision:String(result.document.revision),settings:validateIntegrations(result.document.settings)} : defaultIntegrations();
}

export async function saveIntegrationSettings(raw: unknown, expectedRevision: string): Promise<IntegrationDocument> {
  const settings = validateIntegrations(raw);
  if(settings.some(setting=>setting.id==='doku'&&setting.enabled))await ensureDokuBackend();
  if (process.env.NODE_ENV!=='development') {
    const result = await requestMasterScript('integrationSettings', {operation:'save',settings,expectedRevision});
    if (result.success!==true) throw new Error('Pengaturan belum tersimpan.');
    return {revision:String(result.document.revision),settings:validateIntegrations(result.document.settings)};
  }
  const task = pendingSave.catch(()=>{}).then(async()=>{
    const current = await readIntegrationSettings();
    if (current.revision!==expectedRevision) throw new Error('Pengaturan berubah di perangkat lain. Muat ulang sebelum menyimpan.');
    const document = {revision:randomUUID(),settings};
    const temporary = localFile+'.'+randomUUID()+'.tmp';
    await writeFile(temporary,JSON.stringify(document),{encoding:'utf8',mode:0o600});
    await rename(temporary,localFile);
    return document;
  });
  pendingSave=task;
  return task;
}

export function integrationCredentials() {
  return integrationProviders.map(provider=>({id:provider.id, variables:provider.variables.map(name=>({name,configured:!!process.env[name]?.trim()}))}));
}
