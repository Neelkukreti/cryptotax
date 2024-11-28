import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <CalculateIcon sx={{ mr: 2 }} />
        <Typography variant="h6">Crypto Tax Calculator</Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
