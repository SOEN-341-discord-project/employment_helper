const listOfNotifications = document.getElementById("notificationList");
const message = document.getElementById("message");


async function loadNotifications() {

  message.textContent = "";

  try {
    const data = await apiRequest("/api/notifications");
    const notifications = data.items;

    // Clear the old notifications before showing the new ones.
    listOfNotifications.replaceChildren();

    if (notifications.length === 0) {
      message.textContent = "temeproary placholder";
      return;
    }

    for (let i = 0; i < notifications.length; i++) {

      const notificationAtIndex = notifications[i];
      const notificationBox = makeText("div", "", "field");

      const notificationText = makeText("p", notificationAtIndex.message);
      const date = showDate(notificationAtIndex.created_at);
      const notificationDate = makeText("span", date, "comment");

      notificationBox.appendChild(notificationText);
      notificationBox.appendChild(notificationDate);

      listOfNotifications.appendChild(notificationBox);
    }

  } catch (error) {
    message.textContent = "temeproary placholder";

  } finally {
    refreshButton.disabled = false;
  }
}



loadNotifications();