// Milestone Approaching Email Template
// Sent 3 days before a recovery milestone
// Variables: {{userName}}, {{milestoneLabel}}, {{daysUntil}}, {{journeyUrl}}, {{unsubscribeLink}}

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Milestone Approaching</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header - Blue/purple gradient for anticipation -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700;">Milestone Approaching!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">{{daysUntil}} days away</p>
            </td>
          </tr>

          <!-- Milestone Badge -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 20px; display: inline-block; min-width: 150px;">
                <p style="color: white; margin: 0; font-size: 14px; font-weight: 600;">Almost there!</p>
                <p style="color: white; margin: 5px 0 0; font-size: 32px; font-weight: 700;">{{milestoneLabel}}</p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Hi {{userName}},
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                You're just {{daysUntil}} days away from reaching <strong>{{milestoneLabel}}</strong> of sobriety. This is a significant milestone in your recovery journey!
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Keep going - every day counts, and you're so close to this achievement.
              </p>
            </td>
          </tr>

          <!-- Encouragement Box -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background: #eff6ff; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #1e40af; font-size: 18px; font-weight: 600;">You've got this!</p>
                <p style="margin: 10px 0 0; color: #3b82f6; font-size: 14px;">Stay focused on your recovery goals</p>
              </div>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="{{journeyUrl}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Your Journey
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this because you have milestone alerts enabled.</p>
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
