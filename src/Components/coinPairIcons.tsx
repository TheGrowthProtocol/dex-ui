import React from 'react';
import CoinNoIcon from './coinNoIcon';
import { CoinPairIconsProps } from '../interfaces'; 
import { Box, styled } from '@material-ui/core';

const StyledCoinPairIcons = styled(Box)(({ theme }) => ({
  marginRight: "12px",
}));

const StyledCoinPairIconsCoin = styled(Box)(({ theme }) => ({
  "&:last-child": {
    marginLeft: "12px",
    marginTop: "-12px",
  },
}));

const StyledCoinPairIconsCoinImage = styled('img')(({ theme }) => ({
  width: "24px",
  height: "24px",
  background: "#1A1A1A",
  borderRadius: "20px",
  border: `1px solid ${theme.palette.primary.main}`,
}));

const StyledCoinPairIconsCoinImage2 = styled('img')(({ theme }) => ({
  width: "32px",
  height: "32px",
  background: "#1A1A1A",
  borderRadius: "20px",
  border: `1px solid ${theme.palette.primary.main}`, 
}));

const CoinPairIcons: React.FC<CoinPairIconsProps> = ({ coin1Image, coin2Image }) => {
  return (
    <StyledCoinPairIcons>
        <StyledCoinPairIconsCoin>
        {coin1Image && <StyledCoinPairIconsCoinImage src={coin1Image} alt="Coin 1" />}
        {!coin1Image && <CoinNoIcon />}
        </StyledCoinPairIconsCoin>
        <StyledCoinPairIconsCoin>
            {coin2Image && <StyledCoinPairIconsCoinImage2 src={coin2Image} alt="Coin 2" />}
            {!coin2Image && <CoinNoIcon />}
        </StyledCoinPairIconsCoin>
    </StyledCoinPairIcons>
  );
};

export default CoinPairIcons;