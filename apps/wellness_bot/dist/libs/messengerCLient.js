"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fb_messenger_bot_api_1 = require("fb-messenger-bot-api");
const { ACCESS_TOKEN } = process.env;
const client = new fb_messenger_bot_api_1.FacebookMessagingAPIClient(ACCESS_TOKEN);
exports.default = client;
//# sourceMappingURL=messengerCLient.js.map