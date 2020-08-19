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

function mergeData(mapping, record: Record) {
    const airtable_field = mapping.get('__airtable_field__');
    const docupilot_type = mapping.get('__docupilot_type__');
    console.log("airtable_field :: ", airtable_field);
    console.log("docupilot_type :: ", docupilot_type);
    const mapped_field_value = airtable_field ? record.getCellValue(airtable_field) : null;
    delete mapping['__airtable_field__'];
    delete mapping['__docupilot_type__'];
    console.log("mapped_field_value :: ", mapped_field_value);
    return  mapped_field_value;

    let child_entries = Array.from(mapping.entries());
    if (child_entries.length == 0) {
        mapping = mapped_field_value;
        return;
    } else {
        console.log("mapped_field_value :: ", mapped_field_value);
        // child_entries.forEach(([key, value]) => {
        //     mergeData(value, mapped_field_value);
        // })
    }
}

export function getMergedData(mapping: Map<string, any>, record: Record): Map<string, any> {
    console.log("mapping :: ", mapping);

    const merged_data = new Map<string, any>();

    Array.from(mapping.entries()).forEach(([key, value]) => {
        console.log("key :: ", key);
        console.log("value :: ", value);
        merged_data.set(key, mergeData(value, record))
    });
    console.log("merged_data :: ", merged_data);
    return merged_data
}

export function selectAllowedTypes(field_info) {
    if (field_info.type == 'array' && field_info.generics !=  'string') {
        return docupilot_to_airtable_field_mapping[field_info.generics];
    }
    return docupilot_to_airtable_field_mapping[field_info.type];
}