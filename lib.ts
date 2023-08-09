/*
Approach
I wanted to build a simple encoder that follows a similar format to JSON 
serialization, but with a LZW-inspired pattern to compress repeated values. 
I used a Map to dictionary the values on the way in. 

One thing I found pretty challenging was dealing with nested arrays. Even now 
my deep nested array test is failing - I think this is because the deserialization 
is not truly recursive, but in the time  allotment I couldn't quite figure out how 
to make it work efficiently. 

The algorithm is fairly simple, we iterate over the to_send array and serialize each 
value. If the value exists in the dictionary we store a pointer instead of the value. 
In the case that there are repeated values, especially if they are larger, this does 
a good job at compression the payload. 

I did some manual benchmarking and on thing is for sure - JSON.parse and JSON.stringify 
are much faster than my implementation (although payload size was generally larger), but
I would imagine this is probably a better job for c++ or go. 
*/

export type DataElement = number | string | Data;
export type Data = DataElement[];
type Dict = Map<string, number>;

// In general the time complexity should be O(n) for flat values, but O(n^2) when we have nested values.
export const encode = (to_send: DataElement[]): string => {
  validateInput(to_send);
  const parts = to_send;
  const partDictionary: Dict = new Map();
  let payload = '';

  let delimiter = ",";
  for(let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const encodedPart = serializeValue(part);

    if(i === parts.length - 1) delimiter = "";

    if(partDictionary.has(encodedPart)) {
      const finalPart = `<${partDictionary.get(encodedPart)}>${delimiter}`;
      payload += finalPart;
    } else {
      partDictionary.set(encodedPart, i);
      payload += `${encodedPart}${delimiter}`;
    }
  }
  payload = `[${payload}]`;

  return payload;
};

export const decode = (recieved: string): Data => {
  const arrayString = recieved.slice(1, -1).split(",");

  const deserialized = arrayString.map((value) => {
    if(value.startsWith("<") && value.endsWith(">")) {
      const pointer = parseInt(value.slice(1, -1));

      return deserializeValue(arrayString[pointer]);
    } else {
      return deserializeValue(value);
    };
  });

  return deserialized;
}

const serializeValue = (value: DataElement): string => {
  if(typeof value === 'string') {
    if(value.length > 1000000) {
      throw new Error('String length must be less than or equal to 1,000,000');
    }
    value = value
      .replace(/,/g, "0x2c")
      .replace(/"/g, "0x22")
      .replace(/'/g, "0x27")
      .replace(/</g, "0x3c")
      .replace(/>/g, "0x3e")
      .replace(/;/g, "0x3b");

    return `"${value}"`;
  }

  if(typeof value === "number") {
    if(value > 2147483647 || value < -2147483648) {
      throw new Error('Integers must be of type int32');
    }

    return `${value}`;
  }

  if(Array.isArray(value)) {
    let arrayString = '';
    let delimiter = ";";
    for(let i = 0; i < value.length; i++) {
      if(i === value.length - 1) {
        delimiter = "";
      }
      arrayString += serializeValue(value[i]) + delimiter;
    }

    return `[${arrayString}]`;
  }

  // No string, no number, no array, throw an error
  throw new Error('Unsupported data type');
}

const deserializeValue = (value: string): DataElement => {
  if(typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
    value = value
      .slice(1, -1)
      .replace(/0x2c/g, ",")
      .replace(/0x22/g, "\"")
      .replace(/0x27/g, "'")
      .replace(/0x3c/g, "<")
      .replace(/0x3e/g, ">")
      .replace(/0x3b/g, ";");

    return value;
  } else if(typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      const arrayString = value.slice(1, -1).split(";");
      const deserializedArray = arrayString.map((value) => {
        return deserializeValue(value);
      });
    
      return deserializedArray;
  } else {
    return parseInt(value);
  }
}

const validateInput = (to_send: DataElement[]): void => {
  if(!Array.isArray(to_send)) {
    throw new Error("to_send should be an array.");
  }

  if(to_send.length > 1000) {
    throw new Error("to_send max size is 1000");
  }
}

const to_send: Data = ["foo", "foo", 23, ["bar", 42], 23, ["bar", 42]];
const encoded = encode(to_send);
const decoded = decode(encoded);
console.log({
  encoded,
  decoded,
})