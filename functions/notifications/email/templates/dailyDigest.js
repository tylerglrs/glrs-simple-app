// Daily Email Digest Template
// Sent at user's chosen time (default 8 AM)
// Subject: "Your Daily Recovery Summary - [Date]"

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Recovery Summary</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #058585 0%, #047272 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Your Daily Recovery Summary</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">{{date}}</p>
            </td>
          </tr>

          <!-- Sobriety Counter -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; display: inline-block;">
                <p style="color: white; margin: 0; font-size: 16px; font-weight: 600;">Days Sober</p>
                <p style="color: white; margin: 10px 0 0; font-size: 48px; font-weight: 700;">{{daysSober}}</p>
              </div>
            </td>
          </tr>

          <!-- Today's Check-in Status -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Today's Check-in</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 15px; background: {{morningComplete}}; border-radius: 8px; margin-bottom: 10px;">
                    <p style="margin: 0; font-weight: 600; color: #111827;">Morning Check-in: {{morningStatus}}</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background: {{eveningComplete}}; border-radius: 8px; margin-top: 10px;">
                    <p style="margin: 0; font-weight: 600; color: #111827;">Evening Reflection: {{eveningStatus}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Assignments Due -->
          {{#if assignmentsDue}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Assignments Due</h2>
              {{#each assignmentsDue}}
              <div style="padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 0; font-weight: 600; color: #92400e;">{{this.title}}</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #78350f;">Due: {{this.dueDate}}</p>
              </div>
              {{/each}}
            </td>
          </tr>
          {{/if}}

          <!-- Today's Meetings -->
          {{#if meetings}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Today's Meetings</h2>
              {{#each meetings}}
              <div style="padding: 12px; background: #dbeafe; border-left: 4px solid #058585; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 0; font-weight: 600; color: #1e3a8a;">{{this.name}}</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #1e40af;">{{this.time}} - {{this.location}}</p>
              </div>
              {{/each}}
            </td>
          </tr>
          {{/if}}

          <!-- Quick Stats -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Your Week at a Glance</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px; width: 31%;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Check-in Streak</p>
                    <p style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #058585;">{{checkinStreak}}</p>
                  </td>
                  <td style="width: 3.5%;"></td>
                  <td style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px; width: 31%;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Meetings This Week</p>
                    <p style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #058585;">{{weeklyMeetings}}</p>
                  </td>
                  <td style="width: 3.5%;"></td>
                  <td style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px; width: 31%;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Tasks Completed</p>
                    <p style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #058585;">{{tasksCompleted}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <a href="https://app.glrecoveryservices.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #058585 0%, #047272 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Open GLRS Lighthouse
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this because you enabled daily email digests.</p>
              <p style="margin: 8px 0 0; font-size: 13px;"><a href="{{unsubscribeLink}}" style="color: #058585; text-decoration: none;">Update email preferences</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
