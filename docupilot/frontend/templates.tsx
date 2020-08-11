import React from "react";
import {generateDocument, getTemplateSchema} from "./apicallouts";
import {Box, Button, FieldPicker, Heading, Icon, Input, Loader, Switch, Text} from "@airtable/blocks/ui";
import {FieldType, Record, Table} from "@airtable/blocks/models";
import {SchemaComponent} from "./schema";
import {LoaderComponent} from "./common";
import {getActiveTable, getMergedData} from "./utils";

function TemplateItem({template, select}) {
    return (
        <dt>
            <Box paddingX={3} paddingY={1} display="flex" flexDirection="row" borderBottom="1px solid #E5E5E5" alignItems="center"
                 onClick={select? () => select(template): undefined}>
                <Icon name="file" size={32} />
                <Text as="h3" marginX="12px">{template.title}</Text>
            </Box>
        </dt>
    );
}

function TemplateMergeComponent({selectedTemplate, selectedRecordIds, setRoute}) {

    const [save_as_attachment, setSaveAsAttachment] = React.useState(false );
    const [attachment_field, setAttachmentField] = React.useState(null );
    const [schema, setSchema] = React.useState(null );
    const [mapping, setMapping] = React.useState(new Map<{id: string, name: string}, any>());

    const active_table: Table = getActiveTable();

    if (schema == null) {
        getTemplateSchema(selectedTemplate.id).then((response) => {
            if (response) {
                setSchema(response.data.schema);
            }
        });
    }else if (mapping.size == 0){
        let initial_mapping: Map<{id: string, name: string}, any> = new Map<{id: string, name: string}, any>();
        schema.forEach(docupilot_field => {
            initial_mapping.set(docupilot_field, active_table.fields.filter(f => f.name == docupilot_field.name)[0]);
        });
        setMapping(initial_mapping);
    }

    return (
        <Box padding={3}>
            <Button icon="chevronLeft" variant="secondary">
                back
            </Button>
            <Box margin="12px" display="flex" flexDirection="row" alignItems="center">
                <Icon name="file" size={32} />
                <Text as="h2" marginX="12px">{selectedTemplate.title}</Text>
            </Box>
            <Text as="p" textColor="light" marginX="12px">
                You can seemlessly insert values from Airtable records into your document by matching the Airtable field name to tags in your Docupilot template
            </Text>
            <Box marginY="12px">
                <Switch size="large" backgroundColor="transparent" value={save_as_attachment} label="Upload document to an attachment field"
                        onChange={newValue => setSaveAsAttachment(newValue)}/>
                <FieldPicker marginX="12px" placeholder="Select field" shouldAllowPickingNone={true}
                             table={active_table} field={attachment_field} allowedTypes={[FieldType.MULTIPLE_ATTACHMENTS]}
                             onChange={newField => setAttachmentField(newField)}/>
            </Box>
            {schema
                ? <SchemaComponent active_table={active_table} mapping={mapping} updateMapping={setMapping}/>
                : <LoaderComponent/>
            }

            <Button variant="primary" margin="12px" width="100%" onClick={!schema ? null : () => {
                active_table.selectRecordsAsync().then(query => {
                    selectedRecordIds.forEach(record_id => {
                        const record: Record = query.getRecordById(record_id);
                        // @ts-ignore
                        const attachments: Array<{url: string, filename: string}> = (attachment_field && record.getCellValue(attachment_field)) || [];
                        const merged_data: Map<string, any> = getMergedData(mapping, record);
                        generateDocument(selectedTemplate.id, merged_data).then(response => {
                            if (save_as_attachment && attachment_field) {
                                attachments.push({url: response.data.file_url, filename: response.data.file_name});
                                active_table.updateRecordAsync(record, {[attachment_field.id]: attachments})
                            }
                            setRoute("merge-success");
                        }).catch(error => setRoute("merge-fail"));
                    });
                    query.unloadData();
                }).catch(error => console.log(error));
            }}>
                Create document
            </Button>
        </Box>
    );
}

function TemplateListComponent({templates, selectTemplate, refreshTemplates}) {
    const [search_term, setSearchTerm] = React.useState("" );
    let filtered_templates = !search_term ? templates : templates.filter(_t => _t.title.includes(search_term));

    const template_items = filtered_templates.map((template) => <TemplateItem key={template.id} template={template}
                                                                              select={() => selectTemplate(template)}/>);
    return (
        <Box backgroundColor="white" paddingY={4} overflow="hidden">
            <Box display="flex" paddingX={3}>
                <Heading width="100%">Select a docupilot template</Heading>
                <Button icon="redo" variant="secondary" size="large" onClick={refreshTemplates}/>
            </Box>
            <Input marginX={3} marginY={1} value={search_term} placeholder="Search documents" onChange={e => setSearchTerm(e.target.value)}/>
            <dl>
                {template_items}
            </dl>
        </Box>
    );
}

export function TemplateComponent({templates, refreshTemplates, selected_template, selectTemplate, selected_record_ids, setRoute}) {




    if (selected_template) {
        return <TemplateMergeComponent
            selectedTemplate={selected_template}
            selectedRecordIds={selected_record_ids}
            setRoute={setRoute}
        />
    }
    return <TemplateListComponent templates={templates} selectTemplate={selectTemplate} refreshTemplates={refreshTemplates}/>;
}