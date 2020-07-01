import {
    initializeBlock,
    useGlobalConfig,
    useSettingsButton,
    useRecords,
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
import {getActiveTable, getSelectedRecordIds, getTemplates, getTemplateSchema, getMergedData, generateDocument} from './utils';

axios.defaults.baseURL = 'https://0fe268c3f1ec.ngrok.io/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

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
    const globalConfig = useGlobalConfig();
    // @ts-ignore
    const apiKey: string = globalConfig.get('api-key');

    const [templates, setTemplates] = React.useState(null );
    const [selectedTemplate, setSelectedTemplate] = React.useState(null );

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
    if (selectedRecordIds && selectedRecordIds.length) {
        if (selectedTemplate) {
            return <GenerateDocumentComponent
                activeTable={activeTable}
                selectedTemplate={selectedTemplate}
                selectedRecordIds={selectedRecordIds}
                cancelAction={() => setSelectedTemplate(null)}
            />
        } else {
            if (templates) {
                return <TemplatesListComponent templates={templates} setSelectedTemplate={setSelectedTemplate}/>
            } else {
                return <InfoBox info={<Loader scale={0.3} />}/>
            }
        }
    } else {
        return <InfoBox info={"Select records to generate documents with Docupilot"}/>;
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

function TemplatesListComponent({templates, setSelectedTemplate}) {
    const templateItems = templates.map((template) => <TemplateItem
        key={template.id}
        template={template}
        onClick={() => {
            setSelectedTemplate(template);
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
}

function GenerateDocumentComponent({activeTable, selectedTemplate, selectedRecordIds, cancelAction}) {

    // @ts-ignore
    const attachmentFieldId: string = globalConfig.get('attachmentFieldId');
    const [saveAsAttachment, setSaveAsAttachment] = React.useState(false );
    const [selectedTemplateSchema, setSelectedTemplateSchema] = React.useState(null );

    getTemplateSchema(selectedTemplate.id).then((response) => {
        if (response) {
            setSelectedTemplateSchema(response.data.schema);
        }
    });

    return <Box
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
            <GenerateButtonComponent
                activeTable={activeTable}
                selectedTemplateId={selectedTemplate.id}
                selectedTemplateSchema={selectedTemplateSchema}
                saveAsAttachment={saveAsAttachment}
                attachmentFieldId={attachmentFieldId}
            />
            <Button
                onClick={() => {
                    cancelAction();
                    setSelectedTemplateSchema(null);
                    setSaveAsAttachment(false);
                }}
            >
                Cancel
            </Button>
        </Box>
        <Text>You can seemlessly insert values from Airtable records into your document by
            matching the Airtable field name to tags in your Docupilot template
        </Text>
        <SchemaMappingComponent/>
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

function GenerateButtonComponent({activeTable, selectedTemplateId, selectedTemplateSchema, saveAsAttachment, attachmentFieldId}) {

    const records = useRecords(activeTable.selectRecords());
    return <Button
        marginLeft="10px"
        variant="primary"
        disabled={!selectedTemplateSchema}
        onClick={() => {
            // const record = activeTable.selectRecords()[0];
            const data: Map<string, any> = getMergedData(selectedTemplateSchema, records[0]);
            generateDocument(selectedTemplateId, data,true).then((response) => {
                console.log("Merge response :: ", response);
                if (saveAsAttachment) {
                    const fileUrl: string = response.data.file_url;
                    const fileName: string = response.data.file_name;
                    // @ts-ignore
                    const recordAttachments: Array<object> = records[0].getCellValue(attachmentFieldId) || [];
                    recordAttachments.push({url: fileUrl, filename: fileName});
                    activeTable.updateRecordAsync(records[0], {[attachmentFieldId]: recordAttachments})
                }

            });
        }}
    >
        Generate
    </Button>
}

function SchemaMappingComponent() {
    return <table>
        <thead>
        <tr>
            <th>Field</th>
            <th>Tag</th>
        </tr>
        </thead>
        {/*<tbody>{schemaRows}</tbody>*/}
    </table>
}

initializeBlock(() => <DocupilotBlock />);
