import type { ServerData } from "./types"
export const printIpData = (data:ServerData, emailString:string):string => `
Region: ${data.region}.
Region Name: ${data.regionName}
City: ${data.city}
Country: ${data.country}
${emailString ? `Emails: ${emailString}`:''}`