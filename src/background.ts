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
    // Log.
    console.debug(
        '[OflTranscriptionAssistant.background.onMessageExternal] - getVideoFrameRequest', 
        getVideoFrameRequest
    )

    // Query for the active window
    chrome.tabs.query(
        { active: true, currentWindow: true }, 
        (tabs) => {
            // Log.
            console.debug(
                '[OflTranscriptionAssistant.background.onMessageExternal.tabs.query.callback] - tabs', 
                tabs
            )

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
// Log.
console.debug(
    '[OflTranscriptionAssistant.background] - listener registered'
)

chrome.runtime.onMessageExternal.addListener(onMessageExternal)