import { Box, Typography } from "@material-ui/core";
import React from "react";

interface TokenomicsItem {
    title: string;
    value: string;
}

export const Tokenomics: React.FC<{items: TokenomicsItem[]}> = ({items}) => {
    return (
        <Box className="tokenomics-container">
            <Box className="tokenomics-header" display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                <Typography variant="subtitle1">Tokenomics</Typography>
            </Box>
            <Box className="tokenomics-content">
                {items.map((item, index) => (
                    <Box className="tokenomics-content__item" key={`tokenomics-${item.title}-${index}`} display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
                        <Typography variant="caption" color="textSecondary">{item.title}</Typography>
                        <Typography variant="subtitle2" color="primary">{item.value}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default Tokenomics;