function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let mediaRecorders = {}; // Store MediaRecorders by videoUID
let recordedChunks = {}; // Store recorded chunks by videoUID

// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVideos') {
        const videos = document.querySelectorAll('video');
        const colors = ['red', 'green', 'blue', 'orange', 'purple', 'yellow'];
        let returnObject = [];

        videos.forEach((video, index) => {
            const videoUID = generateUID()
            const color = colors[index % colors.length]


            if (!video.hasAttribute('data-uuid')) {
                video.setAttribute('data-uuid', videoUID);
            }
            video.style.border = `5px solid ${color}`;
            

            returnObject.push({
                videoUID: videoUID,
                color: color
            })
        });

        sendResponse({ok: true, returnObject: returnObject});

    } else if (request.action == "startRecording") {
        const videoUID = request.videoUID;
        const video = document.querySelector(`video[data-uuid="${videoUID}"]`);

        if (video) {
            const stream = video.captureStream();
            const mediaRecorder = new MediaRecorder(stream);
            recordedChunks[videoUID] = [];

            mediaRecorder.ondataavailable = function(event) {
                if (event.data.size > 0) {
                    recordedChunks[videoUID].push(event.data);
                }
            };

            mediaRecorder.start();
            mediaRecorders[videoUID] = mediaRecorder;
            video.play();
            sendResponse({ok: true, message: 'Recording started'});
        } else {
            sendResponse({ok: false, message: 'Video not found'});
        }
    } else if (request.action == "endRecording") {
        const videoUID = request.videoUID;
        const video = document.querySelector(`video[data-uuid="${videoUID}"]`);

        if (video && mediaRecorders[videoUID]) {
            const mediaRecorder = mediaRecorders[videoUID];
            mediaRecorder.stop();
            video.pause();

            mediaRecorder.onstop = function() {
                const blob = new Blob(recordedChunks[videoUID], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'recorded-video.mp4';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
            };

            sendResponse({ok: true, message: 'Recording stopped and downloaded'});
        } else {
            sendResponse({ok: false, message: 'Video not found or not recording'});
        }
    } else {
        throw new Error("unrecognized action")
    }
});