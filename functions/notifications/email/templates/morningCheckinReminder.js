// Morning Check-in Reminder Email Template
// Sent at user's configured morning check-in time
// Subject: "Good Morning, {{userName}}! Time for your check-in"

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Morning Check-in Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #058585 0%, #047272 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Good Morning, {{userName}}!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Time for your daily check-in</p>
            </td>
          </tr>

          <!-- Sobriety Counter -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; display: inline-block; min-width: 120px;">
                <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">Day</p>
                <p style="color: white; margin: 5px 0 0; font-size: 42px; font-weight: 700;">{{daysSober}}</p>
              </div>
              <p style="margin: 15px 0 0; color: #6b7280; font-size: 14px;">of your recovery journey</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                How are you feeling this morning?
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Take a few minutes to check in with yourself. Your morning check-in helps you:
              </p>
              <ul style="margin: 15px 0 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
                <li>Set your intentions for the day</li>
                <li>Track your mood and energy levels</li>
                <li>Build a consistent daily routine</li>
                <li>Stay connected to your recovery goals</li>
              </ul>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="{{checkinUrl}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #058585 0%, #047272 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Complete Check-In
              </a>
            </td>
          </tr>

          <!-- Motivational Quote -->
          <tr>
            <td style="padding: 25px 30px; background: #f0fdfa; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-style: italic; color: #047272; font-size: 15px; text-align: center;">
                "Every morning is a chance to start fresh on your recovery journey."
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this daily reminder because you enabled morning check-in notifications.</p>
              <p style="margin: 8px 0 0; font-size: 13px;">
                <a href="{{unsubscribeLink}}" style="color: #058585; text-decoration: none;">Update notification preferences</a>
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
