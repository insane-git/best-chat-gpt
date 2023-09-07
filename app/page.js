"use client";
import { useEffect, useRef, useState } from "react";
import { FaCaretDown, FaUserAlt } from "react-icons/fa";
import { AiOutlineArrowRight } from "react-icons/ai";
import { BiSquareRounded } from "react-icons/bi";
import { ImCross } from "react-icons/im";
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
  const textarea = textareaRef?.current;
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

    textarea?.focus();
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
      setMessage({ prompt: "" });

      textarea.style.height = "40px";

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
      adjustTextareaHeight(textarea);
      setMessage({ ...message, prompt: "" });
      setSubmitStatus(false);
      setAbortController(null);
      textarea?.focus();
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
    const textarea = textareaRef.current;
    adjustTextareaHeight(textarea);
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
    if (confirm("Delete Chat?")) {
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
  const handleTextareaKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = (textarea) => {
    const minHeight = 40;
    const maxHeight = 300;

    textarea.style.height = "40px"; // Reset the height to auto
    const newHeight = Math.min(
      maxHeight,
      Math.max(minHeight, textarea.scrollHeight)
    );

    textarea.style.height = newHeight + "px"; // Set the new height
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

        <div className="fixed bottom-0 flex items-center justify-center w-full mx-auto bg-black bg-opacity-50 ">
          <div className="flex items-center justify-center p-2 max-md:flex-col w-[80%] mx-auto max-md:w-full">
            <form
              onSubmit={handleSubmit}
              className="flex items-center justify-center w-full max-md:flex-col">
              <div className="flex items-center justify-center w-full p-1 rounded focus-within:border bg-slate-900">
                <textarea
                  value={message.prompt}
                  required
                  ref={textareaRef}
                  name="prompt"
                  placeholder={submitStatus ? "Loading..." : "Ask a question"}
                  className="w-full px-1 py-2 mb-2 transition-all rounded outline-none resize-none bg-slate-900"
                  style={{
                    minHeight: "40px",
                    maxHeight: "300px",
                    height: `${!message.prompt ? "40px" : "auto"}`,
                  }}
                  onChange={handleMessageChange}
                  onKeyDown={handleTextareaKeyDown}
                />

                {abortController ? (
                  <button
                    title="Note that this will cancel the request and the message will be lost"
                    type="button"
                    onClick={handleCancel}
                    className="p-2 mx-1 text-white transition-all bg-red-600 rounded ">
                    <BiSquareRounded />
                  </button>
                ) : (
                  <button
                    disabled={!message.prompt}
                    type="submit"
                    className="h-8 p-2 mx-1 text-center transition-all rounded bg-slate-800 disabled:bg-slate-800 disabled:cursor-not-allowed"
                    style={{
                      height: `${textareaRef?.current?.height}`,
                    }}>
                    <AiOutlineArrowRight />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="absolute">
        <button
          className={`fixed bottom-24 left-5 p-3 bg-slate-900  transition-all duration-300 z-50 rounded-full ${
            messages?.length === 0 && "hidden"
          } `}
          onClick={handleDelete}
          title="Delete chat">
          <ImCross />
        </button>
      </div>
      <div className="absolute">
        <button
          className={`fixed bottom-24 right-5 p-3 bg-slate-600  transition-all duration-300 z-50 rounded-full  ${
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
