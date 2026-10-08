// Operator utility: secrets stay in memory and are never printed or written to disk.
import {createECDH} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const cli='node_modules/supabase/dist/supabase.js';
const project='bjfrcyxaczqcxwccbuyx';
function run(args){const result=spawnSync(process.execPath,[cli,...args,'--project-ref',project,'--output-format','json'],{encoding:'utf8',windowsHide:true});if(result.status!==0)throw new Error('Supabase command failed; secret values and CLI output suppressed.');return JSON.parse(result.stdout);}
const inventory=run(['secrets','list']);
const names=new Set(inventory.secrets.map(secret=>secret.name));
if(['VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY','VAPID_SUBJECT'].some(name=>names.has(name))){console.log('VAPID configuration already exists or is partial; no keys rotated.');process.exit(0);}
const ecdh=createECDH('prime256v1');ecdh.generateKeys();
const publicKey=ecdh.getPublicKey().toString('base64url');
const privateKey=ecdh.getPrivateKey().toString('base64url');
run(['secrets','set',`VAPID_PUBLIC_KEY=${publicKey}`,`VAPID_PRIVATE_KEY=${privateKey}`,`VAPID_SUBJECT=https://${project}.supabase.co`]);
const after=run(['secrets','list']);
console.log(JSON.stringify({configured:['VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY','VAPID_SUBJECT'].every(name=>after.secrets.some(secret=>secret.name===name)),privateKeyPrinted:false,privateKeySavedLocally:false}));
