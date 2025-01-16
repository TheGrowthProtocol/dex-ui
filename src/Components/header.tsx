import React from "react";
import { Grid, Box, useTheme } from "@material-ui/core";
import logo from "../assets/logo.svg";
import ConnectWalletButton from "./connectWalletButton";

const Header: React.FC<{}> = () => {
  const theme = useTheme();
  return (
    <Grid
      container
      className="header"
      style={{ backgroundColor: theme.palette.background.default }}
      alignItems="center"
    >
      <Grid item xs={12} sm={12} md={4} lg={4}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent={{ xs: "center", md: "flex-start" }}
          alignItems="center"
        >
          <img src={logo} alt="TGP DEX Logo" style={{ height: "50px" }} />
        </Box>
      </Grid>
      <Grid item xs={12} sm={12} md={8} lg={8}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent={{ xs: "center", md: "flex-end" }}
          alignItems="center"
        >
          <ConnectWalletButton />
        </Box>
      </Grid>
    </Grid>
  );
};

export default Header;
