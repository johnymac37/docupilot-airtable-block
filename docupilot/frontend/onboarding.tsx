import React from "react";
import {Box, Text, Button, Heading, loadCSSFromString} from "@airtable/blocks/ui";
import {MasterLogoWhite} from "./images";

loadCSSFromString(`.instruction-list:before {
    content: "";
    border-left: 1px solid #FFFFFF;
    height: 100%;
    display: block;
    position: absolute;
    top: 0;
    left: 12px;
    z-index: 0;
} .instruction-box * {
    font-size: 12px;
    line-height: 18px;
}.onboarding-view *{
    color: #FFFFFF;
}`)

const onBoardingInstructions = [
    "Sign in to dashboard.docupilot.app",
    "Create an API key or copy an existing API key from Settings  API.",
    "Paste your API key in the block and start."
]

function InstructionComponent({count, instruction, isLast=false}) {
    return (
        <Box display="flex">
            <Box display="flex" alignItems="center" justifyContent="center" width="24px" height="24px"
                 zIndex={5} backgroundColor="#071C3F" border="2px solid #3D89FF" borderRadius="circle">
                <Text fontWeight="500">{count}</Text>
            </Box>
            <Text flex="1" marginX={3} marginBottom={isLast ? null : 3}>{instruction}</Text>
        </Box>
    )
}

export function OnBoardingComponent({getStarted}) {
    let i_count: number = 0;
    const instruction_components = onBoardingInstructions.map(i => <InstructionComponent key={i_count} count={++i_count}
                                                                                         isLast={i_count==onBoardingInstructions.length}
                                                                                         instruction={i}/>);
    return (
        <Box className="onboarding-view" padding={5} backgroundColor="#071C3F">
            <Box>
                <MasterLogoWhite/>
            </Box>
            <Text fontSize={3} lineHeight="24px" marginY="8px">
                Intuitive, flexible, and affordable Document Automation Software
            </Text>
            <Box className="instruction-box" marginY="20px">
                <Text opacity="0.8">Get Started</Text>
                <Box className="instruction-list" position="relative" marginTop="12px">
                    {instruction_components}
                </Box>
            </Box>
            <Button variant="primary" marginY="8px" width="155px" onClick={getStarted}>
                <Text fontWeight="600" fontSize="14px">
                    Get Started
                </Text>
            </Button>
        </Box>
    );
}