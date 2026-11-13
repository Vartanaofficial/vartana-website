// Sign ASCII JSON so Apps Script and Node use identical bytes for Indonesian
// punctuation, accents and emoji. The payload itself retains its original text.
export const RPC_AUTH_ENCODING='json-ascii-v1';
export function serializeSignedPayload(payload:unknown){
  const json=JSON.stringify(payload);
  if(json===undefined)throw Error('Payload otorisasi tidak valid.');
  return json.replace(/[\u007f-\uffff]/g,character=>'\\u'+character.charCodeAt(0).toString(16).padStart(4,'0'));
}
