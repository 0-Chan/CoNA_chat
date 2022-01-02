const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach(camera => {
      const option = document.createElement("option")
      option.value = camera.deviceId
      option.innerText = camera.label;
      if(currentCamera.id === camera.id) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
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

// getMedia();

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
  await getMedia(camerasSelect.value)
}

muteBtn.addEventListener("click", handelMuteClick);
cameraBtn.addEventListener("click", handelCameraClick);
camerasSelect.addEventListener("input", handelCameraChange)


// Welcome part (join a room)
const welcome = document.getElementById("welcome");
welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event){
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Chrome
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer)
  console.log("Sent the offer");
  socket.emit("offer", offer, roomName);
})

// webRTC part
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

// Firefox
socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
})

socket.on("answer", answer => {
  myPeerConnection.setRemoteDescription(answer);

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