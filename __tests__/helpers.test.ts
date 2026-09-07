import { classNames } from '@/helpers'

describe('classNames helper', () => {
  it('concatenates truthy class names separated by spaces', () => {
    expect(classNames('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('filters out falsy values like undefined, empty strings, and null', () => {
    expect(classNames('btn', undefined, '', 'btn-primary')).toBe('btn btn-primary')
  })

  it('returns an empty string when no arguments or only falsy arguments are provided', () => {
    expect(classNames()).toBe('')
    expect(classNames(undefined, undefined)).toBe('')
  })
})
