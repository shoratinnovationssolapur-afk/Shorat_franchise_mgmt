self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || "Shorat Connect";
  const options = {
    body: data.body || "You have a new notification.",
    tag: data.tag || "shorat-connect-notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const sameOriginClient = clientList.find((client) =>
          client.url.startsWith(self.location.origin)
        );
        if (sameOriginClient) {
          sameOriginClient.focus();
          sameOriginClient.navigate(targetUrl);
          return;
        }
        return clients.openWindow(targetUrl);
      })
  );
});
