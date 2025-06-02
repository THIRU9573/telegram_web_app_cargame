const TonWeb = require('tonweb');
const { Address } = TonWeb.utils;



// Example usage:
const walletAddress = 'UQAYExCaeYyPEI8QAGhsDisoV-pqzgVkhHxPoevU5lnGcn07';  // your address here
    const isValid = TonWeb.utils.Address.isValid(walletAddress);
    console.log(isValid,"valid");
    

if (isValid) {
  console.log('Valid TON address!');
} else {
  console.log('Invalid TON address!');
}
