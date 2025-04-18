// import * as vscode from "vscode"
// import { GlobalStateKey, SecretKey } from "./state-keys"
// // global

// export async function updateGlobalState(context: vscode.ExtensionContext, key: GlobalStateKey, value: unknown) {
// 	await context.globalState.update(key, value)
// }

// export async function getGlobalState(context: vscode.ExtensionContext, key: GlobalStateKey) {
// 	return await context.globalState.get(key)
// }

// // secrets

// export async function storeSecret(context: vscode.ExtensionContext, key: SecretKey, value?: string) {
// 	if (value) {
// 		await context.secrets.store(key, value)
// 	} else {
// 		await context.secrets.delete(key)
// 	}
// }

// export async function getSecret(context: vscode.ExtensionContext, key: SecretKey) {
// 	return await context.secrets.get(key)
// }

// // workspace

// export async function updateWorkspaceState(context: vscode.ExtensionContext, key: string, value: unknown) {
// 	await context.workspaceState.update(key, value)
// }

// export async function getWorkspaceState(context: vscode.ExtensionContext, key: string) {
// 	return await context.workspaceState.get(key)
// }