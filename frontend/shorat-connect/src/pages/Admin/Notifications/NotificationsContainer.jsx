import React, { useContext } from "react";
// Correct path to a file in the same directory
import { NotificationContext } from "./NotificationContext.jsx"; 
import { NotificationPage } from "./NotificationPage.jsx";

const NotificationsContainer = () => {
  const { notifications, loading, handleMarkRead, handleMarkAllRead } = useContext(NotificationContext);

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <NotificationPage
      notifications={notifications}
      onMarkRead={handleMarkRead}
      onMarkAllRead={handleMarkAllRead}
    />
  );
};

export default NotificationsContainer;