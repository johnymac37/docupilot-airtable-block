import {Box, Icon, Text} from "@airtable/blocks/ui";
import React from "react";

export function InformationComponent({icon_name, icon_color, content}) {
    return (
        <Box
            backgroundColor="white"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="300px"
            height="100%"
        >
            <Icon name={icon_name} size={60} fillColor={icon_color} margin={2}/>
            <Text as="p" size="large" textColor="light">{content}</Text>
        </Box>
    );
}