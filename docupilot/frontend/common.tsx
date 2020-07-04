import {Box} from "@airtable/blocks/ui";
import React from "react";

export function InformationComponent({content}) {
    return <Box
        backgroundColor="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="300px"
    >
        {content}
    </Box>
}