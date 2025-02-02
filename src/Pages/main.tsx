import React, { useEffect, useState } from "react";
import { Grid, Box, Tab, Tabs, CircularProgress, styled } from "@material-ui/core";

import Swap from "./swap";
import AddLiquidity from "./addLiquidity";
import PoolsList from "./pools";
import Staking from "./staking";
import RemoveLiquidity from "./removeLiquidity";

/**
 * @description redux state
 */
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchTokens } from '../store/tokens/tokenThunks'; 
import { fetchPools } from "../store/pool/poolThunks";
import { useNetwork } from "../Hooks/useNetwork";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const StyledTabHeader = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: "bold",
  background: "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
  backgroundClip: "text",
  color: "transparent !important",
  fontSize: "16px !important",
  textAlign: "center",

  "&.Mui-selected": {
    fontSize: "20px !important",
  }
}));

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Main = () => {
  const [value, setValue] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const { rpcProvider } = useNetwork();
  const { tokens, loading, error } = useSelector((state: RootState) => state.tokens);

  // @description fetch tokens
  useEffect(() => {
    dispatch(fetchTokens(rpcProvider)); 
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPools(rpcProvider));
  }, [tokens]);

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };


  if (loading) return <div className="loading-container">
    <CircularProgress />
  </div>;
  if (error) return <div>Error: {error}</div>;  

  return (
    <Grid container>
      <Grid item xs={12} md={12} lg={8}>
        <Box sx={{ width: "100%" }} className="main-content-area">
          <Box>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="fullWidth"
              textColor="primary"
            >
              <StyledTabHeader label="Swap Tokens" {...a11yProps(0)} className="tab-header" />
              <StyledTabHeader label="Liquidity Pools" {...a11yProps(1)} className="tab-header" />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Swap />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <AddLiquidity />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <PoolsList  />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <RemoveLiquidity />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            <Staking />
          </CustomTabPanel>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Main;
