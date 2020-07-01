import {
    base,
    cursor
} from "@airtable/blocks";
import {
    initializeBlock,
    useGlobalConfig,
    useSettingsButton,
    useLoadable,
    useWatchable,
    useRecords,
    useBase,
    Box,
    Label,
    Input,
    Heading,
    Icon,
    Button,
    Loader,
    Text,
    Switch,
    FieldPickerSynced
} from '@airtable/blocks/ui';
import React from 'react';
import axios, {AxiosResponse} from 'axios';
import {Field} from "@airtable/blocks/models";

axios.defaults.baseURL = 'https://0fe268c3f1ec.ngrok.io/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

function getActiveTable() {
    const base = useBase();
    // re-render whenever the active table or view changes
    useWatchable(cursor, ['activeTableId', 'activeViewId']);
    const table = base.getTableByIdIfExists(cursor.activeTableId);
    return table;
}

function getSelectedRecordIds(): Array<string> {
    // load selected records
    useLoadable(cursor);
    // re-render whenever the list of selected records changes
    useWatchable(cursor, ['selectedRecordIds']);
    // render the list of selected record ids
    return cursor.selectedRecordIds;
}

function getMergedData(schema, record) {
    const data: Map<string, any> = new Map<string, any>();
    schema.forEach((token) => {
        data[token.name] = record.getCellValueAsString(token.name);
    });
    return data
}

async function getTemplates() {
    try {
        const response: AxiosResponse = await axios.get(`api/v1/templates`);
        return response.data;
    } catch (error) {
        console.error("ERROR :: ", error);
    } finally {

    }
}

async function getTemplateSchema(templateId) {
    try {
        const response: AxiosResponse = await axios.get(`api/v1/templates/${templateId}/schema`);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("ERROR :: ", error);
    } finally {

    }
}

async function generateDocument(templateId, data, testMode) {
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

async function getFile(url) {
    try {
        const response: AxiosResponse = await axios.get('', {baseURL: url});
        return response;
    } catch (error) {
        console.error("ERROR :: ", error);
    } finally {

    }
}

function DocupilotBlock() {

    const [isShowingSettings, setIsShowingSettings] = React.useState(false);
    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));
    if (isShowingSettings) {
        return <SettingsComponent/>
    }
    return <MainComponent/>
}

function SettingsComponent() {
    const globalConfig = useGlobalConfig();
    // @ts-ignore
    const apiKey: string = globalConfig.get('api-key');
    return (
        <Box
            backgroundColor="white"
            padding={3}
            overflow="hidden">
            <Label htmlFor="api-key">Api Key</Label>
            <Input id="api-key" value={apiKey} type="password"
                   onChange={(event) => globalConfig.setAsync('api-key', event.target.value)}/>
        </Box>
    );
}

