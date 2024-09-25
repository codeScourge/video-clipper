console.log("Popup script loaded")


document.getElementById('btn-find-videos').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getVideos'}, function(response) {
          if (response.ok == true) {
            const videos = response.returnObject;

            if (videos.length >= 0) {
              const videoList = document.getElementById("ul-video-list");

              videos.forEach((value, index) => {
                const videoListChild = document.createElement("button")
                videoListChild.innerText = index
                videoListChild.style.backgroundColor = value.color

                videoListChild.addEventListener("click", (e) => {
                  console.log(`Chose video with UID: ${value.videoUID}`)
                })

                videoList.appendChild(videoListChild)
              })
            }

          }
      });
  });
});