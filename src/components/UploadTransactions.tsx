import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Button, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Box, IconButton, TextField, Grid 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";

type EditedTransactionType = {
  Amount: number;
  Total: number;
  [key: string]: string | number;
};

// Helper function to calculate tax on profit




const UploadTransactions = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/"); // Navigate back to home page
  };

  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalTaxDue, setTotalTaxDue] = useState<string>('0.00'); // State for total tax due
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTransaction, setEditedTransaction] = useState<EditedTransactionType | null>(null); 
  const [taxReport, setTaxReport] = useState<{ index: number; market: string; profit: string; tax: string;  remainingQuantity: number; note: string }[]>([]);
  const handleClick = () => {
    console.log('Button clicked!');
  };

  const [isAdding, setIsAdding] = useState<boolean>(false);

  const [fixingMarket, setFixingMarket] = useState<string | null>(null);
  type TransactionType = {
    Date: string;
    Market: string;
    Type: string;
    Amount: number;
    Price: number;
    Fee: number;
  };
  
  const [newTransaction, setNewTransaction] = useState<TransactionType>({
    Date: new Date().toISOString().split('T')[0],
    Market: '',
    Type: 'BUY',
    Amount: 0,
    Price: 0,
    Fee: 0,
  });

const handleFixMarket = (market: string) => {
  setFixingMarket(market);
  setNewTransaction({
    Date: new Date().toISOString().split('T')[0], // Default current date
    Market: market,
    Type: 'BUY',
    Price: 0,
    Amount: 0,
    Fee: 0,
  });
};

const handleNewTransactionChange = (field: string, value: string) => {
  setNewTransaction((prev) => ({
    ...prev,
    [field]: value,
  }));
};

// Add the new transaction to the transactions list
const handleAddTransactionNew = () => {
  // Validate inputs
  if (!newTransaction.Market || !newTransaction.Type) {
    alert('Please fill in all required fields.');
    return;
  }
  setIsAdding(false);

  setTransactions((prev) => [...prev, { ...newTransaction }]);
  // Reset the form
  setNewTransaction({
    Date: new Date().toISOString().split('T')[0],
    Market: '',
    Type: 'BUY',
    Amount: 0,
    Price: 0,
    Fee: 0,
  });
};

  const handleAddTransaction = () => {
    const newTransaction = {
      Date: '', 
      Market: '',
      Type: '',
      Price: 0,
      Amount: 0,
      Total: 0,
      Fee: 0,
    };
    setTransactions([...transactions, newTransaction]);
    setIsEditing(true);
    setEditedTransaction(newTransaction);
  };

  const handleIsAdding = () => {
    setIsAdding(true);
  }
// Define the structure of the transaction object
interface Transaction {
  Market: string;
  Date: string;
  Type: string; // "BUY" or "SELL"
  Amount: string; // Quantity of the asset
  Price: string; // Price at which the transaction occurred
  Fee: string; // Transaction fee
}

