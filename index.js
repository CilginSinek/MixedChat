/**
 * @typedef {Object} Reward
 * @property {string} reward_title - The title of the reward redeemed by the user.
 * @property {number} user_id - The unique identifier of the user who redeemed the reward.
 * @property {number} channel_id - The unique identifier of the channel where the reward was redeemed.
 * @property {string} username - The username of the user who redeemed the reward.
 * @property {string} user_input - The input or message provided by the user when redeeming the reward.
 * @property {string} reward_background_color - The background color associated with the reward, in hex format (e.g., "#93EBE0").
 */
const urlParams = new URLSearchParams(window.location.search);

const kick = urlParams.get("kick");
const twitch = urlParams.get("twitch");
const deletable = urlParams.get("deletable");
const fontParam = urlParams.get("font");
const font = fontParam ? fontParam : "system-ui, sans-serif";

if (fontParam) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontParam}`;
  document.head.appendChild(link);
}

document.body.style.fontFamily = font;

const root = document.querySelector("div#root");

if (!kick && !twitch) {
  root.innerHTML = `
        <div style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            <h1 style="color: #ff0000;">No parameters provided ?kick={kick_name}&twitch={twitch_name}</h1>
            <h2 style="color: #ff0000;">Example: ?kick=kick_name&twitch=twitch_name</h2>
            <h3 style="color: #ff0000;">Also deletable={deletable} and font={font}</h3>
          </div>
    `;
} else {
  // Create a chat view if at least one parameter exists
  const chatView = document.createElement("div");
  chatView.id = "chat-view";

  // Append chat view to root
  root.appendChild(chatView);

  // login websockets;
  if (kick) {
    fetch(`https://kick.com/api/v2/channels/${kick}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch channel data");
        }
        return response.json();
      })
      .then((data) => {
        const chatroom = data.chatroom.id;
        const channelID = data.id;
        const chat = new WebSocket(
          "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false"
        );
        chat.onopen = function () {
          const subscribeMessage1 = {
            event: "pusher:subscribe",
            data: {
              auth: "",
              channel: `chatrooms.${chatroom}.v2`,
            },
          };
        
          const subscribeMessage2 = {
            event: "pusher:subscribe",
            data: {
              auth: "",
              channel: `chatroom_${chatroom}`,
            },
          };
          
          chat.send(JSON.stringify(subscribeMessage1));
          chat.send(JSON.stringify(subscribeMessage2));
        };
        chat.onmessage = function (event) {
          const metaMessage = JSON.parse(event.data);
          if (
            metaMessage.event == "pusher:connection_established" ||
            metaMessage.event == "pusher_internal:subscription_succeeded"
          ) {
            return;
          }
          if (metaMessage.event == "App\\Events\\ChatMessageEvent") {
            const message = JSON.parse(metaMessage.data);
            KickrenderMessage(message, data.subscriber_badges, chatView);
          }
          if (metaMessage.event == "RewardRedeemedEvent") {
            const reward = JSON.parse(metaMessage.data);
            handleRewardsRenderMessage(reward, chatView);
          }
        };
        chat.onerror = function (error) {
          console.error("WebSocket error:", error);
          handleErrorRenderMessage(
            "WebSocket error: " + error.message,
            chatView
          );
        };
        chat.onclose = function () {
          console.warn("WebSocket connection closed. Retrying in 5 seconds...");
          const retryConnection = setInterval(() => {
            const newChat = new WebSocket(
              "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false"
            );
            newChat.onopen = function () {
              console.log("WebSocket connection reestablished.");
              clearInterval(retryConnection); // Stop retrying once connected
              chat = newChat;
              chat.onmessage = chat.onmessage;
              chat.onerror = chat.onerror;
              chat.onclose = chat.onclose;
              chat.onopen(); // Call the original onopen logic
            };
            newChat.onmessage = chat.onmessage;
            newChat.onerror = chat.onerror;
            newChat.onclose = chat.onclose;
          }, 5000);
        };
      });
  }
  if (twitch) {
    const twitchws = new WebSocket("wss://irc-ws.chat.twitch.tv/");
    twitchws.onopen = function () {
      twitchws.send("PASS whatever");
      twitchws.send("NICK justinfan12345");
      twitchws.send(`JOIN #${twitch}`);

      twitchws.onmessage = function (event) {
        const message = event.data;
        if (message.includes("PING :tmi.twitch.tv") || message == "PING") {
          twitchws.send("PONG");
          return;
        }
        if (!message.includes("justinfan12345")) {
          TwitchrenderMessage(message, chatView);
        }
      };
      twitchws.onerror = function (error) {
        console.error("WebSocket error:", error);
        handleErrorRenderMessage("WebSocket error: " + error.message, chatView);
      };
    };
    twitchws.onclose = function () {
      console.warn("WebSocket connection closed. Retrying in 5 seconds...");
      const retryConnection = setInterval(() => {
        // Reinitialize the WebSocket connection
        const newTwitchWs = new WebSocket("wss://irc-ws.chat.twitch.tv/");
        newTwitchWs.onopen = function () {
          console.log("WebSocket connection reestablished.");
          clearInterval(retryConnection); // Stop retrying once connected
          twitchws = newTwitchWs;
          twitchws.onmessage = twitchws.onmessage;
          twitchws.onerror = twitchws.onerror;
          twitchws.onclose = twitchws.onclose;
          twitchws.onopen(); // Call the original onopen logic
        };
        newTwitchWs.onmessage = twitchws.onmessage;
        newTwitchWs.onerror = twitchws.onerror;
        newTwitchWs.onclose = twitchws.onclose;
      }, 5000);
    };
  }
}

