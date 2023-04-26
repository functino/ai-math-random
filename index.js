var spawn = require('child_process').spawn;
var fs = require('fs');

const ERROR_INTERNAL = 0.5;
const ERROR_NOT_A_RANDOM_NUMBER = 0.42;
const ERROR_IN_BLOCK_LIST = 0.23;
const ERROR_API_KEY_MISSING = 0;

// this is a list of numbers where chatGPT already told us that it is not a valid random number
// there is no need to check it again so we can hard-code it here.
const blockList = [0.8567933021, 0.8345679];

const randomPrompt =
    'Give me a random number like Math.random() would do. Give me only the number, no additional text!!!!!!!!';
const securePrompt =
    'Can Math.random in javascript return the value :value? Reply with the exact text YES if yes and with NO if no. Do not add any additional characters. No dot in the end.';

let temperature = 0.7;

const settings = {
    secureMode: false,
    debugMode: false,
    apiKey: null,
};

function useAiMagic(prompt) {
    if (settings.debugMode) {
        console.log('Using promot: ' + prompt);
    }
    if (!settings.apiKey) {
        console.log('API key is missing.');
        return ERROR_API_KEY_MISSING;
    }

    const contentFile = '.node-xmlhttprequest-content-' + process.pid;
    const syncFile = '.node-xmlhttprequest-sync-' + process.pid;

    fs.writeFileSync(syncFile, '', 'utf8');
    const execString = `const https = require('https');

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            Authorization: 'Bearer ${settings.apiKey}',
            'Content-Type': 'application/json',
        },
    };

    const body = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: ${JSON.stringify(prompt)} }],
        temperature: ${temperature},
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            fs.writeFileSync("${contentFile}", data, "utf8");
            fs.unlinkSync("${syncFile}");
        });
    });

    req.on('error', (error) => {
        fs.writeFileSync("${contentFile}", JSON.stringify(error), "utf8");
        fs.unlinkSync("${syncFile}");
    });

    req.write(JSON.stringify(body));
    req.end();`;

    const syncProc = spawn(process.argv[0], ['-e', execString]);
    while (fs.existsSync(syncFile)) {
        // Wait until the sync file is deleted
    }
    const res = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
    fs.unlinkSync(contentFile);
    // Kill the child process once the file has data
    syncProc.stdin.end();

    if (settings.debugMode) {
        console.log('Response: ' + JSON.stringify(res, null, 4));
    }
    return res.choices[0].message.content;
}

function random() {
    try {
        let value;
        const number = parseFloat(useAiMagic(randomPrompt));

        if (settings.secureMode) {
            if (blockList.includes(number)) {
                return ERROR_IN_BLOCK_LIST;
            }
            if (useAiMagic(securePrompt.replace(':value', number)) === 'NO') {
                return ERROR_NOT_A_RANDOM_NUMBER;
            }
        }
        // by randomly setting the temperature we can enhance randomness even more!
        temperature = number;
        return parseFloat(number);
    } catch (err) {
        if (settings.debugMode) {
            console.error(err);
        }
        return ERROR_INTERNAL;
    }
}
let origMathRandom = Math.random;
function setup({ secureMode = false, debugMode = false, apiKey }) {
    settings.secureMode = secureMode;
    settings.debugMode = debugMode;
    settings.apiKey = apiKey;

    Math.random = random;
}

function reset() {
    console.warn('You are falling back to a legacy way of creating random numbers!');
    Math.random = origMathRandom;
}

module.exports = {
    setup,
    reset,
    random,
    ERROR_INTERNAL,
    ERROR_NOT_A_RANDOM_NUMBER,
    ERROR_IN_BLOCK_LIST,
    ERROR_API_KEY_MISSING,
};
