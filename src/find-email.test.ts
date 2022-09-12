import {findEmail} from './find-email'

describe('findIp', () => {
  it('should respond null or convert to false when no ip was found', () => {

    const message = `
    
    Hello!
    
    some text message
    
    `
    const result = findEmail(message)
    expect(result).toEqual(null)
    const convertedToBoolean:boolean = result ? true : false
    expect(convertedToBoolean).toEqual(false)
  })
  it('should respond null when broken email was found', () => {

    const message = `
    
    Hello!
    
    some text message

    john@
    
    `
    const result = findEmail(message)
    expect(result).toEqual(null)
  })

  it('should respond null when broken email was found', () => {

    const message = `
    
    Hello!
    
    some text message

    john@midnight
    
    `
    const result = findEmail(message)
    expect(result).toEqual(null)
  })

  it('should respond null when broken email was found', () => {

    const message = `
    
    Hello!
    
    some text message

    john@.com
    
    `
    const result = findEmail(message)
    expect(result).toEqual(null)
  })

  it('should respond null when broken email was found', () => {

    const message = `
    
    Hello!
    
    some text message

    @
    
    `
    const result = findEmail(message)
    expect(result).toEqual(null)
  })

  it('should respond null when broken email was found', () => {

    const message = `
    
    Hello!
    
    some text message

    @midnight.com
    
    `
    const result = findEmail(message)
    expect(result).toEqual(null)
  })



  it('should respond with an Array when email was found', () => {

    const message = `
    
    hello
    1.2.3.4
    john.doe@midnight.com
    `
    expect(findEmail(message)).toEqual(['john.doe@midnight.com'])

  })
  it('should respond with an Array when email was found', () => {

    const message = `
    
    hello
    1.2.3.4
    john@midnight.com
    `
    type Emails = string[] | null
    const emails:Emails = findEmail(message)
    const emailString = emails?.join(', ')
    expect(Array.isArray(emails) ? emails.length : null).toEqual(1)
    expect(emailString).toEqual('john@midnight.com')

  })

  it('should respond with joined string when email was found', () => {

    const message = `
    
    hello
    1.2.3.4
    john@midnight.com
    john.doe@midnight.com
    `

    type Emails = string[] | null
    const emails:Emails = findEmail(message)
    const emailString = emails?.join(', ')

    expect(Array.isArray(emails) ? emails.length : null).toEqual(2)
    expect(emailString).toEqual('john@midnight.com, john.doe@midnight.com')

  })

  it('should remove duplicates', () => {

    const message = `
    
    hello
    1.2.3.4
    john@midnight.com
    john.doe@midnight.com
    john.doe@midnight.com
    john.doe@midnight.com
    john.doe@midnight.com
    `

    type Emails = string[] | null
    const emails:Emails = findEmail(message)
    const emailString = emails?.filter((item:string, index:number) => emails.indexOf(item) === index).join(', ')

    expect(Array.isArray(emails) ? emails.length : null).toEqual(5)
    expect(emailString).toEqual('john@midnight.com, john.doe@midnight.com')

  })

})
