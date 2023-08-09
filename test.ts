import { encode, decode, Data } from './lib';
import {describe, it, expect} from '@jest/globals';

describe('Encoding Module', () => {
  it('should not allow more than 1000 items', () => {
    const to_send: Data = [];
    for(let i = 0; i < 1001; i++) {
      to_send.push(i);
    }

    expect(() => encode(to_send)).toThrowError();
  });

  it('should not allow invalid data types', () => {
    //Force a bad value here
    const to_send = [{}] as Data;
    expect(() => encode(to_send)).toThrowError();
  });

  it('simple array case', () => {
    const to_send: Data = [1, 2, 3];
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });

  it('simple string case', () => {
    const to_send: Data = ["Hey", "I'm", "a", "string"];
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });

  it('special string characters', () => {
    const to_send: Data = [",", "\"", "It's me"];
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });

  it('simple array/string case', () => {
    const to_send: Data = ["Hey", 1, "I'm", 2, "a", 3, "string"];
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });

  it('simple nested array case', () => {
    const to_send: Data = ["foo", ["bar", 42]];
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });

  it('simple repeated values case', () => {
    const to_send: Data = [1, 1, 2, 2, 3, 3];
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });

  it('simple arrays with repeated values case', () => {
    const to_send: Data = [1, 1, 2, 2, [3, 3]];
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });

  it('deep nested arrays case', () => {
    const to_send: Data = [1, 1, 2, 2, [3, [4, 5]], 6];
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });

  it('larger array/string case', () => {
    const random = (): number => Math.floor(Math.random() * 1000);
    const to_send: Data = [];
    for(let i = 0; i < 1000; i++) {
      const value = i % 2 === 0 ? `Number ${random()} is a string` : random();
      to_send.push(value);
    }
    
    const encoded = encode(to_send);
    const decoded = decode(encoded);
    expect(to_send).toEqual(decoded);
  });
});