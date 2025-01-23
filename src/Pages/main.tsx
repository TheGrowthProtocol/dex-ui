import React, { useEffect, useState } from "react";
import { Grid, Box, Tab, Tabs, CircularProgress } from "@material-ui/core";

import Swap from "../Components/swap";
import Liquidity from "../Components/liquidity";
import PoolsList from "../Components/pools";
import Staking from "../Components/staking";

/**
 * @description redux state
 */
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchTokens } from '../store/tokens/tokenThunks'; 
import RemoveLiquidity from "../Components/removeLiquidity";
import { fetchPools } from "../store/pool/poolThunks";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
  const { tokens, loading, error } = useSelector((state: RootState) => state.tokens);

  // @description fetch tokens
  useEffect(() => {
    dispatch(fetchTokens());
    dispatch(fetchPools());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPools());
  }, [tokens]);

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  const handleTabChange = (newValue: number) => {
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
              <Tab label="Swap Tokens" {...a11yProps(0)} className="tab-header" />
              <Tab
                label="Add Liquidity"
                {...a11yProps(1)}
                className="tab-header"
              />
              <Tab label="Liquidity Pools" {...a11yProps(2)} className="tab-header" />
              <Tab label="Remove Liquidity" {...a11yProps(3)} className="tab-header" />
              <Tab label="Staking" {...a11yProps(4)} className="tab-header" />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Swap />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Liquidity />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <PoolsList handleTabChange={handleTabChange} />
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
