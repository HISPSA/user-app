import * as ACTIONS from '../constants/actionTypes';
import api from '../api';

const createAction = (type, payload) => {
    return {
        type,
        payload,
    };
};

export const getUsers = () => (dispatch, getState) => {
    const { filter, pager: { page } } = getState();
    dispatch(createAction(ACTIONS.LIST_REQUESTED));
    api
        .getUsers(page, filter)
        .then(response => dispatch(createAction(ACTIONS.USER_LIST_RECEIVED, response)))
        .catch(error => dispatch(createAction(ACTIONS.LIST_ERRORED, error.message)));
};

export const incrementPage = currentPage => {
    return createAction(ACTIONS.PAGE_INCREMENTED, currentPage);
};

export const decrementPage = currentPage => {
    return createAction(ACTIONS.PAGE_DECREMENTED, currentPage);
};

export const updateFilter = (currentFilter, updateKey, updateValue) => {
    return createAction(ACTIONS.FILTER_UPDATED, {
        currentFilter,
        updateKey,
        updateValue,
    });
};

export const resetFilter = forUsers => {
    const actionType = forUsers ? ACTIONS.FILTER_RESET_FOR_USER : ACTIONS.FILTER_RESET;
    return createAction(actionType);
};

export const resetPager = () => {
    return createAction(ACTIONS.PAGER_RESET);
};
