import { requestFromNSURLRequest } from './utils';

/**
 * Intercept HTTP requests before sending with NSURLSession.
 */
export function hookNSURLSession (): void {
  console.log('[+] Found NSURLSession target class.');

  performHook(ObjC.classes.NSURLSession, '- dataTaskWithRequest:completionHandler:', (args) => {
    const request = requestFromNSURLRequest(new ObjC.Object(args[2]));

    send({ type: 'request', payload: request, timestamp: Date.now(), origin: 'NSURLSession' });
  });
}

/**
 * Intercept HTTP requests on NSURLRequest deallocation.
 */
 export function hookNSURLRequest (): void {
  console.log('[+] Found NSURLRequest target class.');
  
  performHook(
    ObjC.classes.NSURLRequest,
    '- dealloc',
    (args) => {
      const request = requestFromNSURLRequest(new ObjC.Object(args[0]));

      send({ type: 'request', payload: request, timestamp: Date.now(), origin: 'NSURLRequest' });
    }
  );
}

/**
 * Hook NSURLConnection (verbose).
 */
export function hookNSURLConnection (): void {
  console.log('[+] Found NSURLConnection target class.');

  performHook(
    ObjC.classes.NSURLConnection,
    '- start',
    (_args) => console.log('[+] HTTP Request sent! [NSURLConnection start]')
  );

  performHook(
    ObjC.classes.NSURLConnection,
    '- initWithRequest:delegate:startImmediately:',
    (_args) => console.log('[+] HTTP Request sent! [NSURLConnection initWithRequest:startImmediately] (Deprecated at iOS 9.0)')
  );


  performHook(
    ObjC.classes.NSURLConnection,
    '- initWithRequest:delegate:',
    (_args) => console.log('[+] HTTP Request sent! [NSURLConnection initWithRequest] (Deprecated at iOS 9.0)')
  );

  performHook(
    ObjC.classes.NSURLConnection,
    '+ connectionWithRequest:delegate:',
    (_args) => console.log('[+] HTTP Request sent! [NSURLConnection connectionWithRequest] (Deprecated at iOS 9.0)')
  );

  performHook(
    ObjC.classes.NSURLConnection,
    '+ sendSynchronousRequest:returningResponse:error:',
    (_args) => console.log('[+] HTTP Request sent! [NSURLConnection sendSynchronousRequest] (Deprecated at iOS 9.0)')
  );

  performHook(
    ObjC.classes.NSURLConnection,
    '+ sendAsynchronousRequest:queue:completionHandler:',
    (_args) => console.log('[+] HTTP Request sent! [NSURLConnection sendAsynchronousRequest] (Deprecated at iOS 9.0)')
  );
}

/**
 * Get HTTP POST Requests (verbose).
 */
export function hookNSMutableURLRequest (): void {
  console.log('[+] Found NSMutableURLRequest target class.');
}

function performHook (
  targetClass: ObjC.Object,
  target: string,
  onEnter: (args: InvocationArguments) => void
): void {
  const hook = targetClass[target];

  Interceptor.attach(hook.implementation, {
    onEnter: (args) => {
      onEnter(args);
    }
  });
}