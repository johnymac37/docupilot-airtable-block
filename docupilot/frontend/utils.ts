import {useBase, useLoadable, useWatchable} from "@airtable/blocks/ui";
import {cursor} from "@airtable/blocks";
import {AxiosResponse} from "axios";
import axios from "axios";

export function getActiveTable() {
    const base = useBase();
    // re-render whenever the active table or view changes
    useWatchable(cursor, ['activeTableId', 'activeViewId']);
    const table = base.getTableByIdIfExists(cursor.activeTableId);
    return table;
}

export function getSelectedRecordIds(): Array<string> {
    // load selected records
    useLoadable(cursor);
    // re-render whenever the list of selected records changes
    useWatchable(cursor, ['selectedRecordIds']);
    // render the list of selected record ids
    return cursor.selectedRecordIds;
}

export function getMergedData(schema, record) {
    const data: Map<string, any> = new Map<string, any>();
    schema.forEach((token) => {
        data[token.name] = record.getCellValueAsString(token.name);
    });
    return data
}

export async function getTemplates() {
    try {
        const response: AxiosResponse = await axios.get(`api/v1/templates`);
        return response.data;
    } catch (error) {
        console.error("ERROR :: ", error);
    } finally {

    }
}

export async function getTemplateSchema(templateId) {
    try {
        const response: AxiosResponse = await axios.get(`api/v1/templates/${templateId}/schema`);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("ERROR :: ", error);
    } finally {

    }
}

export async function generateDocument(templateId, data, testMode) {
    try {
        const endPoint = testMode?'test':'merge';
        const response: AxiosResponse = await axios.post(`api/v1/templates/${templateId}/${endPoint}`, data);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("ERROR :: ", error);
    } finally {

    }
}

export async function getFile(url) {
    try {
        const response: AxiosResponse = await axios.get('', {baseURL: url});
        return response;
    } catch (error) {
        console.error("ERROR :: ", error);
    } finally {

    }
}