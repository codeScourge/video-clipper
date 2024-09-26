console.log("Popup script loaded")
let currentVideoUID = null;


let sectionOne = document.getElementById("section-one")
let sectionTwo = document.getElementById("section-two")
sectionOne.style.display = "flex";
sectionTwo.style.display = "none"


function startRecording(videoUID) {
  if (!videoUID) {
    alert("no video selected");
    return false;
  };

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'startRecording', videoUID}, (response) => {
        console.log(response.message)
        return response.ok
      });
  });
};


function stopRecording(videoUID) {
  if (!videoUID) {
    alert("no video selected");
    return false;
  };

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'endRecording', videoUID}, (response) => {
        console.log(response.message)
        return response.ok
    });
  });
};

let startRecBtn = document.getElementById("btn-start-recording");
let stopRecBtn = document.getElementById("btn-stop-recording")

startRecBtn.addEventListener("click", () => {
  startRecording(currentVideoUID);
  startRecBtn.disabled = true;
  stopRecBtn.disabled = false;
})

stopRecBtn.addEventListener("click", () => {
  stopRecording(currentVideoUID)
  startRecBtn.disabled = false;
  stopRecBtn.disabled = true;

  currentVideoUID = null;
  sectionTwo.style.display = "none";
  sectionOne.style.display = "flex";
})


document.getElementById('btn-find-videos').addEventListener('click', (e) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getVideos'}, (response) => {
          if (response.ok == true) {
            console.log(response.message)

            const videoList = document.getElementById("ul-video-list");
            const videos = response.returnObject;

            e.target.style.display = "none"; // hide "find videos" button

            if (videos && videos.length >= 0) {
              videos.forEach((value, index) => {
                const videoListChild = document.createElement("button")
                videoListChild.innerText = index
                videoListChild.style.backgroundColor = value.color

                videoListChild.addEventListener("click", (e) => {
                  console.log(`Chose video with UID: ${value.videoUID}`)

                  currentVideoUID = value.videoUID;

                  sectionTwo.style.display = "flex";
                  sectionOne.style.display = "none";
                })
                
                videoList.appendChild(videoListChild)
              })
            } else {
              const videoListChild = document.createElement("p")
              videoListChild.innerText = "no videos found on this page"
              videoList.appendChild(videoListChild)
            }
          }
      });
  });
});