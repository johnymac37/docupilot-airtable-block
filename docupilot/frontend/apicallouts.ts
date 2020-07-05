import axios, {AxiosResponse, AxiosError} from "axios";

axios.defaults.baseURL = 'https://staging.docupilot.app/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export function setApiKey(apikey: string) {
    axios.defaults.headers.common['apikey'] = apikey;
}

export async function getTemplates() {
    try {
        const response: AxiosResponse = await axios.get(`api/v1/templates`, {params: {filter: 'all'}});
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

export async function generateDocument(templateId, data) {
    try {
        // const endPoint = testMode?'test':'merge';
        const response: AxiosResponse = await axios.post(`api/v1/templates/${templateId}/merge`, data);
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