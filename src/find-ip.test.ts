import {findIp} from './find-ip'

describe('findIp', () => {
  it('should respond null or convert to false when no ip was found', () => {

    const message = `
    
    Hello!
    
    some text message
    
    `
    const result = findIp(message)
    expect(result).toEqual(null)
    const convertedToBoolean:boolean = result ? true : false
    expect(convertedToBoolean).toEqual(false)
  })

  it('should respond null when no ip was found', () => {

    const message = `
    
    hello
    
    x.x.x.x
    
    `
    expect(findIp(message)).toEqual(null)

  })

  it('should respond with array when ip was found', () => {

    const message = `hello
    
    1.2.3.4
    
    some text

    `
    const result = findIp(message)
    expect(result).toEqual(['1.2.3.4'])
    const convertedToBoolean:boolean = result ? true : false
    expect(convertedToBoolean).toEqual(true)
  })

  it('should respond with and array with 2 index when multiple ip was found', () => {

    const message = `
    
    hello
    
    1.2.3.4
    
    some text

    127.0.0.1

    `
    const result = findIp(message)
    expect(result).toEqual(['1.2.3.4', '127.0.0.1'])
    const convertedToBoolean:boolean = result ? true : false
    expect(convertedToBoolean).toEqual(true)
  })

  it('should respond with and array with 2 index when multiple ip was found on single line', () => {

    const message = 'hello 1.2.3.4 some text 127.0.0.1'
    const result = findIp(message)
    expect(result).toEqual(['1.2.3.4', '127.0.0.1'])
    const convertedToBoolean:boolean = result ? true : false
    expect(convertedToBoolean).toEqual(true)
  })
})
