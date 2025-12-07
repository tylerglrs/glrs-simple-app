// Monthly Email Digest Template
// Sent 1st of month at 8 AM
// Subject: "Your Monthly Recovery Report - [Month]"

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Recovery Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Your Monthly Recovery Report</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">{{month}}</p>
            </td>
          </tr>

          <!-- Monthly Progress -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; display: inline-block;">
                <p style="color: white; margin: 0; font-size: 16px; font-weight: 600;">Total Days Sober</p>
                <p style="color: white; margin: 10px 0 0; font-size: 48px; font-weight: 700;">{{daysSober}}</p>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">+{{daysThisMonth}} days this month</p>
              </div>
            </td>
          </tr>

          <!-- Monthly Stats Grid -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Monthly Highlights</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 15px; background: #f9fafb; border-radius: 8px; width: 48%; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Check-in Rate</p>
                    <p style="margin: 8px 0 0; font-size: 32px; font-weight: 700; color: #10b981;">{{checkinRate}}%</p>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="padding: 15px; background: #f9fafb; border-radius: 8px; width: 48%; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Longest Streak</p>
                    <p style="margin: 8px 0 0; font-size: 32px; font-weight: 700; color: #f59e0b;">{{longestStreak}}</p>
                  </td>
                </tr>
                <tr><td colspan="3" style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background: #f9fafb; border-radius: 8px; width: 48%; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Meetings Attended</p>
                    <p style="margin: 8px 0 0; font-size: 32px; font-weight: 700; color: #058585;">{{meetingsAttended}}</p>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="padding: 15px; background: #f9fafb; border-radius: 8px; width: 48%; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">Tasks Completed</p>
                    <p style="margin: 8px 0 0; font-size: 32px; font-weight: 700; color: #8b5cf6;">{{tasksCompleted}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Milestones & Breakthroughs -->
          {{#if milestones}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Milestones Achieved</h2>
              {{#each milestones}}
              <div style="padding: 15px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #92400e;">{{this.label}}</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #78350f;">Achieved on {{this.date}}</p>
              </div>
              {{/each}}
            </td>
          </tr>
          {{/if}}

          <!-- Top Gratitude Themes -->
          {{#if topGratitudes}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Top Gratitude Themes</h2>
              <div style="padding: 20px; background: #f9fafb; border-radius: 8px;">
                {{#each topGratitudes}}
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">{{this.theme}}</p>
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">{{this.count}} mentions</p>
                  </div>
                  <div style="background: #e5e7eb; border-radius: 4px; height: 6px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 100%; width: {{this.percentage}}%; border-radius: 4px;"></div>
                  </div>
                </div>
                {{/each}}
              </div>
            </td>
          </tr>
          {{/if}}

          <!-- Challenges Faced -->
          {{#if challenges}}
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Challenges Overcome</h2>
              <div style="padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">You faced {{challengeCount}} challenges this month and showed resilience in your recovery journey.</p>
                {{#if challengeBreakthrough}}
                <p style="margin: 12px 0 0; font-size: 14px; font-weight: 600; color: #10b981;">Breakthrough: You haven't mentioned {{challengeBreakthrough}} in over 30 days!</p>
                {{/if}}
              </div>
            </td>
          </tr>
          {{/if}}

          <!-- Community Engagement -->
          <tr>
            <td style="padding: 30px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 20px;">Community Engagement</h2>
              <div style="padding: 15px; background: #f9fafb; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">You posted {{communityPosts}} times and connected with {{communityConnections}} peers this month.</p>
              </div>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #111827;">Keep up the amazing progress!</p>
              <a href="https://app.glrecoveryservices.com/journey" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                View Your Journey
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this because you enabled monthly email digests.</p>
              <p style="margin: 8px 0 0; font-size: 13px;"><a href="{{unsubscribeLink}}" style="color: #8b5cf6; text-decoration: none;">Update email preferences</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
