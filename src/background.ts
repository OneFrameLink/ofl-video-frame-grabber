import { FindVideoFrameRequest } from "./models/FindVideoFrameRequest";
import { FindVideoFrameResponse } from "./models/FindVideoFrameResponse";
import { GetVideoFrameRequest } from "./models/GetVideoFrameRequest";
import { GetVideoFrameResponse } from "./models/GetVideoFrameResponse";

//////////////////////////////////////////////////
// Callback
//////////////////////////////////////////////////
function onMessageExternal(
    getVideoFrameRequest: GetVideoFrameRequest,
    __: chrome.runtime.MessageSender,
    sendResponse: (response: GetVideoFrameResponse) => void
) {
    // If the request does not have the type
    // we expect, bail.
    if (getVideoFrameRequest.type !== 'GetVideoFrameRequest')
        return false

    // Log.
    console.debug('[OFL Video Frame Grabber - background script] - Received request')

    // Query for the active window
    chrome.tabs.query(
        { active: true, currentWindow: true }, 
        (tabs) => {
            // If there isn't just one, bail.
            if (tabs.length !== 1) return

            // Get the tab.
            const tab = tabs[0]

            // No ID? Bail.
            if (!tab.id) return

            // The request message.
            const request: FindVideoFrameRequest = {
                type: 'FindVideoFrameRequest',
            }

            // Send a message to try and find the video frame.
            chrome.tabs.sendMessage(
                tab.id,
                request,
                (findResponse: FindVideoFrameResponse) => {
                    // Log.
                    console.debug('[OFL Video Frame Grabber - background script - sendMessage callback] - findResponse', findResponse)

                    // Construct the response.
                    const response: GetVideoFrameResponse = {
                        type: 'GetVideoFrameResponse',
                        url: findResponse.url
                    }

                    // Send the response.
                    sendResponse(response)
                }
            )       
        }
    )

    // Return true to indicate we have to send a response.
    return true
}

//////////////////////////////////////////////////
// Callback registration
//////////////////////////////////////////////////
chrome.runtime.onMessageExternal.addListener(onMessageExternal)