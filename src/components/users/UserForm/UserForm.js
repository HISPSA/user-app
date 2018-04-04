import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import Heading from 'd2-ui/lib/headings/Heading.component';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import HardwareKeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import i18next from 'i18next';
import { navigateTo } from '../../../utils';
import api from '../../../api';
import { userFormInitialValuesSelector } from '../../../selectors';
import { clearItem, getList, showSnackbar } from '../../../actions';
import { USER } from '../../../constants/entityTypes';
import { asArray, getNestedProp } from '../../../utils';
import * as CONFIG from './config';
import validate from './validate';
import asyncValidateUsername from './asyncValidateUsername';
import {
    renderTextField,
    renderText,
    renderSearchableOrgUnitTree,
    renderSearchableGroupEditor,
    renderSelectField,
} from '../../../utils/fieldRenderers';

class UserForm extends Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        getList: PropTypes.func.isRequired,
        clearItem: PropTypes.func.isRequired,
        showSnackbar: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        change: PropTypes.func.isRequired,
        initialize: PropTypes.func.isRequired,
        asyncValidating: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
            .isRequired,
        pristine: PropTypes.bool.isRequired,
        valid: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showMore: false,
            locales: null,
        };
    }

    componentWillMount() {
        const { user, showSnackbar, initialize } = this.props;
        const username = user.id ? user.userCredentials.username : null;

        api
            .getSelectedAndAvailableLocales(username)
            .then(locales => {
                this.setState({ locales });
                initialize(userFormInitialValuesSelector(user, locales));
            })
            .catch(error => {
                const msg = 'Could not load the user data. Please refresh the page.';
                showSnackbar({ message: i18next.t(msg) });
            });
    }

    toggleShowMore = () => {
        this.setState({
            showMore: !this.state.showMore,
        });
    };

    saveUser = (values, _, props) => {
        const { user, showSnackbar, clearItem, getList } = props;
        const selectedUiLocale = this.state.locales.ui.selected;
        const selectedDbLocale = this.state.locales.db.selected;
        api
            .saveUser(values, user, selectedUiLocale, selectedDbLocale)
            .then(() => {
                const msg = i18next.t('User saved successfully');
                showSnackbar({ message: msg });
                clearItem();
                getList(USER);
                this.backToList();
            })
            .catch(error => {
                const msg = i18next.t('There was a problem saving the user.');
                showSnackbar({ message: msg });
            });
    };

    backToList = () => {
        navigateTo('/users');
    };

    getLabelText(label, user, isRequiredField) {
        let labelText = i18next.t(label);

        if (
            isRequiredField === CONFIG.ALWAYS_REQUIRED ||
            (isRequiredField === CONFIG.CREATE_REQUIRED && !user.id)
        ) {
            labelText += ' *';
        }

        return labelText;
    }

    prepareGroupEditor(conf, fieldConfig, user, isRequiredField) {
        conf.assignedItemsLabel = this.getLabelText(
            conf.assignedItemsLabel,
            user,
            isRequiredField
        );
        conf.availableItemsQuery = api[conf.availableItemsQuery];
        conf.availableItemsLabel = i18next.t(conf.availableItemsLabel);
        conf.initialValues = fieldConfig.initialItemsSelector(user);
    }

    renderFields(fields) {
        const { user } = this.props;
        return fields.map((fieldConfig, index) => {
            const { name, fieldRenderer, label, isRequiredField, ...conf } = fieldConfig;
            const labelText = this.getLabelText(label, user, isRequiredField);

            if (fieldRenderer === renderText) {
                return renderText(fieldConfig);
            }

            switch (fieldRenderer) {
                case renderTextField:
                    conf.disabled = Boolean(name === CONFIG.USERNAME && user.id);
                    break;
                case renderSearchableOrgUnitTree:
                    conf.initialValues = asArray(user[fieldConfig.name]);
                    break;
                case renderSearchableGroupEditor:
                    this.prepareGroupEditor(conf, fieldConfig, user, isRequiredField);
                    break;
                case renderSelectField:
                    conf.options = getNestedProp(fieldConfig.optionsSelector, this.state);
                    break;
                default:
                    break;
            }

            return (
                <Field
                    name={name}
                    key={name}
                    component={fieldRenderer}
                    label={labelText}
                    {...conf}
                />
            );
        });
    }

    renderBaseFields() {
        return this.renderFields(CONFIG.BASE_FIELDS);
    }

    renderAdditionalFields(showMore) {
        if (!showMore) {
            return null;
        }
        return (
            <div style={CONFIG.STYLES.additionalFieldsWrap}>
                {this.renderFields(CONFIG.ADDITIONAL_FIELDS)}
            </div>
        );
    }

    renderToggler(showMore) {
        const togglerText = showMore
            ? i18next.t('Show fewer options')
            : i18next.t('Show more options');
        const icon = showMore ? (
            <HardwareKeyboardArrowUp />
        ) : (
            <HardwareKeyboardArrowDown />
        );

        return (
            <div style={CONFIG.STYLES.togglerWrap}>
                <FlatButton
                    onClick={this.toggleShowMore}
                    label={togglerText}
                    style={CONFIG.STYLES.toggler}
                    icon={icon}
                />
            </div>
        );
    }

    render() {
        const { handleSubmit, asyncValidating, pristine, valid } = this.props;
        const { showMore, locales } = this.state;
        const disableSubmit = Boolean(asyncValidating || pristine || !valid);

        if (!locales) {
            return (
                <div style={CONFIG.STYLES.loaderWrap}>
                    <CircularProgress />
                </div>
            );
        }

        return (
            <main>
                <Heading level={2}>{i18next.t('Details')}</Heading>
                <form onSubmit={handleSubmit(this.saveUser)}>
                    {this.renderBaseFields()}
                    {this.renderAdditionalFields(showMore)}
                    {this.renderToggler(showMore)}
                    <div>
                        <RaisedButton
                            label={i18next.t('Save')}
                            type="submit"
                            primary={true}
                            disabled={disableSubmit}
                            style={{ marginRight: '8px' }}
                        />
                        <RaisedButton
                            label={i18next.t('Cancel')}
                            onClick={this.backToList}
                        />
                    </div>
                </form>
            </main>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.currentItem,
    };
};

const ReduxFormWrappedUserForm = reduxForm({
    form: 'userForm',
    validate,
    asyncValidate: asyncValidateUsername,
    asyncBlurFields: [CONFIG.USERNAME],
})(UserForm);

export default connect(mapStateToProps, {
    clearItem,
    showSnackbar,
    getList,
})(ReduxFormWrappedUserForm);
