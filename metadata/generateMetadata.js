const fs = require('fs');
const path = require('path');

// Create metadata directory if it doesn't exist
const metadataDir = path.join(__dirname, 'json');
const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

console.log("🎨 Generating Genesis NFT Metadata");
console.log("=".repeat(40));

// Genesis NFT traits and rarities
const traits = {
    background: [
        { name: "Golden Sunset", rarity: 5 },
        { name: "Royal Purple", rarity: 10 },
        { name: "Diamond Blue", rarity: 15 },
        { name: "Emerald Green", rarity: 20 },
        { name: "Silver Mist", rarity: 50 }
    ],
    body: [
        { name: "Platinum Elephant", rarity: 5 },
        { name: "Golden Elephant", rarity: 15 },
        { name: "Diamond Elephant", rarity: 25 },
        { name: "Silver Elephant", rarity: 55 }
    ],
    eyes: [
        { name: "Laser Eyes", rarity: 1 },
        { name: "Diamond Eyes", rarity: 4 },
        { name: "Golden Eyes", rarity: 10 },
        { name: "Sapphire Eyes", rarity: 15 },
        { name: "Emerald Eyes", rarity: 20 },
        { name: "Ruby Eyes", rarity: 50 }
    ],
    crown: [
        { name: "Genesis Crown", rarity: 1 },
        { name: "Royal Crown", rarity: 9 },
        { name: "Golden Crown", rarity: 20 },
        { name: "Silver Crown", rarity: 70 }
    ],
    accessory: [
        { name: "HVNA Chain", rarity: 15 },
        { name: "Diamond Ring", rarity: 10 },
        { name: "Golden Tusk", rarity: 25 },
        { name: "Silver Badge", rarity: 50 }
    ]
};

// Generate random trait with rarity
function selectRandomTrait(traitArray) {
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const trait of traitArray) {
        cumulative += trait.rarity;
        if (rand <= cumulative) {
            return trait.name;
        }
    }
    return traitArray[traitArray.length - 1].name;
}

// Determine tier based on token ID
function getTier(tokenId) {
    if (tokenId <= 5) return { name: "Ultra Rare", price: "2.5 ETH" };
    if (tokenId <= 15) return { name: "Legendary", price: "2.0 ETH" };
    if (tokenId <= 30) return { name: "Epic", price: "1.5 ETH" };
    return { name: "Genesis", price: "1.0 ETH" };
}

// Generate metadata for each Genesis NFT (1-100)
for (let tokenId = 1; tokenId <= 100; tokenId++) {
    const tier = getTier(tokenId);
    
    // Generate unique traits for this NFT
    const nftTraits = {
        background: selectRandomTrait(traits.background),
        body: selectRandomTrait(traits.body),
        eyes: selectRandomTrait(traits.eyes),
        crown: selectRandomTrait(traits.crown),
        accessory: selectRandomTrait(traits.accessory)
    };
    
    // Create special traits for ultra rare NFTs
    if (tokenId <= 5) {
        nftTraits.crown = "Genesis Crown";
        nftTraits.eyes = tokenId === 1 ? "Laser Eyes" : "Diamond Eyes";
    }
    
    const metadata = {
        name: `Genesis Elephant #${tokenId}`,
        description: `Genesis Elephant #${tokenId} - ${tier.name} tier. One of only 100 Genesis NFTs in the Boldly Elephunky collection. Grants 30% lifetime discount on all Havana Elephant Brand products and exclusive founder benefits. This NFT represents true ownership in the HVNA ecosystem.`,
        image: `http://localhost:3001/genesis/images/${tokenId}.png`,
        external_url: "https://havanaelephant.com/genesis",
        background_color: "1a1a2e",
        attributes: [
            {
                trait_type: "Collection",
                value: "Genesis"
            },
            {
                trait_type: "Tier",
                value: tier.name
            },
            {
                trait_type: "Mint Price",
                value: tier.price
            },
            {
                trait_type: "Discount Benefit",
                value: "30%"
            },
            {
                trait_type: "Background",
                value: nftTraits.background
            },
            {
                trait_type: "Body",
                value: nftTraits.body
            },
            {
                trait_type: "Eyes",
                value: nftTraits.eyes
            },
            {
                trait_type: "Crown",
                value: nftTraits.crown
            },
            {
                trait_type: "Accessory",
                value: nftTraits.accessory
            },
            {
                trait_type: "Generation",
                value: "Genesis",
                max_value: 1
            },
            {
                display_type: "number",
                trait_type: "Token ID",
                value: tokenId,
                max_value: 100
            }
        ],
        properties: {
            category: "NFT",
            collection: "Boldly Elephunky Genesis",
            creator: "Havana Elephant Brand"
        }
    };
    
    // Add special properties for ultra rare NFTs
    if (tokenId <= 5) {
        metadata.attributes.push({
            trait_type: "Special",
            value: "Founder Genesis"
        });
    }
    
    // Write metadata file
    const filename = `${tokenId}.json`;
    const filepath = path.join(metadataDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
    
    if (tokenId % 20 === 0 || tokenId <= 5) {
        console.log(`✅ Generated metadata for Genesis #${tokenId} (${tier.name})`);
    }
}

// Create a sample manifest file
const manifest = {
    name: "Boldly Elephunky Genesis Collection",
    description: "The original 100 Genesis NFTs of the Boldly Elephunky collection. Each Genesis NFT grants 30% lifetime discounts and exclusive founder benefits.",
    image: "https://api.boldlyelephunky.com/genesis/collection.png",
    external_link: "https://havanaelephant.com/genesis",
    seller_fee_basis_points: 500, // 5% royalty
    fee_recipient: "0x4844382d686CE775e095315C084d40cEd16d8Cf5"
};

fs.writeFileSync(path.join(__dirname, 'collection.json'), JSON.stringify(manifest, null, 2));

console.log("\n🎉 Metadata Generation Complete!");
console.log("=".repeat(40));
console.log("✅ Generated 100 Genesis NFT metadata files");
console.log("✅ Created collection manifest");
console.log("✅ Files saved to:", metadataDir);
console.log("\n📝 Next Steps:");
console.log("1. Upload metadata to IPFS or web server");
console.log("2. Upload/generate NFT images");
console.log("3. Update contract baseURI");
console.log("4. Test on OpenSea");

// Generate a simple image placeholder template
const imagePlaceholder = `
<!DOCTYPE html>
<html>
<head>
    <title>Genesis NFT Placeholder</title>
    <style>
        body { margin: 0; padding: 20px; background: linear-gradient(135deg, #1a1a2e, #16213e); }
        .nft-card { 
            width: 400px; 
            height: 400px; 
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .crown { font-size: 60px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 16px; opacity: 0.9; }
        .tier { 
            background: rgba(255,255,255,0.2); 
            padding: 8px 16px; 
            border-radius: 12px; 
            margin-top: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="nft-card">
        <div class="crown">👑</div>
        <div class="title">Genesis Elephant</div>
        <div class="subtitle">#{{TOKEN_ID}}</div>
        <div class="tier">{{TIER}}</div>
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'image-template.html'), imagePlaceholder);
console.log("✅ Created image placeholder template");