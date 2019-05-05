const request = require('request-promise');
const WebSocket = require('ws');

const URI_SIGNUP = 'https://va.idp.liveperson.net/api/account/13350576/signup';
const URI_WEBSOCKET = 'wss://va.msg.liveperson.net/ws_api/account/13350576/messaging/consumer?v=3';


const params = {
    method: 'POST',
    uri: URI_SIGNUP,
    json: true
};

request(params)
    .then(function (result) {
        const jwt = result.jwt;

        const ws = new WebSocket(URI_WEBSOCKET, {
            headers: {
                Authorization: `jwt ${jwt}`
            }
        });

        ws.on('open', function () {
            ws.send('{"kind":"req","id":1,"type":"cm.ConsumerRequestConversation"}');
        });

        ws.on('message', function (message) {
            message = JSON.parse(message);

            if(message.type === 'cm.RequestConversationResponse') {
                console.log('received conversation response message', message);

                const conversationId = message.body.conversationId;
                console.log(conversationId);

                const content = {
                    kind: 'req',
                    id: 2,
                    type: 'ms.PublishEvent',
                    body: {
                        dialogId: conversationId,
                        event: {
                            type: 'ContentEvent',
                            contentType: 'text/plain',
                            message: 'My first message'
                        }
                    }
                };

                ws.send(JSON.stringify(content));
            }
            else {
                console.log('different response', message);
            }

        });
    });