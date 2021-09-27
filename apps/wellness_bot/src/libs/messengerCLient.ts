import { FacebookMessagingAPIClient } from 'fb-messenger-bot-api';
const { ACCESS_TOKEN } = process.env;

const client = new FacebookMessagingAPIClient(ACCESS_TOKEN);

export default client;
