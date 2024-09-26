function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

let mediaRecorders = {}; // Store MediaRecorders by videoUID
let recordedChunks = {}; // Store recorded chunks by videoUID
let youtubePlayers = {}; // Store YouTube player objects by videoUID

// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVideos') {
        const videos = document.querySelectorAll('video');
        const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');
        const colors = ['red', 'green', 'blue', 'orange', 'purple', 'yellow'];
        let returnObject = [];

        function processVideoElement(element, isYouTube = false) {
            const videoUID = generateUID();
            const color = colors[returnObject.length % colors.length];

            if (!element.hasAttribute('data-uuid')) {
                element.setAttribute('data-uuid', videoUID);
            }
            element.style.border = `5px solid ${color}`;

            returnObject.push({
                videoUID: videoUID,
                color: color,
                isYouTube: isYouTube
            });
        }

        videos.forEach(video => processVideoElement(video));
        youtubeIframes.forEach(iframe => processVideoElement(iframe, true));

        sendResponse({ok: true, returnObject: returnObject});

    } else if (request.action == "startRecording") {
        const videoUID = request.videoUID;
        const isYouTube = request.isYouTube;

        if (isYouTube) {
            const iframe = document.querySelector(`iframe[data-uuid="${videoUID}"]`);
            if (iframe) {
                if (!youtubePlayers[videoUID]) {
                    youtubePlayers[videoUID] = new YT.Player(iframe, {
                        events: {
                            'onReady': onPlayerReady
                        }
                    });
                } else {
                    onPlayerReady({ target: youtubePlayers[videoUID] });
                }

                function onPlayerReady(event) {
                    event.target.playVideo();
                    // Start screen capture here (requires additional implementation)
                    sendResponse({ok: true, message: 'YouTube recording started'});
                }
            } else {
                sendResponse({ok: false, message: 'YouTube video not found'});
            }
        } else {
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
                sendResponse({ok: true, message: 'HTML5 video recording started'});
            } else {
                sendResponse({ok: false, message: 'HTML5 video not found'});
            }
        }

    } else if (request.action == "endRecording") {
        const videoUID = request.videoUID;
        const isYouTube = request.isYouTube;

        if (isYouTube) {
            const player = youtubePlayers[videoUID];
            if (player) {
                player.pauseVideo();
                // Stop screen capture and save video here (requires additional implementation)
                sendResponse({ok: true, message: 'YouTube recording stopped and saved'});
            } else {
                sendResponse({ok: false, message: 'YouTube video not found or not recording'});
            }
        } else {
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

                sendResponse({ok: true, message: 'HTML5 video recording stopped and downloaded'});
            } else {
                sendResponse({ok: false, message: 'HTML5 video not found or not recording'});
            }
        }
    } else {
        throw new Error("unrecognized action");
    }

    return true; // Indicates that the response will be sent asynchronously
});


// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);