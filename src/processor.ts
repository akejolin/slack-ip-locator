import findIp from './find-ip'
import findEmail from './find-email'
import { http } from "./http";
import createPR from './create-pr'
import type {Action, Emails, ServerData} from './types'
import { printIpData } from './printIpData';
export default (app:any, token:string):void => {

  // map wanted Slack reaction emoji with result status
  enum reactionTypes {
    'VALID_IP' = 'white_check_mark',
    'INVALID_IP' = 'x',
    'IP_NOT_FOUND' = 'x',
    'IP_FOUND' = 'x',
    'IP_CHECK_FAILURE' = 'warning'
  };


  // Initialize result records array
  const resultRecords:Action[] = []
  let ipMatched:string[]|null
  try {
    // Invoke Bot on phrase 'hello'
    app.message('hello', async ({ message, say }:{message:any, say:any}) => {
      
      // Default. Action when no ip found. Will lead to no reactions.
      resultRecords.push({
        ip: '',
        message: 'IP address was not found.',
        reason: 'IP_NOT_FOUND',
      })
  
      // Find ip:s
      ipMatched = findIp(message.text)

      // Find email:s
      const emails:Emails = findEmail(message.text)
      const emailString = emails?.filter((item:string, index:number) => emails.indexOf(item) === index).join(', ')


      // 1. Ip found
      if (ipMatched) {
        const result = await http.get<ServerData>(`http://ip-api.com/json/${ipMatched[0]}`);

        if (result.data.status === 'fail') {
          resultRecords.push({
            ip: ipMatched[0],
            message: 'Not a valid IP address. Action: No action needed',
            reason: 'INVALID_IP',
          })
        } else {

          // Valid IP
          if (result.data.region === 'CA') {
          //if (result.data.region === 'AB') {

            resultRecords.push({
              ip: ipMatched[0],
              message: `Valid IP address and it´s within target. ${printIpData(result.data as ServerData, emailString as string)}`,
              reason: 'VALID_IP',
            })
            
          } else {
            resultRecords.push({
              ip: ipMatched[0],
              message: `Valid IP address but not within target. Action: No action needed. ${printIpData(result.data as ServerData, emailString as string)}`,
              reason: 'INVALID_IP',
            })
          }
        }
      }

      // Extract final result from resultRecords
      const response:Action = resultRecords[resultRecords.length -1]

      // Respond to slack with new thread message
      await say({
        text: `${response.message}`,
        thread_ts: message.thread_ts || message.ts,
      });
      // Add Slack reaction to initial thread message
      await app.client.reactions.add({
        token,
        channel: message.channel,
        name: reactionTypes[`${response.reason}`],
        timestamp: message.ts
      })

      // Create GITHUB PR

      let pr:any = null
      if (response.reason === 'VALID_IP') {
        pr = await createPR({ip: response.ip , email: emailString})
      } else {
        // Abort process since not valid ip
        return        
      }

      // Respond to slack with new thread message encouraging actions
      const slackTeam = '<@akejolin>'
      if (pr?.status > 199 && pr?.status < 300) {
        await say({
          text: `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/pull/${pr?.data.number}
${slackTeam} 👆 Action: Review pull request!`,
          thread_ts: message.thread_ts || message.ts,
        });
      } else {
        await say({
          text:`${slackTeam} 👆 Action: Create pull request!
https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/`,
          thread_ts: message.thread_ts || message.ts,
        });     
      }


    })
  } catch(error) {
    console.error(error)
  }

}