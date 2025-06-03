import TonWeb from 'tonweb';

// Create TonWeb instance
const tonweb = new TonWeb();

const testnetAddress = "0QC8nhhrL-wRFfCHDIj5MRhh8Et_k-KqRBvfKOYOFnPQzi9R";

// Check if address is valid
const isValid = TonWeb.utils.Address.isValid(testnetAddress);
if (!isValid) {
    console.log("Invalid TON wallet address");
} else {
    console.log("Valid address");
    
    // Check network type based on first character
    const firstChar = testnetAddress.charAt(0);
    
    // According to TEP-2:
    // E... (bounceable, mainnet)
    // U... (non-bounceable, mainnet) 
    // k... (bounceable, testnet)
    // 0... (non-bounceable, testnet)
    
    if (firstChar === 'k' || firstChar === '0') {
        console.log("This is a testnet address");
    } else if (firstChar === 'E' || firstChar === 'U') {
        console.log("This is a mainnet address");
    } else {
        console.log("Unknown network type");
    }
    
    // Check if address is bounceable
    if (firstChar === 'E' || firstChar === 'k') {
        console.log("This is a bounceable address");
    } else if (firstChar === 'U' || firstChar === '0') {
        console.log("This is a non-bounceable address");
    }
}


