import { config, panic } from './config'
import { fake } from 'sinon'
import { expect } from 'chai'

describe('config', () => {
  it('should exit when panic is enabled', function () {
    config.shouldPanic = true
    let original = process.exit
    let mockFn = fake()
    process.exit = mockFn as any
    panic()
    expect(mockFn.calledOnce)
    process.exit = original
  })

  it('should not exit when panic is disabled', function () {
    config.shouldPanic = false
    let original = process.exit
    let mockFn = fake()
    process.exit = mockFn as any
    panic()
    expect(mockFn.notCalled)
    process.exit = original
  })
})
