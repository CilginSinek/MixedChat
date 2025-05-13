const urlParams = new URLSearchParams(window.location.search);

const kick = urlParams.get("kick");
const twitch = urlParams.get("twitch");
const deletable = urlParams.get("deletable");

const root = document.querySelector("div#root");

if (!kick && !twitch) {
  root.innerHTML = `
        <div style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
            <h1 style="color: #ff0000;">No parameters provided ?kick={kick_name}&twitch={twitch_name}& (its optional) deletable={true}</h1>
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
        const chat = new WebSocket(
          "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false"
        );
        chat.onopen = function () {
          chat.send(
            JSON.stringify({
              event: "pusher:subscribe",
              data: { auth: "", channel: `chatrooms.${chatroom}.v2` },
            })
          );
        };
        chat.onmessage = function (event) {
          const metaMessage = JSON.parse(event.data);
          if (
            metaMessage.event == "pusher:connection_established" ||
            metaMessage.event == "pusher_internal:subscription_succeeded"
          ) {
            return;
          }
          const message = JSON.parse(metaMessage.data);
          KickrenderMessage(message, data.subscriber_badges, chatView);
        };
        chat.onerror = function (error) {
          console.error("WebSocket error:", error);
          handleErrorRenderMessage("WebSocket error: " + error.message, chatView);
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
        if(message.includes("PING :tmi.twitch.tv") || message == "PING"){
          twitchws.send("PONG");
          return;
        }
        if (!message.includes("justinfan12345")) {
          TwitchrenderMessage(message, chatView);
        }
      };
      twitchws.onerror = function (error){
        console.error("WebSocket error:", error);
        handleErrorRenderMessage("WebSocket error: " + error.message, chatView);
      }
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
  const span = document.createElement('span');
  span.className = 'chat-text';

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
    const img = document.createElement('img');
    img.src = `https://files.kick.com/emotes/${emoteId}/fullsize`;
    img.alt = emoteName;
    img.className = 'emote-image';

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
    userBadges.push(
      "https://i0.wp.com/www.alphr.com/wp-content/uploads/2021/03/How-to-Make-Someone-a-Mod-in-Twitch-scaled.jpg?fit=2560%2C2560&ssl=1"
    );
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
  row.classList.add("chat-row error");

  const textSpan = document.createElement("span");
  textSpan.classList.add("chat-text");
  textSpan.innerText = mesaj;
  row.appendChild(textSpan);

  scrollToBottomIfNear(masterDiv, 200, true, () => {
    masterDiv.appendChild(row);
  });
}