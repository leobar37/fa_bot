"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const fb_messenger_bot_api_1 = require("fb-messenger-bot-api");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const { VALIDATION_TOKEN } = process.env;
app.set('port', process.env.PORT || 5000);
console.log(VALIDATION_TOKEN);
const validateWebhook = function validateWebhook(token) {
    return (req, res) => fb_messenger_bot_api_1.ValidateWebhook.validateServer(req, res, token);
};
const validator = validateWebhook(VALIDATION_TOKEN);
app.get('/', validator);
app.post('/', (req, res) => {
    const incommingMessages = fb_messenger_bot_api_1.FacebookMessageParser.parsePayload(req.body);
    console.log(incommingMessages);
});
app.listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
});
//# sourceMappingURL=app.js.map