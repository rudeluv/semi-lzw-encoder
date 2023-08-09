### Using the Module
```ts
import { encode, decode } from "./lib.ts";

const to_send: Data = ['foo', 'foo', 23, ['bar', 42], 23, ['bar', 42]];
const encoded = encode(to_send);
// '["foo",<0>,23,["bar";42],<2>,<3>]'
const decoded = decode(encoded);
// [ 'foo', 'foo', 23, [ 'bar', 42 ], 23, [ 'bar', 42 ] ]
```