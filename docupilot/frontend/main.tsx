import React from "react";
import {RecordId} from "@airtable/blocks/types";
import {getSelectedRecordIds} from "./utils";
import {getTemplates} from "./apicallouts";
import {TemplateComponent} from "./templates";
import {InformationComponent, LoaderComponent} from "./common";

export function MainComponent() {
    const [route, setRoute] = React.useState<string>('template-view');
    const [templates, setTemplates] = React.useState<Docupilot.TemplateList>(null);
    const [selected_template, setSelectedTemplate] = React.useState<Docupilot.Template>(null);
    const selected_record_ids: Array<RecordId> = getSelectedRecordIds();

    function refreshTemplates() {
        getTemplates().then((response) => {
            if (response) {
                setTemplates(response.data);
            }
        });
    }

    if (templates == null) {
        refreshTemplates();
    }

    if (route == 'template-view') {
        if (!selected_record_ids.length) {
            return <InformationComponent icon_name="checklist" icon_color="#B3B3B3" show_icon_bg={false}
                                         content="Select records to generate documents with docupilot"/>;
        }
        if (templates) {
            return <TemplateComponent templates={templates} refreshTemplates={refreshTemplates}
                                      selected_template={selected_template} selectTemplate={setSelectedTemplate}
                                      selected_record_ids={selected_record_ids} setRoute={setRoute}/>
        }
    } else if (route == 'merge-success') {
        return <InformationComponent icon_name="check" icon_color="#36FFC3"
                                     content="Document created successfully 🎉"
                                     actions={[
                                         {label: 'Dismiss', variant: 'secondary', onClick: () => {
                                             setSelectedTemplate(null);
                                             setRoute('template-view');
                                         }}
                                         ]}/>;
    } else if (route == 'merge-fail') {
        return <InformationComponent icon_name="warning" icon_color="#F36F6F"
                                     content="Document creation failed ☹️"
                                     actions={[
                                         {label: 'Retry again', onClick: () => {setRoute('template-view')}},
                                         {label: 'Dismiss', variant: 'secondary', onClick: () => {
                                             setSelectedTemplate(null);
                                             setRoute('template-view');
                                         }}
                                         ]}/>;
    }
    return <LoaderComponent/>;
}