const generateTaxReport = () => {
  const report: { index: number; market: string; profit: string; tax: string; remainingQuantity: number; note: string }[] = [];
  let totalTax = 0;
  // Group transactions by market
  const groupedByMarket = transactions.reduce((acc, transaction) => {
    const { Market } = transaction;
    if (!acc[Market]) acc[Market] = [];
    acc[Market].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  Object.keys(groupedByMarket).forEach((market) => {
    const marketTransactions = groupedByMarket[market];

    // Sort transactions by date
    marketTransactions.sort((a: Transaction, b: Transaction) => new Date(a.Date).getTime() - new Date(b.Date).getTime()); // Sort by date

    let buyQuantity = 0;
    let sellQuantity = 0;
    let profit = 0;
    let note = '';
    let sellDetected = false;
    let remainingAmount = 0;
    let buyTracker = 0;

    marketTransactions.forEach((transaction: Transaction) => { // Explicitly define type for 'transaction'
      const { Type, Amount, Price, Fee } = transaction;
      const amount = +Amount || 0;
      const price = +Price || 0;
      const fee = +Fee || 0;
      if (Type === 'BUY') {
        buyQuantity += amount; // Accumulate BUY quantity
        buyTracker += amount;
      } else if (Type === 'SELL') {
        sellDetected = true;
        sellQuantity += amount;

        if (buyQuantity >= amount) {
          // Full SELL matched with available BUY
          profit += (price - fee) * amount;
          buyQuantity -= amount; // Deduct sold quantity from available BUY
        } else {
          // Partial SELL exceeds available BUY
          profit += (price - fee) * buyQuantity;
          note = 'Buy is less than sell';
          buyQuantity = 0;
        }
      }
    });
    remainingAmount = buyTracker - sellQuantity; 
    if(buyTracker == 0)
    {
      remainingAmount = 0;
    } else {
      note = '';
    }
    if (sellDetected && buyQuantity === 0 && !note) {
      note = 'Sell order not detected';
    }
   // Remaining quantity after selling all available BUY orders if any. If no sell, it remains 0.

    const tax = profit * 0.3; // 30% tax rate
    totalTax += tax;
    report.push({
      index: report.length + 1,
      market: market,
      profit: profit.toFixed(2),
      tax: sellDetected ? tax.toFixed(2) : '0.00',
      remainingQuantity: remainingAmount,
      note,
    });
  });

  return { report, totalTax};
};

  
const handleCalculateTax = () => {
  const { report, totalTax } = generateTaxReport(); // Destructure to get report and totalTax
  setTaxReport(report);
  setTotalTaxDue(totalTax.toFixed(2)); // Set the total tax due
};
  const calculateTax = (purchasePrice: number, sellPrice: number, amount: number) => {
    if (isNaN(purchasePrice) || isNaN(sellPrice) || isNaN(amount)) {
      console.log('Invalid purchase price');
      console.error("Invalid data for tax calculation", { purchasePrice, sellPrice, amount });
      return NaN;
    }
    console.log('Valid purchase price');
  
    const profit = (sellPrice - purchasePrice) * amount;
    const tax = profit * 0.30; // 30% tax rate on profit
    return tax;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return console.error("No file selected");

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      if (typeof binaryStr === 'string') {
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const transactions = processExcelData(jsonData);
        setTransactions(transactions);
      }
    };
    reader.readAsBinaryString(file);
  };

  const processExcelData = (jsonData: any[][]): any[] => {
    const [headers, ...rows] = jsonData;
    const formattedHeaders = headers.map((header: any) => header.trim().charAt(0).toUpperCase() + header.trim().slice(1));
    return rows.map((row) => {
      const transaction: Record<string, any> = {};
      formattedHeaders.forEach((header, index) => {
        const value = row[index] || '';
        transaction[header] = ['Price', 'Total', 'Amount'].includes(header) ? +value : value; // Convert numeric fields
      });
      return transaction;
    });
  };

  const handleEdit = (transaction: any) => {
    setIsEditing(true);
    setEditedTransaction({ ...transaction });
  };

  const handleSaveEdit = () => {
    if (editedTransaction) {
      const updatedTransactions = [...transactions];
      const index = updatedTransactions.findIndex(
        (t) => t.Date === editedTransaction.Date && t.Market === editedTransaction.Market
      );
      if (index !== -1) {
        updatedTransactions[index] = editedTransaction;
      } else {
        updatedTransactions.push(editedTransaction); // Add as new transaction
      }
      setTransactions(updatedTransactions);
      setIsEditing(false);
      setEditedTransaction(null);
    }
  };

  const handleSaveNewTransaction = () => {
    if (newTransaction.Market && newTransaction.Amount > 0 && newTransaction.Price >= 0) {
      const updatedTransactions = [
        ...transactions,
        { ...newTransaction, Total: newTransaction.Price * newTransaction.Amount },
      ];
      setTransactions(updatedTransactions);
      setFixingMarket(null); // Close the modal
    } else {
      alert("Please fill all fields correctly before saving the transaction.");
    }
    setIsAdding(false);
  };
  
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const target = e.target as HTMLInputElement; // Explicitly cast to HTMLInputElement
    const { value } = target;
  
    setEditedTransaction((prev) => ({
      ...prev!,
      [field]: field === 'Amount' || field === 'Total' ? +value : value, // Convert to number for Quantity and Total
    }));
  };

  const handleDelete = (transaction: any) => {
    const updatedTransactions = transactions.filter(
      (t) => t.Date !== transaction.Date || t.Market !== transaction.Market
    );
    setTransactions(updatedTransactions);
  };

  // const handleCalculateTax = () => {
  //   return transactions.map((transaction, index) => {
  //     const price = +transaction.Price || 0; // Ensure numeric
  //     const total = +transaction.Total || 0; // Ensure numeric
  //     const amount = +transaction.Amount || 0; // Ensure numeric
  
  //     const profit = (total - price) * amount;
  //     const tax = profit * 0.3; // 30% tax rate
  
  //     return {
  //       index: index + 1,
  //       profit: isNaN(profit) ? 0 : profit.toFixed(2),
  //       tax: isNaN(tax) ? 0 : tax.toFixed(2),
  //     };
  //   });
  // };

  return (
    <Box sx={{ padding: 3 }}>
         {/* Back Button */}
         <Button variant="contained" color="primary" onClick={handleBack} sx={{ marginBottom: 2 }}>
        Back to Home
      </Button>
      <Typography variant="h4" gutterBottom align="center">
        Upload Transactions
      </Typography>

      <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
        <Button
          variant="contained"
          component="label"
          color="primary"
          sx={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Choose File
          <input
            type="file"
            accept=".xlsx, .xls"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      {transactions.length > 0 && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Uploaded Transactions
          </Typography>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="transaction table">
              <TableHead>
                <TableRow>
                  {Object.keys(transactions[0]).map((key) => (
                    <TableCell key={key} align="center">{key}</TableCell>
                  ))}
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {transactions.map((transaction, idx) => (
    <TableRow key={idx}>
      {Object.entries(transaction).map(([key, value], index) => {
        let displayValue: React.ReactNode = String(value);
        if (key === 'Type') {
          displayValue = value === 'Sell' ? (
            <span style={{ color: 'red', fontWeight: 'bold' }}>SELL</span>
          ) : value === 'Buy' ? (
            <span style={{ color: 'green', fontWeight: 'bold' }}>BUY</span>
          ) : (
            String(value)
          );
        }
        return (
          <TableCell key={index} align="center">
            {displayValue}
          </TableCell>
        );
      })}
      <TableCell align="center">
        <IconButton onClick={() => handleEdit(transaction)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(transaction)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}

  {/* Add New Transaction Row */}
  <TableRow>
    <TableCell colSpan={Object.keys(transactions[0]).length + 1}>
      <Button variant="contained"
            color="primary"
            onClick={handleIsAdding}
            fullWidth>
        Add New Transaction
      </Button>
      {isAdding && (
        <Grid container spacing={2} sx={{ padding: 2 }}>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Date"
            type="date"
            value={newTransaction.Date}
            onChange={(e) => handleNewTransactionChange('Date', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Market"
            value={newTransaction.Market}
            onChange={(e) => handleNewTransactionChange('Market', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Type"
            select
            value={newTransaction.Type}
            onChange={(e) => handleNewTransactionChange('Type', e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </TextField>
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Amount"
            type="number"
            value={newTransaction.Amount}
            onChange={(e) => handleNewTransactionChange('Amount', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Price"
            type="number"
            value={newTransaction.Price}
            onChange={(e) => handleNewTransactionChange('Price', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            label="Fee"
            type="number"
            value={newTransaction.Fee}
            onChange={(e) => handleNewTransactionChange('Fee', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTransactionNew}
            fullWidth
          >
            Save New Transaction
          </Button>
        </Grid>
      </Grid>
       )}
    </TableCell>
  </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {isEditing && editedTransaction && (
            <Box sx={{ marginTop: 2 }}>
             <Typography variant="h6" gutterBottom>
    Edit Transaction
  </Typography>
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <TextField
        label="Amount"
        type="number"
        value={editedTransaction.Amount}
        onChange={(e) => handleChange(e, 'Amount')}
        fullWidth
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        label="Price"
        type="number"
        value={editedTransaction.Price}
        onChange={(e) => handleChange(e, 'Price')}
        fullWidth
      />
    </Grid>
  </Grid>
  <Button variant="contained" color="primary" onClick={handleSaveEdit} sx={{ marginTop: 2 }}>
    Save Changes
  </Button>
            </Box>
          )}

{fixingMarket && (
  <Box sx={{ marginTop: 4 }}>
    <Typography variant="h6" gutterBottom>
      Fix Transaction for Market: {fixingMarket}
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Type"
          select
          SelectProps={{ native: true }}
          value={newTransaction.Type}
          onChange={(e) => setNewTransaction({ ...newTransaction, Type: e.target.value })}
          fullWidth
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </TextField>
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Amount"
          type="number"
          value={newTransaction.Amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, Amount: +e.target.value })}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Price"
          type="number"
          value={newTransaction.Price}
          onChange={(e) => setNewTransaction({ ...newTransaction, Price: +e.target.value })}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Fee"
          type="number"
          value={newTransaction.Fee}
          onChange={(e) => setNewTransaction({ ...newTransaction, Fee: +e.target.value })}
          fullWidth
        />
      </Grid>
    </Grid>
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleSaveNewTransaction()}
      sx={{ marginTop: 2 }}
    >
      Save Transaction
    </Button>
    <Button
      variant="text"
      color="secondary"
      onClick={() => setFixingMarket(null)}
      sx={{ marginLeft: 2 }}
    >
      Cancel
    </Button>
  </Box>
)}


          <Box sx={{ textAlign: 'center', marginTop: 3 }}>
            <Button variant="contained" color="secondary" onClick={handleCalculateTax}>
              Calculate Tax
            </Button>
          </Box>

          {taxReport.length > 0 && (
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tax Report
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
            <TableRow>
            <TableCell align="center">Transaction</TableCell>
    <TableCell align="center">Market</TableCell>
    <TableCell align="center">Profit</TableCell>
    <TableCell align="center">Tax</TableCell>
    <TableCell align="center">Remaining Quantity</TableCell>
    <TableCell align="center">Note</TableCell>
  </TableRow>
            </TableHead>

            <TableBody>
            {taxReport.map(({ index, market, profit, tax, remainingQuantity, note }) => (
  <TableRow key={index}>
    <TableCell align="center">{index}</TableCell>
    <TableCell align="center">{market}</TableCell>
    <TableCell align="center">{profit}</TableCell>
    <TableCell align="center">{tax}</TableCell>
    <TableCell align="center">{remainingQuantity}</TableCell>
    <TableCell align="center">
      {note}
      {note && (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => handleFixMarket(market)}
          sx={{ marginLeft: 1 }}
        >
          Fix
        </Button>
      )}
    </TableCell>
  </TableRow>
))}

</TableBody>
          </Table>
        </TableContainer>
         {/* Add the total tax due */}
  {taxReport.length > 0 && (
    <Box sx={{ marginTop: 3, textAlign: 'center' }}>
      <Typography variant="h6">Total Tax Due: {totalTaxDue}</Typography>
    </Box>
  )}
            </Box>
    )}
  </Box>
      )}
    </Box>
  );
};

export default UploadTransactions;
