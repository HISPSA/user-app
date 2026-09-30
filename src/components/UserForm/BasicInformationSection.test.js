import { useDataQuery, useConfig, useDataEngine } from '@dhis2/app-runtime'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Form } from 'react-final-form'
import BasicInformationSection from './BasicInformationSection.jsx'
import ContactDetailsSection from './ContactDetailsSection.jsx'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useDataQuery: jest.fn(),
    useConfig: jest.fn(),
    useDataEngine: jest.fn(),
}))

jest.mock('@dhis2/d2-i18n', () => ({
    ...jest.requireActual('@dhis2/d2-i18n'),
    t: (key) => key,
    addResources: jest.fn(),
}))

const renderWithForm = (component, onSubmit = jest.fn(), initialValues) => {
    return render(
        <Form onSubmit={onSubmit} initialValues={initialValues}>
            {({ handleSubmit }) => (
                <form noValidate onSubmit={handleSubmit}>
                    {component}
                    <button type="submit">Save</button>
                </form>
            )}
        </Form>
    )
}

describe('BasicInformationSection', () => {
    beforeEach(() => {
        useDataQuery.mockReset()
        useConfig.mockReset()
        useDataEngine.mockReturnValue({
            query: jest
                .fn()
                .mockResolvedValue({ result: { response: 'success' } }),
        })
    })

    it('disables the "Disable this user account" checkbox for the current user', () => {
        useDataQuery.mockReturnValue({
            data: { enforceVerifiedEmail: true },
        })
        const user = {
            id: '1',
            disabled: false,
        }

        renderWithForm(
            <BasicInformationSection
                user={user}
                inviteUser={''}
                userInterfaceLanguage="en"
                interfaceLanguageOptions={[]}
                userDatabaseLanguage="en"
                databaseLanguageOptions={[]}
                currentUserId="1"
            />
        )

        const checkbox = screen.getByLabelText(/disable this user account/i)
        expect(checkbox).toBeDisabled()
    })

    it('populates the form with user data when user prop changes', () => {
        useDataQuery.mockReturnValue({
            data: { enforceVerifiedEmail: true },
        })
        const user = {
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            surname: 'User',
        }

        renderWithForm(
            <BasicInformationSection
                user={user}
                inviteUser={''}
                userInterfaceLanguage="en"
                interfaceLanguageOptions={[]}
                userDatabaseLanguage="en"
                databaseLanguageOptions={[]}
                currentUserId="1"
            />
        )
        expect(screen.getByLabelText(/Username/i)).toHaveValue('testuser')
        expect(screen.getByLabelText(/Email Address/i)).toHaveValue(
            'test@example.com'
        )
        expect(screen.getByLabelText(/First Name/i)).toHaveValue('Test')
        expect(screen.getByLabelText(/Last Name/i)).toHaveValue('User')
    })

    it('does not show email verification message when creating a new user (no user data available)', () => {
        useConfig.mockReturnValue({
            serverVersion: { minor: '42' },
            systemInfo: { emailConfigured: true },
        })
        useDataQuery.mockReturnValue({ data: { enforceVerifiedEmail: true } })

        renderWithForm(
            <BasicInformationSection
                user={null}
                userInterfaceLanguage="en"
                interfaceLanguageOptions={[]}
                userDatabaseLanguage="en"
                databaseLanguageOptions={[]}
                currentUserId="1"
            />
        )
        expect(
            screen.queryByText(/this user email has been verified/i)
        ).toBeNull()
        expect(
            screen.queryByText(/this user does not have a verified email/i)
        ).toBeNull()
    })

    it('does not show email verification message when system is v41 or earlier', () => {
        useConfig.mockReturnValue({
            serverVersion: { minor: '41' },
            systemInfo: { emailConfigured: true },
        })

        useDataQuery.mockReturnValue({ data: { enforceVerifiedEmail: true } })

        const user = {
            emailVerified: false,
        }

        renderWithForm(
            <BasicInformationSection
                user={user}
                inviteUser={''}
                userInterfaceLanguage="en"
                interfaceLanguageOptions={[]}
                userDatabaseLanguage="en"
                databaseLanguageOptions={[]}
                currentUserId="1"
            />
        )
        expect(
            screen.queryByText(/this user email has been verified/i)
        ).toBeNull()
        expect(
            screen.queryByText(/this user does not have a verified email/i)
        ).toBeNull()
    })

    it('does not show email verification message when email configured is false', () => {
        useConfig.mockReturnValue({
            serverVersion: { minor: '42' },
            systemInfo: { emailConfigured: false },
        })
        useDataQuery.mockReturnValue({ data: { enforceVerifiedEmail: true } })

        const user = {
            emailVerified: false,
        }
        renderWithForm(
            <BasicInformationSection
                user={user}
                inviteUser={''}
                userInterfaceLanguage="en"
                interfaceLanguageOptions={[]}
                userDatabaseLanguage="en"
                databaseLanguageOptions={[]}
                currentUserId="1"
            />
        )
        expect(
            screen.queryByText(/this user email has been verified/i)
        ).toBeNull()
        expect(
            screen.queryByText(/this user does not have a verified email/i)
        ).toBeNull()
    })

    it('shows positive email verification message when all conditions are met and emailVerified is true', () => {
        useConfig.mockReturnValue({
            serverVersion: { minor: '42' },
            systemInfo: { emailConfigured: true },
        })
        useDataQuery.mockReturnValue({ data: { enforceVerifiedEmail: true } })

        const user = {
            emailVerified: true,
        }
        renderWithForm(
            <BasicInformationSection
                user={user}
                inviteUser={''}
                userInterfaceLanguage="en"
                interfaceLanguageOptions={[]}
                userDatabaseLanguage="en"
                databaseLanguageOptions={[]}
                currentUserId="1"
            />
        )
        expect(
            screen.queryByText(/this user email has been verified/i)
        ).toBeInTheDocument()
    })

    it('shows negative email verification message when all conditions are met and emailVerified is false', () => {
        useConfig.mockReturnValue({
            serverVersion: { minor: '42' },
            systemInfo: { emailConfigured: true },
        })
        useDataQuery.mockReturnValue({ data: { enforceVerifiedEmail: true } })

        const user = {
            emailVerified: false,
        }
        renderWithForm(
            <BasicInformationSection
                user={user}
                inviteUser={''}
                userInterfaceLanguage="en"
                interfaceLanguageOptions={[]}
                userDatabaseLanguage="en"
                databaseLanguageOptions={[]}
                currentUserId="1"
            />
        )
        expect(
            screen.queryByText(/this user does not have a verified email/i)
        ).toBeInTheDocument()
    })
})

