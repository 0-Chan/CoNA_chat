const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to Server ◈")
});

socket.addEventListener("message", (message) => {
  console.log("New message: [", message.data, "] from the server");
});

socket.addEventListener("close", () => {
  console.log("Disconnected from the Server ◇");
});

setTimeout(() => {
  socket.send("HELLO FROM THE BROWSER~!");
}, 3000)


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

