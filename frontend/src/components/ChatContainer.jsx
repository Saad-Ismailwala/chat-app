import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    editMessage,
    markMessagesAsRead,
    clearUnread,
  } = useChatStore();
  const [deleteId, setDeleteId] = useState(null);

  const { authUser, socket, typingUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);

    // 🔴 clear unread when chat opens
    clearUnread(selectedUser._id);

    if (socket) {
      subscribeToMessages();
      markMessagesAsRead(selectedUser._id);
    }

    return () => unsubscribeFromMessages();
  }, [
    clearUnread,
    getMessages,
    markMessagesAsRead,
    selectedUser._id,
    socket,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleEditSubmit = (messageId) => {
    if (!editText.trim()) return;
    editMessage(messageId, editText);
    setEditingMessageId(null);
    setEditText("");
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;

          const isMyMessage =
            message.senderId?.toString() === authUser._id?.toString();

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
              ref={isLast ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMyMessage
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1 flex items-center gap-2">
                <time className="text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>

                {/* edit delete buttons */}
                {isMyMessage && !message.isDeleted && (
                  <>
                    <button
                      className="text-xs text-blue-500"
                      onClick={() => {
                        setEditingMessageId(message._id);
                        setEditText(message.text);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="text-xs text-red-500"
                      onClick={() => setDeleteId(message._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              <div className="chat-bubble flex flex-col">
                {message.image && !message.isDeleted && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}

                {editingMessageId === message._id ? (
                  <div className="flex gap-2">
                    <input
                      className="input input-sm input-bordered w-full"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button
                      className="btn btn-xs btn-success"
                      onClick={() => handleEditSubmit(message._id)}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p>{message.isDeleted ? "Message deleted" : message.text}</p>
                )}
              </div>

              {isMyMessage && (
                <div className="chat-footer mt-1 flex items-center gap-1 text-xs">
                  <span
                    className={
                      message.isRead ? "text-blue-500 font-bold" : "opacity-50"
                    }
                  >
                    ✓✓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* typing indicator */}
      {typingUser === selectedUser?._id && (
        <div className="px-4 pb-2 text-sm text-base-content/60 italic">
          {selectedUser.fullName} is typing...
        </div>
      )}

      <MessageInput />
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-xl shadow-xl w-[320px]">
            <h3 className="font-semibold text-lg mb-2">Delete message?</h3>
            <p className="text-sm opacity-70 mb-4">
              This message will be permanently deleted.
            </p>

            <div className="flex justify-end gap-2">
              <button className="btn btn-sm" onClick={() => setDeleteId(null)}>
                Cancel
              </button>

              <button
                className="btn btn-sm btn-error"
                onClick={() => {
                  deleteMessage(deleteId);
                  setDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
