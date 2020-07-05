import {useBase, useLoadable, useRecordById, useWatchable} from "@airtable/blocks/ui";
import {cursor} from "@airtable/blocks";
import {Table, Record} from "@airtable/blocks/models";
import {RecordId} from "@airtable/blocks/types";

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

export function getMergedData(schema: Array<{name: string, type: string}>, record: Record): Map<string, any> {
    const data: Map<string, any> = new Map<string, any>();
    schema.forEach((token) => {
        data[token.name] = record.getCellValueAsString(token.name);
    });
    return data
}