import {ensureMidtransBackend} from './midtrans';
import {ensureDokuBackend} from './doku-production';
import {randomUUID} from 'node:crypto';
import {readFile, writeFile, rename} from 'node:fs/promises';
import {join} from 'node:path';
import {requestMasterScript} from './master-products';
import {defaultIntegrations, integrationProviders, validateIntegrations, type IntegrationDocument} from './integrations';

const localFile = join(process.cwd(), '.qa-integrations-settings.json');
let pendingSave: Promise<unknown> = Promise.resolve();

function readStoredSettings(raw: unknown) {
  if (Array.isArray(raw) && raw.length === integrationProviders.length - 1 && !raw.some(setting => setting?.id === 'midtrans')) {
    raw = [...raw, defaultIntegrations().settings.find(setting => setting.id === 'midtrans')];
  }
  return validateIntegrations(raw);
}

export async function readIntegrationSettings(): Promise<IntegrationDocument> {
  if (process.env.NODE_ENV === 'development') {
    try {
      const stored = JSON.parse(await readFile(localFile, 'utf8'));
      return {revision:String(stored.revision),settings:readStoredSettings(stored.settings)};
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error('Pengaturan integrasi lokal belum dapat dibaca.');
      }
      // With no local override, use the methods configured for this workbook.
    }
  }
  const result = await requestMasterScript('integrationSettings', {operation:'read'});
  if (result.success!==true) throw new Error('Pengaturan integrasi belum dapat dimuat.');
  return result.document ? {revision:String(result.document.revision),settings:readStoredSettings(result.document.settings)} : defaultIntegrations();
}

let previewSettings: {expires: number; promise: Promise<IntegrationDocument>} | undefined;
export function readPreviewIntegrationSettings() {
  if (previewSettings && previewSettings.expires > Date.now()) return previewSettings.promise;
  const entry = {expires: Infinity, promise: readIntegrationSettings()};
  previewSettings = entry;
  void entry.promise.then(() => { entry.expires = Date.now() + 15_000; }, () => {
    if (previewSettings === entry) previewSettings = undefined;
  });
  return entry.promise;
}

export async function saveIntegrationSettings(raw: unknown, expectedRevision: string): Promise<IntegrationDocument> {
  const settings = validateIntegrations(raw);
  const midtrans = settings.find(setting => setting.id === 'midtrans' && setting.enabled);
  if (midtrans) await ensureMidtransBackend(midtrans.environment);
  else if(settings.some(setting=>setting.id==='doku'&&setting.enabled))await ensureDokuBackend();
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
    previewSettings = undefined;
    return document;
  });
  pendingSave=task;
  return task;
}

export function integrationCredentials() {
  return integrationProviders.map(provider=>({id:provider.id, variables:provider.variables.map(name=>({name,configured:!!process.env[name]?.trim()}))}));
}
