let originalConsoleLog = console.log;

/**
 * console.log を無効化（元の関数を保存）
 */
export function muteConsoleLog() {
  originalConsoleLog = console.log;
  console.log = () => {};
}

/**
 * 一時的にconsole.logを復活させて出力
 * 出力後に再度無効化
 */
export function print(message) {
  console.log = originalConsoleLog;
  console.log(message);
  console.log = () => {};
}
