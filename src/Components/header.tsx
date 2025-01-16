import React from "react";
import { Button, Grid, Typography, Box, useTheme } from "@material-ui/core";
import logo from "../assets/logo.svg";
import ConnectWalletButton from "./connectWalletButton";

const Header: React.FC<{}> = () => {
  const theme = useTheme();
  const menuItems = [
    { name: "Dex", link: "/dex" },
    { name: "Faucet", link: "/faucet" },
    { name: "dApps", link: "/dapps" },
    { name: "Docs", link: "/docs" },
    { name: "Blogs", link: "/blogs" },
    { name: "Block Explorer", link: "/block-explorer" },
  ];
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
          {/* menuItems.map((item) => (
            <a key={item.name} href={item.link} className="header-menu-item">
              {item.name}
            </a>
          ))} */}
          <ConnectWalletButton />
        </Box>
      </Grid>
    </Grid>
  );
};

export default Header;
