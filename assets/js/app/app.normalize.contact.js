import {
    booleanOrFalse,
    numberOrEmpty,
    objectArrayOrEmpty,
    objectOrEmpty,
    stringOrEmpty,
} from './app.utils.js';
import { normalizeButtonElementData } from './app.normalize.meta.js';

function normalizeContactOptionData(option) {
    const optionData = objectOrEmpty(option);

    return {
        id: stringOrEmpty(optionData.id),
        value: stringOrEmpty(optionData.value),
        label: stringOrEmpty(optionData.label),
        selected: booleanOrFalse(optionData.selected),
    };
}

function normalizeContactFieldData(field) {
    const fieldConfig = objectOrEmpty(field);
    const options = objectArrayOrEmpty(fieldConfig.options).map(normalizeContactOptionData);

    return {
        type: stringOrEmpty(fieldConfig.type) || 'text',
        id: stringOrEmpty(fieldConfig.id),
        name: stringOrEmpty(fieldConfig.name),
        label: stringOrEmpty(fieldConfig.label),
        placeholder: stringOrEmpty(fieldConfig.placeholder),
        rows: numberOrEmpty(fieldConfig.rows),
        required: booleanOrFalse(fieldConfig.required),
        row: booleanOrFalse(fieldConfig.row),
        wrapperClass: stringOrEmpty(fieldConfig.wrapperClass) || 'form-group',
        maxLength: typeof fieldConfig.maxLength === 'number' ? fieldConfig.maxLength : null,
        errorRequired: stringOrEmpty(fieldConfig.errorRequired),
        errorTooLong: stringOrEmpty(fieldConfig.errorTooLong),
        errorInvalid: stringOrEmpty(fieldConfig.errorInvalid),
        value: stringOrEmpty(fieldConfig.value),
        options: options,
    };
}

export function normalizeContactData(data) {
    const contact = objectOrEmpty(data);
    const introCard = objectOrEmpty(contact.introCard);
    const form = objectOrEmpty(contact.form);

    return {
        id: stringOrEmpty(contact.id),
        preheader: stringOrEmpty(contact.preheader),
        title: stringOrEmpty(contact.title),
        introCard: {
            title: stringOrEmpty(introCard.title),
            text: stringOrEmpty(introCard.text),
            linkLabel: stringOrEmpty(introCard.linkLabel) || 'E-Mail senden',
        },
        form: {
            action: stringOrEmpty(form.action) || './contact.php',
            fields: objectArrayOrEmpty(form.fields).map(normalizeContactFieldData),
            submitButton: normalizeButtonElementData(form.submitButton, stringOrEmpty(form.submitLabel)),
        },
    };
}

export function normalizeFooterData(data) {
    const footer = objectOrEmpty(data);

    return {
        text: stringOrEmpty(footer.text),
        copyright: stringOrEmpty(footer.copyright),
        owner: stringOrEmpty(footer.owner),
    };
}
