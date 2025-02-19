import * as vscode from 'vscode';
import path from 'path';

type FolderConfiguration = {
	name?: string;
	delay?: number;
	command?: string | string[];
}

type Configuration = {
	name: string;
	command: string | string[];
	folders: string[] | Record<string, FolderConfiguration>;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('auto-open-terminals.open', async () => {

		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFile) {

			let configuration = vscode.workspace.getConfiguration("auto-open-terminals");
			let configurations = configuration.get<Configuration[]>("configurations");
			if (!configurations) {
				vscode.window.showErrorMessage('No configurations found for auto-open-terminals');
				return;
			}
		
			let terminal: vscode.Terminal | undefined;
			let count = 0;

			let name: string | undefined = (configurations.length === 1)
				? configurations[0].name
				: await vscode.window.showQuickPick(configurations.map(c => c.name));

			let config = configurations.find(c => c.name === name);
			if (config) {

				let folders: FolderConfiguration[] = [];
				if (Array.isArray(config.folders)) {
					folders = config.folders.map(name => ({ name }));
				} else {
					folders = Object.keys(config.folders).map(name => ({ name, ...(config.folders as any)[name] }));
				}

				const sendCommands = async (terminal: vscode.Terminal, commands: string | string[]) => {
					if (Array.isArray(commands)) {
						for (let command of commands) {
							await terminal.sendText(command);
						}
					} else {
						await terminal.sendText(commands);
					}
				};

				const doCommands = async (terminal: vscode.Terminal, folder: FolderConfiguration) => {
					if (folder.delay) {
						const term = terminal;								
						setTimeout(() => {
							void sendCommands(term, folder.command ?? config.command);
						}, folder.delay);
					} else {
						void sendCommands(terminal, folder.command ?? config.command);
					}
				};

				for (let folder of folders) {

					let workspaceFolder = vscode.workspace.workspaceFolders?.find(f => f.name === folder.name);
					if (workspaceFolder) {

						// open first, split the rest
						if (!terminal) {

							const id = ++count;
							terminal = vscode.window.createTerminal({
								name: workspaceFolder.name,
								cwd: workspaceFolder.uri.fsPath,
								location: vscode.TerminalLocation.Panel
							});
							terminal.show();
							doCommands(terminal, folder);
			
						} else {
			
							const id = ++count;
							await vscode.commands.executeCommand("workbench.action.terminal.split");
							const terminal = vscode.window.activeTerminal;
							if (terminal) {
								await vscode.commands.executeCommand("workbench.action.terminal.renameWithArg", { name: workspaceFolder.name });
								await terminal.sendText(`cd "${path.resolve(workspaceFolder.uri.fsPath)}"`);
								doCommands(terminal, folder);
							}
						}
					}
				}

				vscode.window.showInformationMessage(`Opened ${count} terminal${count === 1 ? '' : 's'}..`);

			}

		}

	});

	context.subscriptions.push(disposable);

}

// This method is called when your extension is deactivated
export function deactivate() {
	// nothing for now
}
