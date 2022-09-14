export type ActionTypes = 'IP_FOUND' | 'IP_NOT_FOUND' | 'VALID_IP' | 'INVALID_IP' | 'IP_CHECK_FAILURE'

export type Action = {
  message: string,
  reason: ActionTypes,
}

export type Emails = string[] | null

export interface ServerData {
  region:string,
  regionName:string,
  city: string,
  country: string,
  status: string,
}