import { OAuth2Client } from "../../oauth2-client";
import { SCRIPT_API_BASE } from "../../../const";

export async function createScriptProject(
  oauth2: OAuth2Client,
  title: string,
  code: string
) {
  try {
    const authHeader = await oauth2.getAuthHeader();

    // Create blank project
    const createResponse = await fetch(`${SCRIPT_API_BASE}/projects`, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!createResponse.ok) {
      throw new Error(await createResponse.text());
    }

    const project = await createResponse.json();
    const scriptId = project.scriptId!;

    // Correct manifest
    const manifest = {
      timeZone: "Asia/Kolkata",
      exceptionLogging: "STACKDRIVER",
      runtimeVersion: "V8",
      webapp: {
        access: "ANYONE_ANONYMOUS",
        executeAs: "USER_DEPLOYING",
      },
      executionApi: {
        access: "MYSELF",
      },
    };

    // Check if code contains 'doGet'
    let finalCode = code;
    if (!code.includes("function doGet")) {
      const defaultDispatcher = `
/**
 * DEFAULT DISPATCHER (Injected by GDriveKit)
 * Allows calling any global function via ?func=functionName
 */
function doGet(e) {
  var params = e.parameter;
  var funcName = params.func;

  if (!funcName) {
    return ContentService.createTextOutput("Error: Missing 'func' parameter");
  }

  // Sanitize function name to prevent dangerous execution
  if (!funcName.match(/^[a-zA-Z0-9_]+$/)) {
    return ContentService.createTextOutput("Error: Invalid function name");
  }

  // Dynamic dispatch
  // In Apps Script V8, global functions are properties of the global object ('this')
  if (typeof this[funcName] === 'function') {
    try {
      var result = this[funcName](params);
      
      // Handle object results (auto-stringify)
      if (typeof result === 'object' && result !== null) {
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(String(result));
    } catch (error) {
       return ContentService.createTextOutput("Error executing '" + funcName + "': " + error.toString());
    }
  } else {
    return ContentService.createTextOutput("Error: Function '" + funcName + "' not found");
  }
}
      
`;
      finalCode = defaultDispatcher + "\n" + code;
    }

    const content = [
      {
        name: "appsscript",
        type: "JSON",
        source: JSON.stringify(manifest, null, 2),
      },
      {
        name: "Code",
        type: "SERVER_JS",
        source: finalCode,
      },
    ];

    const updateResponse = await fetch(
      `${SCRIPT_API_BASE}/projects/${scriptId}/content`,
      {
        method: "PUT",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: content }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(await updateResponse.text());
    }

    return {
      success: true,
      data: { scriptId },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
