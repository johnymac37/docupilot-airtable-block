import {useBase, useLoadable, useRecordById, useWatchable} from "@airtable/blocks/ui";
import {cursor} from "@airtable/blocks";
import {Table, Record} from "@airtable/blocks/models";
import {RecordId} from "@airtable/blocks/types";
import {docupilot_to_airtable_field_mapping} from "./constants";

export function getActiveTable(): Table {
    const base = useBase();
    // re-render whenever the active table or view changes
    useWatchable(cursor, ['activeTableId', 'activeViewId']);
    return base.getTableByIdIfExists(cursor.activeTableId);
}

export function getSelectedRecordIds(): Array<RecordId> {
    // load selected records
    useLoadable(cursor);
    // re-render whenever the list of selected records changes
    useWatchable(cursor, ['selectedRecordIds']);
    // render the list of selected record ids
    return cursor.selectedRecordIds;
}

async function mergeData(mappingValue: Docupilot.MappingValue, record: Record) {
    const airtable_field = mappingValue.__airtable_field__;
    const docupilot_type = mappingValue.__docupilot_type__;

    if (airtable_field == null) {
        return null;
    } else if (docupilot_type == 'string') {
        return record.getCellValueAsString(airtable_field);
    }

    if (mappingValue.fields != null) {
        const data_list = new Array<Map<string, any>>();
        const linked_query = await record.selectLinkedRecordsFromCellAsync(airtable_field);
        const linked_records = docupilot_type == 'object' ? linked_query.records.slice(0,1) : linked_query.records;
        for (const linked_record of linked_records) {
            const data = new Map<string, any>();
            for (const [key, value] of Object.entries(mappingValue.fields)) {
                const child_merged_data = await mergeData(value, linked_record);
                if (child_merged_data != null) {
                    data.set(key, child_merged_data);
                }
            }
            if (data) {
                data_list.push(data);
            }
        }
        linked_query.unloadData();
        return docupilot_type == 'object' ? data_list[0]: data_list;
    }

    return record.getCellValue(airtable_field);
}

export async function getMergedData(mapping: Docupilot.Mapping, record: Record) {
    const data = new Map<string, any>();

    for (const [key, value] of Object.entries(mapping)) {
        const merged_data = await mergeData(value, record);
        if (merged_data != null) {
            data.set(key, merged_data);
        }
    }
    return data
}

export function selectAllowedTypes(schema_field: Docupilot.SchemaField): Array<string> {
    if (schema_field.type == 'array' && schema_field.generics !=  'string') {
        return docupilot_to_airtable_field_mapping[schema_field.generics];
    }
    return docupilot_to_airtable_field_mapping[schema_field.type];
}