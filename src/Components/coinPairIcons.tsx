import React from 'react';
import CoinNoIcon from './coinNoIcon';
import { CoinPairIconsProps } from '../interfaces'; 
import { Box } from '@material-ui/core';

const CoinPairIcons: React.FC<CoinPairIconsProps> = ({ coin1Image, coin2Image }) => {
  return (
    <Box className="coin-pair-icons">
        <Box className="coin-pair-icons__coin">
        {coin1Image && <img src={coin1Image} alt="Coin 1"/>}
        {!coin1Image && <CoinNoIcon />}
        </Box>
        <Box className="coin-pair-icons__coin">
            {coin2Image && <img src={coin2Image} alt="Coin 2"/>}
            {!coin2Image && <CoinNoIcon />}
        </Box>
    </Box>
  );
};

export default CoinPairIcons;