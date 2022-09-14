import ipRegex from './ip-regex'

export const findIp = (blob:string):string[]|null => String(blob).match(ipRegex()) 

export default findIp