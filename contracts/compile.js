// Compile GenesisMarketplace contract using solc
// Run with: npm install solc && node compile.js

import solc from 'solc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findImports(importPath) {
    // Handle OpenZeppelin imports
    if (importPath.startsWith('@openzeppelin/contracts/')) {
        const contractPath = importPath.replace('@openzeppelin/contracts/', '');
        try {
            const fullPath = path.join(__dirname, '../node_modules/@openzeppelin/contracts', contractPath);
            const content = fs.readFileSync(fullPath, 'utf8');
            return { contents: content };
        } catch (error) {
            console.error(`Import not found: ${importPath}`);
            return { error: `Import not found: ${importPath}` };
        }
    }
    return { error: `Import not found: ${importPath}` };
}

async function compileContract() {
    console.log('📦 Compiling GenesisMarketplace...');
    
    // Read the contract source
    const contractSource = fs.readFileSync(path.join(__dirname, 'GenesisMarketplace.sol'), 'utf8');
    
    // Compilation input
    const input = {
        language: 'Solidity',
        sources: {
            'GenesisMarketplace.sol': {
                content: contractSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            },
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    };
    
    // Compile
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
    
    // Check for errors
    if (output.errors) {
        output.errors.forEach(error => {
            console.error(`${error.severity}: ${error.message}`);
        });
        
        const hasErrors = output.errors.some(error => error.severity === 'error');
        if (hasErrors) {
            throw new Error('Compilation failed');
        }
    }
    
    // Extract compiled contract
    const contract = output.contracts['GenesisMarketplace.sol']['GenesisMarketplace'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;
    
    // Save compilation artifacts
    const artifacts = {
        contractName: 'GenesisMarketplace',
        abi: abi,
        bytecode: bytecode,
        compiledAt: new Date().toISOString()
    };
    
    fs.writeFileSync(path.join(__dirname, 'GenesisMarketplace.json'), JSON.stringify(artifacts, null, 2));
    console.log('✅ Contract compiled successfully!');
    console.log('📄 Artifacts saved to GenesisMarketplace.json');
    
    // Update deploy script with bytecode and ABI
    let deployScript = fs.readFileSync(path.join(__dirname, 'deploy.js'), 'utf8');
    deployScript = deployScript.replace(
        'const MARKETPLACE_BYTECODE = "";',
        `const MARKETPLACE_BYTECODE = "${bytecode}";`
    );
    deployScript = deployScript.replace(
        'const MARKETPLACE_ABI = [];',
        `const MARKETPLACE_ABI = ${JSON.stringify(abi, null, 2)};`
    );
    
    fs.writeFileSync(path.join(__dirname, 'deploy.js'), deployScript);
    console.log('📝 Deploy script updated with compilation artifacts');
    
    return { abi, bytecode };
}

export { compileContract };

// Run compilation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    compileContract()
        .then(() => console.log('\n🎉 Ready for deployment!'))
        .catch(error => {
            console.error('❌ Compilation failed:', error);
            process.exit(1);
        });
}