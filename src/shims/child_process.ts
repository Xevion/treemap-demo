// Browser shim for Node's child_process
export function spawn(): never {
  throw new Error('child_process.spawn is not available in the browser');
}

export default { spawn };
