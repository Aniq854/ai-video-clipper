const fs = require('fs');
const path = require('path');
const https = require('https');

const binDir = path.join(__dirname, 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

const ytdlpPath = path.join(binDir, 'yt-dlp');

console.log('Downloading yt-dlp binary for Linux...');
const file = fs.createWriteStream(ytdlpPath);

function download(url) {
  https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      download(response.headers.location);
      return;
    }

    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('✅ yt-dlp downloaded successfully.');
      try {
        fs.chmodSync(ytdlpPath, '755');
        console.log('✅ Made yt-dlp executable.');
      } catch (err) {
        console.error('❌ Failed to chmod yt-dlp:', err);
      }
    });
  }).on('error', (err) => {
    try { fs.unlinkSync(ytdlpPath); } catch (e) {}
    console.error('❌ Error downloading yt-dlp:', err.message);
  });
}

download('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp');
