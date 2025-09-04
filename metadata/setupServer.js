const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Serve metadata files
app.get('/genesis/:tokenId', (req, res) => {
    const tokenId = parseInt(req.params.tokenId);
    
    if (!tokenId || tokenId < 1 || tokenId > 100) {
        return res.status(404).json({ error: 'Token ID must be between 1 and 100' });
    }
    
    const metadataPath = path.join(__dirname, 'json', `${tokenId}.json`);
    
    if (!fs.existsSync(metadataPath)) {
        return res.status(404).json({ error: 'Metadata not found' });
    }
    
    try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        res.json(metadata);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read metadata' });
    }
});

// Serve placeholder images  
app.get('/genesis/images/:tokenId.png', (req, res) => {
    const tokenId = parseInt(req.params.tokenId);
    
    if (!tokenId || tokenId < 1 || tokenId > 100) {
        return res.status(404).json({ error: 'Invalid token ID' });
    }
    
    // Check if actual image exists first
    const imagePath = path.join(__dirname, 'images', `${tokenId}.png`);
    if (fs.existsSync(imagePath)) {
        res.setHeader('Content-Type', 'image/png');
        res.sendFile(imagePath);
        return;
    }
    
    // Return a simple HTML page that can be screenshotted to create images
    const tier = tokenId <= 5 ? 'Ultra Rare' : 
                 tokenId <= 15 ? 'Legendary' : 
                 tokenId <= 30 ? 'Epic' : 'Genesis';
                 
    const gradient = tokenId <= 5 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                    tokenId <= 15 ? 'linear-gradient(135deg, #9932CC, #8A2BE2)' :
                    tokenId <= 30 ? 'linear-gradient(135deg, #FF6347, #FF4500)' :
                    'linear-gradient(135deg, #667eea, #764ba2)';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Genesis NFT #${tokenId}</title>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                width: 400px; 
                height: 400px;
                background: linear-gradient(135deg, #1a1a2e, #16213e); 
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .nft-card { 
                width: 360px; 
                height: 360px; 
                background: ${gradient};
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: Arial, sans-serif;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                position: relative;
            }
            .crown { 
                font-size: 60px; 
                margin-bottom: 20px; 
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            .title { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 10px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }
            .subtitle { 
                font-size: 18px; 
                opacity: 0.9;
                margin-bottom: 20px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }
            .tier { 
                background: rgba(255,255,255,0.2); 
                padding: 8px 16px; 
                border-radius: 12px; 
                font-weight: bold;
                text-shadow: none;
            }
            .hvna-logo {
                position: absolute;
                bottom: 20px;
                right: 20px;
                font-size: 12px;
                opacity: 0.7;
            }
        </style>
    </head>
    <body>
        <div class="nft-card">
            <div class="crown">${tokenId <= 5 ? '👑' : tokenId <= 15 ? '🏆' : tokenId <= 30 ? '⭐' : '🐘'}</div>
            <div class="title">Genesis Elephant</div>
            <div class="subtitle">#${tokenId}</div>
            <div class="tier">${tier}</div>
            <div class="hvna-logo">HVNA</div>
        </div>
    </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// Collection info
app.get('/genesis/collection', (req, res) => {
    const collectionPath = path.join(__dirname, 'collection.json');
    
    if (!fs.existsSync(collectionPath)) {
        return res.status(404).json({ error: 'Collection info not found' });
    }
    
    try {
        const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read collection info' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Genesis NFT Metadata Server',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log('🚀 Genesis NFT Metadata Server Started');
    console.log('=' .repeat(40));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Metadata URL: http://localhost:${PORT}/genesis/{tokenId}`);
    console.log(`✅ Images URL: http://localhost:${PORT}/genesis/images/{tokenId}.png`);
    console.log(`✅ Collection URL: http://localhost:${PORT}/genesis/collection`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log('\n📝 Test URLs:');
    console.log(`   http://localhost:${PORT}/genesis/1`);
    console.log(`   http://localhost:${PORT}/genesis/images/1.png`);
    console.log('\n🔗 Ready to set as contract baseURI');
});