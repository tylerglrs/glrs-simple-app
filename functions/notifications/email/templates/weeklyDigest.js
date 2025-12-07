// Weekly Email Digest Template
// Sent Monday at 8 AM
// Subject: "Your Weekly Recovery Summary - Week of [Date]"

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Recovery Summary</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Your Weekly Recovery Summary</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Week of {{weekStart}}</p>
            </td>
          </tr>

          <!-- Sobriety Progress -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; display: inline-block;">
                <p style="color: white; margin: 0; font-size: 16px; font-weight: 600;">Total Days Sober</p>
                <p style="color: white; margin: 10px 0 0; font-size: 48px; font-weight: 700;">{{daysSober}}</p>
              </div>
            </td>
          </tr>

          <!-- Weekly Completion Rate -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Check-in Completion</h2>
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px;">
                <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">This Week</p>
                <div style="background: #e5e7eb; border-radius: 8px; height: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 100%; width: {{completionRate}}%; border-radius: 8px;"></div>
                </div>
                <p style="margin: 10px 0 0; font-size: 24px; font-weight: 700; color: #10b981;">{{completionRate}}%</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">{{completedCheckins}} of {{totalCheckins}} check-ins completed</p>
              </div>
            </td>
          </tr>

          <!-- Milestones Achieved -->
          {{#if milestones}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Milestones Achieved</h2>
              {{#each milestones}}
              <div style="padding: 15px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #92400e;">{{this.label}}</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #78350f;">{{this.days}} Days Sober</p>
              </div>
              {{/each}}
            </td>
          </tr>
          {{/if}}

          <!-- Weekly Insights -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">This Week's Insights</h2>

              <!-- Gratitude Themes -->
              {{#if gratitudeThemes}}
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #111827;">Top Gratitude Themes</p>
                {{#each gratitudeThemes}}
                <span style="display: inline-block; padding: 6px 12px; background: #dbeafe; color: #1e40af; border-radius: 6px; margin: 4px; font-size: 13px; font-weight: 500;">{{this}}</span>
                {{/each}}
              </div>
              {{/if}}

              <!-- Mood Trend -->
              <div style="padding: 15px; background: #f9fafb; border-radius: 8px;">
                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Average Mood</p>
                <p style="margin: 10px 0 0; font-size: 32px; font-weight: 700; color: #6366f1;">{{averageMood}}/10</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">{{moodTrend}}</p>
              </div>
            </td>
          </tr>

          <!-- Activity Summary -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Weekly Activity</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px; background: #f9fafb; border-radius: 8px; width: 48%;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Meetings Attended</p>
                    <p style="margin: 8px 0 0; font-size: 28px; font-weight: 700; color: #058585;">{{meetingsAttended}}</p>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="padding: 12px; background: #f9fafb; border-radius: 8px; width: 48%;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Tasks Completed</p>
                    <p style="margin: 8px 0 0; font-size: 28px; font-weight: 700; color: #058585;">{{tasksCompleted}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Upcoming This Week -->
          {{#if upcomingAssignments}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Coming Up This Week</h2>
              {{#each upcomingAssignments}}
              <div style="padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 0; font-weight: 600; color: #92400e;">{{this.title}}</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #78350f;">Due: {{this.dueDate}}</p>
              </div>
              {{/each}}
            </td>
          </tr>
          {{/if}}

          <!-- Call to Action -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <a href="https://app.glrecoveryservices.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                View Full Report
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this because you enabled weekly email digests.</p>
              <p style="margin: 8px 0 0; font-size: 13px;"><a href="{{unsubscribeLink}}" style="color: #6366f1; text-decoration: none;">Update email preferences</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
