import SelectField from 'd2-ui/lib/form-fields/DropDown.component';
import TextField from 'd2-ui/lib/form-fields/TextField';
import CheckBox from 'd2-ui/lib/form-fields/CheckBox.component';
import i18next from 'i18next';

const style = {
    float: 'left',
    marginRight: '1rem',
};

export const FIELD_NAMES = {
    QUERY: 'query',
    INACTIVE_MONTHS: 'inactiveMonths',
    INVITATION_STATUS: 'invitationStatus',
    SELF_REGISTERED: 'selfRegistered',
};

export const getQuery = (value, onInputHandler, customStyle) => ({
    name: FIELD_NAMES.QUERY,
    value: value,
    component: TextField,
    props: {
        floatingLabelText: i18next.t('Search by name'),
        style: { ...style, width: '256px', ...customStyle },
        hintText: '',
        type: 'search',
        onInput: onInputHandler,
    },
});

export const getInactiveMonths = value => {
    const month = i18next.t('month');
    const months = i18next.t('months');
    return {
        name: FIELD_NAMES.INACTIVE_MONTHS,
        value: value,
        component: SelectField,
        props: {
            menuItems: [
                { id: 1, displayName: `1 ${month}` },
                { id: 2, displayName: `2 ${months}` },
                { id: 3, displayName: `3 ${months}` },
                { id: 4, displayName: `4 ${months}` },
                { id: 5, displayName: `5 ${months}` },
                { id: 6, displayName: `6 ${months}` },
                { id: 7, displayName: `7 ${months}` },
                { id: 8, displayName: `8 ${months}` },
                { id: 9, displayName: `9 ${months}` },
                { id: 10, displayName: `10 ${months}` },
                { id: 11, displayName: `11 ${months}` },
                { id: 12, displayName: `12 ${months}` },
            ],
            includeEmpty: true,
            emptyLabel: i18next.t('<No value>'),
            floatingLabelText: i18next.t('Show by inactivity'),
            style: { ...style, width: '172px' },
        },
    };
};

export const getInvitationStatus = value => ({
    name: FIELD_NAMES.INVITATION_STATUS,
    value: value,
    component: SelectField,
    props: {
        menuItems: [
            { id: 'all', displayName: i18next.t('All invitations') },
            { id: 'expired', displayName: i18next.t('Expired invitations') },
        ],
        includeEmpty: true,
        emptyLabel: i18next.t('<No value>'),
        floatingLabelText: i18next.t('Show invitations'),
        style: { ...style, width: '172px' },
    },
});

export const getSelfRegistered = (value, onCheckHandler) => {
    value = !!value;
    const baseClassName = 'data-table__filter-bar__checkbox';
    const checkedClassName = `${baseClassName}--checked`;
    return {
        name: FIELD_NAMES.SELF_REGISTERED,
        value: value,
        component: CheckBox,
        props: {
            onCheck: onCheckHandler,
            label: i18next.t('Show self registrations'),
            className: value ? checkedClassName : baseClassName,
            style: {
                ...style,
                display: 'inline-block',
                float: 'left',
                width: '222px',
                paddingTop: '37px',
                height: '35px',
                marginBottom: '24px', // Give some padding to the last filter element to create space for the table
            },
            wrapperStyle: {
                marginTop: 0,
                marginBottom: 0,
            },
        },
    };
};