function getSubscriberBadgeUrl(subscriberBadges, badges) {
  // badges içinden "subscriber" tipindeki objeyi bul
  const subscriberBadgeInfo = badges.find((b) => b.type === "subscriber");

  const months = subscriberBadgeInfo.count;

  // subscriber_badges içinde months ile eşleşenleri filtrele ve src değerlerini al
  const url = subscriberBadges
    .filter((b) => b.months <= months)
    .sort((a, b) => b.months - a.months)
    .slice(0, 1) // Only take the biggest one
    .map((b) => b.badge_image.src);

  return url;
}

function appendChatTextWithEmotes(text, masterDiv) {
  // 1) span oluştur ve class ata
  const span = document.createElement("span");
  span.className = "chat-text";

  // 2) Metni emote kalıplarına göre parçala
  //    Regex: [emote:12345:smile] gibi ifadeleri yakalar
  const emoteRegex = /\[emote:(\d+):([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = emoteRegex.exec(text)) !== null) {
    const [fullMatch, emoteId, emoteName] = match;
    const matchStart = match.index;

    // a) Text’in emote’dan önceki kısmını düz metin olarak ekle
    if (matchStart > lastIndex) {
      const plainText = text.slice(lastIndex, matchStart);
      span.appendChild(document.createTextNode(plainText));
    }

    // b) Bir img etiketi oluştur, gerekli özellikleri ata
    const img = document.createElement("img");
    img.src = `https://files.kick.com/emotes/${emoteId}/fullsize`;
    img.alt = emoteName;
    img.className = "emote-image";

    span.appendChild(img);

    // c) İlerle
    lastIndex = matchStart + fullMatch.length;
  }

  // 3) Kalan düz metni ekle
  if (lastIndex < text.length) {
    span.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  // 4) span'i masterDiv’e ekle
  masterDiv.appendChild(span);
}

function KickrenderMessage(mesaj, badges, masterDiv) {
  // 1. Ana wrapper
  const row = document.createElement("div");
  row.classList.add("chat-row");

  const chatcol = document.createElement("div");
  chatcol.classList.add("chat-col");
  chatcol.appendChild(row);

  // 2. Eğer yanıt ise, küçük reply preview
  if (mesaj.type === "reply" && mesaj.metadata) {
    const preview = document.createElement("span");
    preview.classList.add("reply-preview");
    preview.textContent = `↱ ${mesaj.metadata.original_sender.username}: ${mesaj.metadata.original_message.content}`;
    chatcol.appendChild(preview);
  }

  const userBadges = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIMKB-qewQd91nPHVwgcG0iNgK5JTsqcTsZw&s",
  ];

  if (mesaj.sender.identity.badges.some((b) => b.type == "moderator")) {
    userBadges.push("./public/mod.png");
  }

  if (mesaj.sender.identity.badges.some((b) => b.type == "verified")) {
    userBadges.push("./public/verified.png");
  }

  if (mesaj.sender.identity.badges.some((b) => b.type == "vip")) {
    userBadges.push("./public/vip.png");
  }

  if (mesaj.sender.identity.badges.some((b) => b.type == "og")) {
    userBadges.push("./public/og.png");
  }

  if (mesaj.sender.identity.badges.some((b) => b.type == "subscriber")) {
    userBadges.push(
      getSubscriberBadgeUrl(badges, mesaj.sender.identity.badges)
    );
  }

  // 3. Badge container
  const badgeContainer = document.createElement("div");
  badgeContainer.classList.add("badge-container");
  userBadges.forEach((url) => {
    const img = document.createElement("img");
    img.classList.add("badge-img");
    img.src = url;
    img.alt = "badge";
    badgeContainer.appendChild(img);
  });

  const username = document.createElement("span");
  username.classList.add("chat-username");
  username.innerText = mesaj.sender.username + ":";
  username.style.color = mesaj.sender.identity.color;
  badgeContainer.appendChild(username);
  row.appendChild(badgeContainer);

  // içerik
  appendChatTextWithEmotes(mesaj.content, row);

  if (deletable) {
    const deletebutton = document.createElement("button");
    deletebutton.innerText = "X";
    deletebutton.classList.add("delete-button");
    deletebutton.onclick = function () {
      row.remove();
    };
    textSpan.appendChild(deletebutton);
  }

  // 5. Ekle ve kaydır
  scrollToBottomIfNear(masterDiv, 200, true, () => {
    masterDiv.appendChild(chatcol);
  });
}

const parseMsg = (msg) => ({
  name: msg.slice(1, msg.indexOf("!")),
  content: msg.slice(msg.indexOf(" :") + 2, -2),
});

function TwitchrenderMessage(mesaj, masterDiv) {
  const mesajobject = parseMsg(mesaj);
  const row = document.createElement("div");
  row.classList.add("chat-row");

  const badgeContainer = document.createElement("div");
  badgeContainer.classList.add("badge-container");
  const img = document.createElement("img");
  img.classList.add("badge-img");
  img.src = "https://cdn-icons-png.flaticon.com/512/5968/5968819.png";
  img.alt = "badge";
  badgeContainer.appendChild(img);

  const username = document.createElement("span");
  username.classList.add("chat-username");
  username.innerText = mesajobject.name + ":";
  badgeContainer.appendChild(username);
  row.appendChild(badgeContainer);

  const textSpan = document.createElement("span");
  textSpan.classList.add("chat-text");
  textSpan.innerText = mesajobject.content;
  row.appendChild(textSpan);

  if (deletable) {
    const deletebutton = document.createElement("button");
    deletebutton.innerText = "X";
    deletebutton.classList.add("delete-button");
    deletebutton.onclick = function () {
      row.remove();
    };
    textSpan.appendChild(deletebutton);
  }

  scrollToBottomIfNear(masterDiv, 200, true, () => {
    masterDiv.appendChild(row);
  });
}

function scrollToBottomIfNear(el, threshold = 200, smooth = false, renderfunc) {
  const { scrollTop, scrollHeight, clientHeight } = el;

  // Ne kadar uzaktayız en alttan?
  const distanceFromBottom = scrollHeight - clientHeight - scrollTop;

  // Eğer threshold içinde kaldıysa, scroll et
  if (distanceFromBottom <= threshold) {
    if (smooth) {
      renderfunc();
      el.scrollTo({ top: scrollHeight, behavior: "smooth" });
    } else {
      renderfunc();
      el.scrollTop = scrollHeight;
    }
  }
}

function handleErrorRenderMessage(mesaj, masterDiv) {
  const row = document.createElement("div");
  row.classList.add("chat-row", "error");

  const textSpan = document.createElement("span");
  textSpan.classList.add("chat-text");
  textSpan.innerText = mesaj;
  row.appendChild(textSpan);

  scrollToBottomIfNear(masterDiv, 200, true, () => {
    masterDiv.appendChild(row);
  });
}

/**
 *
 * @param {Reward} reward - Reward object, e.g.
 * @param {*} masterDiv
 */
function handleRewardsRenderMessage(reward, masterDiv) {
  const row = document.createElement("div");
  row.classList.add("chat-row", "reward-row");

  const box = document.createElement("div");
  box.className = "reward-box";

  const userDiv = document.createElement("div");
  userDiv.className = "reward-username";

  const badgeImg = document.createElement("img");
  badgeImg.src =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIMKB-qewQd91nPHVwgcG0iNgK5JTsqcTsZw&s";
  badgeImg.alt = "badge";
  badgeImg.className = "badge-img";

  const usernameSpan = document.createElement("span");
  usernameSpan.textContent = reward.username;

  userDiv.style.color = reward.reward_background_color || "#888";

  userDiv.appendChild(badgeImg);
  userDiv.appendChild(usernameSpan);

  const rewardDiv = document.createElement("div");
  rewardDiv.className = "reward-title";
  rewardDiv.innerHTML = `<b>${reward.reward_title}</b> ödülünü aldı`;

  box.appendChild(userDiv);
  box.appendChild(rewardDiv);

  if (reward.user_input && reward.user_input.trim() !== "") {
    const inputDiv = document.createElement("div");
    inputDiv.className = "reward-userinput";
    inputDiv.textContent = reward.user_input;
    box.appendChild(inputDiv);
  }

  row.appendChild(box);

  scrollToBottomIfNear(masterDiv, 200, true, () => {
    masterDiv.appendChild(row);
  });
}
