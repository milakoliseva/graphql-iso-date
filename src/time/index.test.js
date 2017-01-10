// @flow
/**
 * Copyright (c) 2017, Dirk-Jan Rutten
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
 
import GraphQLTime from './'
import * as Kind from 'graphql/language/kinds'
import MockDate from 'mockdate'
const {stringify} = require('jest-matcher-utils')

// Mock the new Date() call so it always returns 2017-01-01T00:00:00.000Z
MockDate.set(new Date(Date.UTC(2017, 0, 1)))

const invalidDates = [
  // General
  'Invalid date',
  // Time with hours, minutes, seconds and milliseconds
  '00:00:00.1Z',
  '00:00:00.10Z',
  '00:00:00.1000Z',
  // Date
  '2016-01-01T00:00:00.223Z',
  // Offset from UTC
  '00:00:00.45+0130',
  '00:00:00.45+01'
]

const validDates = [
  [ '00:00:00Z', new Date(Date.UTC(2017, 0, 1)) ],
  [ '00:00:59Z', new Date(Date.UTC(2017, 0, 1, 0, 0, 59)) ],
  [ '10:00:11.003Z', new Date(Date.UTC(2017, 0, 1, 10, 0, 11, 3)) ],
  [ '00:00:00+01:30', new Date(Date.UTC(2016, 11, 31, 22, 30)) ]
]

describe('GraphQLTime', () => {
  describe('serialization', () => {
    [
      {},
      [],
      null,
      undefined,
      true
    ].forEach(invalidInput => {
      it(`throws error when serializing ${stringify(invalidInput)}`, () => {
        expect(() =>
          GraphQLTime.serialize(invalidInput)
        ).toThrowErrorMatchingSnapshot()
      })
    });

    // Serialize from Date
    [
      [ new Date(Date.UTC(2016, 0, 1)), '00:00:00.000Z' ],
      [ new Date(Date.UTC(2016, 0, 1, 14, 48, 10, 3)), '14:48:10.003Z' ]
    ].forEach(([ value, expected ]) => {
      it(`serializes javascript Date ${stringify(value)} into ${stringify(expected)}`, () => {
        expect(
          GraphQLTime.serialize(value)
        ).toEqual(expected)
      })
    })

    it(`throws error when serializing invalid date`, () => {
      expect(() =>
        GraphQLTime.serialize(new Date('invalid date'))
      ).toThrowErrorMatchingSnapshot()
    })

    validDates.forEach(([value]) => {
      it(`serializes date-string ${value}`, () => {
        expect(
          GraphQLTime.serialize(value)
        ).toEqual(value)
      })
    })

    invalidDates.forEach(dateString => {
      it(`throws an error when serializing an invalid date-string ${stringify(dateString)}`, () => {
        expect(() =>
          GraphQLTime.serialize(dateString)
        ).toThrowErrorMatchingSnapshot()
      })
    })
  })

  describe('value parsing', () => {
    validDates.forEach(([ value, expected ]) => {
      it(`parses date-string ${stringify(value)} into javascript Date ${stringify(expected)}`, () => {
        expect(
          GraphQLTime.parseValue(value)
        ).toEqual(expected)
      })
    });

    [
      null,
      undefined,
      4566,
      {},
      [],
      true
    ].forEach(invalidInput => {
      it(`throws an error when parsing ${stringify(invalidInput)}`, () => {
        expect(() =>
          GraphQLTime.parseValue(invalidInput)
        ).toThrowErrorMatchingSnapshot()
      })
    })

    invalidDates.forEach(dateString => {
      it(`throws an error parsing an invalid time-string ${stringify(dateString)}`, () => {
        expect(() =>
          GraphQLTime.parseValue(dateString)
        ).toThrowErrorMatchingSnapshot()
      })
    })
  })

  describe('literial parsing', () => {
    validDates.forEach(([ value, expected ]) => {
      const literal = {
        kind: Kind.STRING, value
      }

      it(`parses literal ${stringify(literal)} into javascript Date ${stringify(expected)}`, () => {
        expect(
          GraphQLTime.parseLiteral(literal)
        ).toEqual(expected)
      })
    })

    invalidDates.forEach(value => {
      const invalidLiteral = {
        kind: Kind.STRING, value
      }
      it(`returns null when parsing invalid literal ${stringify(invalidLiteral)}`, () => {
        expect(
          GraphQLTime.parseLiteral(invalidLiteral)
        ).toEqual(null)
      })
    })

    const invalidLiteralFloat = {
      kind: Kind.FLOAT, value: 5
    }
    it(`returns null when parsing invalid literal ${stringify(invalidLiteralFloat)}`, () => {
      expect(
        GraphQLTime.parseLiteral(invalidLiteralFloat)
      ).toEqual(null)
    })
  })
})
