import axios, { AxiosResponse } from 'axios';

axios.defaults.baseURL = 'https://dashboard.docupilot.app/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export function setApiKey(apikey: string) {
  axios.defaults.headers.common['apikey'] = apikey;
}

export async function getProfileDetails(apikey) {
  const response: AxiosResponse = await axios.get(`accounts/v1/me`, {
    headers: { apikey: apikey },
  });
  return response.data;
}

export async function getTemplates() {
  try {
    const response: AxiosResponse = await axios.get(`api/v1/templates`, {
      params: { filter: 'all' },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting templates :: ', error);
  }
}

export async function getTemplateSchema(templateId) {
  try {
    const response: AxiosResponse = await axios.get(
      `api/v1/templates/${templateId}/schema`,
    );
    return response.data;
  } catch (error) {
    console.error('Error getting template schema :: ', error);
  }
}

export async function generateDocument(templateId, data, download = false) {
  try {
    let url_endpoint: string = `api/v1/templates/${templateId}/merge`;
    if (download) {
      url_endpoint = url_endpoint + `?download=true`;
    }
    const response: AxiosResponse = await axios.post(url_endpoint, data);
    return response.data;
  } catch (error) {
    console.error('Error generating document :: ', error);
  }
}
