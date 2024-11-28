export const calculateSpotTaxForTransactions = (
    transactions: { sellingPrice: number; purchasePrice: number; tdsPaid: number }[],
    surchargeRate: number = 0
  ) => {
    let totalProfit = 0;
    let totalTdsPaid = 0;
  
    transactions.forEach(({ sellingPrice, purchasePrice, tdsPaid }) => {
      totalProfit += sellingPrice - purchasePrice;
      totalTdsPaid += tdsPaid;
    });
  
    const taxLiability = totalProfit * 0.3; // 30% tax
    const surcharge = taxLiability * (surchargeRate / 100);
    const cess = (taxLiability + surcharge) * 0.04; // 4% cess
    const totalTax = taxLiability + surcharge + cess;
    const taxPayable = totalTax - totalTdsPaid;
  
    return { totalProfit, taxLiability, surcharge, cess, taxPayable };
  };
  