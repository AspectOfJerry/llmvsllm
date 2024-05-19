import OpenAI from "openai";
import c from "chalk";
import dotenv from "dotenv";

// create a .env file with the OpenAI API key
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});


async function main() {
    const assistant1 = await openai.beta.assistants.retrieve("asst_sr4x6mYMMEVplgm0jZd90uBP"); // Participer
    const assistant2 = await openai.beta.assistants.retrieve("asst_jf8aztHfXhKhttQGKWqtGhg8"); // Gagner

    const topic = "L'important est-il de gagner ou de participer?";
    const rounds = 8;

    const thread = await openai.beta.threads.create({
        messages: [{
            "role": "user",
            "content": "Commencez le débat sur la question suivante: " + topic // + " Il y aura " + rounds + " tours."
        }]
    });

    async function requestAssistant(assistant, thread) {
        await openai.beta.threads.runs.createAndPoll(
            thread.id,
            {
                assistant_id: assistant.id
            }
        );

        const messages = (await openai.beta.threads.messages.list(thread.id)).data;
        return messages[0].content[0].text.value;
    }

    let assistant1Turn = true;

    console.log(c.red("> Starting debate on: " + topic));

    for (let i = 0; i < rounds; i++) {
        if (assistant1Turn) {
            console.debug(c.green("> Requesting run from assistant 1..."));
            const answer = await requestAssistant(assistant1, thread);

            console.log(c.cyan(">>> Assistant 1 (Alice, PARTICIPER):\n") + answer);
        } else {
            console.debug(c.green("> Requesting run from assistant 2..."));
            const answer = await requestAssistant(assistant2, thread);

            console.log(c.cyan(">>> Assistant 2 (Bob, GAGNER):\n") + answer);
        }

        // console.log("\n");

        console.debug(c.yellow("> Switching turns..."));
        assistant1Turn = !assistant1Turn;
    }
}

await main().then(() => console.log(c.red("> Done!"))).catch((err) => console.error("Error:", err));
