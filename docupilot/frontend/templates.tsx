import React from "react";
import {Box, Button, FieldPicker, Heading, Icon, Input, Switch, Text, Loader} from "@airtable/blocks/ui";
import {FieldType, Field, Record, Table} from "@airtable/blocks/models";
import {SchemaComponent} from "./schema";
import {LoaderComponent} from "./common";
import {getActiveTable, getMergedData} from "./utils";
import {generateDocument, getTemplateSchema} from "./apicallouts";


function TemplateItem({template, select}) {
    return (
        <dt>
            <Box paddingX={3} paddingY={1} display="flex" flexDirection="row" style={{cursor: "pointer"}}
                 hasOnClick={true} borderBottom="1px solid #E5E5E5" alignItems="center"
                 onClick={(event) => select(template)}>
                <Icon name="file" size={32} />
                <Text as="h3" marginX="12px">{template.title}</Text>
            </Box>
        </dt>
    );
}

 function TemplateMergeComponent({selectedTemplate, selectedRecordIds, setRoute, setPageContext, openList}) {

    const [save_as_attachment, setSaveAsAttachment] = React.useState<boolean>(false);
    const [attachment_field, setAttachmentField] = React.useState<Field>(null);
    const [schema, setSchema] = React.useState<Docupilot.Schema>(null);
    const [merge_inprogress, setMergeInprogress] = React.useState<boolean>(false);

    const active_table: Table = getActiveTable();
    const mapping: Docupilot.Mapping = {};

    function updateMapping(key: string, value: Docupilot.MappingValue) {
        mapping[key] = value;
    }

    if (schema == null) {
        getTemplateSchema(selectedTemplate.id).then((response) => {
            if (response) {
                setSchema(response.data.schema);
            }
        });
    }

    return (
        <Box padding={3}>
            <Button icon="chevronLeft" variant="secondary" onClick={openList}>
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
                <FieldPicker marginX="12px" placeholder="Select field" disabled={!save_as_attachment} shouldAllowPickingNone={true}
                             table={active_table} field={attachment_field} allowedTypes={[FieldType.MULTIPLE_ATTACHMENTS]}
                             onChange={newField => setAttachmentField(newField)}/>
            </Box>
            {!!schema
                ? <SchemaComponent schema={schema} activeTable={active_table} updateMapping={updateMapping}/>
                : <LoaderComponent/>
            }

            <Button margin="12px" width="100%" variant="primary"  disabled={!schema || merge_inprogress} onClick={() => {
                setMergeInprogress(true);
                active_table.selectRecordsAsync().then(query => {
                    let merged_record_count = 0;
                    let success_context = [];
                    selectedRecordIds.forEach(record_id => {
                        const record: Record = query.getRecordById(record_id);
                        const record_name: string = record.name
                        // @ts-ignore
                        const attachments: Array<{url: string, filename: string}> = (attachment_field && record.getCellValue(attachment_field)) || [];
                        getMergedData(mapping, record).then(merged_data => {
                            generateDocument(selectedTemplate.id, merged_data, save_as_attachment).then(response => {
                                merged_record_count++;
                                if (save_as_attachment && attachment_field) {
                                    attachments.push({url: response.data.file_url, filename: response.data.file_name});
                                    success_context.push({record: record_name, generated_document: response.data.file_name})
                                    active_table.updateRecordAsync(record, {[attachment_field.id]: attachments})
                                }
                                if (merged_record_count == selectedRecordIds.length) {
                                    setMergeInprogress(false);
                                    setPageContext(success_context);
                                    setRoute("merge-success");
                                }
                            }).catch(error => {
                                console.log("error in generateDocument :: ", error);
                                setMergeInprogress(false);
                                setRoute("merge-fail");
                            });
                        }).catch(error => {
                            console.log("error in getMergedData :: ", error);
                            setMergeInprogress(false);
                            setRoute("merge-fail");
                        })
                    });
                    query.unloadData();
                }).catch(error => {
                    setMergeInprogress(false);
                    setRoute("merge-fail");
                });
            }}>
                {merge_inprogress
                    ? <Loader scale={0.3} fillColor="#fff"/>
                    : 'Create document'
                }
            </Button>
        </Box>
    );
}

function TemplateListComponent({templates, selectTemplate, refreshTemplates}) {
    const [search_term, setSearchTerm] = React.useState<string>("");
    let filtered_templates: Docupilot.TemplateList = !search_term ? templates : templates.filter(_t => _t.title.toLowerCase().includes(search_term));

    const template_items = filtered_templates.map((template) => <TemplateItem key={template.id} template={template}
                                                                              select={() => selectTemplate(template)}/>);
    return (
        <Box backgroundColor="white" paddingY={4} overflow="hidden">
            <Box display="flex" paddingX={3}>
                <Heading width="100%">Select a docupilot template</Heading>
                <Button aria-label="refresh-templates" icon="redo" variant="secondary" size="large" onClick={refreshTemplates}/>
            </Box>
            <Input marginX={3} marginY={1} value={search_term} placeholder="Search documents" onChange={e => setSearchTerm(e.target.value)}/>
            <dl>
                {template_items}
            </dl>
        </Box>
    );
}

export function TemplateComponent({templates, refreshTemplates, selected_template, selectTemplate, selected_record_ids, setRoute, setPageContext}) {

    if (selected_template) {
        return <TemplateMergeComponent
            selectedTemplate={selected_template}
            selectedRecordIds={selected_record_ids}
            setRoute={setRoute}
            setPageContext={setPageContext}
            openList={() => selectTemplate(null)}
        />
    }
    return <TemplateListComponent templates={templates} selectTemplate={selectTemplate} refreshTemplates={refreshTemplates}/>;
}