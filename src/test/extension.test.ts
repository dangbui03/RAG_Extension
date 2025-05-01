import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import * as extension from "../extension";
// import { GenerateCommentCommand } from "../../commands/generateComment";
// import { GfunctionCommentCommand } from "../../commands/functionComment";
// import { RagginProvider } from "../../core/webview/RagginProvider";
import { Logger, LogLevel } from "../utils/logging";

suite("Extension Test Suite", () => {
  const sandbox = sinon.createSandbox();
  let extensionContext: vscode.ExtensionContext;

  setup(() => {
    // Create a mock for the extension context
    extensionContext = {
      subscriptions: [],
      workspaceState: {
        get: () => {},
        update: () => Promise.resolve(),
        keys: () => [],
      } as any,
      globalState: {
        get: () => {},
        update: () => Promise.resolve(),
        keys: () => [],
      } as any,
      extensionPath: "",
      storagePath: "",
      globalStoragePath: "",
      asAbsolutePath: (relativePath) => relativePath,
      extensionUri: {} as vscode.Uri,
      secrets: {
		  get: () => Promise.resolve(""),
		  store: () => Promise.resolve(),
		  delete: () => Promise.resolve(),
	  } as unknown as vscode.SecretStorage,
      extension: {} as vscode.Extension<any>,
      languageModelAccessInformation: {} as vscode.LanguageModelAccessInformation,
    environmentVariableCollection: {
        getScoped: () => ({ clear: () => { }, get: () => null, forEach: () => { }, delete: () => false, replace: () => { }, append: () => { }, prepend: () => { } }),
        clear: () => { },
        get: () => null,
        forEach: () => { },
        delete: () => false,
        replace: () => { },
        append: () => { },
        prepend: () => { }
    } as unknown as vscode.GlobalEnvironmentVariableCollection,
      extensionMode: vscode.ExtensionMode.Test,
      storageUri: {} as vscode.Uri,
      globalStorageUri: {} as vscode.Uri,
      logUri: {} as vscode.Uri,
      logPath: "",
    };

    // Stub vscode APIs
    sandbox.stub(vscode.window, "createOutputChannel").returns({
      appendLine: () => {},
      append: () => {},
      clear: () => {},
      show: () => {},
      hide: () => {},
      dispose: () => {},
      name: "RAGGIN",
    } as any);

    sandbox.stub(vscode.window, "createStatusBarItem").returns({
      show: sinon.spy(),
      hide: sinon.spy(),
      dispose: sinon.spy(),
      text: "",
      command: "",
      tooltip: "",
    } as any);

    sandbox.stub(vscode.window, "registerWebviewViewProvider").returns({
      dispose: sinon.spy(),
    });

    sandbox.stub(vscode.commands, "registerCommand").returns({
      dispose: sinon.spy(),
    });

    sandbox.stub(vscode.workspace, "getConfiguration").returns({
      get: (key: string, defaultValue: any) => {
        if (key === "logLevel") return "info";
        if (key === "minWidth") return 100;
        return defaultValue;
      },
    } as any);

    // Stub Logger methods
    const initializeStub = sandbox.stub(Logger, "initialize");
    const setLogLevelStub = sandbox.stub(Logger, "setLogLevel");
    const infoStub = sandbox.stub(Logger, "info");
    const errorStub = sandbox.stub(Logger, "error");
    const debugStub = sandbox.stub(Logger, "debug");
    
    // Store stub references on Logger for easy assertion access
    (Logger as any).initialize = initializeStub;
    (Logger as any).setLogLevel = setLogLevelStub;
    (Logger as any).info = infoStub;
    (Logger as any).error = errorStub;
    (Logger as any).debug = debugStub;
  });

  teardown(() => {
    sandbox.restore();
  });

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test("Extension activates properly", async () => {
    // Act
    extension.activate(extensionContext);

    // Assert
    assert.ok((Logger.initialize as sinon.SinonStub).calledOnce, "Logger should be initialized");
    assert.ok(
      (vscode.window.createOutputChannel as sinon.SinonStub).calledWith("RAGGIN"),
      "Output channel should be created"
    );
    assert.ok(
      (vscode.window.registerWebviewViewProvider as sinon.SinonStub).calledOnce,
      "Sidebar provider should be registered"
    );
    assert.ok(
      (vscode.window.createStatusBarItem as sinon.SinonStub).calledOnce,
      "Status bar item should be created"
    );
  });

  test("Commands are registered correctly", async () => {
    // Act
    extension.activate(extensionContext);

    // Assert
    assert.ok(
      (vscode.commands.registerCommand as sinon.SinonStub).calledWith(
        "raggin.generateComment",
        sinon.match.func
      ),
      "Generate comment command should be registered"
    );
    assert.ok(
      (vscode.commands.registerCommand as sinon.SinonStub).calledWith(
        "raggin.gfunctionComment",
        sinon.match.func
      ),
      "Function comment command should be registered"
    );
    assert.ok(
      (vscode.commands.registerCommand as sinon.SinonStub).calledWith(
        "raggin.readEntireCodeBase",
        sinon.match.func
      ),
      "Read entire codebase command should be registered"
    );
    assert.ok(
      (vscode.commands.registerCommand as sinon.SinonStub).calledWith(
        "raggin.executeAllCommands",
        sinon.match.func
      ),
      "Execute all commands should be registered"
    );
  });

  test("Status bar item is configured correctly", async () => {
    // Arrange
    const statusBarItemStub = {
      text: "",
      command: "",
      show: sinon.spy(),
      hide: sinon.spy(),
      dispose: sinon.spy(),
    };
    (vscode.window.createStatusBarItem as sinon.SinonStub).returns(
      statusBarItemStub
    );

    // Act
    extension.activate(extensionContext);

    // Assert
    assert.strictEqual(
      statusBarItemStub.text,
      "Generate Comment",
      "Status bar text should be set"
    );
    assert.strictEqual(
      statusBarItemStub.command,
      "raggin.generateComment",
      "Status bar command should be set"
    );
    assert.ok(
      statusBarItemStub.show.calledOnce,
      "Status bar item should be shown"
    );
  });

  test("estimateEditorWidth returns correct width for visible ranges", () => {
    // Arrange
    const editor = {
      document: {
        lineAt: (line: number) => ({
          text: line === 0 ? "short" : "this is a longer line of text",
        }),
      },
      visibleRanges: [
        {
          start: { line: 0 },
          end: { line: 1 },
        },
      ],
    } as unknown as vscode.TextEditor;

    // Act
    const width = (extension as any).estimateEditorWidth(editor);

    // Assert
    // The longest line is the second one with length 29, so width should be 29 * 8 = 232
    assert.strictEqual(
      width,
      232,
      "Editor width should be calculated correctly"
    );
  });

  test("estimateEditorWidth returns 0 for no visible ranges", () => {
    // Arrange
    const editor = {
      document: {
        lineAt: () => ({ text: "any text" }),
      },
      visibleRanges: [],
    } as unknown as vscode.TextEditor;

    // Act
    const width = (extension as any).estimateEditorWidth(editor);

    // Assert
    assert.strictEqual(
      width,
      0,
      "Editor width should be 0 when no visible ranges"
    );
  });

  test("deactivate function logs correctly", () => {
    // Act
    extension.deactivate();

    // Assert
    assert.ok(
      (Logger as any).info.calledWith("Extension deactivated"),
      "Should log deactivation message"
    );
  });

  // To test command executions, we need to mock the actual commands
  test("executeAllCommands calls all commands", async () => {
    // Arrange
    const executeCommandStub = sandbox.stub(vscode.commands, "executeCommand");
    let executeAllCommandsCallback: (() => Promise<void>) | undefined;

    (vscode.commands.registerCommand as sinon.SinonStub).callsFake(
      (command: string, callback: any) => {
        if (command === "raggin.executeAllCommands") {
          executeAllCommandsCallback = callback;
        }
        return { dispose: () => {} };
      }
    );

    // Act
    extension.activate(extensionContext);
    if (executeAllCommandsCallback) {
      await executeAllCommandsCallback();
    }

    // Assert
    assert.ok(
      executeCommandStub.calledWith("raggin.generateComment"),
      "Generate comment command should be called"
    );
    assert.ok(
      executeCommandStub.calledWith("raggin.gfunctionComment"),
      "Function comment command should be called"
    );
    assert.ok(
      executeCommandStub.calledWith("raggin.readEntireCodeBase"),
      "Read codebase command should be called"
    );
  });

  // Test Logger configuration
  test("Logger is initialized with correct level", () => {
    // Act
    extension.activate(extensionContext);

    // Assert
    assert.ok((Logger.initialize as sinon.SinonStub).calledOnce, "Logger should be initialized");
    assert.ok((Logger.setLogLevel as sinon.SinonStub).calledOnce, "Log level should be set");
    assert.ok(
      (Logger.info as sinon.SinonStub).calledWith("RAGGIN extension activated"),
      "Activation message should be logged"
    );
  });
});
