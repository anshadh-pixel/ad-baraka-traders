import { spawn } from 'child_process';
import path from 'path';

const email = 'adbarakatraders.app@gmail.com';
const password = 'AdBarakaTradersPass2026!';
const domain = 'ad-baraka-traders.surge.sh';
const distPath = './dist';

console.log(`Starting surge deployment for ${distPath} to ${domain}...`);

const surge = spawn('npx', ['surge', './dist', domain], {
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

surge.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);

  if (str.toLowerCase().includes('email:')) {
    console.log(`\n[Sending email: ${email}]`);
    surge.stdin.write(email + '\n');
  } else if (str.toLowerCase().includes('password:')) {
    console.log(`\n[Sending password]`);
    surge.stdin.write(password + '\n');
  }
});

surge.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

surge.on('close', (code) => {
  console.log(`\nSurge process exited with code ${code}`);
});
