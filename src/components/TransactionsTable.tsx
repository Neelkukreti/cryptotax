import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";

const TypeCell = styled(TableCell)(({ type }: { type: string }) => ({
  color: type === "sell" ? "red" : "green",
  fontWeight: "bold",
  textTransform: "uppercase",
}));

interface Transaction {
  date: string;
  market: string;
  type: string;
  price: number;
  amount: number;
  total: number;
}

interface TransactionsTableProps {
  groupedTransactions: { [key: string]: Transaction[] };
  onEditTransaction: (
    coin: string,
    index: number,
    field: keyof Transaction,
    value: number
  ) => void;
  onDeleteTransaction: (coin: string, index: number) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  groupedTransactions,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [editingCoin, setEditingCoin] = useState<string | null>(null);

  const calculateAggregateData = () => {
    return Object.entries(groupedTransactions).map(([coin, entries]) => {
      const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
      const totalValue = entries.reduce((sum, entry) => sum + entry.total, 0);
      return { coin, totalAmount, totalValue };
    });
  };

  const aggregatedData = calculateAggregateData();

  return (
    <Box>
      {aggregatedData.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Market</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aggregatedData.map(({ coin, totalAmount, totalValue }, idx) => (
                <TableRow key={idx}>
                  <TableCell>{coin}</TableCell>
                  <TableCell>{totalAmount}</TableCell>
                  <TableCell>{totalValue}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      onClick={() =>
                        setEditingCoin(editingCoin === coin ? null : coin)
                      }
                    >
                      {editingCoin === coin ? "Hide Transactions" : "View Transactions"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {editingCoin && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Transactions for {editingCoin}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedTransactions[editingCoin]?.map((txn, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{txn.date || "Unknown"}</TableCell>
                    <TypeCell type={txn.type}>
                      {txn.type === "sell" ? "SELL" : "BUY"}
                    </TypeCell>
                    <TableCell>{txn.price}</TableCell>
                    <TableCell>
                      <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                        value={txn.amount}
                        onChange={(e) =>
                          onEditTransaction(editingCoin, idx, "amount", +e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                        value={txn.total}
                        onChange={(e) =>
                          onEditTransaction(editingCoin, idx, "total", +e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => onDeleteTransaction(editingCoin, idx)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default TransactionsTable;
