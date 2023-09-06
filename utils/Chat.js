import React from "react";

export default function Chat({
  messages,
  prompt,
  ClearChat,
  handleSubmit,
  handleMessageChange,
  abortController,
  scrollStatus,
  messagesContainerRef,
  handleCancel,
}) {
  // return (
  //   <div
  //     className="flex flex-col pt-10 max-w-[60vw]  mx-auto min-h-screen"
  //     ref={messagesContainerRef}>
  //     <div className="flex flex-col justify-end flex-1 mb-20 overflow-y-auto">
  //       {messages?.map((message, index) => (
  //         <div key={index}>
  //           {message.prompt && (
  //             <div className="p-2 text-right rounded bg-slate-700">
  //               <p className="text-right">{message.prompt} : User</p>
  //             </div>
  //           )}
  //           {message.response && (
  //             <div className="p-2 text-left rounded bg-slate-800">
  //               <p>AI : {message.response} </p>
  //             </div>
  //           )}
  //         </div>
  //       ))}
  //     </div>

  //     <div className="w-[60vw] fixed bottom-0 bg-white min-h-20 flex justify-center items-center mx-auto">
  //       <button onClick={ClearChat}>
  //         <p className="text-sm text-center text-yellow-50">Clear chat</p>
  //       </button>
  //       <form onSubmit={handleSubmit} className="flex justify-center w-full">
  //         <textarea
  //           value={prompt}
  //           required
  //           placeholder="Type your message here..."
  //           className="w-full p-2 rounded bg-slate-900"
  //           onChange={handleMessageChange}></textarea>
  //         {abortController ? (
  //           <button
  //             title="Note that this will cancel the request and the message will be lost"
  //             type="button"
  //             onClick={handleCancel}
  //             className="p-2 mx-1 text-white transition-all bg-red-600 rounded">
  //             Cancel
  //           </button>
  //         ) : (
  //           <button
  //             disabled={!prompt}
  //             type="submit"
  //             className="p-2 mx-1 text-white transition-all rounded bg-slate-900 disabled:bg-slate-700">
  //             Submit
  //           </button>
  //         )}
  //       </form>
  //     </div>
  //   </div>
  // );
  return (
    <div
      className="flex flex-col pt-10 max-w-[95vw] justify-center mx-auto min-h-screen"
      ref={messagesContainerRef}>
      <div className="flex flex-col max-w-[60vw] mx-auto justify-center flex-1 mb-24 overflow-y-auto">
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

      <div className="fixed bottom-0 flex items-center justify-center w-full mx-auto min-h-20">
        <div
          style={{
            display: "flex",
            margin: "0 auto",
            width: "100%",
            justifyContent: "center",
            backgroundColor: "transparent",
            backdropFilter: "blur(10px)",
            padding: "1rem",
          }}>
          <button onClick={ClearChat} style={{ width: "10%" }}>
            <p className="text-sm text-center text-yellow-50">Clear chat</p>
          </button>
          <form onSubmit={handleSubmit} className="flex justify-center w-full">
            <textarea
              value={prompt}
              required
              placeholder="Type your message here..."
              className="p-2 rounded bg-slate-900"
              style={{ width: "70%" }}
              onChange={handleMessageChange}></textarea>
            {abortController ? (
              <button
                title="Note that this will cancel the request and the message will be lost"
                type="button"
                style={{ width: "10%" }}
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
      {/* <div className="bg-black">
        <div className="fixed bottom-0 w-full py-12 bg-black">
          <div className="flex items-center justify-center w-full m-0 mx-auto min-h-20">
            <button onClick={ClearChat} style={{ width: "10%" }}>
              <p className="text-sm text-center text-yellow-50">Clear chat</p>
            </button>
            <form
              onSubmit={handleSubmit}
              className="flex justify-center w-full">
              <textarea
                value={prompt}
                required
                placeholder="Type your message here..."
                className="p-2 rounded bg-slate-900"
                style={{ width: "70%" }}
                onChange={handleMessageChange}></textarea>
              {abortController ? (
                <button
                  title="Note that this will cancel the request and the message will be lost"
                  type="button"
                  style={{ width: "10%" }}
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
      </div> */}
    </div>
  );
}
