"use client";
import { useEffect, useRef, useState } from "react";

const GptForm = () => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [serverMessagesArray, setServerMessagesArray] = useState([]);
  const messagesContainerRef = useRef(null);
  const [responseTest, setResponseTest] = useState("");
  const [abortController, setAbortController] = useState(null);
  const [scrollStatus, setScrollStatus] = useState(false);
  const [initialMessages, setInitialMessages] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [apiStatus, setApiStatus] = useState(false);
  const [Status, setStatus] = useState("");
  useEffect(() => {
    const retrieveMessages = async () => {
      const storedMessages = await JSON.parse(
        localStorage.getItem("messages") || "[]"
      );
      setMessages(storedMessages);
      setInitialMessages(storedMessages);
    };
    retrieveMessages();
  }, []);
  useEffect(() => {
    localStorage.getItem("apiKey") &&
      handleApiKey &&
      setApiKey(localStorage.getItem("apiKey"));
  }, []);
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [initialMessages]);
  useEffect(() => {
    if (document && typeof document !== "undefined") {
      document.addEventListener("scroll", () => {
        let check =
          document.documentElement.scrollTop + window.innerHeight >=
          document.documentElement.scrollHeight;
        if (check) {
          setScrollStatus(true);
        } else {
          setScrollStatus(false);
        }
      });
    }
  });
  useEffect(() => {
    if (scrollStatus) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  });

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
    }
    setAbortController(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessages((prevMessages) => [
        ...(prevMessages || []),
        { prompt, response: "" },
      ]);
      const controller = new AbortController();
      setAbortController(controller);
      const res = await fetch("/api/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          prompt,
          messagesArray: serverMessagesArray,
          api: apiKey,
        }),
      });
      setPrompt("");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      var responseData = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        responseData += chunk;
        setResponseTest(responseData);
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          {
            prompt,
            response: prevMessages[prevMessages.length - 1].response + chunk,
          },
        ]);
      }
      setResponse(responseData);
      setServerMessagesArray((prevMessages) => [
        ...prevMessages,

        { role: "user", content: prompt },
        { role: "assistant", content: response },
      ]);
      const updatedMessages = [...messages, { prompt, response: responseData }];
      localStorage.setItem("messages", JSON.stringify(updatedMessages));
      setAbortController(null);
    } catch (error) {
      if (error.name === "AbortError") {
        // Request was cancelled
        console.log("Request was cancelled");
      } else {
        // Handle other errors
        console.error("Error:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
      setAbortController(null);
    };
  }, []);

  const handleMessageChange = (e) => {
    setPrompt(e.target.value);
  };
  const ClearChat = () => {
    if (messages.length > 0 && window.confirm("Are you sure?")) {
      setMessages([]);
      localStorage.removeItem("messages");
    }
  };
  const handleApiChange = (e) => {
    setApiKey(e.target.value);
  };
  const handleApiKey = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-16k",
          messages: [{ role: "user", content: "hello" }],
        }),
      });
      if (res.ok) {
        console.log("success");
        const data = await res.json();
        setApiStatus(true);
        localStorage.setItem("apiKey", apiKey);
        console.log(data);
        setStatus("success");
        setApiKey(apiKey);
        return;
      } else {
        console.log(res.error);
      }
    } catch (error) {
      console.log(error);
      setStatus("Invalid API ");
    }
  };

  return (
    <>
      {!apiKey || apiStatus === false ? (
        <div className="flex flex-col items-center justify-center">
          <form onSubmit={handleApiKey}>
            <input
              type="text"
              value={apiKey}
              placeholder="Enter ChatGPT API"
              onChange={handleApiChange}
              className="p-2 rounded bg-slate-900"
            />
            <button type="submit">Submit</button>
          </form>
          <p> {Status} </p>
        </div>
      ) : (
        <div
          className="flex flex-col pt-10 max-w-[60vw] mx-auto min-h-screen"
          ref={messagesContainerRef}>
          <div className="flex flex-col justify-end flex-1 overflow-y-auto">
            {messages?.map((message, index) => (
              <div key={index}>
                {message.prompt && (
                  <div className="p-2 text-right rounded bg-slate-700">
                    <p className="text-right">{message.prompt} : User</p>
                  </div>
                )}
                {message.response && (
                  <div className="p-2 text-left rounded bg-slate-800">
                    <p>AI : {message.response} </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="w-[60vw] min-h-20 flex justify-center items-center mx-auto">
            <button onClick={ClearChat}>
              <p className="text-sm text-center text-yellow-50">Clear chat</p>
            </button>
            <form
              onSubmit={handleSubmit}
              className="flex justify-center w-full">
              <textarea
                value={prompt}
                required
                placeholder="Type your message here..."
                className="w-full p-2 rounded bg-slate-900"
                onChange={handleMessageChange}></textarea>
              {abortController ? (
                <button
                  title="Note that this will cancel the request and the message will be lost"
                  type="button"
                  onClick={handleCancel}
                  className="p-2 mx-1 text-white transition-all bg-red-600 rounded">
                  Cancel
                </button>
              ) : (
                <button
                  disabled={!prompt}
                  type="submit"
                  className="p-2 mx-1 text-white transition-all rounded bg-slate-900 disabled:bg-slate-700">
                  Submit
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GptForm;
// export const dynamic = true;
// export const fetchCache = "force-no-store";
// export const revalidate = 0;
