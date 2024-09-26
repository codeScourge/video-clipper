#### what it does
Recently watched a funny video from [this guy](https://www.youtube.com/@assless), and wanted to save a clip from the video. Screen recording this thing using something like OBS is a hastle, so I want a native solution.

#### how to use
Simply open the extension, click "find videos" to get all video tags (and YouTube players which use their own component), choose the video you want to record from. Then click "start recording" which will automatically start playing the video from where you left off. Clicking "stop recording" will stop the video and save the content you just watched to your Computer as an `mp4` file.

#### how to install
open the extensions manager of your browser. For chromium based ones:
- enable developer settings
- click "load unpacked" and choose the `extensions` subfolder in this repo

#### (finished) plan for building
- user clicks "find videos" , this sends a message to the content_script, which adds a border to all videos
- user chooses which of the videos he want to target
- the pop up gets a "start recording" button
- the user clicks it, this sends a message to the content_script, the video starts playing
- the button turns into a "finish recording" button, this sends a message to the content_script, the video is done recording and is downloaded to the users computer (maybe later to storage first and then download with button in popup)
- add YouTube support
- make Pretty
