import { OpenAIStream } from "@/utils/stream";

export const POST = async (req) => {
  const { prompt, messagesArray } = await req.json();

  if (!prompt) {
    console.log("Missing prompt");
    return new Response("Missing prompt", { status: 400 });
  }
  var messages;
  if (messagesArray) {
    messages = messagesArray.concat([{ role: "user", content: prompt }]);
  }

  if (messages.length > 6) {
    messages = messages.slice(-7);
  }

  const payload = {
    model: "gpt-3.5-turbo-16k",
    messages: messages,

    temperature: 0.1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 15384,
    // max_tokens: 16384,

    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);

  return new Response(stream);
};
