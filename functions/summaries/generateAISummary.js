const functions = require('firebase-functions');
const OpenAI = require('openai');

// Phase 6.3: Import Beacon personality
const {
  BEACON_IDENTITY,
  SPECIFICITY_RULES,
  PROHIBITIONS,
} = require('../beacon/beaconPersonality');

const openai = new OpenAI({
  apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY,
});

/**
 * System prompt for objective + warm summaries
 * Phase 6.3: Updated with Beacon personality and specificity rules
 * Tone: Factual with slight warmth. Lead with numbers, add brief encouragement where earned.
 */
const SUMMARY_SYSTEM_PROMPT = `${BEACON_IDENTITY}

You analyze recovery data and provide summaries.

${SPECIFICITY_RULES}

Additional rules for summaries:
- State facts and numbers FIRST (exact percentages, averages, counts)
- Add one brief encouraging observation if data supports it
- Note areas to watch without being negative
- No over-the-top cheerleading ("Amazing!", "Crushing it!")
- Keep summaries concise (2-4 sentences)
- Use phrases like "solid consistency", "worth watching", "building momentum"

Example good output:
"Check-in rate 71% (5/7 days) - solid consistency. Mood averaged 6.2, up from 5.4 last week. Sleep at 5.8 remains an area to watch. 3 meetings attended, your most active week this month."

Example bad output:
"Wow, what an amazing week! You're absolutely crushing it! Keep up the incredible work!"

${PROHIBITIONS}`;

/**
 * Generate weekly summary
 * @param {Object} weekData - Aggregated week data
 * @returns {Promise<string>} AI-generated summary
 */
