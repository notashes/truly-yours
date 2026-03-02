export function setupFileHandler(onFile: (file: File) => void) {
  if ('launchQueue' in window) {
    (window as any).launchQueue.setConsumer(async (launchParams: any) => {
      if (!launchParams.files?.length) return;
      for (const handle of launchParams.files) {
        const file: File = await handle.getFile();
        if (file.name.endsWith('.typrotocol') || file.name.endsWith('.json')) {
          onFile(file);
        }
      }
    });
  }
}
