import { OpenAIStream } from "@/utils/stream";

export const POST = async (req) => {
  const { prompt, messagesArray } = await req.json();

  if (!prompt) {
    console.log("Missing prompt");
    return new Response("Missing prompt", { status: 400 });
  }
  var BasicCommands = [
    {
      role: "system",
      content:
        "you are chatgpt a chatbot which is an expert in everything special codding and that gives you answers to your queries as efficiently as possible",
      // "you are chatgpt a chatbot that always answers in a funny way and never answers to the point and when asked to write code than give jokes",
    },
  ];
  var messages = messagesArray.concat([{ role: "user", content: prompt }]);

  if (messages.length > 7) {
    messages = messages.slice(-7);
  }
  const AllMessages = BasicCommands.concat(messages);
  const payload = {
    model: "gpt-3.5-turbo-16k",
    messages: AllMessages,
      temperature: 0.5,
  top_p: 1,
  frequency_penalty: 2,
  presence_penalty: 1,
    max_tokens: 10000,
    stream: true,
    n: 1,
  };
  console.log(AllMessages);
  const stream = await OpenAIStream(payload);

  return new Response(stream);
};
