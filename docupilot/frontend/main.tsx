import React from "react";
import {FieldType, Record, Table} from "@airtable/blocks/models";
import {getActiveTable, getMergedData, getSelectedRecordIds} from "./utils";
import {getTemplates, getTemplateSchema, generateDocument} from "./apicallouts";
import {InformationComponent} from "./common";
import {Box, Heading, Icon, Loader, Text, Button, Input, Switch, FieldPicker} from "@airtable/blocks/ui";

function TemplateItem({template, select}) {
    return <dt>
        <Box paddingX={3} paddingY={1} display="flex" flexDirection="row" borderBottom="1px solid #E5E5E5" alignItems="center"
             onClick={select? () => select(template): undefined}>
            <Icon name="file" size={32} />
            <Text as="h3" marginX="12px">{template.title}</Text>
        </Box>
    </dt>
}

function TemplateMergeComponent({activeTable, selectedTemplate, selectedRecordIds, cancelAction}) {

    // @ts-ignore
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

    return (
        <Box padding={3}>
            <Button icon="chevronLeft" variant="secondary">
                back
            </Button>
            <Box marginY="12px" display="flex" flexDirection="row" alignItems="center">
                <Icon name="file" size={32} />
                <Text as="h3" marginX="12px">{selectedTemplate.title}</Text>
            </Box>
            <Text as="p">
                You can seemlessly insert values from Airtable records into your document by matching the Airtable field name to tags in your Docupilot template
            </Text>
            <Switch value={save_as_attachment} label="Upload document to an attachment field" size="large" margin="12px"
                    backgroundColor="transparent" onChange={newValue => setSaveAsAttachment(newValue)}/>
            <FieldPicker table={activeTable} field={attachment_field} allowedTypes={[FieldType.MULTIPLE_ATTACHMENTS]}
                         onChange={newField => setAttachmentField(newField)}/>
        </Box>
    )

    // return <Box
    //     backgroundColor="white"
    //     padding={3}
    //     overflow="hidden">
    //     <Heading>Create Document</Heading>
    //     <dl>
    //         <TemplateItem key={selectedTemplate.id} template={selectedTemplate} select={undefined}/>
    //     </dl>
    //     {selectedRecordIds.length < 2 &&
    //     <Switch
    //         value={save_as_attachment}
    //         onChange={newValue => setSaveAsAttachment(newValue)}
    //         label="Upload the document to an attachment field"
    //         width="320px"
    //     />
    //     }
    //     {save_as_attachment &&
    //     <FieldPicker
    //         table={activeTable}
    //         field={attachment_field}
    //         allowedTypes={[FieldType.MULTIPLE_ATTACHMENTS]}
    //         onChange={newField => setAttachmentField(newField)}
    //         marginY="10px"
    //     />
    //     }
    //     <Box
    //         paddingY="20px"
    //         display="flex"
    //         flexDirection="row-reverse"
    //         borderBottom="solid 0.5px LightGray"
    //     >
    //         <Button
    //             marginLeft="10px"
    //             variant="primary"
    //             disabled={schema == null}
    //             onClick={() => {
    //                 activeTable.selectRecordsAsync().then(query => {
    //                     selectedRecordIds.forEach(record_id => {
    //                         const record: Record = query.getRecordById(record_id);
    //                         // @ts-ignore
    //                         const attachments: Array<{url: string, filename: string}> = (attachment_field && record.getCellValue(attachment_field)) || [];
    //                         const merged_data: Map<string, any> = getMergedData(schema, record);
    //                         generateDocument(selectedTemplate.id, merged_data).then(response => {
    //                             if (save_as_attachment && attachment_field) {
    //                                 attachments.push({url: response.data.file_url, filename: response.data.file_name});
    //                                 activeTable.updateRecordAsync(record, {[attachment_field.id]: attachments})
    //                             }
    //                         });
    //                     });
    //                     query.unloadData();
    //                 }).catch(error => console.log(error));
    //             }}
    //         >
    //             Generate
    //         </Button>
    //         <Button
    //             onClick={() => {
    //                 cancelAction();
    //                 setSchema(null);
    //                 setSaveAsAttachment(false);
    //             }}
    //         >
    //             Cancel
    //         </Button>
    //     </Box>
    //     <Text>You can seemlessly insert values from Airtable records into your document by
    //         matching the Airtable field name to tags in your Docupilot template
    //     </Text>
    // </Box>
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

export function MainComponent() {
    const [templates, setTemplates] = React.useState(null );
    const [selected_template, setSelectedTemplate] = React.useState(null );

    const active_table: Table = getActiveTable();
    const selected_record_ids = getSelectedRecordIds();

    if (templates == null) {
        getTemplates().then((response) => {
            if (response) {
                setTemplates(response.data);
                setSelectedTemplate(response.data[0]);
            }
        });
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
                return <TemplateListComponent templates={templates} selectTemplate={setSelectedTemplate} refreshTemplates={() => {
                    getTemplates().then((response) => {
                        if (response) {
                            setTemplates(response.data);
                        }
                    });
                }}/>
            } else {
                return <Loader scale={0.3} />
            }
        }
    } else {
        return <InformationComponent icon_name={"checklist"} icon_color={"#B3B3B3"}
                                     content={"Select records to generate documents with docupilot"}/>;
    }
}