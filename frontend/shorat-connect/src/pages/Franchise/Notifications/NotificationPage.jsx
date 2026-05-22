import React, { useRef } from "react";

export const NotificationPage = ({
  notifications = [],
  onMarkRead = () => {},
  onMarkAllRead = () => {},
}) => {
  const listRef = useRef(null);
  const unreadCount = notifications.filter((n) => !(n.is_read || n.read)).length;

  const handleMarkAllAndScroll = () => {
    onMarkAllRead();
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  return (
    <div className="relative min-h-[400px] px-4 sm:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 mt-16 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </h1>
      </div>
      <p className="text-gray-700 mb-6 text-sm sm:text-base">
        View recent updates and alerts
      </p>

      <ul
        ref={listRef}
        className="space-y-4 mb-20 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
      >
        {notifications.length === 0 && (
          <li className="text-center text-gray-500">No notifications.</li>
        )}

        {notifications.map(({ id, message, created_at, time, is_read, read }) => {
          const isRead = is_read || read;

          return (
            <li
              key={id}
              className={`p-4 border rounded-lg shadow-sm bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 transition ${
                isRead ? "opacity-60" : "font-semibold"
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold text-base sm:text-lg">{message}</p>
                <p className="text-xs sm:text-sm text-gray-700">
                  {created_at ? new Date(created_at).toLocaleString() : time}
                </p>
              </div>
              {!isRead && (
                <button
                  className="text-blue-600 underline text-xs sm:text-sm self-start sm:self-center"
                  onClick={() => onMarkRead(id)}
                >
                  Mark Read
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {unreadCount > 0 && (
        <button
          onClick={handleMarkAllAndScroll}
          title="Mark all notifications as read"
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition text-xs sm:text-sm"
          aria-label="Mark all notifications as read"
        >
          Mark All Read
        </button>
      )}
    </div>
  );
};
