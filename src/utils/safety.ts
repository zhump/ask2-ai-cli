import chalk from 'chalk';
import { createReadlineInterface } from './input.js';

// Dangerous command patterns that require double confirmation
const DANGEROUS_PATTERNS = [
  // rm commands - various dangerous patterns
  /^rm\s+/, // Any rm command (all deletions should be confirmed)
  /sudo\s+rm/, // sudo rm

  // Other dangerous file operations
  /find\s+.*-delete/, // find with -delete
  /find\s+.*-exec\s+rm/, // find with rm execution
  /xargs\s+rm/, // xargs rm combination

  // System-level dangerous operations
  /dd\s+if=/, // dd command
  /mkfs/, // format filesystem
  /fdisk/, // disk partitioning
  /parted/, // disk partitioning
  /wipefs/, // wipe filesystem
  /shred/, // secure delete
  /:\(\)\{\s*:\|\:&\s*\}/, // fork bomb

  // Dangerous redirections to system locations
  />\s*\/dev\/sd[a-z]/, // write to disk device
  />\s*\/etc\//, // overwrite system config
  />\s*\/boot\//, // overwrite boot files
  />\s*\/usr\//, // overwrite system files
  />\s*\/var\/log\//, // overwrite system logs
  />\s*\/proc\//, // write to proc filesystem
  />\s*\/sys\//, // write to sys filesystem

  // Dangerous permissions
  /chmod\s+777/, // dangerous permissions
  /chmod\s+-R\s+777/, // recursive dangerous permissions
  /chown\s+root/, // change ownership to root
  /chown\s+.*:.*\//, // change ownership of system paths

  // File truncation of system files
  /truncate.*\/etc\//, // truncate system config
  /truncate.*\/var\//, // truncate system files
  /truncate.*\/usr\//, // truncate system files

  // Mass file operations
  /rm\s+.*\*/, // rm with wildcards
  /rm\s+-rf/, // recursive force delete
  /rm\s+-r/, // recursive delete
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

    // Allow pressing Enter to confirm (empty input) or typing the explicit phrase
    rl.question(chalk.red('\nPress Enter to confirm explicitly (anything else will cancel): '), (answer) => {
      rl.close();

      const trimmed = answer.trim();
      const confirmed = trimmed === '';

      if (confirmed) {
        if (trimmed === '') {
          console.log(chalk.yellow('\n⚠️  Proceeding with dangerous operation (confirmed by Enter)...'));
        }
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