function MainComponent() {
    // const [templates, _setTemplates]: Array<Object[]> = React.useState([]);
    const globalConfig = useGlobalConfig();
    // @ts-ignore
    const apiKey: string = globalConfig.get('api-key');
    const attachmentFieldId: string = globalConfig.get('attachmentFieldId');

    const [mergeInProgress, setMergeInProgress] = React.useState(false);
    const [templates, setTemplates] = React.useState(null );
    const [selectedTemplate, setSelectedTemplate] = React.useState(null );
    const [selectedTemplateSchema, setSelectedTemplateSchema] = React.useState(null );
    const [saveAsAttachment, setSaveAsAttachment] = React.useState(false );

    if (!apiKey) {
        return <InfoBox info={"Add a valid Api Key in the settings page"}/>;
    } else {
        axios.defaults.headers.common['apikey'] = apiKey;
        if (!templates) {
            getTemplates().then((response) => {
                if (response) {
                    setTemplates(response.data);
                }
            });
        }
    }

    const activeTable = getActiveTable();
    const selectedRecordIds: Array<string> = getSelectedRecordIds();
    const records = useRecords(activeTable.selectRecords());
    if (mergeInProgress) {
        return <InfoBox info={<Loader/>}/>;
    } else {
        if (selectedRecordIds && selectedRecordIds.length) {
            if (selectedTemplate) {
                return <div>
                    <Box
                        backgroundColor="white"
                        padding={3}
                        overflow="hidden">
                        <Heading>Create Document</Heading>
                        <dl>
                            <TemplateItem key={selectedTemplate.id} template={selectedTemplate} onClick={undefined}/>
                        </dl>
                        {selectedRecordIds.length < 2 &&
                            <Switch
                                value={saveAsAttachment}
                                onChange={newValue => setSaveAsAttachment(newValue)}
                                label="Upload the document to an attachment field"
                                width="320px"
                            />
                        }
                        {saveAsAttachment &&
                            <FieldPickerSynced table={activeTable} globalConfigKey="attachmentFieldId"/>
                        }
                        <Box
                            paddingY="10px"
                            display="flex"
                            flexDirection="row-reverse"
                            borderBottom="solid 0.5px LightGray"
                        >
                            <Button
                                marginLeft="10px"
                                variant="primary"
                                disabled={!selectedTemplateSchema}
                                onClick={() => {
                                    // const record = activeTable.selectRecords()[0];
                                    setMergeInProgress(true);
                                    console.log("Active Table :: ", activeTable, " Selected Record :: ", records[0]);
                                    const data: Map<string, any> = getMergedData(selectedTemplateSchema, records[0]);
                                    generateDocument(selectedTemplate.id, data,true).then((response) => {
                                        console.log("Merge response :: ", response);
                                        setMergeInProgress(false);
                                        if (saveAsAttachment) {
                                            const fileUrl: string = response.data.file_url;
                                            if (fileUrl.startsWith("http://")) {
                                                fileUrl.replace("http://", "https://");
                                            }
                                            getFile(fileUrl).then((file) => activeTable.updateRecordAsync(records[0], {[attachmentFieldId]: file}))
                                        }

                                    });
                                }}
                            >
                                Generate
                            </Button>
                            <Button onClick={() => console.log("Cancel Button clicked")}>
                                Cancel
                            </Button>
                        </Box>
                        <Text>You can seemlessly insert values from Airtable records into your document by
                            matching the Airtable field name to tags in your Docupilot template
                        </Text>
                        <table>
                            <thead>
                            <tr>
                                <th>Field</th>
                                <th>Tag</th>
                            </tr>
                            </thead>
                            {/*<tbody>{schemaRows}</tbody>*/}
                        </table>
                    </Box>
                </div>
            } else {
                if (templates) {
                    const templateItems = templates.map((template) => <TemplateItem
                        key={template.id}
                        template={template}
                        onClick={() => {
                            setSelectedTemplate(template);
                            getTemplateSchema(template.id).then((response) => {
                                if (response) {
                                    setSelectedTemplateSchema(response.data.schema);
                                }
                            })
                        }
                        }
                    />);
                    return <Box
                        backgroundColor="white"
                        padding={3}
                        overflow="hidden">
                        <Heading>Select a docupilot template</Heading>
                        <dl>
                            {templateItems}
                        </dl>
                    </Box>
                } else {
                    return <InfoBox info={<Loader scale={0.3} />}/>
                }
            }
        } else {
            return <InfoBox info={"Select records to generate documents with Docupilot"}/>;
        }
    }

}

function InfoBox({info}) {
    return <Box
        backgroundColor="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="300px"
    >
        {info}
    </Box>
}

function TemplateItem({template, onClick}) {
    return <dt>
        <Box
            padding="10px"
            display="flex"
            flexDirection="row"
            borderBottom="solid 0.5px LightGray"
            onClick={onClick? () => onClick(template): undefined}
        >
            <Icon name="file" size={16} />
            <Text marginX="15px">{template.title}</Text>
        </Box>
    </dt>
}

initializeBlock(() => <DocupilotBlock />);
