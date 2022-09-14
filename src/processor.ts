import findIp from './find-ip'
import findEmail from './find-email'
import { http } from "./http";
import createPR from './create-pr'
import type {Action, Emails, ServerData} from './types' 
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

  try {
    // Invoke Bot on phrase 'hello'
    app.message('hello', async ({ message, say }:{message:any, say:any}) => {
      
      // 1. Default No Ip found
      resultRecords.push({
        message: 'IP address was not found in the message',
        reason: 'IP_NOT_FOUND',
      })
  
      const ipMatched:string[]|null = findIp(message.text)

      const emails:Emails = findEmail(message.text)
      const emailString = emails?.filter((item:string, index:number) => emails.indexOf(item) === index).join(', ')


      // 1. No Ip found
      if (ipMatched) {
        resultRecords.push({
          message: `IP address was tracked in the message but still don't know if it is within target`,
          reason: 'IP_FOUND',
        })

        if (ipMatched) {
          const result = await http.get<ServerData>(`http://ip-api.com/json/${ipMatched[0]}`);

          if (result.data.status === 'fail') {
            resultRecords.push({
              message: 'Not a valid IP address. Action: No action needed',
              reason: 'INVALID_IP',
            })
          } else {

            // Valid IP
            //if (result.data.region === 'CA') {
            if (result.data.region === 'AB') {

              // Create GITHUB PR
              const pr = await createPR({ip: ipMatched[0] , email: emailString})

              resultRecords.push({
                message: `Valid IP address and it´s within target. <@akejolin> 👆 Action: ${pr?.status === 200 ? 'Review' : 'Create'} pull request!
  Region: ${result.data.region}.
  Region Name: ${result.data.regionName}
  City: ${result.data.city}
  Country: ${result.data.country}
  ${emailString  ? `Emails: ${emailString}`: ''}
  `,
                reason: 'VALID_IP',
              })
              
            } else {
              resultRecords.push({
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

      // Respond to slack with new thread message
      await say({
        text: `${resultRecords[resultRecords.length -1].message}`,
        thread_ts: message.thread_ts || message.ts,
      });
      // Add Slack reaction to initial thread message
      await app.client.reactions.add({
        token,
        channel: message.channel,
        name: reactionTypes[`${resultRecords[resultRecords.length -1].reason}`],
        timestamp: message.ts
      })
    })
  } catch(error) {
    console.error(error)
  }

}