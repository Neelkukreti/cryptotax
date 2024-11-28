import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: "center", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crypto Cult - Crypto Tax Calculator
      </Typography>
      <Box sx={{ marginY: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/spot-tax-calculator")}
          sx={{ margin: 1 }}
        >
          Spot Trading Tax Calculator
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/futures-tax-calculator")}
          sx={{ margin: 1 }}
        >
          Futures Trading Tax Calculator
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/upload-transactions")}
          sx={{ margin: 1 }}
        >
          Upload Transactions Excel
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
