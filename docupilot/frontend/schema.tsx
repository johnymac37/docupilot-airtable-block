import React from "react";
import {base} from "@airtable/blocks";
import {Box, Text, Select} from "@airtable/blocks/ui";
import {Field} from "@airtable/blocks/models"
import {selectAllowedTypes} from './utils';

function defaultSelectedField(fields: Array<Field>, docupilot_field_name: string): Field {
    docupilot_field_name = docupilot_field_name.toLowerCase().replace('_', '');
    return fields.filter(airtable_field => {
        let airtable_field_name = airtable_field.name.toLowerCase().replace(' ', '');
        return airtable_field_name == docupilot_field_name;
    })[0];
}


function CustomFieldPicker({docupilot_field_name, table, onSelection, allowed_field_types=null, updateLinkedTable=null, width="50%"}) {

    if (!table) {
        return <Select width={width} disabled={true} value={null} options={[{value: null, label: '-'}]}/>
    }

    const field_options = allowed_field_types ? table.fields.filter(airtable_field => allowed_field_types.includes(airtable_field.type)) : table.fields;
    const [selected_field, setSelectedField] = React.useState(defaultSelectedField(field_options, docupilot_field_name));
    const options = [{value: null, label: '-'}, ...field_options.map(airtable_field => ({value: airtable_field.id, label: airtable_field.name}))];

    onSelection(selected_field? selected_field.id: null);
    if (updateLinkedTable != null) {
        updateLinkedTable(selected_field? base.getTableById(selected_field.options.linkedTableId as string): null);
    }

    return <Select width={width} value={selected_field ? selected_field.id : null} options={options}
                   onChange={(newValue => {
                       let newField = newValue ? table.getFieldById(newValue) : null;
                       setSelectedField(newField);
                   })}/>
}

function MappingComponent({docupilot_field, table, cb, level= 0}) {
    const [linked_table, setLinkedTable] = React.useState(null);
    const has_child = docupilot_field.fields != null;
    let mapping_value: Docupilot.MappingValue = {
        __airtable_field__: null,
        __docupilot_type__: docupilot_field.type
    };

    let main_component = (
        <Box display="flex" paddingY="8px" paddingLeft={level > 0? '10px': null}>
            <Text width="50%" fontWeight="500">{docupilot_field.name}</Text>
            <CustomFieldPicker docupilot_field_name={docupilot_field.name} table={table}
                               onSelection={(newValue) => {
                                   mapping_value.__airtable_field__ = newValue;
                                   cb(mapping_value);
                               }}
                               allowed_field_types={selectAllowedTypes(docupilot_field)}
                               updateLinkedTable={has_child? setLinkedTable: null}/>
        </Box>
    );
    let child_components;
    if (has_child) {
        let child_count: number = 0;
        let child_mapping: Docupilot.Mapping = {};
        child_components = docupilot_field.fields.map(child_field => {
            return <MappingComponent key={child_count++} docupilot_field={child_field} table={linked_table} level={level+1}
                                     cb={(newValue) => {
                                         child_mapping[child_field.name] = newValue;
                                         cb(mapping_value);
                                     }}/>;
        })
        mapping_value.fields = child_mapping;
    }
    return (
        <Box borderLeft={level > 0? '1px solid #E5E5E5': null} marginLeft={level > 1? '11px': null}>
            {main_component}
            {child_components}
        </Box>
    );
}

export function SchemaComponent({schema, activeTable, updateMapping}) {

    let count: number = 0;
    const mapping_components = schema.map(docupilot_field => {
        return <MappingComponent key={count++} docupilot_field={docupilot_field} table={activeTable}
                                 cb={(newValue) => updateMapping(docupilot_field.name, newValue)}
        />
    });

    return (
        <Box marginY="24px">
            <Box display="flex" paddingY="16px">
                <Text width="50%" textColor="light">Docupilot fields</Text>
                <Text width="50%" textColor="light">Airtable fieds/columns</Text>
            </Box>
            <Box>
                {mapping_components}
            </Box>
        </Box>
    );
}