const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    console.log(myStream.getVideoTracks());
    cameras.forEach(camera => {
      const option = document.createElement("option")
      option.value = camera.deviceId
      option.innerText = camera.label;
      if(currentCamera.id === camera.id) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);

      const options = document.createElement("option")
      options.value = camera.deviceId
      options.innerText = camera.label;
      camerasSelect.appendChild(options);
    })
  } catch(error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    video: { facingMode: "user" },
    audio: true,
  };
  const cameraConstraints = {
    video: { deviceId : { exact: deviceId } },
    audio: true,
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if(!deviceId){
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
}

getMedia();

function handelMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "🔊Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "🔇Mute";
    muted = false;
  }
}

function handelCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "👌Cam ON"
    cameraOff = false;
  } else {
    cameraBtn.innerText = "🖐Cam OFF"
    cameraOff = true;
  
  }
}

async function handelCameraChange() {
  console.log(camerasSelect.value);
  await getMedia(camerasSelect.value)
}

muteBtn.addEventListener("click", handelMuteClick);
cameraBtn.addEventListener("click", handelCameraClick);
camerasSelect.addEventListener("input", handelCameraChange)


const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;

let roomName;

function addMessage(message){
  const ul = room.querySelector("ul")
  const li = document.createElement("li")
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event){
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${input.value}`);
    input.value = "";
  });
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#nickname input");
  const value = input.value;
  socket.emit("nickname", input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nickForm = room.querySelector("#nickname");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nickForm.addEventListener("submit", handleNicknameSubmit);

}

function handleRoomSubmit(event){
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} joined!`);
})

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left uu!`);
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if(rooms.length === 0){
    return;
  }
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  })
});


// Dark mode part
function toggleDarkMode() {
    let bodyTag = document.getElementsByTagName('body')[0];
    let toggleTag = document.getElementById('colorToggle');
    
    if (bodyTag.classList.contains('lightMode')) {
        bodyTag.classList.replace('lightMode', 'darkMode');
        toggleTag.innerHTML = 'Light Mode';
    } else {
        bodyTag.classList.replace('darkMode', 'lightMode');
        toggleTag.innerHTML = 'Dark Mode';
    }
}

function handleDarkMode() {
    let bodyTag = document.getElementsByTagName('body')[0];
    let toggleTag = document.getElementById('colorToggle');
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        bodyTag.classList.add('darkMode');
        toggleTag.innerHTML = 'Light Mode';
    } else {
        bodyTag.classList.add('lightMode');
        toggleTag.innerHTML = 'Dark Mode';
        bodyTag.classList.replace('lightMode', 'darkMode');
        toggleTag.innerHTML = 'Light Mode';
    }
}
window.onload = handleDarkMode;