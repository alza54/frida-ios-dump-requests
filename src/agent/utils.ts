import { IRequest } from './types';

/**
 * Translates ObjC.Object to an object.
 */
export function bytesToUInt8Array (data: ObjC.Object): Array<number> | undefined {
  const byteArray = ptr(data.bytes()).readByteArray(data.length());

  return byteArray instanceof ArrayBuffer
    ? Array.from(new Uint8Array(byteArray))
    : undefined;
}

/**
 * Translates NSDictionary to an object.
 */
export function objectFromNSDictionary (dictionary: ObjC.Object): Record<string, string> {
  const enumerator = dictionary.keyEnumerator();
  const output: Record<string, string> = {};

  let key;

  while ((key = enumerator.nextObject()) !== null) {
    output[key] = dictionary.objectForKey_(key).toString();
  }

  return output;
}

/**
 * Generates request payload from ObjC NSURLRequest object.
 * 
 * @param {ObjC.Object} object NSURLRequest ObjC object
 *
 * @returns {IRequest} Request payload
 */
export function requestFromNSURLRequest (object: ObjC.Object): IRequest {
  return {
    method: object.HTTPMethod().toString(),
    url: object.URL().toString(),
    headers: objectFromNSDictionary(object.allHTTPHeaderFields()),
    body: object.HTTPBody()
      ? bytesToUInt8Array(object.HTTPBody())
      : undefined
  };
}