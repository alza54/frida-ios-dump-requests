#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import * as frida from 'frida';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { IRequest, IRequestSignal } from './agent/types';

const argv = yargs(hideBin(process.argv)).options({
  n: { type: 'string', alias: 'name', description: 'Target process name to spawn.' },
  p: { type: 'number', alias: 'pid', description: 'Target process PID to attach to.' },
  o: { type: 'string', alias: 'output', description: 'Output JSON file path.', demandOption: true },
  'body-type': { choices: ['uint8array', 'base64'], description: 'JSON output body type.', default: 'uint8array' },
  filter: { choices: ['NSURLSession', 'NSURLRequest'], alias: 'origin-filter', description: 'Filter intercepted request origin. None by default.' }
}).parseSync();

const requests: Array<{ request: IRequest; timestamp: number; origin: string }> = [];

async function handleRequest ({ payload: request, timestamp, origin }: IRequestSignal): Promise<void> {
  console.log(`[+] HTTP ${request.method} request: ${request.url}`);

  if (argv['body-type'] === 'base64' && typeof request.body !== 'undefined') {
    request.body = Buffer.from(request.body).toString('base64');
  }

  if (typeof argv['filter'] === 'string' && origin !== argv['filter']) {
    return;
  }

  requests.push({ request, timestamp, origin });

  await fs.writeFile(argv.o, JSON.stringify(requests), 'utf8');
}

async function main (): Promise<void> {
  const scriptContent = await fs.readFile(path.resolve(__dirname, '../src/_agent.js'), 'utf8');

  const device = await frida.getUsbDevice();

  let session!: frida.Session;
  let pid!: number;

  if (typeof argv.p !== 'undefined') {
    pid = argv.p;
    session = await device.attach(pid);
  } else if (typeof argv.n !== 'undefined') {
    pid = await device.spawn(argv.n);
    session = await device.attach(pid); 
  } else {
    throw new TypeError('You need to provide either app package name to spawn or app PID to attach.');
  }

  const script = await session.createScript(scriptContent);

  script.message.connect(message => {
    if (
      message.type === 'send' &&
      typeof message.payload === 'object' &&
      message.payload.type === 'request'
    ) {
      handleRequest(message.payload);
    }
  });

  await script.load();

  console.log('[+] Script loaded');

  await device.resume(pid);

  console.log('[+] Process resumed');
}

main()
  .catch(console.error);