export const findIp = (blob:string):string[]|null =>
  String(blob).match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g)  

export default findIp