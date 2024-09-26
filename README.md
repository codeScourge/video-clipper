#### what it does
Recently watched a funny video from [this guy](https://www.youtube.com/@assless), and wanted to save a clip from the video. Screen recording this thing using something like OBS is a hastle, so I want a native solution.


#### TODO
- add youtube support (they dont use video tags)
- make pretty


#### (finished) plan for building
- user clicks "find videos" , this sends a message to the content_script, which adds a border to all videos
- user chooses which of the videos he want to target
- the pop up gets a "start recording" button
- the user clicks it, this sends a message to the content_script, the video starts playing
- the button turns into a "finish recording" button, this sends a message to the content_script, the video is done recording and is downloaded to the users computer (maybe later to storage first and then download with button in popup)
