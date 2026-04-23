// ============================================================
// AUSTRALIS – Portugol Debugger
// Modo passo a passo com breakpoints e inspeção de variáveis
// ============================================================

import { ProgramNode } from "../parser/ast";
import { PortugolValue } from "../interpreter/environment";
import { Interpreter, IOInterface, StepInfo } from "../interpreter/interpreter";

export type DebuggerState = "idle" | "running" | "paused" | "finished" | "error";

export interface DebuggerEvent {
  type: "step" | "breakpoint" | "finished" | "error" | "output";
  line?: number;
  variables?: Record<string, PortugolValue>;
  output?: string;
  error?: string;
}

export class PortugolDebugger {
  private interpreter: Interpreter;
  private state: DebuggerState = "idle";
  private stepQueue: Array<() => void> = [];
  private output = "";
  private eventListeners: Array<(event: DebuggerEvent) => void> = [];
  public breakpoints: Set<number> = new Set();

  constructor(private io: IOInterface) {
    this.interpreter = new Interpreter(io);
  }

  // =============================================
  // Event system
  // =============================================
  on(listener: (event: DebuggerEvent) => void): void {
    this.eventListeners.push(listener);
  }

  private emit(event: DebuggerEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }

  // =============================================
  // Breakpoint management
  // =============================================
  addBreakpoint(line: number): void {
    this.breakpoints.add(line);
    this.interpreter.breakpoints.add(line);
  }

  removeBreakpoint(line: number): void {
    this.breakpoints.delete(line);
    this.interpreter.breakpoints.delete(line);
  }

  clearBreakpoints(): void {
    this.breakpoints.clear();
    this.interpreter.breakpoints.clear();
  }

  // =============================================
  // Execution control
  // =============================================
  async start(program: ProgramNode): Promise<void> {
    this.state = "running";
    this.output = "";

    // Intercept I/O for output events
    const originalWrite = this.io.write.bind(this.io);
    const debugIO: IOInterface = {
      write: (text: string) => {
        this.output += text;
        this.emit({ type: "output", output: text });
        originalWrite(text);
      },
      read: this.io.read.bind(this.io),
    };

    const dbgInterpreter = new Interpreter(debugIO);
    dbgInterpreter.breakpoints = this.interpreter.breakpoints;

    dbgInterpreter.onStep = async (info: StepInfo) => {
      this.state = "paused";
      this.emit({
        type: this.breakpoints.has(info.line) ? "breakpoint" : "step",
        line: info.line,
        variables: info.variables,
        output: info.output,
      });
      // Wait for resume signal
      await this.waitForResume();
      this.state = "running";
    };

    try {
      await dbgInterpreter.execute(program);
      this.state = "finished";
      this.emit({ type: "finished", output: this.output });
    } catch (e) {
      this.state = "error";
      this.emit({ type: "error", error: (e as Error).message });
    }
  }

  // =============================================
  // Step control (called from UI)
  // =============================================
  stepInto(): void {
    if (this.state === "paused") {
      this.interpreter.paused = true;
      this.resolveStep();
    }
  }

  stepOver(): void {
    if (this.state === "paused") {
      this.interpreter.paused = false;
      this.resolveStep();
    }
  }

  continue(): void {
    if (this.state === "paused") {
      this.interpreter.paused = false;
      this.resolveStep();
    }
  }

  pause(): void {
    this.interpreter.paused = true;
  }

  stop(): void {
    this.state = "finished";
    this.resolveStep();
  }

  getState(): DebuggerState {
    return this.state;
  }

  private resolveStep(): void {
    const resolve = this.stepQueue.shift();
    if (resolve) resolve();
  }

  private waitForResume(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.stepQueue.push(resolve);
    });
  }
}
