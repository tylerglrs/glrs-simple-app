// Weekly Progress Report Template
// Sent Sunday at 6 PM
// Subject: "Weekly Progress Report - Ready for Coach Review"
// Note: This report is ALSO sent to assigned coach

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Progress Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Weekly Progress Report</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Week of {{weekStart}}</p>
              {{#if isCoachReport}}
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">PIR: {{pirName}}</p>
              {{/if}}
            </td>
          </tr>

          <!-- Sobriety Status -->
          <tr>
            <td style="padding: 30px; border-bottom: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; text-align: center; display: inline-block; width: 100%;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align: center; width: 50%;">
                      <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">Days Sober</p>
                      <p style="color: white; margin: 10px 0 0; font-size: 42px; font-weight: 700;">{{daysSober}}</p>
                    </td>
                    <td style="text-align: center; width: 50%;">
                      <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">Check-in Streak</p>
                      <p style="color: white; margin: 10px 0 0; font-size: 42px; font-weight: 700;">{{checkinStreak}}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Daily Mood Scores -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Daily Mood Trend</h2>
              <div style="padding: 20px; background: #f9fafb; border-radius: 8px;">
                {{#each moodScores}}
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">{{this.day}}</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: {{this.color}};">{{this.score}}/10</p>
                  </div>
                  <div style="background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
                    <div style="background: {{this.color}}; height: 100%; width: {{this.percentage}}%; border-radius: 4px;"></div>
                  </div>
                </div>
                {{/each}}
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Weekly Average: <span style="font-weight: 700; color: #111827;">{{averageMood}}/10</span></p>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Trend: <span style="font-weight: 700; color: {{trendColor}};">{{moodTrend}}</span></p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Gratitudes This Week -->
          {{#if gratitudes}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Gratitudes This Week</h2>
              {{#each gratitudes}}
              <div style="padding: 12px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 13px; color: #6b7280;">{{this.date}}</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #111827;">{{this.text}}</p>
              </div>
              {{/each}}
            </td>
          </tr>
          {{/if}}

          <!-- Challenges Mentioned -->
          {{#if challenges}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Challenges This Week</h2>
              {{#each challenges}}
              <div style="padding: 12px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 13px; color: #6b7280;">{{this.date}} - <span style="font-weight: 600;">{{this.category}}</span></p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #111827;">{{this.description}}</p>
              </div>
              {{/each}}
            </td>
          </tr>
          {{/if}}

          <!-- Assignment Status -->
          {{#if assignments}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Assignment Status</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px; background: #d1fae5; border-radius: 8px; width: 32%; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #065f46;">Completed</p>
                    <p style="margin: 6px 0 0; font-size: 24px; font-weight: 700; color: #047857;">{{assignmentsCompleted}}</p>
                  </td>
                  <td style="width: 2%;"></td>
                  <td style="padding: 12px; background: #fef3c7; border-radius: 8px; width: 32%; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #78350f;">In Progress</p>
                    <p style="margin: 6px 0 0; font-size: 24px; font-weight: 700; color: #d97706;">{{assignmentsInProgress}}</p>
                  </td>
                  <td style="width: 2%;"></td>
                  <td style="padding: 12px; background: #fee2e2; border-radius: 8px; width: 32%; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #7f1d1d;">Overdue</p>
                    <p style="margin: 6px 0 0; font-size: 24px; font-weight: 700; color: #dc2626;">{{assignmentsOverdue}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          {{/if}}

          <!-- Meeting Attendance -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Meeting Attendance</h2>
              <div style="padding: 20px; background: #dbeafe; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;">Attended this week</p>
                <p style="margin: 10px 0 0; font-size: 48px; font-weight: 700; color: #1e3a8a;">{{meetingsAttended}}</p>
                <p style="margin: 8px 0 0; font-size: 13px; color: #1e40af;">out of {{meetingsScheduled}} scheduled</p>
              </div>
            </td>
          </tr>

          <!-- Red Flags / Concerns -->
          {{#if concerns}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Areas Needing Attention</h2>
              {{#each concerns}}
              <div style="padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #991b1b;">{{this.title}}</p>
                <p style="margin: 5px 0 0; font-size: 13px; color: #6b7280;">{{this.description}}</p>
              </div>
              {{/each}}
            </td>
          </tr>
          {{/if}}

          <!-- PIR's Sunday Reflection -->
          {{#if sundayReflection}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Sunday Self-Reflection</h2>
              <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #6366f1;">
                <p style="margin: 0; font-size: 14px; color: #111827; line-height: 1.6;">{{sundayReflection}}</p>
              </div>
            </td>
          </tr>
          {{/if}}

          <!-- Call to Action -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              {{#if isCoachReport}}
              <a href="https://app.glrecoveryservices.com/coach/pirs/{{pirId}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Review PIR Progress
              </a>
              {{/if}}
              {{#if !isCoachReport}}
              <a href="https://app.glrecoveryservices.com/journey" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                View Detailed Report
              </a>
              {{/if}}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              {{#if isCoachReport}}
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this as {{pirName}}'s assigned coach.</p>
              {{/if}}
              {{#if !isCoachReport}}
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this because you enabled weekly progress reports.</p>
              <p style="margin: 8px 0 0; font-size: 13px;"><a href="{{unsubscribeLink}}" style="color: #ec4899; text-decoration: none;">Update email preferences</a></p>
              {{/if}}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
