// Meeting Reminder Email Template
// Used for 24-hour, 1-hour, and starting now reminders
// Variables: {{userName}}, {{meetingName}}, {{meetingDate}}, {{meetingTime}}, {{reminderText}}, {{meetingLocation}}, {{meetingsUrl}}, {{unsubscribeLink}}

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header - Blue/calendar theme -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Meeting Reminder</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">{{reminderText}}</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Hi {{userName}},
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                This is a reminder about your upcoming meeting:
              </p>

              <!-- Meeting Card -->
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0; color: #1e40af; font-size: 20px;">{{meetingName}}</h3>
                <p style="margin: 12px 0 0; color: #1d4ed8; font-size: 16px;">
                  <strong>Date:</strong> {{meetingDate}}
                </p>
                <p style="margin: 8px 0 0; color: #1d4ed8; font-size: 16px;">
                  <strong>Time:</strong> {{meetingTime}}
                </p>
                <p style="margin: 8px 0 0; color: #1d4ed8; font-size: 16px;">
                  <strong>Location:</strong> {{meetingLocation}}
                </p>
              </div>

              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Attending meetings is an important part of your recovery journey. We look forward to seeing you there!
              </p>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="{{meetingsUrl}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Meeting Details
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this because you have meeting reminders enabled.</p>
              <p style="margin: 8px 0 0; font-size: 13px;">
                <a href="{{unsubscribeLink}}" style="color: #3b82f6; text-decoration: none;">Update notification preferences</a>
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
