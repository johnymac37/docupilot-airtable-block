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

async function mergeData(mapping, record: Record) {
    const airtable_field = mapping.get('__airtable_field__');
    const docupilot_type = mapping.get('__docupilot_type__');
    mapping.delete('__airtable_field__');
    mapping.delete('__docupilot_type__');

    if (airtable_field == null) {
        return null;
    } else if (docupilot_type == 'string') {
        return record.getCellValueAsString(airtable_field);
    }

    const child_entries = Array.from(mapping.entries());
    if (child_entries.length != 0) {
        const data_list = new Array<Map<string, any>>();
        const linked_query = await record.selectLinkedRecordsFromCellAsync(airtable_field);
        const linked_records = docupilot_type == 'object' ? linked_query.records.slice(0,1) : linked_query.records;
        for (const linked_record of linked_records) {
            const data = new Map<string, any>();
            for (const entry of child_entries) {
                const merged_data = await mergeData(entry[1], linked_record);
                if (merged_data != null) {
                    data.set(entry[0], merged_data);
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

export async function getMergedData(mapping: Map<string, any>, record: Record) {
    const data = new Map<string, any>();

    for (const [key, value] of mapping.entries()) {
        const merged_data = await mergeData(value, record);
        if (merged_data != null) {
            data.set(key, merged_data);
        }
    }
    return data
}

export function selectAllowedTypes(field_info) {
    if (field_info.type == 'array' && field_info.generics !=  'string') {
        return docupilot_to_airtable_field_mapping[field_info.generics];
    }
    return docupilot_to_airtable_field_mapping[field_info.type];
}