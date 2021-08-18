import { FindVideoFrameRequest } from "./models/FindVideoFrameRequest";
import { FindVideoFrameResponse } from "./models/FindVideoFrameResponse";

//////////////////////////////////////////////////
// Event handler
//////////////////////////////////////////////////
// Need to return true as per:
// https://stackoverflow.com/a/56483156/50776
// We could try and return a promise, as well
// but it's easier right now to return true
// since we have to send the message in
// a callback.
function onMessage(
    message: FindVideoFrameRequest,
    _: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
) {
    // If not a message to find a video request, bounce.
    // Don't bother to send a message back, as we don't know
    // what this is exactly.
    if (message.type !== 'FindVideoFrameRequest')
        return false 
  
    // Get the video elements, if there is a single one.
    const elements = document.getElementsByTagName('video')

    // Log.
    console.debug('[OFL Video Frame Grabber - content script] - elements', elements)

    // If there is not exactly one video element, bail.
    // Note we need to send back false (and not
    // an empty response) as there may be
    // no video elements here, so we
    // can't burn our one callback.
    if (elements.length !== 1)
        return false

    // Get the video.
    const video = elements[0]

    // Extract the video frame.  Create an element.
    const canvas = document.createElement("canvas");

    // Set the width and height.
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Get the context.
    const context = canvas.getContext("2d")

    // If null, bail.
    if (context === null) {
        // Log.
        console.error('[OFL Video Frame Grabber - content script] - Could not get 2d context for canvas.')

        // Bail.
        return false
    }

    // Draw the image.
    context.drawImage(video, 0, 0);

    // Convert to a url.
    const url = canvas.toDataURL("image/png")

    // The return value.
    const response: FindVideoFrameResponse = {
        type: 'FindVideoFrameResponse',
        url
    }

    // Send the response.
    sendResponse(response)

    // Return true.
    return true
}

//////////////////////////////////////////////////
// Event handler registration
//////////////////////////////////////////////////
chrome.runtime.onMessage.addListener(onMessage);