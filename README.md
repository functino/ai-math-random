# Math.random with AI

Math.random is nice. But we can improve it a lot by using artificial intelligence to enhance it.

## Installation

Just run `npm install ai-math-random`.

## API / Usage

```
const { setup } = require('ai-math-random');

setup({ apiKey: 'YOUR_CHATGPT_API_KEY_HERE' });

Math.random(); // this will now use AI to create GOOD random numbers
```

You can make it even more secure and check the generated random number for validity by using secureMode:

```
const { setup } = require('ai-math-random');

setup({ apiKey: 'YOUR_CHATGPT_API_KEY_HERE', secureMode: true });

// this will return a random number or
// 0.42 if the generated random number is not really random (checked via AI)
Math.random();
```

### Error Handling

To ensure that this library is very very resilient and will never fail it will never throw an error.
Instead it will still return valid "random" numbers as error codes.

Here are the error codes:

```
const ERROR_INTERNAL = 0.500; // something went wrong internally
const ERROR_API_KEY_MISSING = 0; // you did not set your API key

// only in secureMode:
const ERROR_IN_BLOCK_LIST = 0.23; // we already know that generared number is not random
const ERROR_NOT_A_RANDOM_NUMBER = 0.42; // the random number is not random enough for secureMode
```

For convenience those ERROR\_ constants are also exported.

## Contributing

PRs are always welcome!
How about adding support to run this in the browser?
Or extending our block-list with clearly non-random random numbers?
