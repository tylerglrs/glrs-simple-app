// Evening Reflection Reminder Email Template
// Sent at user's configured evening reflection time
// Subject: "Evening Reflection - How was your day, {{userName}}?"

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evening Reflection Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header - Evening gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #7c3aed 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Evening Reflection</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">How was your day, {{userName}}?</p>
            </td>
          </tr>

          <!-- Sobriety Counter -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; display: inline-block; min-width: 120px;">
                <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">Day</p>
                <p style="color: white; margin: 5px 0 0; font-size: 42px; font-weight: 700;">{{daysSober}}</p>
              </div>
              <p style="margin: 15px 0 0; color: #6b7280; font-size: 14px;">Another day of progress</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                As your day winds down, take a moment to reflect on what you've accomplished.
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Your evening reflection helps you:
              </p>
              <ul style="margin: 15px 0 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
                <li>Recognize your wins, big and small</li>
                <li>Process challenges you faced today</li>
                <li>Express gratitude for your progress</li>
                <li>Prepare mentally for restful sleep</li>
              </ul>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="{{reflectionUrl}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Start Reflection
              </a>
            </td>
          </tr>

          <!-- Reflection Prompts -->
          <tr>
            <td style="padding: 25px 30px; background: #faf5ff; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 15px; font-weight: 600; color: #5b21b6; font-size: 14px;">Tonight's Reflection Prompts:</p>
              <p style="margin: 0 0 8px; color: #6b21a8; font-size: 14px;">- What am I grateful for today?</p>
              <p style="margin: 0 0 8px; color: #6b21a8; font-size: 14px;">- What challenged me, and how did I respond?</p>
              <p style="margin: 0; color: #6b21a8; font-size: 14px;">- What's one thing I'm looking forward to tomorrow?</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this daily reminder because you enabled evening reflection notifications.</p>
              <p style="margin: 8px 0 0; font-size: 13px;">
                <a href="{{unsubscribeLink}}" style="color: #7c3aed; text-decoration: none;">Update notification preferences</a>
              </p>
              <p style="margin: 15px 0 0; font-size: 12px; color: #9ca3af;">
                &copy; 2025 Guiding Light Recovery Services. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
