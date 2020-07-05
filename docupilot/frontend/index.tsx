import React from 'react';
import {
    initializeBlock,
    useGlobalConfig,
    useSettingsButton,
    Box,
    Label,
    Input,
    Heading,
    Icon,
    Button,
    Loader,
    Text,
    Switch,
    FieldPickerSynced,
    FieldPicker
} from '@airtable/blocks/ui';
import {InformationComponent} from './common';
import {getActiveTable, getSelectedRecordIds, getMergedData} from './utils';
import {setApiKey, getTemplates, getTemplateSchema, generateDocument} from './apicallouts';
import {Field, Record, Table, FieldType} from "@airtable/blocks/models";

function DocupilotBlock() {

    const [show_settings, setIsShowingSettings] = React.useState(false);
    useSettingsButton(() => setIsShowingSettings(!show_settings));
    if (show_settings) {
        return <SettingsComponent/>
    }
    return <MainComponent/>
}

function SettingsComponent() {
    const globalConfig = useGlobalConfig();
    // @ts-ignore
    const apikey: string = globalConfig.get('api-key');
    return (
        <Box
            backgroundColor="white"
            padding={3}
            overflow="hidden">
            <Label htmlFor="api-key">Api Key</Label>
            <Input id="api-key" value={apikey} type="password"
                   onChange={(event) => globalConfig.setAsync('api-key', event.target.value)}/>
        </Box>
    );
}

function MainComponent() {
    const globalConfig = useGlobalConfig();
    // @ts-ignore
    const apikey: string = globalConfig.get('api-key');

    const [templates, setTemplates] = React.useState(null );
    const [selected_template, setSelectedTemplate] = React.useState(null );

    const active_table: Table = getActiveTable();
    const selected_record_ids = getSelectedRecordIds();

    if (!apikey) {
        return <InformationComponent content={"Add a valid Api Key in the settings page"}/>;
    } else {
        setApiKey(apikey);
        if (templates == null) {
            getTemplates().then((response) => {
                if (response) {
                    setTemplates(response.data);
                }
            });
        }
    }

    if (selected_record_ids && selected_record_ids.length) {
        if (selected_template) {
            return <TemplateMergeComponent
                activeTable={active_table}
                selectedTemplate={selected_template}
                selectedRecordIds={selected_record_ids}
                cancelAction={() => setSelectedTemplate(null)}
            />
        } else {
            if (templates) {
                return <TemplateListComponent templates={templates} setSelectedTemplate={setSelectedTemplate}/>
            } else {
                return <InformationComponent content={<Loader scale={0.3} />}/>
            }
        }
    } else {
        return <InformationComponent content={"Select records to generate documents with Docupilot"}/>;
    }
}



function TemplateListComponent({templates, setSelectedTemplate}) {
    const template_items = templates.map((template) => <TemplateItem
        key={template.id}
        template={template}
        onClick={() => setSelectedTemplate(template)}
    />);
    return <Box
        backgroundColor="white"
        padding={3}
        overflow="hidden">
        <Heading>Select a docupilot template</Heading>
        <dl>
            {template_items}
        </dl>
    </Box>
}

function TemplateMergeComponent({activeTable, selectedTemplate, selectedRecordIds, cancelAction}) {

    // @ts-ignore
    // const attachment_field_id: string = globalConfig.get('attachment-field-id');
    const [save_as_attachment, setSaveAsAttachment] = React.useState(false );
    // @ts-ignore
    const [attachment_field, setAttachmentField]: Field = React.useState(null );
    const [schema, setSchema] = React.useState(null );

    if (selectedRecordIds.length > 1 && (save_as_attachment || attachment_field != null)) {
        setSaveAsAttachment(false);
        setAttachmentField(null);
    }

    if (schema == null) {
        getTemplateSchema(selectedTemplate.id).then((response) => {
            if (response) {
                setSchema(response.data.schema);
            }
        });
    }

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
            value={save_as_attachment}
            onChange={newValue => setSaveAsAttachment(newValue)}
            label="Upload the document to an attachment field"
            width="320px"
        />
        }
        {save_as_attachment &&
        <FieldPicker
            table={activeTable}
            field={attachment_field}
            allowedTypes={[FieldType.MULTIPLE_ATTACHMENTS]}
            onChange={newField => setAttachmentField(newField)}
            marginY="10px"
        />
        }
        <Box
            paddingY="20px"
            display="flex"
            flexDirection="row-reverse"
            borderBottom="solid 0.5px LightGray"
        >
            <Button
                marginLeft="10px"
                variant="primary"
                disabled={schema == null}
                onClick={() => {
                    activeTable.selectRecordsAsync().then(query => {
                        selectedRecordIds.forEach(record_id => {
                            const record: Record = query.getRecordById(record_id);
                            // @ts-ignore
                            const attachments: Array<{url: string, filename: string}> = (attachment_field && record.getCellValue(attachment_field)) || [];
                            const merged_data: Map<string, any> = getMergedData(schema, record);
                            generateDocument(selectedTemplate.id, merged_data).then(response => {
                                if (save_as_attachment && attachment_field) {
                                    attachments.push({url: response.data.file_url, filename: response.data.file_name});
                                    activeTable.updateRecordAsync(record, {[attachment_field.id]: attachments})
                                }
                            });
                        });
                        query.unloadData();
                    }).catch(error => console.log(error));
                }}
            >
                Generate
            </Button>
            <Button
                onClick={() => {
                    cancelAction();
                    setSchema(null);
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
