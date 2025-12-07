// Milestone Reached Email Template
// Sent when user reaches a sobriety milestone
// Variables: {{userName}}, {{milestoneLabel}}, {{daysSober}}, {{journeyUrl}}, {{unsubscribeLink}}

module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Milestone Reached!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header - Gold celebration gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Congratulations!</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0; font-size: 20px; font-weight: 600;">You've reached {{milestoneLabel}}!</p>
            </td>
          </tr>

          <!-- Celebration Badge -->
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 50%; width: 120px; height: 120px; display: inline-block; line-height: 120px;">
                <span style="color: white; font-size: 48px; font-weight: 700;">{{daysSober}}</span>
              </div>
              <p style="margin: 15px 0 0; color: #6b7280; font-size: 16px;">Days of Sobriety</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0; font-size: 18px; line-height: 1.6; color: #374151;">
                Dear {{userName}},
              </p>
              <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Today marks <strong>{{milestoneLabel}}</strong> of your sobriety journey. This is a tremendous achievement that deserves to be celebrated!
              </p>
              <p style="margin: 15px 0 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Every day you've chosen recovery has been a victory. Your strength, determination, and commitment have brought you here. Be proud of how far you've come.
              </p>
            </td>
          </tr>

          <!-- Achievement Card -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; text-align: center; border: 2px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Achievement Unlocked</p>
                <p style="margin: 10px 0 0; color: #78350f; font-size: 24px; font-weight: 700;">{{milestoneLabel}} Milestone</p>
                <p style="margin: 10px 0 0; color: #92400e; font-size: 14px;">Keep building on this success!</p>
              </div>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="{{journeyUrl}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Your Journey
              </a>
            </td>
          </tr>

          <!-- Inspirational Quote -->
          <tr>
            <td style="padding: 25px 30px; background: #f0fdf4; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-style: italic; color: #166534; font-size: 15px; text-align: center;">
                "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would."
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">You're receiving this because you have milestone alerts enabled.</p>
              <p style="margin: 8px 0 0; font-size: 13px;">
                <a href="{{unsubscribeLink}}" style="color: #059669; text-decoration: none;">Update notification preferences</a>
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
