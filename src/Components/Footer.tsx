import React from "react";
import { Grid, Typography } from "@material-ui/core";

const Footer: React.FC<{}> = () => {
  return (
    <Grid container>
        <Grid item xs={12}>
            Test
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
            <Typography variant="h6">© 2025 the growth protocol.</Typography>
        </Grid>
        <Grid item xs={12} md={8} lg={8}>
            <Typography variant="h6">All rights reserved.</Typography>
        </Grid>
    </Grid>
  );
};

export default Footer;
