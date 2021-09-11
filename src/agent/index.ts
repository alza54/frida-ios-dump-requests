import { hookNSMutableURLRequest, hookNSURLConnection, hookNSURLRequest, hookNSURLSession } from './hooks';

function hookClasses (): void {
  for (const className in ObjC.classes) {
    if (ObjC.classes.hasOwnProperty(className)) {
      switch (className) {
        case 'NSURLConnection':
          hookNSURLConnection();
          break;
        case 'NSURLRequest':
          hookNSURLRequest();
          break;
        case 'NSMutableURLRequest':
          hookNSMutableURLRequest();
          break;
        case 'NSURLSession':
          hookNSURLSession();
          break;
      }
    }
  }
}

if (ObjC.available) {
  try {
    hookClasses();
  } catch (error) {
    if (error instanceof Error) {
      console.error('[!] Exception: ' + error.message);
    } else {
      console.error('[!] Unknown Exception:', error);
    }
  }
}