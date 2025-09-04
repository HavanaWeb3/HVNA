const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generateNFTImages() {
    console.log('🎨 Generating Genesis NFT Images');
    console.log('='.repeat(40));
    
    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 400 });
    
    for (let tokenId = 1; tokenId <= 100; tokenId++) {
        try {
            console.log(`Generating image for Genesis NFT #${tokenId}...`);
            
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
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        width: 400px; 
                        height: 400px;
                        background: linear-gradient(135deg, #1a1a2e, #16213e); 
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: 'Arial', sans-serif;
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
                        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                        position: relative;
                        border: 2px solid rgba(255,255,255,0.1);
                    }
                    .crown { 
                        font-size: 80px; 
                        margin-bottom: 25px; 
                        text-shadow: 3px 3px 6px rgba(0,0,0,0.6);
                        filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
                    }
                    .title { 
                        font-size: 28px; 
                        font-weight: bold; 
                        margin-bottom: 12px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
                        text-align: center;
                    }
                    .subtitle { 
                        font-size: 22px; 
                        opacity: 0.95;
                        margin-bottom: 25px;
                        text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
                        font-weight: bold;
                    }
                    .tier { 
                        background: rgba(255,255,255,0.25); 
                        padding: 10px 20px; 
                        border-radius: 15px; 
                        font-weight: bold;
                        font-size: 16px;
                        text-shadow: none;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255,255,255,0.2);
                    }
                    .hvna-logo {
                        position: absolute;
                        bottom: 15px;
                        right: 20px;
                        font-size: 14px;
                        opacity: 0.8;
                        font-weight: bold;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    }
                    .id-badge {
                        position: absolute;
                        top: 15px;
                        left: 20px;
                        background: rgba(0,0,0,0.4);
                        padding: 5px 10px;
                        border-radius: 8px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="nft-card">
                    <div class="id-badge">#${tokenId}</div>
                    <div class="crown">${tokenId <= 5 ? '👑' : tokenId <= 15 ? '🏆' : tokenId <= 30 ? '⭐' : '🐘'}</div>
                    <div class="title">Genesis Elephant</div>
                    <div class="subtitle">${tier}</div>
                    <div class="hvna-logo">HVNA</div>
                </div>
            </body>
            </html>
            `;
            
            await page.setContent(html);
            await page.waitForTimeout(100);
            
            const screenshot = await page.screenshot({
                type: 'png',
                omitBackground: false
            });
            
            const imagePath = path.join(imagesDir, `${tokenId}.png`);
            fs.writeFileSync(imagePath, screenshot);
            
            if (tokenId % 10 === 0 || tokenId <= 5) {
                console.log(`✅ Generated image for Genesis #${tokenId} (${tier})`);
            }
            
        } catch (error) {
            console.log(`❌ Failed to generate image for #${tokenId}:`, error.message);
        }
    }
    
    await browser.close();
    
    console.log('\n🎉 Image Generation Complete!');
    console.log(`✅ Generated 100 Genesis NFT images`);
    console.log(`✅ Images saved to: ${imagesDir}`);
}

// Check if we have puppeteer
try {
    require('puppeteer');
    generateNFTImages().catch(console.error);
} catch (error) {
    console.log('❌ Puppeteer not installed');
    console.log('📦 Installing puppeteer...');
    console.log('Run: npm install puppeteer');
    console.log('Then run this script again');
}