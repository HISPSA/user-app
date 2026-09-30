import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Form from '../Form.jsx'
import ContactDetailsSection from './ContactDetailsSection.jsx'

const renderContactForm = (user, onSubmit = jest.fn()) => {
    render(
        <Form submitButtonLabel="Save" onSubmit={onSubmit} onCancel={() => {}}>
            {() => <ContactDetailsSection user={user} />}
        </Form>
    )
    return onSubmit
}

describe('ContactDetailsSection', () => {
    it.each([
        ['', 'Please provide a value'],
        ['   ', 'Enter a valid South African phone number'],
        ['082 123 4567', 'Enter a valid South African phone number'],
        ['+270821234567', 'Enter a valid South African phone number'],
        ['+447911123456', 'Enter a valid South African phone number'],
    ])('blocks submission for phone number "%s"', async (value, message) => {
        const interaction = userEvent.setup()
        const onSubmit = renderContactForm()
        const phoneInput = screen.getByLabelText(/Mobile phone number/i)
        expect(
            phoneInput.closest('[data-test="dhis2-uiwidgets-inputfield"]')
        ).toHaveTextContent('*')
        if (value) {
            await interaction.type(phoneInput, value)
        }
        await interaction.click(screen.getByLabelText('WhatsApp'))
        // Make the form dirty even when the required phone field is empty.
        await interaction.type(screen.getByLabelText('WhatsApp'), '0821234567')
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
        fireEvent.submit(phoneInput.closest('form'))
        expect(onSubmit).not.toHaveBeenCalled()
        expect(await screen.findByText(new RegExp(message))).toBeInTheDocument()
    })

    it.each(['0821234567', '+27821234567'])(
        'submits %s unchanged',
        async (value) => {
            const interaction = userEvent.setup()
            const onSubmit = renderContactForm()
            await interaction.type(
                screen.getByLabelText(/Mobile phone number/i),
                value
            )
            await interaction.click(
                screen.getByRole('button', { name: 'Save' })
            )
            await waitFor(() => expect(onSubmit).toHaveBeenCalled())
            expect(onSubmit.mock.calls[0][0].phoneNumber).toBe(value)
        }
    )

    it('requires a legacy user to supply a missing phone number before saving edits', async () => {
        const interaction = userEvent.setup()
        const onSubmit = renderContactForm({ whatsApp: '0821234567' })
        await interaction.type(
            screen.getByLabelText('Skype'),
            'updated-account'
        )
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
        fireEvent.submit(screen.getByLabelText('Skype').closest('form'))
        expect(onSubmit).not.toHaveBeenCalled()
        await interaction.type(
            screen.getByLabelText(/Mobile phone number/i),
            '+27712345678'
        )
        await interaction.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(onSubmit).toHaveBeenCalled())
        expect(onSubmit.mock.calls[0][0]).toMatchObject({
            phoneNumber: '+27712345678',
            skype: 'updated-account',
        })
    })

    it('validates an existing invalid phone number even when only another field is edited', async () => {
        const interaction = userEvent.setup()
        const onSubmit = renderContactForm({ phoneNumber: '+447911123456' })
        await interaction.type(
            screen.getByLabelText('Skype'),
            'updated-account'
        )
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
        fireEvent.submit(screen.getByLabelText('Skype').closest('form'))
        expect(onSubmit).not.toHaveBeenCalled()
    })
})
