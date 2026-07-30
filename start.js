const { spawn, exec } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || '3000';
const serverPath = path.join(__dirname, 'server.js');
const url = `http://localhost:${PORT}`;

const server = spawn(process.execPath, [serverPath], {
  stdio: 'inherit',
  env: Object.assign({}, process.env, { PORT })
});

server.on('error', (err) => {
  console.error('启动后端服务失败：', err);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (signal) {
    console.log(`后端服务因信号 ${signal} 退出。`);
  } else {
    console.log(`后端服务退出，代码 ${code}。`);
  }
  process.exit(code);
});

function openBrowser(targetUrl) {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open "${targetUrl}"`;
  } else if (platform === 'win32') {
    command = `start "" "${targetUrl}"`;
  } else {
    command = `xdg-open "${targetUrl}"`;
  }

  exec(command, (err) => {
    if (err) {
      console.log('自动打开浏览器失败，请手动访问：', targetUrl);
    }
  });
}

// Wait a moment for the server to start before opening the browser.
setTimeout(() => {
  console.log(`正在打开浏览器：${url}`);
  openBrowser(url);
}, 1000);
