import {FieldType} from "@airtable/blocks/models";

export const docupilot_to_airtable_field_mapping = {
    // 'string' : [FieldType.CHECKBOX, FieldType.BARCODE, FieldType.EMAIL],
    'object' : [FieldType.MULTIPLE_RECORD_LINKS],
    'array' : [
        FieldType.MULTIPLE_LOOKUP_VALUES, FieldType.MULTIPLE_RECORD_LINKS, FieldType.MULTIPLE_SELECTS,
        FieldType.MULTIPLE_COLLABORATORS, FieldType.MULTIPLE_ATTACHMENTS
    ]
}