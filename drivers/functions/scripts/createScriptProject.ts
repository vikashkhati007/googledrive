import { OAuth2Client } from "../../oauth2-client";
import { SCRIPT_API_BASE } from "../../../const";
import { client } from "../../Client";

export type ScriptProjectType = "HTML" | "API" | "FUNCTION";

export async function createScriptProject(
  oauth2: OAuth2Client,
  title: string,
  code: string,
  projectType: ScriptProjectType = "FUNCTION"
) {
  try {
    const authHeader = await oauth2.getAuthHeader();

    // Create blank project
    const createResponse = await client.post(
      `${SCRIPT_API_BASE}/projects`,
      JSON.stringify({ title }),
      {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      }
    );

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

    let serverCode = "";
    let htmlContent = "";

    // Inject boilerplate based on project type
    if (projectType === "FUNCTION") {
      // 1. FUNCTION: code is JS
      if (!code.includes("function doGet")) {
        const defaultDispatcher = `
/**
 * [FUNCTION MODE] DISPATCHER
 * Allows calling global functions via ?func=functionName
 */
function doGet(e) {
  var params = e.parameter;
  var funcName = params.func;

  if (!funcName) return ContentService.createTextOutput("Error: Missing 'func' parameter");

  // Sanitize function name
  if (!funcName.match(/^[a-zA-Z0-9_]+$/)) {
    return ContentService.createTextOutput("Error: Invalid function name");
  }

  if (typeof this[funcName] === 'function') {
    try {
      var result = this[funcName](params);
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
        serverCode = defaultDispatcher + "\n" + code;
      } else {
        serverCode = code;
      }
    } else if (projectType === "HTML") {
      // 2. HTML: code is HTML
      // Standard dispatcher for HTML
      serverCode = `
/**
 * [HTML MODE]
 * Renders the 'index' HTML file.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('${title}')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
`;
      htmlContent = code; // Use the provided code as strict HTML content
    } else if (projectType === "API") {
      // 3. API: Wraps user's apiMain function
      if (!code.includes("function doGet")) {
        // If the user didn't write their own doGet/doPost, we wrap their 'apiMain'
        const apiTemplate = `
/**
 * [API MODE]
 * Automatically wraps apiMain(params)
 */
function doGet(e) {
  return handleApiRequest(e.parameter);
}

function doPost(e) {
  var params = {};
  if (e.postData && e.postData.contents) {
    try {
      params = JSON.parse(e.postData.contents);
    } catch(err) {
      params = { error: "Invalid JSON body", raw: e.postData.contents };
    }
  }
  // Merge query params if needed, or just use body. 
  // For simplicity, let's mix them or just pass what we have.
  for (var k in e.parameter) {
    params[k] = e.parameter[k];
  }
  return handleApiRequest(params);
}

function handleApiRequest(params) {
  if (typeof apiMain !== 'function') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', 
      message: 'apiMain function not defined in script'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var result = apiMain(params);
    // If result is already a proper output, return it. 
    // Otherwise assume it's data to be JSON stringified.
    if (result && typeof result.getMimeType === 'function') {
      return result;
    }
    
    var response = { status: 'success', data: result };
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
     return ContentService.createTextOutput(JSON.stringify({
       status: 'error', 
       message: err.toString(),
       stack: err.stack
     })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
        serverCode = apiTemplate + "\n" + code;
      } else {
        serverCode = code;
      }
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
        source: serverCode,
      },
    ];

    if (projectType === "HTML") {
      content.push({
        name: "index",
        type: "HTML",
        source: htmlContent,
      });
    }

    // Note: Using PATCH instead of PUT (Jiren doesn't have PUT)
    const updateResponse = await client.patch(
      `${SCRIPT_API_BASE}/projects/${scriptId}/content`,
      JSON.stringify({ files: content }),
      {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
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
