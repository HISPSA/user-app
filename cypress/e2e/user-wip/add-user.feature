Feature: A user can be added

    Scenario: A new user with required fields is created
        Given the user-manager is on the add user page
        When the user-manager enters only the required information
            | email       | required.user@example.com |
            | phoneNumber | 0821234567                |
        And submits the form
        Then a new user should be added
        And the new user should have all previously provided information

    Scenario Outline: Invalid compulsory contact information prevents creation
        Given the user-manager is on the add user page
        When the user-manager enters only the required information
            | email       | required.user@example.com |
            | phoneNumber | 0821234567                |
        And sets the <field> field to "<value>"
        Then the user-manager should not be able to submit the form

        Examples:
            | field       | value         |
            | email       |               |
            | phoneNumber |               |
            | phoneNumber | +270821234567 |

    Scenario: An invited user requires valid email and mobile phone information
        Given the user-manager is on the add user page
        When the user-manager chooses email invitation to create account
        And enters the required invitation information
            | email       | invited.user@example.com |
            | phoneNumber | +27821234567             |
        And submits the form
        Then the new user should be invited with all previously provided information

    Scenario: A new user with all possible values is created
        Given the user-manager is on the add user page
        When the user-manager fills in all form inputs
        And submits the form
        Then a new user should be added
        And the new user should have all previously provided information
