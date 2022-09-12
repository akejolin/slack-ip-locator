import { App } from '@slack/bolt'
import findIp from './src/find-ip'
import findEmail from './src/find-email'
import { http } from "./src/http";

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

type ActionTypes = 'IP_FOUND' | 'IP_NOT_FOUND' | 'VALID_IP' | 'INVALID_IP' | 'IP_CHECK_FAILURE'

type Action = {
  message: string,
  reason: ActionTypes,
}



enum reactionTypes {
  'VALID_IP' = 'white_check_mark',
  'INVALID_IP' = 'x',
  'IP_NOT_FOUND' = 'x',
  'IP_FOUND' = 'x',
  'IP_CHECK_FAILURE' = 'warning'
};


const finalResult:Action[] = []

try {
  app.message('hello', async ({ message, say }:{message:any, say:any}) => {
    
    // 1. Default No Ip found
    finalResult.push({
      message: 'IP address was not found in the message',
      reason: 'IP_NOT_FOUND',
    })
    //const isAnIp:boolean = findIp(message) ? true : false
    const ipMatched:string[]|null = findIp(message.text)

    type Emails = string[] | null
    const emails:Emails = findEmail(message.text)
    const emailString = emails?.filter((item:string, index:number) => emails.indexOf(item) === index).join(', ')


    // 1. No Ip found
    if (ipMatched) {
      finalResult.push({
        message: `IP address was tracked in the message but still don't know if it is within target`,
        reason: 'IP_FOUND',
      })
      interface ServerData {
        region:string,
        regionName:string,
        city: string,
        country: string,
        status: string,
      }

      if (ipMatched) {
        const result = await http.get<ServerData>(`http://ip-api.com/json/${ipMatched[0]}`);

        if (result.data.status === 'fail') {
          finalResult.push({
            message: 'Not a valid IP address. Action: No action needed',
            reason: 'INVALID_IP',
          })
        } else {

          // Valid IP
          if (result.data.region === 'CA') {
            finalResult.push({
              message: `Valid IP address and it´s within target. <@akejolin> 👆 Action: Create pull request!
Region: ${result.data.region}.
Region Name: ${result.data.regionName}
City: ${result.data.city}
Country: ${result.data.country}
${emailString  ? `Emails: ${emailString}`: ''}

`,
              reason: 'VALID_IP',
            })
          } else {
            finalResult.push({
              message: `Valid IP address but not within target. Action: No action needed.
Region: ${result.data.region}.
Region Name: ${result.data.regionName}
City: ${result.data.city}
Country: ${result.data.country}
${emailString ? `Emails: ${emailString}`:''}
`,
              reason: 'INVALID_IP',
            })          
          }
        }
      }
    }

    await say({
      text: `${finalResult[finalResult.length -1].message}`,
      thread_ts: message.thread_ts || message.ts,
    });
    await app.client.reactions.add({
      token,
      channel: message.channel,
      name: reactionTypes[`${finalResult[finalResult.length -1].reason}`],
      timestamp: message.ts
    })
  })
} catch(error) {
  console.error(error)
}

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ App is running!');
})();