async function generateWeeklySummary(weekData) {
  let prompt = `Summarize this week's recovery data:

Check-ins: ${weekData.checkIns.completed}/${weekData.checkIns.total} (${Math.round(weekData.checkIns.rate * 100)}%)
- Mood avg: ${weekData.checkIns.moodAvg.toFixed(1)}/10 (range ${weekData.checkIns.moodLow}-${weekData.checkIns.moodHigh})
- Craving avg: ${weekData.checkIns.cravingAvg.toFixed(1)}/10 (${weekData.checkIns.cravingSpikes} spikes above 7)
- Anxiety avg: ${weekData.checkIns.anxietyAvg.toFixed(1)}/10
- Sleep avg: ${weekData.checkIns.sleepAvg.toFixed(1)}/10

Reflections: ${weekData.reflections.completed}/${weekData.reflections.total}
Gratitudes logged: ${weekData.reflections.gratitudeCount}

Habits: ${weekData.habits.tracked} tracked, ${Math.round(weekData.habits.overallCompletionRate * 100)}% completion

Meetings: ${weekData.meetings.attended} attended (${weekData.meetings.byFormat.inPerson} in-person, ${weekData.meetings.byFormat.virtual} virtual)

Sobriety: Day ${weekData.journey.sobrietyDaysStart} -> Day ${weekData.journey.sobrietyDaysEnd}`;

  // Phase 5: Include full gratitude text (last 5 entries)
  if (weekData.gratitudes?.entries?.length > 0) {
    prompt += `\n\nRecent gratitudes:`;
    weekData.gratitudes.entries.slice(0, 5).forEach(g => {
      const text = g.text || g.gratitude || '';
      if (text) {
        prompt += `\n- "${text.substring(0, 150)}${text.length > 150 ? '...' : ''}"`;
      }
    });
  }

  // Phase 5: Include reflection themes (gratitude + challenge text)
  if (weekData.reflections?.daily) {
    const reflectionsWithContent = Object.entries(weekData.reflections.daily)
      .filter(([, r]) => r && r.completed && (r.gratitude || r.challenge))
      .slice(0, 5);

    if (reflectionsWithContent.length > 0) {
      prompt += `\n\nReflection themes this week:`;
      reflectionsWithContent.forEach(([day, r]) => {
        if (r.gratitude) {
          const text = r.gratitude.substring(0, 100);
          prompt += `\n- ${day} gratitude: "${text}${r.gratitude.length > 100 ? '...' : ''}"`;
        }
        if (r.challenge) {
          const text = r.challenge.substring(0, 100);
          prompt += `\n- ${day} challenge: "${text}${r.challenge.length > 100 ? '...' : ''}"`;
        }
      });
    }
  }

  // Phase 5: Include habit names
  if (weekData.habits?.names?.length > 0) {
    prompt += `\n\nActive habits: ${weekData.habits.names.join(', ')}`;
  } else if (weekData.habits?.topHabits?.length > 0) {
    prompt += `\n\nActive habits: ${weekData.habits.topHabits.join(', ')}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return 'Weekly summary generation unavailable.';
  }
}

/**
 * Generate monthly summary
 * @param {Object} monthData - Aggregated month data
 * @param {Object|null} priorMonth - Prior month data for comparison
 * @returns {Promise<string>} AI-generated summary
 */
async function generateMonthlySummary(monthData, priorMonth = null) {
  let prompt = `Summarize this month's recovery data:

Days in recovery: Day ${monthData.sobrietyDaysStart} -> Day ${monthData.sobrietyDaysEnd}

Check-ins: ${monthData.checkIns.completed}/${monthData.checkIns.total} (${Math.round(monthData.checkIns.rate * 100)}%)
- Mood avg: ${monthData.checkIns.moodAvg.toFixed(1)}/10
- Craving avg: ${monthData.checkIns.cravingAvg.toFixed(1)}/10
- Sleep avg: ${monthData.checkIns.sleepAvg.toFixed(1)}/10

Reflections: ${monthData.reflections.completed}/${monthData.reflections.total} (${Math.round(monthData.reflections.rate * 100)}%)

Meetings: ${monthData.meetings.total} total (${monthData.meetings.avgPerWeek.toFixed(1)}/week avg)

Habit completion: ${Math.round(monthData.habits.avgCompletionRate * 100)}%

Resources completed: ${monthData.resources.completed}

Community: ${monthData.community.posts} posts, ${monthData.community.comments} comments`;

  if (priorMonth) {
    prompt += `

Compared to last month:
- Mood: ${monthData.checkIns.moodTrend > 0 ? '+' : ''}${monthData.checkIns.moodTrend.toFixed(1)}
- Meetings: ${monthData.meetings.trend > 0 ? '+' : ''}${monthData.meetings.trend}`;
  }

  if (monthData.milestones?.achieved?.length > 0) {
    prompt += `

Milestones achieved: ${monthData.milestones.achieved.join(', ')}`;
  }

  // Phase 5: Include aggregated gratitude themes for the month
  if (monthData.gratitudes?.themes?.length > 0) {
    prompt += `\n\nGratitude themes this month: ${monthData.gratitudes.themes.slice(0, 5).join(', ')}`;
  }

  // Phase 5: Include sample gratitudes from the month
  if (monthData.gratitudes?.sampleEntries?.length > 0) {
    prompt += `\n\nSample gratitudes:`;
    monthData.gratitudes.sampleEntries.slice(0, 3).forEach(g => {
      const text = g.text || g.gratitude || '';
      if (text) {
        prompt += `\n- "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`;
      }
    });
  }

  // Phase 5: Include common challenges faced this month
  if (monthData.reflections?.challenges?.length > 0) {
    prompt += `\n\nCommon challenges: ${monthData.reflections.challenges.slice(0, 3).join(', ')}`;
  }

  // Phase 5: Include habit names tracked this month
  if (monthData.habits?.names?.length > 0) {
    prompt += `\n\nHabits tracked: ${monthData.habits.names.join(', ')}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    return 'Monthly summary generation unavailable.';
  }
}

/**
 * Generate check-in insight
 * @param {Object} checkIn - Check-in data
 * @param {Object|null} recentAvgs - Recent averages for comparison
 * @returns {Promise<string>} AI-generated insight
 */
async function generateCheckInInsight(checkIn, recentAvgs = null) {
  let prompt = `Brief insight for this check-in:
- Mood: ${checkIn.mood || 'N/A'}/10
- Craving: ${checkIn.craving || 'N/A'}/10
- Anxiety: ${checkIn.anxiety || 'N/A'}/10
- Sleep: ${checkIn.sleep || 'N/A'}/10
- Energy: ${checkIn.energy || 'N/A'}/10`;

  // Phase 5: Include check-in notes if present
  if (checkIn.notes && checkIn.notes.trim()) {
    const noteText = checkIn.notes.substring(0, 200);
    prompt += `\n- Notes: "${noteText}${checkIn.notes.length > 200 ? '...' : ''}"`;
  }

  // Phase 5: Include triggers if noted
  if (checkIn.triggers && checkIn.triggers.length > 0) {
    prompt += `\n- Triggers noted: ${Array.isArray(checkIn.triggers) ? checkIn.triggers.join(', ') : checkIn.triggers}`;
  }

  // Phase 5: Include coping strategies used
  if (checkIn.copingStrategies && checkIn.copingStrategies.length > 0) {
    prompt += `\n- Coping strategies used: ${Array.isArray(checkIn.copingStrategies) ? checkIn.copingStrategies.join(', ') : checkIn.copingStrategies}`;
  }

  if (recentAvgs) {
    prompt += `

7-day averages:
- Mood avg: ${recentAvgs.moodAvg.toFixed(1)}
- Craving avg: ${recentAvgs.cravingAvg.toFixed(1)}
- Sleep avg: ${recentAvgs.sleepAvg.toFixed(1)}`;
  }

  prompt += `

Provide ONE sentence noting what stands out (compare to averages if available, reference notes/triggers if relevant).`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 75,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating check-in insight:', error);
    return null;
  }
}

/**
 * Generate reflection insight
 * @param {Object} reflection - Reflection data
 * @returns {Promise<string>} AI-generated insight
 */
async function generateReflectionInsight(reflection) {
  const prompt = `Brief insight for this reflection:
- Day rating: ${reflection.dayRating || reflection.overallDay || 'N/A'}/5
- Gratitude: "${reflection.gratitude || 'Not provided'}"
- Challenge: "${reflection.challenge || reflection.challenges || 'Not provided'}"
- Tomorrow's goal: "${reflection.tomorrowGoal || 'Not provided'}"

Provide ONE sentence noting themes or patterns.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 75,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating reflection insight:', error);
    return null;
  }
}

module.exports = {
  generateWeeklySummary,
  generateMonthlySummary,
  generateCheckInInsight,
  generateReflectionInsight,
  SUMMARY_SYSTEM_PROMPT,
};
