const listOfNotifications = document.getElementById("notificationList");
const message = document.getElementById("message");

async function loadNotifications() {
  message.textContent = "";

  try {
    const data = await apiRequest("/api/notifications");
    const notifications = data;

    listOfNotifications.replaceChildren();

    if (notifications.length === 0) {
      message.textContent = "No notifications yet.";
      return;
    }

    for (let i = 0; i < notifications.length; i++) {
      const notificationAtIndex = notifications[i];
      const notificationBox = makeText("div", "", "field");
      const notificationText = makeText("p", notificationAtIndex.message);

      const alertTime = notificationAtIndex.available_at || notificationAtIndex.created_at;
      const date = new Date(alertTime).toLocaleString();
      const notificationDate = makeText("span", "Alert posted on " + date, "comment");

      notificationBox.appendChild(notificationText);
      notificationBox.appendChild(notificationDate);

      if (!notificationAtIndex.is_read) {
        const readButton = makeText("button", "Mark as read");
        readButton.type = "button";

        readButton.addEventListener("click", async function () {
          readButton.disabled = true;
          message.textContent = "";

          try {
            const url = "/api/notifications/" + notificationAtIndex.id + "/read";
            await apiRequest(url, "PATCH");
            readButton.remove();
          } catch (error) {
            message.textContent = "Unable to mark this notification as read.";
            readButton.disabled = false;
          }
        });

        const action = makeText("div", "", "action");
        action.appendChild(readButton);
        notificationBox.appendChild(action);
      }

      listOfNotifications.appendChild(notificationBox);
    }
  } catch (error) {
    message.textContent = "Unable to load notifications.";
  }
}

loadNotifications();