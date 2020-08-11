import React from "react";
import {Box, FieldPicker, Loader, Text} from "@airtable/blocks/ui";

export function SchemaComponent({active_table, mapping, updateMapping}) {

    const mapping_rows = Array.from(mapping.entries()).map(([key,value]) => <tr key={key.id}>
        <td>
            <Text fontWeight="bold">{key.name}</Text>
        </td>
        <td>
            <FieldPicker marginX="12px" placeholder="-" shouldAllowPickingNone={true} table={active_table}
                         field={value} onChange={(newField) => {
                             let temp_mapping: Map<{id: string, name: string}, any> = new Map<{id: string, name: string}, any>(mapping);
                             temp_mapping.set(key, newField);
                             updateMapping(temp_mapping);
            }}/>
        </td>
    </tr>);
    return (
        <Box marginX="12px" marginY="24px">
            <table width="100%">
                <thead>
                    <tr key="heading">
                        <th><Text textColor="light">Docupilot fields</Text></th>
                        <th><Text textColor="light">Airtable fieds/columns</Text></th>
                    </tr>
                </thead>
                <tbody>{mapping_rows}</tbody>
            </table>
        </Box>
    );
}