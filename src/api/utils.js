import { generateUid } from 'd2/lib/uid';
import _ from '../constants/lodash';
import store from '../store';
import {
    PAGE as DEFAULT_PAGE,
    PAGE_SIZE as DEFAULT_PAGE_SIZE,
} from '../constants/defaults';

import FIELDS from '../constants/queryFields';

import {
    USER_PROPS,
    USER_CRED_PROPS,
    DIMENSION_RESTRICTIONS_FOR_DATA_ANALYTICS,
} from '../containers/UserForm/config';

export const getQueryFields = (entityName, detailFields) => {
    const formattedEntityName = _.snakeCase(entityName).toUpperCase();
    const varName = detailFields
        ? `${formattedEntityName}_DETAILS`
        : `${formattedEntityName}_LIST`;

    return FIELDS[varName];
};

export const createRequestData = (page = DEFAULT_PAGE, filter, fields) => {
    const {
        query,
        inactiveMonths,
        selfRegistered,
        invitationStatus,
        organisationUnits,
    } = filter;

    let requestData = {
        pageSize: DEFAULT_PAGE_SIZE,
        fields,
        page,
    };

    if (query) requestData.query = query;
    if (inactiveMonths) requestData.inactiveMonths = inactiveMonths;
    if (selfRegistered) requestData.selfRegistered = selfRegistered;
    if (invitationStatus) requestData.invitationStatus = invitationStatus;

    if (organisationUnits.length) {
        const ids = organisationUnits.map(unit => unit.id).join();
        requestData.filter = `organisationUnits.id:in:[${ids}]`;
    }

    return requestData;
};

const addValueAsProp = (data, value, propName) => {
    if (!_.isUndefined(value)) {
        data[propName] = _.isArray(value) ? value.map(id => ({ id })) : value;
    }
};

export const parseUserSaveData = (values, user) => {
    const userId = user.id || generateUid();
    const userCredId =
        (user.userCredentials && user.userCredentials.id) || generateUid();
    let data = {
        id: userId,
        userCredentials: {
            id: userCredId,
            userInfo: { id: userId },
            cogsDimensionConstraints: [],
            catDimensionConstraints: [],
        },
    };
    let cred = data.userCredentials;

    if (_.isArray(values.catCogsDimensionConstraints)) {
        values.catCogsDimensionConstraints.forEach(constraint => {
            if (constraint.dimensionType === 'CATEGORY_OPTION_GROUP_SET') {
                cred.cogsDimensionConstraints.push({ id: constraint.id });
            } else {
                cred.catDimensionConstraints.push({ id: constraint.id });
            }
        });
    }

    USER_PROPS.forEach(propName =>
        addValueAsProp(data, values[propName], propName)
    );
    USER_CRED_PROPS.forEach(propName =>
        addValueAsProp(cred, values[propName], propName)
    );

    delete cred[DIMENSION_RESTRICTIONS_FOR_DATA_ANALYTICS];

    return data;
};

export const parseLocaleUrl = (type, username, val) => {
    return `/userSettings/key${type}Locale?user=${username}&value=${val}`;
};

export const getFilteredOrgUnits = (orgUnits, orgUnitType) => {
    const { currentUser } = store.getState();
    const availableOrgUnits = currentUser[orgUnitType];

    return orgUnits.toArray().filter(unit => {
        const isAvailableUnit = Boolean(availableOrgUnits.get(unit.id));
        const hasAvailableAncestor =
            !isAvailableUnit &&
            unit.ancestors
                .toArray()
                .some(ancestor => Boolean(availableOrgUnits.get(ancestor.id)));

        return isAvailableUnit || hasAvailableAncestor;
    });
};