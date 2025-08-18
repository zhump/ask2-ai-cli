import * as readline from 'readline';

export interface UserChoice {
  action: 'execute' | 'exit' | 'change' | 'explain';
}

export function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

export function askUserChoice(): Promise<UserChoice> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();

    console.log('\nChoose action:');
    console.log('  Enter - Execute command');
    console.log('  N - Exit');
    console.log('  C - Change answer');
    console.log('  E - Explain command');

    rl.question('\nPlease choose (Enter/N/C/E): ', (answer) => {
      rl.close();

      const input = answer.trim().toLowerCase();

      if (input === 'n') {
        resolve({ action: 'exit' });
      } else if (input === 'c') {
        resolve({ action: 'change' });
      } else if (input === 'e') {
        resolve({ action: 'explain' });
      } else {
        // Default is execute (including Enter and other inputs)
        resolve({ action: 'execute' });
      }
    });
  });
}