import chalk from 'chalk';

export interface DebugOptions {
  debug?: boolean;
}

export class DebugTimer {
  private startTime: number;
  private stages: { name: string; duration: number }[] = [];
  private currentStage: string | null = null;
  private stageStartTime: number = 0;
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
    this.startTime = Date.now();
  }

  startStage(stageName: string): void {
    if (this.currentStage) {
      this.endStage();
    }
    
    this.currentStage = stageName;
    this.stageStartTime = Date.now();
    
    if (this.debug) {
      console.log(chalk.gray(`🔧 [DEBUG] Starting stage: ${stageName}`));
    }
  }

  endStage(): void {
    if (this.currentStage) {
      const duration = Date.now() - this.stageStartTime;
      this.stages.push({ name: this.currentStage, duration });
      
      if (this.debug) {
        console.log(chalk.gray(`✅ [DEBUG] Completed stage: ${this.currentStage} (${duration}ms)`));
      }
      
      this.currentStage = null;
    }
  }

  showPrompt(prompt: string): void {
    if (this.debug) {
      console.log(chalk.blue('\n📝 [DEBUG] Prompt sent to AI:'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(prompt);
      console.log(chalk.gray('─'.repeat(60)));
    }
  }

  showResponse(response: string): void {
    if (this.debug) {
      console.log(chalk.green('\n🤖 [DEBUG] AI raw response:'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(response);
      console.log(chalk.gray('─'.repeat(60)));
    }
  }

  showSummary(): void {
    if (this.debug) {
      this.endStage(); // 确保当前阶段结束
      
      const totalTime = Date.now() - this.startTime;
      
      console.log(chalk.magenta('\n📊 [DEBUG] Execution timing statistics:'));
      console.log(chalk.gray('─'.repeat(40)));
      
      this.stages.forEach(stage => {
        const percentage = ((stage.duration / totalTime) * 100).toFixed(1);
        console.log(chalk.gray(`  ${stage.name}: ${stage.duration}ms (${percentage}%)`));
      });
      
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.magenta(`  Total time: ${totalTime}ms`));
      console.log();
    }
  }
}