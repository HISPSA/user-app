import { composeValidators, hasValue } from '@dhis2/ui'
import { validateSouthAfricanPhoneNumber } from './validators.js'

describe('validateSouthAfricanPhoneNumber', () => {
    it.each(['0821234567', '0712345678', '+27821234567', '+27712345678'])(
        'accepts %s',
        (value) => {
            expect(validateSouthAfricanPhoneNumber(value)).toBeUndefined()
        }
    )

    it.each([
        '821234567',
        '27821234567',
        '+270821234567',
        '082123456',
        '08212345678',
        '+2782123456',
        '+278212345678',
        '+447911123456',
        '082 123 4567',
        '082-123-4567',
        '(082)1234567',
        'abcdefghij',
        '',
        '   ',
        undefined,
        null,
        ' 0821234567',
        '0821234567 ',
        '0821234567\n',
        '+27821234567\n',
    ])('rejects %s', (value) => {
        expect(validateSouthAfricanPhoneNumber(value)).toBe(
            'Enter a valid South African phone number (e.g. 0821234567 or +27821234567)'
        )
    })

    it('uses the existing required-value message for an empty field', () => {
        const validate = composeValidators(
            hasValue,
            validateSouthAfricanPhoneNumber
        )
        expect(validate('')).toBe('Please provide a value')
        expect(validate(undefined)).toBe('Please provide a value')
    })
})
