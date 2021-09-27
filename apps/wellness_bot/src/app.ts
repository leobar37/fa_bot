import express, { Request, Response, Router } from 'express';

import { ValidateWebhook, FacebookMessageParser } from 'fb-messenger-bot-api';
import messengerClient from './libs/messengerCLient';
// import {  } from '@fa-bot/api'

const app = express();

app.use(express.json());

const { VALIDATION_TOKEN } = process.env;

app.set('port', process.env.PORT || 5000);

const validateWebhook = function validateWebhook(token: string) {
  return (req: Request, res: Response) =>
    ValidateWebhook.validateServer(req, res, token);
};

const validator = validateWebhook(VALIDATION_TOKEN);

let count = 0;
const router = Router();

router.get('/', (req: Request, res: Response) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = VALIDATION_TOKEN;
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      console.log('validate');

      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

router.post('/', async (req: Request, res: Response) => {
  ++count;
  console.log(JSON.stringify(req.body, null, 3));

  const incommingMessages = FacebookMessageParser.parsePayload(req.body);

  incommingMessages.forEach(async (payload) => {
    // n
    const { sender, message, timestamp } = payload;
    if (message) {
      console.log(new Date(timestamp));
      await messengerClient.sendTextMessage(sender.id, message.text);
    }
  });
  // incommingMessages.forEach(async (ms) => {
  //   if (ms?.message) {
  //     console.log('haveas');
  //     console.log(ms);

  //     await messengerClient.sendTextMessage(ms.sender.id, ms.message?.text);
  //   } else {
  //     await messengerClient.sendTextMessage(ms.sender.id, 'No hay mensaje');
  //     console.log('not message');
  //   }
  // });
  res.sendStatus(200);
});

app.use(router);

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
