import React, { useState } from "react";
import { Grid, Typography, Box, Tab, Tabs } from "@material-ui/core";

import Swap from "../Components/swap";
import Liquidity from "../Components/liquidity";
import PoolsList from "../Components/pools";
import Staking from "../Components/staking";
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
      {value === index && <>{ children }</>}
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

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Grid container>
      <Grid item xs={12} md={12}>
        <Box sx={{ width: "100%" }} className="main-content-area">
          <Box>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="fullWidth"
              textColor="primary"
            >
              <Tab label="Swap" {...a11yProps(0)} className="tab-header" />
              <Tab label="Add Liquidity" {...a11yProps(1)} className="tab-header" />
              <Tab label="Pools" {...a11yProps(2)} className="tab-header" />
              <Tab label="Staking" {...a11yProps(3)} className="tab-header" />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Swap />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Liquidity />
          </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <PoolsList />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <Staking />
          </CustomTabPanel>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Main;
