import React from "react";
import "./Chat.css";
import { useState } from "react";
import { useEffect } from "react";

const Chat = ({ socket }) => {
  const [text, settext] = useState("");
  const [arr, setarr] = useState([]);

  useEffect(() => {
    const handleChatForPlayer = (data) => {
      console.log("text received--", data.text);
      setarr((prevMessages) => [...prevMessages, data]);
    };

    socket.on("chat-for-player", handleChatForPlayer);

    return () => {
      socket.off("chat-for-player", handleChatForPlayer);
    };
  }, [socket]);

  const onchangeHandler = (e) => {
    settext(e.target.value);
  };
  const handleclick = () => {
    if (!text.trim()) return;
    console.log("clicked");
    const temp = { text: text, opp: false };
    setarr((prearr) => [...prearr, temp]);

    socket.emit("chatsend", {
      text: text,
      opp: true,
    });
    settext("");
  };

  window.setInterval(function() {
    var elem = document.getElementById('content');
    if (elem) {
      elem.scrollTop = elem.scrollHeight;
    }
  }, 5000);


var input = document.getElementById("myInput");

if(input){
  input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("btn1").click();
    }
  });
}

  

  return (
    <div className="main-chat">
      <div className="heading">Chat Here</div>
      <div className="content" id="content">
        {/* <div className="message-send">
          <span>📩</span>
          <p>lets have a match i will knock u down u bitch </p>
        </div>
        <div className="message-user">
          <p>lets have a match</p>
        </div> */}
        {arr.map((data, index) => (
          <div
            className={data.opp ? "message-send" : "message-user"}
            key={index}
          >
            {data.opp ? <span>📩</span> : <span> </span>}
            <p>{data.text}</p>
          </div>
        ))}
      </div>
      <div className="footer">
        <input
          className="f-input"
          id="myInput"
          onChange={onchangeHandler}
          type="text"
          name="text"
          value={text}
          placeholder="Send Message"
        />
        <button className="btn" id="btn1" onClick={handleclick}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chat;
