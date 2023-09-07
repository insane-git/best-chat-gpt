"use client";
import { useEffect, useRef, useState } from "react";
import { FaCaretDown, FaUserAlt } from "react-icons/fa";
const GptForm = () => {
  const [message, setMessage] = useState({
    prompt: "",
    response: "",
  });
  const textareaRef = useRef(null);
  const [scrollStatus, setScrollStatus] = useState(false);
  const [initialMessages, setInitialMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [copyStatus, setCopyStatus] = useState([]);
  const containerRef = useRef(null);
  const codeBlocks = useRef([]);
  const [abortController, setAbortController] = useState(null);

  const [submitStatus, setSubmitStatus] = useState(false);
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
  // const isComputer = window.matchMedia("(min-width: 1068px)").matches;
  // useEffect(() => {
  //   if (!isComputer && scrollStatus) {
  //     window.scrollTo(0, document.body.scrollHeight);
  //   }
  // }, [document.documentElement.scrollHeight]);
  useEffect(() => {
    if (scrollStatus && scrollStatus === true) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [messages]);
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
    window.scrollTo(0, document.body.scrollHeight);
  }, [initialMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitStatus(true);
      setMessages((prevMessages) => [
        ...(prevMessages || []),
        { role: "user", content: message.prompt },
        {
          role: "assistant",
          content: "",
        },
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
          prompt: message.prompt,
          messagesArray: messages,
        }),
      });
      setMessage({ prompt: "" });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      var responseData = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        responseData += chunk;
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1].content += chunk;
          return updatedMessages;
        });
      }
      const updatedMessages = [
        ...messages,
        { role: "user", content: message.prompt },
        { role: "assistant", content: responseData },
      ];
      localStorage.setItem("messages", JSON.stringify(updatedMessages));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setMessage({ ...message, prompt: "" });
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      setSubmitStatus(false);
      setAbortController(null);
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
  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      localStorage.setItem("messages", JSON.stringify([...messages]));
    }
    setAbortController(null);
  };
  const handleMessageChange = (e) => {
    setMessage({ ...message, [e.target.name]: e.target.value });
  };

  const handleCopyClick = (index) => {
    if (codeBlocks.current[index]) {
      const codeBlockContent = codeBlocks.current[index].textContent;
      const textArea = document.createElement("textarea");
      textArea.value = codeBlockContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      // Update the copy status for this code block
      const newCopyStatus = [...copyStatus];
      newCopyStatus[index] = true;
      setCopyStatus(newCopyStatus);

      // Reset the copy status after a delay
    }
  };
  useEffect(() => {
    // Reset the copy status after 2 seconds
    const timeout = setTimeout(() => {
      const newCopyStatus = copyStatus.map(() => false);
      setCopyStatus(newCopyStatus);
    }, 2000);

    // Clear the timeout when the component unmounts
    return () => clearTimeout(timeout);
  }, [copyStatus]);
  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      setMessages([]);
      localStorage.removeItem("messages");
    }
  };
  const scrollToBottom = () => {
    containerRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };
  return (
    <div ref={containerRef}>
      <div className="flex flex-col min-h-screen pt-10 mx-auto">
        <div className="flex flex-col justify-end flex-1 mb-32 w-[90vw] mx-auto overflow-y-auto">
          {messages?.map((message, index) => (
            <div key={index}>
              {message?.role === "user" && (
                <div className="w-full p-2 rounded bg-slate-700">
                  <pre
                    className="flex items-center"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}>
                    <FaUserAlt className="mx-1" /> {message.content}
                  </pre>
                </div>
              )}
              {message?.role === "assistant" && (
                <div className="w-full p-2 rounded bg-slate-800">
                  {message.content.split("```").map((part, index) => {
                    if (index % 2 === 0) {
                      return (
                        <div className="px-2 py-4 " key={index}>
                          <pre
                            key={index}
                            style={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}>
                            {part}
                          </pre>
                        </div>
                      );
                    } else {
                      const lines = part.split("\n");
                      const codeContent = lines.slice(1).join("\n");
                      return (
                        <div
                          className="relative px-4 py-4 text-white bg-black rounded-lg"
                          key={index}>
                          <pre
                            ref={(el) => (codeBlocks.current[index] = el)}
                            style={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}>
                            {codeContent}
                          </pre>
                          <button
                            className="absolute top-0 right-0 p-2 text-white rounded-sm bg-slate-900"
                            onClick={() => handleCopyClick(index)}>
                            {copyStatus[index] ? "Copied" : "Copy"}
                          </button>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 flex items-center justify-center w-full mx-auto bg-black bg-opacity-50 min-h-20 ">
          <div
            className="flex items-center justify-center p-4 max-md:flex-col"
            style={{
              margin: "0 auto",
              width: "80%",
            }}>
            <form
              onSubmit={handleSubmit}
              className="flex items-center justify-center w-full max-md:flex-col">
              <button
                type="button"
                className="p-1 transition-all rounded w-28 hover:bg-red-500"
                onClick={handleDelete}>
                Clear Chat
              </button>
              <div className="flex items-center justify-center w-full max-sm:flex-col">
                <textarea
                  value={message.prompt}
                  required
                  ref={textareaRef}
                  name="prompt"
                  rows={!message.prompt && 1}
                  placeholder="Type message here..."
                  className="w-full p-2 transition-all rounded resize-none bg-slate-900 "
                  style={{
                    "maxHeight": "300px",
                    "height": "auto",
                    "@media (max-width: 300px)": {
                      minHeight: "200px",
                    },
                  }}
                  onChange={handleMessageChange}
                  onInput={(e) => {
                    e.target.rows = 1;
                    e.target.rows = Math.min(
                      5,
                      Math.ceil((e.target.scrollHeight - 16) / 20)
                    );
                  }}
                />

                {abortController ? (
                  <button
                    title="Note that this will cancel the request and the message will be lost"
                    type="button"
                    onClick={handleCancel}
                    className="p-2 mx-1 text-white transition-all bg-red-600 rounded ">
                    Cancel
                  </button>
                ) : (
                  <button
                    disabled={!message.prompt}
                    type="submit"
                    className="flex flex-col items-center justify-center h-8 p-2 mx-1 text-center transition-all rounded bg-slate-900 disabled:bg-slate-700">
                    Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="absolute">
        <button
          className={`fixed bottom-20 right-5 p-3 bg-slate-600  transition-all duration-300 z-50 rounded-full  ${
            scrollStatus && "hidden"
          }`}
          onClick={scrollToBottom}
          title="Scroll to bottom">
          <FaCaretDown />
        </button>
      </div>
    </div>
  );
};

export default GptForm;
export const dynamic = true;
