import * as readline from 'readline';

export interface UserChoice {
  action: 'execute' | 'exit' | 'change';
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
    
    rl.question('\nPlease choose (Enter/N/C): ', (answer) => {
      rl.close();
      
      const input = answer.trim().toLowerCase();
      
      if (input === 'n') {
        resolve({ action: 'exit' });
      } else if (input === 'c') {
        resolve({ action: 'change' });
      } else {
        // Default is execute (including Enter and other inputs)
        resolve({ action: 'execute' });
      }
    });
  });
}