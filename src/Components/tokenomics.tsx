import { Box, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { POOL } from "../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { fetchPools, fetchPoolTokenomics } from "../store/pool/poolThunks";
import { AppDispatch, RootState } from "../store/store";
import { Tokenomics as TokenomicsType } from "../interfaces";



interface TokenomicsProps {
    type: "swap" | "pool";
    selectedPool: POOL | null;
    isConnected: boolean;
}


export const Tokenomics: React.FC<TokenomicsProps> = ({type, selectedPool, isConnected}) => {
    const dispatch = useDispatch<AppDispatch>(); 
    const { amount1: swapAmount1, amount2: swapAmount2, loading:swapLoading, error:swapError} = useSelector((state: RootState) => state.swap);
    const { amount1: liquidityAmount1, amount2: liquidityAmount2, loading:liquidityLoading, error:liquidityError} = useSelector((state: RootState) => state.liquidity);
    
    const poolTokenomics:TokenomicsType = useSelector((state: RootState) => state.pool.poolTokenomics);

    useEffect(() => {
        if (isConnected && selectedPool) {
            switch (type) {
                case "swap":
                    console.log("swap", selectedPool, swapAmount1, swapAmount2);
                    dispatch(fetchPoolTokenomics({pool: selectedPool, swapAmount1: swapAmount1, swapAmount2: swapAmount2}));
                    break;
                case "pool":
                    //dispatch(fetchPoolTokenomics({pool: selectedPool, liquidityAmount1: liquidityAmount1, liquidityAmount2: liquidityAmount2}));
                    break;
            }
        }
    }, [dispatch, isConnected, type, selectedPool]);

    useEffect(() => {
        if (selectedPool) {
            dispatch(fetchPoolTokenomics({pool: selectedPool, swapAmount1: swapAmount1, swapAmount2: swapAmount2}));
        }
    }, [swapAmount1, swapAmount2, dispatch, selectedPool]);


    
    if (swapLoading) {
        return <div>Loading...</div>;
    }

    if (swapError) {
        return <div>Error: {swapError}</div>;
    }

    console.log("poolTokenomics", poolTokenomics);

    return (
        <Box className="tokenomics-container">
            <Box className="tokenomics-header" display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                <Typography variant="subtitle1">Tokenomics</Typography>
            </Box>
            <Box className="tokenomics-content">
                {poolTokenomics && Object.keys(poolTokenomics).map((key) => (
                    <Box className="tokenomics-content__item" key={`tokenomics-${key}`} display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
                        <Typography variant="caption" color="textSecondary">{poolTokenomics[key].title}</Typography>
                        <Typography variant="subtitle2" color="primary">{poolTokenomics[key].value}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default Tokenomics;