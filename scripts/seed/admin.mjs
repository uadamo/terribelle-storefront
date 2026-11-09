// Minimal Admin GraphQL helper that shells out to `shopify store execute`
// (auth via `shopify store auth`, see scripts/seed/README.md).
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const STORE = process.env.SHOPIFY_STORE || 'terribelle-ev5cs4ik.myshopify.com';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-admin-'));
let n = 0;

export function gql(query, variables = {}) {
  const id = n++;
  const q = path.join(tmp, `q${id}.graphql`);
  const v = path.join(tmp, `v${id}.json`);
  const o = path.join(tmp, `o${id}.json`);
  fs.writeFileSync(q, query);
  fs.writeFileSync(v, JSON.stringify(variables));
  const args = ['shopify', 'store', 'execute', '--store', STORE, '--json', '--allow-mutations',
    '--query-file', q, '--variable-file', v, '--output-file', o];
  try {
    execFileSync('npx', args, {
      stdio: ['ignore', 'ignore', 'pipe'],
      env: {...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1'},
    });
  } catch (err) {
    // The CLI sometimes exits non-zero on a socket reset *after* writing output.
    if (!fs.existsSync(o)) throw new Error(`GraphQL call failed: ${err.stderr?.toString().slice(-800)}`);
  }
  const data = JSON.parse(fs.readFileSync(o, 'utf8'));
  // Surface userErrors from any top-level mutation payload.
  for (const [key, val] of Object.entries(data ?? {})) {
    if (val?.userErrors?.length) {
      throw new Error(`${key}: ${JSON.stringify(val.userErrors)}`);
    }
  }
  return data;
}
