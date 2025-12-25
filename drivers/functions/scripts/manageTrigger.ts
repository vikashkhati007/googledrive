import { OAuth2Client } from "../../oauth2-client";
import { SCRIPT_API_BASE } from "../../../const";
import { client } from "../../Client";

export type TriggerSchedule =
  | "none"
  | "minutely"
  | "hourly"
  | "daily"
  | "weekly";

/**
 * Create or update a time-based trigger for a script
 * Note: Triggers are created by calling a setup function in the script itself
 */
export async function manageTrigger(
  oauth2: OAuth2Client,
  scriptId: string,
  schedule: TriggerSchedule
) {
  try {
    const authHeader = await oauth2.getAuthHeader();

    // Run the script's setupTrigger function via the execution API
    const response = await client.post(
      `${SCRIPT_API_BASE}/scripts/${scriptId}:run`,
      JSON.stringify({
        function: "setupTrigger",
        parameters: [schedule],
        devMode: false,
      }),
      {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      // If execution fails, it might be because the script needs authorization
      if (text.includes("401") || text.includes("403")) {
        return {
          success: false,
          needsAuth: true,
          error: "Script needs authorization for triggers",
        };
      }
      throw new Error(text);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || "Trigger setup failed");
    }

    return {
      success: true,
      data: result.response?.result,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Generate the trigger setup code to be included in the script
 */
export function generateTriggerSetupCode(): string {
  return `
/**
 * Setup time-based trigger for this function
 * Called via web app URL: ?func=setupTrigger&schedule=daily
 */
function setupTrigger(params) {
  var schedule = params.schedule;
  
  // Delete existing triggers for 'run' function
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'run') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  if (!schedule || schedule === 'none') {
    return { success: true, message: 'Triggers removed' };
  }
  
  var builder = ScriptApp.newTrigger('run');
  
  switch (schedule) {
    case 'minutely':
      builder.timeBased().everyMinutes(1).create();
      break;
    case 'hourly':
      builder.timeBased().everyHours(1).create();
      break;
    case 'daily':
      builder.timeBased().everyDays(1).atHour(9).create(); // 9 AM
      break;
    case 'weekly':
      builder.timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();
      break;
    default:
      return { success: false, error: 'Unknown schedule: ' + schedule };
  }
  
  return { success: true, schedule: schedule, message: 'Trigger created for ' + schedule };
}

/**
 * Get current trigger info
 */
function getTriggerInfo() {
  var triggers = ScriptApp.getProjectTriggers();
  var result = [];
  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    result.push({
      handler: t.getHandlerFunction(),
      type: t.getTriggerSource().toString(),
      eventType: t.getEventType().toString()
    });
  }
  return result;
}
`;
}
