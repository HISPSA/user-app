import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import { Checkbox } from 'material-ui';
import DropDown from 'd2-ui/lib/form-fields/DropDown.component';
import { updateFilter, getList } from '../../actions';
import OrganisationUnitInput from './OrganisationUnitInput';
import SearchFilter from '../SearchFilter';
import {
    INACTIVE_MONTHS,
    INVITATION_STATUS,
    SELF_REGISTERED,
} from '../../constants/filterFieldNames';

const style = {
    float: 'left',
    marginRight: '1rem',
};

const selfRegisteredStyle = {
    ...style,
    display: 'inline-block',
    float: 'left',
    width: '182px',
    paddingTop: '37px',
    height: '35px',
};

class UserFilter extends Component {
    static propTypes = {
        filter: PropTypes.object.isRequired,
        getList: PropTypes.func.isRequired,
        updateFilter: PropTypes.func.isRequired,
        entityType: PropTypes.string.isRequired,
    };

    onFilterChange = (fieldName, newValue) => {
        const { getList, entityType, updateFilter, filter } = this.props;

        if (filter[fieldName] === newValue) {
            return;
        }

        updateFilter(fieldName, newValue);
        getList(entityType);
    };

    createInactiveMonthsOptions() {
        const month = i18next.t('month');
        const months = i18next.t('months');
        return Array(11)
            .fill()
            .map((_, index) => {
                const id = index + 1;
                const displayName = id === 1 ? `${id} ${month}` : `${id} ${months}`;
                return { id, displayName };
            });
    }

    renderDropDown(config) {
        const mergedConfig = {
            ...config,
            includeEmpty: true,
            emptyLabel: i18next.t('<No value>'),
        };
        return <DropDown {...mergedConfig} />;
    }

    renderInactiveMonthsFilter() {
        const dropDownConfig = {
            menuItems: this.createInactiveMonthsOptions(),
            floatingLabelText: i18next.t('Inactivity'),
            value: this.props.filter.inactiveMonths,
            onChange: event => this.onFilterChange(INACTIVE_MONTHS, event.target.value),
            style: { ...style, width: '132px' },
        };

        return this.renderDropDown(dropDownConfig);
    }

    renderInvitationStatusFilter() {
        const dropDownConfig = {
            menuItems: [
                { id: 'all', displayName: i18next.t('All invitations') },
                { id: 'expired', displayName: i18next.t('Expired invitations') },
            ],
            floatingLabelText: i18next.t('Invitations'),
            value: this.props.filter.invitationStatus,
            onChange: event => this.onFilterChange(INVITATION_STATUS, event.target.value),
            style: { ...style, width: '172px' },
        };

        return this.renderDropDown(dropDownConfig);
    }

    renderSelfRegisteredFilter() {
        const value = this.props.filter.selfRegistered;
        const baseClassName = 'data-table__filter-bar__checkbox';
        const checkedClassName = `${baseClassName}--checked`;

        return (
            <Checkbox
                value={value}
                onCheck={(event, value) => this.onFilterChange(SELF_REGISTERED, value)}
                label={i18next.t('Self registrations')}
                className={value ? checkedClassName : baseClassName}
                style={selfRegisteredStyle}
            />
        );
    }

    render() {
        const { entityType } = this.props;
        return (
            <div>
                <SearchFilter entityType={entityType} />
                <OrganisationUnitInput />
                {this.renderInactiveMonthsFilter()}
                {this.renderInvitationStatusFilter()}
                {this.renderSelfRegisteredFilter()}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        filter: state.filter,
    };
};

export default connect(mapStateToProps, {
    updateFilter,
    getList,
})(UserFilter);
