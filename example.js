const { setup, reset } = require('./index');

const CHAT_GPT_API_KEY = ''; // set your chatgpt api key here
setup({ debugMode: true, secureMode: true, apiKey: CHAT_GPT_API_KEY });

console.log(Math.random());
