import chalk from 'chalk';
import { createReadlineInterface } from './input.js';

// Dangerous command patterns that require double confirmation
const DANGEROUS_PATTERNS = [
  /rm\s+(-[rf]*\s+)?\//, // rm with root path
  /rm\s+(-[rf]*\s+)?\*/, // rm with wildcard
  /rm\s+-rf/, // rm -rf
  /sudo\s+rm/, // sudo rm
  /dd\s+if=/, // dd command
  /mkfs/, // format filesystem
  /fdisk/, // disk partitioning
  /parted/, // disk partitioning
  /wipefs/, // wipe filesystem
  /shred/, // secure delete
  /:\(\)\{\s*:\|\:&\s*\}/, // fork bomb
  />\s*\/dev\/sd[a-z]/, // write to disk device
  /chmod\s+777/, // dangerous permissions
  /chown\s+.*\//, // change ownership of root paths
  /truncate.*\//, // truncate system files
  />\s*\/etc\//, // overwrite system config
  />\s*\/boot\//, // overwrite boot files
  />\s*\/usr\//, // overwrite system files
  />\s*\/var\//, // overwrite system files
];

// Commands that typically require elevated privileges
const PRIVILEGE_PATTERNS = [
  /^sudo\s+/, // already has sudo
  /^su\s+/, // switch user
  /systemctl/, // systemd service management
  /service\s+/, // service management
  /mount\s+/, // mount filesystems
  /umount\s+/, // unmount filesystems
  /iptables/, // firewall rules
  /ufw\s+/, // uncomplicated firewall
  /apt\s+(install|remove|update|upgrade)/, // package management
  /yum\s+(install|remove|update)/, // package management
  /dnf\s+(install|remove|update)/, // package management
  /pacman\s+-S/, // package management
  /brew\s+install/, // homebrew (usually doesn't need sudo)
  /chown\s+/, // change ownership
  /chmod\s+/, // change permissions (some cases)
  /passwd/, // change password
  /useradd/, // add user
  /userdel/, // delete user
  /groupadd/, // add group
  /crontab\s+-e/, // edit cron jobs
];

export function isDangerousCommand(command: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(command));
}

export function requiresPrivileges(command: string): boolean {
  // Skip if already has sudo
  if (command.trim().startsWith('sudo ')) {
    return false;
  }
  
  return PRIVILEGE_PATTERNS.some(pattern => pattern.test(command));
}

export function isCurrentUserPrivileged(): boolean {
  // Check if running as root/administrator
  if (process.getuid && process.getuid() === 0) {
    return true;
  }
  
  // On Windows, check if running as administrator (simplified check)
  if (process.platform === 'win32') {
    // This is a simplified check - in practice, you'd need more sophisticated detection
    return process.env.USERNAME === 'Administrator' || 
           process.env.USERDOMAIN === 'NT AUTHORITY';
  }
  
  return false;
}

export async function confirmDangerousOperation(command: string): Promise<boolean> {
  console.log(chalk.red('\n⚠️  DANGEROUS OPERATION DETECTED!'));
  console.log(chalk.yellow('This command may cause irreversible damage to your system:'));
  console.log(chalk.cyan(command));
  console.log();
  console.log(chalk.red('Are you absolutely sure you want to execute this command?'));
  console.log(chalk.gray('This is your final warning before execution.'));
  
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    
    rl.question(chalk.red('\nType "YES I AM SURE" to confirm (anything else will cancel): '), (answer) => {
      rl.close();
      
      const confirmed = answer.trim() === 'YES I AM SURE';
      if (confirmed) {
        console.log(chalk.yellow('\n⚠️  Proceeding with dangerous operation...'));
      } else {
        console.log(chalk.green('\n✅ Operation cancelled for safety.'));
      }
      
      resolve(confirmed);
    });
  });
}

export function suggestPrivilegeEscalation(command: string, systemInfo: any): string {
  if (systemInfo.platform === 'win32') {
    return `Run as Administrator: ${command}`;
  } else {
    return `sudo ${command}`;
  }
}