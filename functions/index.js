const functions = require("firebase-functions");
const axios = require('axios');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

const token = 'Bearer xxx'

const dialogflowid = 'yyy';

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';

const LINE_HEADER = {
        'Content-Type': 'application/json',
        'Authorization': token
};

exports.Chatbot = functions.https.onRequest((request, response) => {
    functions.logger.info(request.body.events, {structuredData: true});
    if(request.body.events === undefined)
    {
        functions.logger.info(request.body.events, {structuredData: true});
        response.send("Hello from Browser");       
    }
    else 
    {
        functions.logger.info(request.body.events, {structuredData: true});
        let event = request.body.events[0]
        let message = event.message.text

        functions.logger.info(message, {structuredData: true});
        // https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects

        if (event.type === "message") {
                switch (event.message.type) {
                        case 'text':
                                if (message === '#Demo') {
                                        replyRaw(request);
                                } else if (message === '#push') {
                                        push(request);
                                } else if (message === 'สวัสดี') {
                                        replyText(request);
                                } else {
                                        postToDialogflow(request);
                                }
                                break;
                        case 'image':
                                replyRaw(request);
                                break;
                        case 'sticker':
                                replySticker(request);
                                break;
                        default:
                                break;
                }

        } 

    }
});


const replyRaw = request => {
    return axios({
        method: 'post',
        url: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            replyToken: request.body.events[0].replyToken,
            messages: [
                    {
                            type: "text",
                            text: JSON.stringify(request.body)
                    }
            ]
        })
      });
};

const replyText = request => {
    return axios({
        method: 'post',
        url: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            replyToken: request.body.events[0].replyToken,
            messages: [
                    {
                            type: "text",
                            text: request.body.events[0].message.text
                    }
            ]
        })
      });
};

const replySticker = request => {
    return axios({
        method: 'post',
        url: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        data: JSON.stringify({
            replyToken: request.body.events[0].replyToken,
            messages: [
                {
                    type: "sticker",
                    packageId: request.body.events[0].message.packageId,
                    stickerId: request.body.events[0].message.stickerId,
                  }
            ]
        })
      });


};

const push = request => {
    return axios({
        method: 'post',
        url: `${LINE_MESSAGING_API}/push`,
        headers: LINE_HEADER,
        data: JSON.stringify({
                    to: request.body.events[0].source.userId,
                    messages: [
                            {
                                    type: "text",
                                    text: "Send Push Message"
                            }
                    ]
            })
    }).then(function (response) {
            functions.logger.info(response);
    }).catch(function (error) {
            functions.logger.info(error.message);
    });
}

const postToDialogflow = request => {
    request.headers.host = "bots.dialogflow.com";

    return axios({
        method: 'post',
        url: "https://bots.dialogflow.com/line/" + dialogflowid + "/webhook",
        headers: request.headers,
        data: JSON.stringify(request.body)
    }).then(function (response) {
            functions.logger.info(response);
    }).catch(function (error) {
            functions.logger.info(error.message);
    });
};