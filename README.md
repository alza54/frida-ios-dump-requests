# frida-ios-dump-requests

Dump any iOS application HTTP requests with Frida and Node.js with just one command. **It is working regardless SSL pinning.**

## Working with

* ✅ Facebook (335.0 - latest)
* ✅ Instagram (204.0 - latest)
* ✅ Snapchat (11.44.0.39 - latest)
* ✅ Probably any other iOS application

## Introduction

This library intercepts HTTP requests by hooking ObjC internal classes such as `NSURLRequest` which are used to construct HTTP requests. This tool tries to catch the request when it's considered ready to be send, and forwards its data to Node.js logger wrapper. This way you could intercept and even modify requests regardless of SSL pinning and other MITM prevention techniques. It may be useful for penetration testing purposes, security researchers and app testers.

## Prerequisites

1. [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed (developed with npm version 6.14.15 and Node 14.17.6).
2. Jailbroken iOS device running Frida-server. I am running Frida 14.2.18, so if you are running >=Frida@15, in case of issues (e.g. error `[Error: This feature requires an iOS Developer Disk Image to be mounted; run Xcode briefly or use ideviceimagemounter to mount one manually]`), run `npm install --save frida@latest`

## Installation

```bash
git clone https://github.com/alza54/frida-ios-dump-requests.git # Clone repo
cd frida-ios-dump-requests
npm install # Install dependencies
npm run lib:build # Compile Frida script
npm run build # Build Typescript source
```

## Usage

```
node dist/index.js --help

Options:
      --help                     Show help                             [boolean]
      --version                  Show version number                   [boolean]
  -n, --name                     Target process name to spawn.          [string]
  -p, --pid                      Target process PID to attach to.       [number]
  -o, --output                   Output JSON file path.      [string] [required]
      --body-type                JSON output body type.
                       [choices: "uint8array", "base64"] [default: "uint8array"]
      --filter, --origin-filter  Filter intercepted request origin. None by
                                 default.
                                       [choices: "NSURLSession", "NSURLRequest"]
```

```
# Dump Snapchat requests (spawn app)
node dist/index.js -n com.toyopagroup.picaboo -o snapchat.json --body-type base64
```

```
# Dump requests from an running app
node dist/index.js -p 4026 -o discord.json --body-type base64
```

## Filter option
Different apps use different ways to send HTTP requests. When you set `--filter NSURLSession` you will avoid dumping of unsent/duplicated HTTP requests, but for many apps such as Facebook, Instagram, Snapchat you won't see any requests dumped. `NSURLSession` filter however relies on `dealloc` method and  might dump unsent (trash) requests as well.

## Contributing
Pull requests are welcome.

## Note
If you found this tool useful, please consider starring it 💫

## License
[MIT](https://github.com/alza54/frida-ios-dump-requests/blob/main/LICENSE.md)