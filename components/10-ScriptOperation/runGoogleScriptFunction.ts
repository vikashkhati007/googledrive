/**
 * Call a Google Apps Script Web App URL with parameters
 */
export async function runGoogleScriptFunction(
  url: string,
  functionName: string,
  parameters: Record<string, any> = {}
) {
  try {
    const urlObj = new URL(url);

    // Set the fixed 'func' parameter
    urlObj.searchParams.append("func", functionName);

    // Append optional parameters
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const strValue =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        urlObj.searchParams.append(key, strValue);
      }
    });

    const response = await fetch(urlObj.toString(), {
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(
        `Web App call failed: ${response.status} ${response.statusText}`
      );
    }

    // Try to parse as JSON first, fallback to text
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err: any) {
    throw new Error("Failed to call Web App: " + (err.message || err));
  }
}
