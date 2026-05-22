import React, { useRef } from "react";

export const NotificationPage = ({
  notifications,
  setNotifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  const listRef = useRef(null);

  const handleMarkAllAndScroll = () => {
    onMarkAllRead();
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative min-h-[400px] p-3 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 sm:mb-4 flex-wrap gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
      </div>

      <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
        View recent updates and alerts
      </p>

      {/* Notification List */}
      <ul
        ref={listRef}
        className="space-y-3 sm:space-y-4 mb-20 max-h-[60vh] overflow-y-auto pr-2"
      >
        {notifications.length === 0 && (
          <li className="text-center text-gray-500 py-6">
            No notifications.
          </li>
        )}

        {notifications.map(({ id, message, created_at, is_read }) => (
          <li
            key={id}
            className={`p-3 sm:p-4 border rounded shadow-sm bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 ${
              is_read ? "opacity-60" : "font-semibold"
            }`}
          >
            <div className="flex-1">
              <p className="font-medium sm:font-semibold text-sm sm:text-base">
                {message}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {new Date(created_at).toLocaleString()}
              </p>
            </div>

            {!is_read && (
              <button
                className="text-blue-600 underline text-xs sm:text-sm self-start sm:self-auto"
                onClick={() => onMarkRead(id)}
              >
                Mark Read
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Floating Button (Mark all read) */}
      {unreadCount > 0 && (
        <button
          onClick={handleMarkAllAndScroll}
          title="Mark all notifications as read"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white px-4 py-2 sm:p-3 rounded-full shadow-lg hover:bg-blue-700 transition text-xs sm:text-sm"
          aria-label="Mark all notifications as read"
        >
          Mark All Read
        </button>
      )}
    </div>
  );
};