describe.each([
    ['normal creation', undefined, 'SET_PASSWORD'],
    ['invitation', undefined, 'INVITE_USER'],
    ['editing a legacy user', { username: 'testuser' }, undefined],
])('email validation during %s', (mode, user, inviteUser) => {
    beforeEach(() => {
        useDataQuery.mockReturnValue({ data: { enforceVerifiedEmail: false } })
        useConfig.mockReturnValue({ serverVersion: { minor: '41' } })
        useDataEngine.mockReturnValue({
            query: jest
                .fn()
                .mockResolvedValue({ result: { response: 'success' } }),
        })
    })

    it.each([
        ['', 'Please provide a value'],
        ['invalid-email', 'Please provide a valid email address'],
        ['   ', 'Please provide a value'],
    ])('blocks submission for email "%s"', async (value, message) => {
        const interaction = userEvent.setup()
        const onSubmit = jest.fn()
        renderWithForm(
            <>
                <BasicInformationSection
                    user={user}
                    inviteUser={inviteUser}
                    userInterfaceLanguage="en"
                    interfaceLanguageOptions={[
                        { label: 'English', value: 'en' },
                    ]}
                    databaseLanguageOptions={[]}
                    currentUserId="current-user"
                />
                <ContactDetailsSection user={user} />
            </>,
            onSubmit,
            {
                username: 'testuser',
                firstName: 'Test',
                surname: 'User',
                phoneNumber: '0821234567',
            }
        )

        const emailInput = screen.getByLabelText(/Email address/i)
        expect(
            emailInput.closest('[data-test="dhis2-uiwidgets-inputfield"]')
        ).toHaveTextContent('*')
        if (value) {
            await interaction.type(emailInput, value)
        }
        await interaction.click(screen.getByRole('button', { name: 'Save' }))
        expect(await screen.findByText(message)).toBeInTheDocument()
        expect(onSubmit).not.toHaveBeenCalled()

        await interaction.clear(emailInput)
        await interaction.type(emailInput, 'test@example.com')
        await waitFor(() =>
            expect(screen.queryByText(message)).not.toBeInTheDocument()
        )
        await interaction.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(onSubmit).toHaveBeenCalled())
        expect(onSubmit.mock.calls[0][0].email).toBe('test@example.com')
    })

    it.each(['0821234567', '+27821234567'])(
        'requires a phone number and submits valid contacts with %s',
        async (phoneNumber) => {
            const interaction = userEvent.setup()
            const onSubmit = jest.fn()
            renderWithForm(
                <>
                    <BasicInformationSection
                        user={user}
                        inviteUser={inviteUser}
                        userInterfaceLanguage="en"
                        interfaceLanguageOptions={[
                            { label: 'English', value: 'en' },
                        ]}
                        databaseLanguageOptions={[]}
                        currentUserId="current-user"
                    />
                    <ContactDetailsSection user={user} />
                </>,
                onSubmit,
                {
                    username: 'testuser',
                    firstName: 'Test',
                    surname: 'User',
                    email: 'test@example.com',
                }
            )

            await interaction.click(
                screen.getByRole('button', { name: 'Save' })
            )
            expect(
                await screen.findByText('Please provide a value')
            ).toBeInTheDocument()
            expect(onSubmit).not.toHaveBeenCalled()
            await interaction.type(
                screen.getByLabelText(/Mobile phone number/i),
                '+447911123456'
            )
            await interaction.click(
                screen.getByRole('button', { name: 'Save' })
            )
            expect(
                await screen.findByText(
                    /Enter a valid South African phone number/
                )
            ).toBeInTheDocument()
            expect(onSubmit).not.toHaveBeenCalled()
            await interaction.clear(
                screen.getByLabelText(/Mobile phone number/i)
            )
            await interaction.type(
                screen.getByLabelText(/Mobile phone number/i),
                phoneNumber
            )
            await interaction.click(
                screen.getByRole('button', { name: 'Save' })
            )
            await waitFor(() => expect(onSubmit).toHaveBeenCalled())
            expect(onSubmit.mock.calls[0][0]).toMatchObject({
                email: 'test@example.com',
                phoneNumber,
            })
        }
    )
})
