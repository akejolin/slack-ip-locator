import { App } from '@slack/bolt'
import processor from './src/processor'

// Initializes your app with your bot token and signing secret
const signingSecret = process.env.SLACK_SIGNING_SECRET
const token = process.env.SLACK_BOT_TOKEN
const appToken = process.env.SLACK_APP_TOKEN

const app = new App({
  signingSecret,
  token,
  socketMode: true,
  appToken
});

processor(app, token as string);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ App is running!');
})();