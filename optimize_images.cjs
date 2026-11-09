const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetImages = [
  {
    id: 'creator-intro-showreel',
    key: 'intro_showreel_poster',
    title: 'Intro Showreel Poster',
    url: 'https://yeviauqxuwbovkrqzzzh.supabase.co/storage/v1/object/sign/thumbnails/1793961085457_px2e4o.jpeg?token=eyJraWQiOiIzMGM3ZmZjMy03NjEwLTQ4YmMtOGQwNy01NzdkZjM0MDg1NmYiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0aHVtYm5haWxzLzE3OTM5NjEwODU0NTdfcHgyZTRvLmpwZWciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkzOTg4NDE4LCJleHAiOjIxMDkzNDg0MTh9.hnmfqkE0X19EtAuorw5dnnnEDoV_rg9zMLx8jvKJ3cGKxyA8p2PQ3SczwPzbJMafmTAeu_hxZuugOIXNs47rLw'
  },
  {
    id: '58afc2c5-221f-4abd-8427-8497b6492037',
    key: 'luxury_perfume',
    title: 'Luxury Perfume 3D Animation Thumbnail',
    url: 'https://yeviauqxuwbovkrqzzzh.supabase.co/storage/v1/object/sign/thumbnails/1793961055579_3n40mt.jpeg?token=eyJraWQiOiIzMGM3ZmZjMy03NjEwLTQ4YmMtOGQwNy01NzdkZjM0MDg1NmYiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0aHVtYm5haWxzLzE3OTM5NjEwNTU1NzlfM240MG10LmpwZWciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkzOTg4NDE4LCJleHAiOjIxMDkzNDg0MTh9.vO7_3RMP3r35zuH629wRCKS4uAljVqszkQppcJtvQU4ngJsXUOQPXEhRYss7d2eVa2874MUCFlhyjKocNZZ-aw'
  },
  {
    id: 'e42ec56e-ae9d-40dd-b20d-38b6ef1131e0',
    key: 'luxury_jewellery',
    title: 'Luxury Jewellery 3D Animation Thumbnail',
    url: 'https://yeviauqxuwbovkrqzzzh.supabase.co/storage/v1/object/sign/thumbnails/1793960780838_pxms7l.jpeg?token=eyJraWQiOiIzMGM3ZmZjMy03NjEwLTQ4YmMtOGQwNy01NzdkZjM0MDg1NmYiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0aHVtYm5haWxzLzE3OTM5NjA3ODA4MzhfcHhtczdsLmpwZWciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkzOTg4NDE4LCJleHAiOjIxMDkzNDg0MTh9.bywCU2A6RP1IPpbuSyoUMwn5CL4iH1BlEBqFBmMunAZzZouACv4uL10-vN0yMcygpt6pi9iN9KSZGa5V7fFgFQ'
  },
  {
    id: '5ccfbbc0-f9d3-460f-a066-9623360157c4',
    key: 'rainy_serenity',
    title: 'Rainy Serenity 3D Nature Animation Thumbnail',
    url: 'https://yeviauqxuwbovkrqzzzh.supabase.co/storage/v1/object/sign/thumbnails/1793960709158_ip6yh4.jpeg?token=eyJraWQiOiIzMGM3ZmZjMy03NjEwLTQ4YmMtOGQwNy01NzdkZjM0MDg1NmYiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0aHVtYm5haWxzLzE3OTM5NjA3MDkxNThfaXA2eWg0LmpwZWciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkzOTg4NDE4LCJleHAiOjIxMDkzNDg0MTh9.hb8y9TFTlX4GmSuSnz_ojKzeUUkAa7BBCYn2bdn2QRkoawNBqmueSrJaEtdR0wiSudyojK07vjBBI10jcbWnkA'
  },
  {
    id: 'e229a50b-8170-45ca-8b9a-bf0e9bf6c37e',
    key: 'meta_glasses',
    title: 'Meta Glasses (9:16 Vertical Reel Thumbnail)',
    url: 'https://yeviauqxuwbovkrqzzzh.supabase.co/storage/v1/object/sign/thumbnails/1793960536575_rvur5p.jpeg?token=eyJraWQiOiIzMGM3ZmZjMy03NjEwLTQ4YmMtOGQwNy01NzdkZjM0MDg1NmYiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0aHVtYm5haWxzLzE3OTM5NjA1MzY1NzVfcnZ1cjVwLmpwZWciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkzOTg4NDE4LCJleHAiOjIxMDkzNDg0MTh9.4gMo9Co30SHEUu0dlrycuzuxWWifUk_roSz39YfflrNgoGmvImSlf4fZDpwoUurGAsE9Aj3TDtPI6ikHUj5Z5w'
  },
  {
    id: 'dbbc5d37-e7de-4608-b236-4a9996d48cea',
    key: 'boat_nirvana',
    title: 'BoAt Nirvana Ion ANC (9:16 Vertical Reel Thumbnail)',
    url: 'https://yeviauqxuwbovkrqzzzh.supabase.co/storage/v1/object/sign/thumbnails/1793960635207_ramddl.jpeg?token=eyJraWQiOiIzMGM3ZmZjMy03NjEwLTQ4YmMtOGQwNy01NzdkZjM0MDg1NmYiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0aHVtYm5haWxzLzE3OTM5NjA2MzUyMDdfcmFtZGRsLmpwZWciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkzOTg4NDE4LCJleHAiOjIxMDkzNDg0MTh9.z6lDWcuZ8dfvEMTnMjNRoIsmVrdKAESMGVRWcW1xpQzg44RWfkMcTv7LUJXdYYm3E8OFiTk78LM0u65L5GhUVA'
  }
];

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function optimizeAll() {
  const outputDir = path.join(__dirname, 'optimized_thumbnails');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const results = [];

  for (const item of targetImages) {
    console.log(`Downloading and converting ${item.title}...`);
    const originalBuf = await downloadBuffer(item.url);
    const origSize = originalBuf.length;

    // Convert to WebP preserving quality (quality: 85, effort: 6)
    const webpBuf = await sharp(originalBuf)
      .webp({ quality: 85, effort: 6 })
      .toBuffer();

    const webpSize = webpBuf.length;
    const savingsPercent = (((origSize - webpSize) / origSize) * 100).toFixed(1);

    const outPath = path.join(outputDir, `${item.key}.webp`);
    fs.writeFileSync(outPath, webpBuf);

    console.log(`  Original JPEG: ${(origSize / 1024).toFixed(2)} KB`);
    console.log(`  Optimized WebP: ${(webpSize / 1024).toFixed(2)} KB (-${savingsPercent}%)`);

    results.push({
      ...item,
      origSize,
      webpSize,
      savingsPercent,
      outPath
    });
  }

  console.log('\n--- ALL CONVERSIONS COMPLETE ---');
  console.table(results.map(r => ({
    Title: r.title,
    'Orig (KB)': (r.origSize / 1024).toFixed(1),
    'WebP (KB)': (r.webpSize / 1024).toFixed(1),
    'Reduction': `${r.savingsPercent}%`
  })));
}

optimizeAll().catch(console.error);
