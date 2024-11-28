import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface SpotTransaction {
  id: number;
  coinName: string;
  sellingPrice: number;
  purchasePrice: number;
  profit: number;
}

const SpotTaxCalculator: React.FC = () => {
  const [transactions, setTransactions] = useState<SpotTransaction[]>([]);
  const [sellingPrice, setSellingPrice] = useState<number | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [coinName, setCoinName] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);
  const [tdsDeducted, setTdsDeducted] = useState<number>(0);
  const [includeCess, setIncludeCess] = useState<boolean>(true);
  const navigate = useNavigate();

  const addOrUpdateTransaction = () => {
    if (sellingPrice !== null && purchasePrice !== null) {
      const profit = sellingPrice - purchasePrice;

      if (editId !== null) {
        // Update existing transaction
        setTransactions((prevTransactions) =>
          prevTransactions.map((txn) =>
            txn.id === editId
              ? { ...txn, coinName: coinName || `Coin ${editId}`, sellingPrice, purchasePrice, profit }
              : txn
          )
        );
        setEditId(null);
      } else {
        // Add new transaction
        const newTransaction: SpotTransaction = {
          id: transactions.length + 1,
          coinName: coinName || `Coin ${transactions.length + 1}`,
          sellingPrice,
          purchasePrice,
          profit,
        };
        setTransactions([...transactions, newTransaction]);
      }

      setSellingPrice(null);
      setPurchasePrice(null);
      setCoinName("");
    }
  };

  const editTransaction = (id: number) => {
    const transaction = transactions.find((txn) => txn.id === id);
    if (transaction) {
      setEditId(transaction.id);
      setCoinName(transaction.coinName);
      setSellingPrice(transaction.sellingPrice);
      setPurchasePrice(transaction.purchasePrice);
    }
  };

  const removeTransaction = (id: number) => {
    setTransactions((prevTransactions) => prevTransactions.filter((txn) => txn.id !== id));
  };

  const calculateTax = () => {
    const totalProfit = transactions.reduce((sum, txn) => sum + txn.profit, 0);
    const taxLiability = totalProfit * 0.3 + (includeCess ? totalProfit * 0.04 : 0);
    const finalTax = taxLiability - tdsDeducted;
    alert(`Total Tax Payable: ₹${finalTax.toFixed(2)}`);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => navigate("/")}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Typography variant="h5" gutterBottom>
        Spot Trading Tax Calculator
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Coin Name (Optional)"
            type="text"
            variant="outlined"
            fullWidth
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Selling Price (₹)"
            type="number"
            variant="outlined"
            fullWidth
            value={sellingPrice || ""}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Purchase Price (₹)"
            type="number"
            variant="outlined"
            fullWidth
            value={purchasePrice || ""}
            onChange={(e) => setPurchasePrice(Number(e.target.value))}
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="primary"
        onClick={addOrUpdateTransaction}
        sx={{ mt: 2 }}
      >
        {editId !== null ? "Update Transaction" : "Add Transaction"}
      </Button>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Transactions:</Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Coin Name</TableCell>
                <TableCell>Selling Price (₹)</TableCell>
                <TableCell>Purchase Price (₹)</TableCell>
                <TableCell>Profit (₹)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{txn.id}</TableCell>
                  <TableCell>{txn.coinName}</TableCell>
                  <TableCell>{txn.sellingPrice}</TableCell>
                  <TableCell>{txn.purchasePrice}</TableCell>
                  <TableCell>{txn.profit.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => editTransaction(txn.id)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => removeTransaction(txn.id)} color="secondary">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ mt: 3 }}>
        <TextField
          label="TDS Deducted (₹)"
          type="number"
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          onChange={(e) => setTdsDeducted(Number(e.target.value))}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includeCess}
              onChange={(e) => setIncludeCess(e.target.checked)}
            />
          }
          label="Include Cess (4%)"
          sx={{ mt: 2 }}
        />
        <Button variant="contained" color="primary" onClick={calculateTax} sx={{ mt: 2 }}>
          Calculate Total Tax
        </Button>
      </Box>
    </Box>
  );
};

export default SpotTaxCalculator;
