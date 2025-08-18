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
    
    console.log('\n选择操作:');
    console.log('  回车键 - 执行命令');
    console.log('  N - 退出');
    console.log('  C - 换个答案');
    
    rl.question('\n请选择 (回车/N/C): ', (answer) => {
      rl.close();
      
      const input = answer.trim().toLowerCase();
      
      if (input === 'n') {
        resolve({ action: 'exit' });
      } else if (input === 'c') {
        resolve({ action: 'change' });
      } else {
        // 默认是执行（包括回车和其他输入）
        resolve({ action: 'execute' });
      }
    });
  });
}