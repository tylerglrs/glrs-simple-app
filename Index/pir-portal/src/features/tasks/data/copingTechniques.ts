// =============================================================================
// COPING TECHNIQUES DATA - Day-Based Rotation System
// =============================================================================
// 31 evidence-based techniques from CBT, DBT, and Mindfulness traditions.
// One technique per day of the month for consistent, varied practice.

export type CopingCategory = 'CBT' | 'DBT' | 'MINDFULNESS'

export interface CopingTechnique {
  id: string
  day: number // 1-31 (matches day of month)
  name: string
  category: CopingCategory
  description: string
  steps: string[]
  duration: string
  icon: string // Lucide icon name
  benefits: string[]
}

// =============================================================================
// 31 COPING TECHNIQUES
// =============================================================================

export const COPING_TECHNIQUES: CopingTechnique[] = [
  // Day 1 - Start the month with grounding
  {
    id: 'ct-01',
    day: 1,
    name: 'Box Breathing',
    category: 'MINDFULNESS',
    description: 'Calm your nervous system with this simple 4-4-4-4 breathing pattern used by Navy SEALs.',
    steps: [
      'Sit comfortably with feet flat on the floor',
      'Breathe in slowly for 4 counts',
      'Hold your breath for 4 counts',
      'Breathe out slowly for 4 counts',
      'Hold empty for 4 counts',
      'Repeat 4 times or until calm',
    ],
    duration: '2-3 minutes',
    icon: 'Wind',
    benefits: ['Reduces stress', 'Lowers heart rate', 'Improves focus'],
  },

  // Day 2 - Cognitive restructuring
  {
    id: 'ct-02',
    day: 2,
    name: 'Thought Record',
    category: 'CBT',
    description: 'Challenge negative thoughts by examining the evidence for and against them.',
    steps: [
      'Identify the triggering situation',
      'Notice the automatic negative thought',
      'Rate your belief in the thought (0-100%)',
      'List evidence that supports the thought',
      'List evidence that contradicts the thought',
      'Create a balanced, realistic alternative thought',
      'Re-rate your belief in the original thought',
    ],
    duration: '10-15 minutes',
    icon: 'FileText',
    benefits: ['Reduces anxiety', 'Challenges distortions', 'Builds perspective'],
  },

  // Day 3 - Grounding technique
  {
    id: 'ct-03',
    day: 3,
    name: '5-4-3-2-1 Grounding',
    category: 'MINDFULNESS',
    description: 'Use your five senses to anchor yourself in the present moment during anxiety or cravings.',
    steps: [
      'Notice 5 things you can SEE around you',
      'Notice 4 things you can TOUCH or feel',
      'Notice 3 things you can HEAR',
      'Notice 2 things you can SMELL',
      'Notice 1 thing you can TASTE',
      'Take a deep breath and notice how you feel',
    ],
    duration: '3-5 minutes',
    icon: 'Eye',
    benefits: ['Stops panic attacks', 'Reduces cravings', 'Present moment awareness'],
  },

  // Day 4 - Distress tolerance
  {
    id: 'ct-04',
    day: 4,
    name: 'TIPP Skills',
    category: 'DBT',
    description: 'Quickly change your body chemistry to reduce intense emotions using Temperature, Intense exercise, Paced breathing, and Progressive relaxation.',
    steps: [
      'Temperature: Hold ice cubes or splash cold water on face',
      'Intense Exercise: Do jumping jacks or run in place for 5 min',
      'Paced Breathing: Breathe out longer than you breathe in (4 in, 8 out)',
      'Progressive Relaxation: Tense and release each muscle group',
      'Continue until emotional intensity decreases',
    ],
    duration: '5-15 minutes',
    icon: 'Thermometer',
    benefits: ['Rapidly reduces distress', 'Changes body chemistry', 'Breaks emotional spirals'],
  },

  // Day 5 - Mindful awareness
  {
    id: 'ct-05',
    day: 5,
    name: 'Body Scan Meditation',
    category: 'MINDFULNESS',
    description: 'Systematically bring awareness to each part of your body to release tension and increase body awareness.',
    steps: [
      'Lie down or sit comfortably',
      'Close your eyes and take 3 deep breaths',
      'Start at the top of your head, notice any sensations',
      'Slowly move attention down: face, neck, shoulders',
      'Continue through arms, chest, belly, legs, feet',
      'Notice areas of tension without trying to change them',
      'End by feeling your whole body as one',
    ],
    duration: '10-20 minutes',
    icon: 'User',
    benefits: ['Releases physical tension', 'Increases body awareness', 'Promotes relaxation'],
  },

  // Day 6 - Behavioral activation
  {
    id: 'ct-06',
    day: 6,
    name: 'Opposite Action',
    category: 'DBT',
    description: 'Act opposite to your emotional urge when the emotion is not justified or effective.',
    steps: [
      'Identify the emotion you are experiencing',
      'Notice the action urge (e.g., isolate when sad)',
      'Ask: Is acting on this urge helpful right now?',
      'If not helpful, identify the opposite action',
      'Do the opposite action fully, not half-heartedly',
      'Example: If sad and want to isolate, reach out to a friend',
    ],
    duration: 'Varies',
    icon: 'ArrowLeftRight',
    benefits: ['Changes emotional experience', 'Prevents avoidance', 'Builds mastery'],
  },

  // Day 7 - Cognitive technique
  {
    id: 'ct-07',
    day: 7,
    name: 'Cognitive Defusion',
    category: 'CBT',
    description: 'Create distance from unhelpful thoughts by observing them rather than getting caught up in them.',
    steps: [
      'Notice the difficult thought',
      'Add "I notice I\'m having the thought that..." before it',
      'Say the thought in a silly voice or sing it',
      'Visualize the thought as clouds passing by',
      'Thank your mind for the thought',
      'Return attention to the present moment',
    ],
    duration: '5 minutes',
    icon: 'Cloud',
    benefits: ['Reduces thought power', 'Creates psychological flexibility', 'Decreases rumination'],
  },

  // Day 8 - Interpersonal effectiveness
  {
    id: 'ct-08',
    day: 8,
    name: 'DEAR MAN',
    category: 'DBT',
    description: 'Ask for what you need effectively while maintaining self-respect and relationships.',
    steps: [
      'Describe the situation objectively (facts only)',
      'Express your feelings using "I" statements',
      'Assert what you want clearly and specifically',
      'Reinforce by explaining benefits to the other person',
      'Stay Mindful of your goal, avoid distractions',
      'Appear confident even if you don\'t feel it',
      'Negotiate and be willing to give to get',
    ],
    duration: '10 minutes to prepare',
    icon: 'MessageSquare',
    benefits: ['Improves communication', 'Gets needs met', 'Maintains relationships'],
  },

  // Day 9 - Present moment
  {
    id: 'ct-09',
    day: 9,
    name: 'Mindful Eating',
    category: 'MINDFULNESS',
    description: 'Bring full attention to the experience of eating one piece of food.',
    steps: [
      'Choose one small item of food (raisin, chocolate, etc.)',
      'Look at it as if you\'ve never seen it before',
      'Notice colors, textures, shapes',
      'Smell it and notice any reactions',
      'Place it in your mouth but don\'t chew',
      'Notice the sensations on your tongue',
      'Slowly chew and notice flavors changing',
      'Swallow and feel it moving down',
    ],
    duration: '5-10 minutes',
    icon: 'Apple',
    benefits: ['Increases present moment awareness', 'Reduces emotional eating', 'Enhances enjoyment'],
  },

  // Day 10 - Self-soothing
  {
    id: 'ct-10',
    day: 10,
    name: 'Self-Soothing with Senses',
    category: 'DBT',
    description: 'Use your five senses to comfort yourself during difficult moments.',
    steps: [
      'Vision: Look at photos that bring peace, nature, or art',
      'Hearing: Listen to calming music or nature sounds',
      'Smell: Use essential oils, candles, or fresh flowers',
      'Taste: Have a warm cup of tea or favorite comfort food',
      'Touch: Wrap in a soft blanket, pet an animal, take a warm bath',
      'Choose at least 2-3 senses to engage',
    ],
    duration: '10-30 minutes',
    icon: 'Heart',
    benefits: ['Provides comfort', 'Reduces distress', 'Builds self-care habits'],
  },

  // Day 11 - Identifying patterns
  {
    id: 'ct-11',
    day: 11,
    name: 'ABC Analysis',
    category: 'CBT',
    description: 'Understand the relationship between Activating events, Beliefs, and Consequences.',
    steps: [
      'A - Identify the Activating event (what happened)',
      'B - Identify your Beliefs about the event',
      'C - Notice the Consequences (emotional and behavioral)',
      'Ask: Are my beliefs rational and helpful?',
      'D - Dispute irrational beliefs with evidence',
      'E - Create new Effects with balanced thinking',
    ],
    duration: '15 minutes',
    icon: 'GitBranch',
    benefits: ['Identifies patterns', 'Challenges irrational beliefs', 'Empowers change'],
  },

  // Day 12 - Emotion regulation
  {
    id: 'ct-12',
    day: 12,
    name: 'PLEASE Skills',
    category: 'DBT',
    description: 'Reduce emotional vulnerability by taking care of your physical health.',
    steps: [
      'PL - Treat Physical iLlness (see a doctor when needed)',
      'E - Eat balanced meals regularly',
      'A - Avoid mood-altering substances',
      'S - Get adequate Sleep (7-9 hours)',
      'E - Exercise daily (even just a 10-min walk)',
      'Track your PLEASE habits for a week',
    ],
    duration: 'Daily practice',
    icon: 'Shield',
    benefits: ['Reduces emotional vulnerability', 'Builds resilience', 'Improves overall wellbeing'],
  },

  // Day 13 - Relaxation
  {
    id: 'ct-13',
    day: 13,
    name: 'Progressive Muscle Relaxation',
    category: 'MINDFULNESS',
    description: 'Systematically tense and release muscle groups to release physical tension.',
    steps: [
      'Find a comfortable position',
      'Start with your feet: tense for 5 seconds, release',
      'Move to calves: tense, hold, release',
      'Continue up: thighs, buttocks, abdomen',
      'Then: hands, arms, shoulders, face',
      'Notice the difference between tension and relaxation',
      'End with 3 deep breaths',
    ],
    duration: '15-20 minutes',
    icon: 'Activity',
    benefits: ['Reduces physical tension', 'Lowers anxiety', 'Improves sleep'],
  },

  // Day 14 - Acceptance
  {
    id: 'ct-14',
    day: 14,
    name: 'Radical Acceptance',
    category: 'DBT',
    description: 'Accept reality as it is, even when you don\'t like it, to reduce suffering.',
    steps: [
      'Identify what you are fighting against',
      'Acknowledge: "This is the current reality"',
      'Notice physical resistance in your body',
      'Say to yourself: "I cannot change what has already happened"',
      'Consider: Fighting reality only adds suffering',
      'Ask: What can I do now, given this reality?',
      'Repeat the acceptance statement as needed',
    ],
    duration: '10 minutes',
    icon: 'Circle',
    benefits: ['Reduces suffering', 'Frees up energy', 'Enables forward movement'],
  },

  // Day 15 - Behavioral experiment
  {
    id: 'ct-15',
    day: 15,
    name: 'Behavioral Experiment',
    category: 'CBT',
    description: 'Test your negative predictions by gathering real-world evidence.',
    steps: [
      'Identify a negative prediction (e.g., "They\'ll reject me")',
      'Rate your belief in the prediction (0-100%)',
      'Design a small experiment to test it',
      'Predict the outcome before the experiment',
      'Conduct the experiment',
      'Record what actually happened',
      'Compare prediction vs. reality',
      'What did you learn?',
    ],
    duration: 'Varies',
    icon: 'FlaskConical',
    benefits: ['Tests anxious predictions', 'Builds confidence', 'Gathers evidence'],
  },

  // Day 16 - Distraction
  {
    id: 'ct-16',
    day: 16,
    name: 'ACCEPTS Distraction',
    category: 'DBT',
    description: 'Use healthy distractions to ride out emotional waves until they pass.',
    steps: [
      'Activities: Do something that requires focus',
      'Contributing: Help someone else',
      'Comparisons: Compare to times you coped well',
      'Emotions: Create opposite emotions (comedy for sadness)',
      'Push away: Mentally leave the situation temporarily',
      'Thoughts: Count, do puzzles, name categories',
      'Sensations: Hold ice, squeeze a stress ball',
    ],
    duration: '15-30 minutes',
    icon: 'Shuffle',
    benefits: ['Reduces emotional intensity', 'Buys time to cope', 'Prevents impulsive actions'],
  },

  // Day 17 - Values clarification
  {
    id: 'ct-17',
    day: 17,
    name: 'Values Compass',
    category: 'CBT',
    description: 'Reconnect with your core values to guide decision-making and provide motivation.',
    steps: [
      'List 3-5 things most important to you (e.g., family, health, honesty)',
      'For each value, rate how well you\'re living it (1-10)',
      'Choose one value to focus on this week',
      'Identify one small action aligned with that value',
      'Schedule that action for tomorrow',
      'Reflect: How did acting on your value feel?',
    ],
    duration: '15 minutes',
    icon: 'Compass',
    benefits: ['Provides direction', 'Increases motivation', 'Reduces feeling lost'],
  },

  // Day 18 - Loving-kindness
  {
    id: 'ct-18',
    day: 18,
    name: 'Loving-Kindness Meditation',
    category: 'MINDFULNESS',
    description: 'Generate feelings of goodwill toward yourself and others.',
    steps: [
      'Sit comfortably and close your eyes',
      'Think of yourself and repeat: "May I be happy, may I be healthy, may I be safe"',
      'Picture someone you love, send them the same wishes',
      'Think of a neutral person, extend the wishes to them',
      'If you\'re ready, extend to someone difficult',
      'Finally, extend to all beings everywhere',
      'Rest in the feeling of warmth and connection',
    ],
    duration: '10-15 minutes',
    icon: 'HeartHandshake',
    benefits: ['Increases self-compassion', 'Reduces anger', 'Builds connection'],
  },

  // Day 19 - Problem-solving
  {
    id: 'ct-19',
    day: 19,
    name: 'Problem Solving Steps',
    category: 'CBT',
    description: 'Approach problems systematically rather than feeling overwhelmed.',
    steps: [
      'Define the problem specifically (not "everything is wrong")',
      'Brainstorm all possible solutions (no judging yet)',
      'Evaluate pros and cons of each option',
      'Choose the best option for now',
      'Break it into small, concrete steps',
      'Take the first step today',
      'Evaluate and adjust as needed',
    ],
    duration: '20 minutes',
    icon: 'Lightbulb',
    benefits: ['Reduces overwhelm', 'Creates action plan', 'Builds problem-solving skills'],
  },

  // Day 20 - Wise mind
  {
    id: 'ct-20',
    day: 20,
    name: 'Wise Mind Access',
    category: 'DBT',
    description: 'Find the balance between emotional mind and rational mind.',
    steps: [
      'Notice if you\'re in emotional mind (driven by feelings) or rational mind (cold logic)',
      'Take three slow breaths',
      'Ask: "What does my gut tell me?"',
      'Ask: "What do the facts tell me?"',
      'Find the place where feeling and knowing meet',
      'Ask: "What is the wise action here?"',
      'Trust the answer that arises',
    ],
    duration: '5-10 minutes',
    icon: 'Scale',
    benefits: ['Balances emotion and logic', 'Improves decisions', 'Builds intuition'],
  },

  // Day 21 - Gratitude
  {
    id: 'ct-21',
    day: 21,
    name: 'Three Good Things',
    category: 'CBT',
    description: 'Train your brain to notice positive experiences by recording them daily.',
    steps: [
      'At the end of each day, write down 3 good things',
      'They can be small (good coffee) or big (got a job)',
      'For each one, write WHY it happened',
      'Notice your role in making it happen',
      'Savor the positive feeling as you write',
      'Do this for at least one week',
    ],
    duration: '5 minutes',
    icon: 'Sparkles',
    benefits: ['Increases happiness', 'Reduces depression', 'Shifts attention to positive'],
  },

  // Day 22 - Urge surfing
  {
    id: 'ct-22',
    day: 22,
    name: 'Urge Surfing',
    category: 'MINDFULNESS',
    description: 'Ride out cravings and urges by observing them without acting on them.',
    steps: [
      'Notice the urge or craving arising',
      'Don\'t fight it or act on it - just observe',
      'Notice where you feel it in your body',
      'Imagine the urge as a wave that rises and falls',
      'Breathe and let the wave crest',
      'Notice: Urges typically peak at 20-30 minutes',
      'Surf the wave until it naturally subsides',
    ],
    duration: '20-30 minutes',
    icon: 'Waves',
    benefits: ['Reduces addictive behavior', 'Builds distress tolerance', 'Proves urges pass'],
  },

  // Day 23 - Interpersonal
  {
    id: 'ct-23',
    day: 23,
    name: 'GIVE Skills',
    category: 'DBT',
    description: 'Maintain relationships during difficult conversations.',
    steps: [
      'Gentle: Be non-threatening, no attacks or judgments',
      'Interested: Listen and ask questions, show curiosity',
      'Validate: Acknowledge the other person\'s feelings',
      'Easy manner: Use humor if appropriate, be light',
      'Practice with a less charged conversation first',
      'Notice the difference in how the conversation flows',
    ],
    duration: 'During conversations',
    icon: 'Users',
    benefits: ['Improves relationships', 'Reduces conflict', 'Builds connection'],
  },

  // Day 24 - Self-compassion
  {
    id: 'ct-24',
    day: 24,
    name: 'Self-Compassion Break',
    category: 'MINDFULNESS',
    description: 'Offer yourself kindness during difficult moments.',
    steps: [
      'Acknowledge: "This is a moment of suffering"',
      'Recognize: "Suffering is part of being human"',
      'Place your hand on your heart',
      'Say: "May I be kind to myself"',
      'Ask: "What do I need right now?"',
      'Offer yourself the same kindness you\'d give a friend',
    ],
    duration: '3-5 minutes',
    icon: 'Heart',
    benefits: ['Reduces self-criticism', 'Increases resilience', 'Promotes healing'],
  },

  // Day 25 - Cognitive
  {
    id: 'ct-25',
    day: 25,
    name: 'Decatastrophizing',
    category: 'CBT',
    description: 'Challenge worst-case thinking by examining probability and coping ability.',
    steps: [
      'Identify the catastrophic thought',
      'Ask: "What is the worst that could happen?"',
      'Ask: "What is the best that could happen?"',
      'Ask: "What is most likely to happen?"',
      'If the worst happened, how would you cope?',
      'Who could help you? What have you survived before?',
      'Focus on the most likely scenario',
    ],
    duration: '10 minutes',
    icon: 'AlertTriangle',
    benefits: ['Reduces catastrophizing', 'Builds coping confidence', 'Provides perspective'],
  },

  // Day 26 - Mindful walking
  {
    id: 'ct-26',
    day: 26,
    name: 'Walking Meditation',
    category: 'MINDFULNESS',
    description: 'Bring mindful awareness to the simple act of walking.',
    steps: [
      'Find a quiet place to walk 10-20 steps',
      'Stand still, feel your feet on the ground',
      'Begin walking slowly, notice lifting each foot',
      'Feel the foot move through the air',
      'Notice the foot touching down again',
      'When your mind wanders, return to the sensations',
      'Continue for 5-10 minutes',
    ],
    duration: '10 minutes',
    icon: 'Footprints',
    benefits: ['Combines movement and mindfulness', 'Grounds in body', 'Can do anywhere'],
  },

  // Day 27 - Emotion naming
  {
    id: 'ct-27',
    day: 27,
    name: 'Name It to Tame It',
    category: 'DBT',
    description: 'Reduce emotional intensity by accurately naming your emotions.',
    steps: [
      'Notice you\'re having an emotional reaction',
      'Pause and take a breath',
      'Ask: "What emotion am I feeling?"',
      'Be specific (not just "bad" but "disappointed")',
      'Say: "I notice I\'m feeling [emotion]"',
      'Notice if naming it reduces intensity',
      'Expand vocabulary: use an emotion wheel if needed',
    ],
    duration: '2 minutes',
    icon: 'Tag',
    benefits: ['Reduces emotional intensity', 'Increases awareness', 'Improves communication'],
  },

  // Day 28 - Scheduling
  {
    id: 'ct-28',
    day: 28,
    name: 'Activity Scheduling',
    category: 'CBT',
    description: 'Combat depression by scheduling pleasurable and mastery activities.',
    steps: [
      'List 5 activities that bring pleasure',
      'List 5 activities that give sense of accomplishment',
      'Rate each on a scale of 1-10 for mood boost',
      'Schedule at least one of each type daily',
      'Start small - even 10 minutes counts',
      'Track mood before and after activities',
      'Notice patterns in what helps most',
    ],
    duration: '15 minutes to plan',
    icon: 'Calendar',
    benefits: ['Combats depression', 'Increases activity', 'Builds positive habits'],
  },

  // Day 29 - CHECK THE FACTS
  {
    id: 'ct-29',
    day: 29,
    name: 'Check the Facts',
    category: 'DBT',
    description: 'Determine if your emotional response fits the facts of the situation.',
    steps: [
      'Describe the situation with facts only (no interpretations)',
      'What interpretations or assumptions are you making?',
      'Are there other possible interpretations?',
      'Does your emotion fit the facts?',
      'Is the intensity appropriate to the situation?',
      'If not fitting, what emotion would fit better?',
    ],
    duration: '10 minutes',
    icon: 'Search',
    benefits: ['Reduces emotional overreaction', 'Separates facts from interpretation', 'Improves accuracy'],
  },

  // Day 30 - Visualization
  {
    id: 'ct-30',
    day: 30,
    name: 'Safe Place Visualization',
    category: 'MINDFULNESS',
    description: 'Create a mental sanctuary you can visit anytime for calm and safety.',
    steps: [
      'Close your eyes and take deep breaths',
      'Imagine a place where you feel completely safe',
      'It can be real or imaginary',
      'Notice what you see in detail',
      'What sounds do you hear there?',
      'What do you feel (temperature, textures)?',
      'Add any comforting elements you want',
      'Know you can return here anytime',
    ],
    duration: '10 minutes',
    icon: 'Home',
    benefits: ['Reduces anxiety', 'Provides mental escape', 'Always accessible'],
  },

  // Day 31 - Integration
  {
    id: 'ct-31',
    day: 31,
    name: 'Monthly Reflection',
    category: 'CBT',
    description: 'Review and celebrate your progress from the past month.',
    steps: [
      'Review: What challenges did you face this month?',
      'Which coping techniques worked best for you?',
      'What progress did you make, however small?',
      'What are you proud of?',
      'What would you like to focus on next month?',
      'Write a compassionate letter to yourself',
      'Set one intention for the coming month',
    ],
    duration: '20 minutes',
    icon: 'ClipboardCheck',
    benefits: ['Celebrates progress', 'Identifies what works', 'Sets intentions'],
  },

  // =============================================================================
  // EXTENDED TECHNIQUES (Days 32-61) - Additional Evidence-Based Practices
  // =============================================================================

  // Day 32 - Somatic release
  {
    id: 'ct-32',
    day: 32,
    name: 'Shake It Off',
    category: 'MINDFULNESS',
    description: 'Release stored tension through intentional shaking, mimicking how animals naturally discharge stress.',
    steps: [
      'Stand with feet hip-width apart',
      'Begin shaking your hands gently',
      'Let the shaking spread to your arms',
      'Allow your whole body to shake loosely',
      'Shake for 2-3 minutes without controlling it',
      'Gradually slow down and stand still',
      'Notice how your body feels now',
    ],
    duration: '3-5 minutes',
    icon: 'Activity',
    benefits: ['Releases physical tension', 'Discharges stress hormones', 'Reconnects mind-body'],
  },

  // Day 33 - Rumination interruption
  {
    id: 'ct-33',
    day: 33,
    name: 'Worry Tree Decision',
    category: 'CBT',
    description: 'Use a decision tree to determine if a worry is actionable, then either act or let go.',
    steps: [
      'Notice the worry and write it down',
      'Ask: "Can I do something about this?"',
      'If YES: "Can I do it now?"',
      'If now: Do it immediately',
      'If later: Schedule it and let go for now',
      'If NO to first question: Practice letting go',
      'Redirect attention to present moment',
    ],
    duration: '5 minutes',
    icon: 'GitBranch',
    benefits: ['Stops rumination cycles', 'Promotes action or acceptance', 'Reduces worry time'],
  },

  // Day 34 - Emotional validation
  {
    id: 'ct-34',
    day: 34,
    name: 'Self-Validation Practice',
    category: 'DBT',
    description: 'Validate your own emotional experience instead of dismissing or judging it.',
    steps: [
      'Notice the emotion you are experiencing',
      'Name it without judgment: "I am feeling angry"',
      'Acknowledge it makes sense: "Of course I feel this way because..."',
      'Remind yourself: "All emotions are valid"',
      'Avoid "shoulding" yourself: Not "I shouldn\'t feel this"',
      'Give yourself permission to feel',
      'Then decide how to respond effectively',
    ],
    duration: '3-5 minutes',
    icon: 'Heart',
    benefits: ['Reduces emotional intensity', 'Builds self-trust', 'Prevents shame spirals'],
  },

  // Day 35 - Perfectionism
  {
    id: 'ct-35',
    day: 35,
    name: 'Good Enough Standard',
    category: 'CBT',
    description: 'Challenge perfectionism by defining and accepting "good enough" outcomes.',
    steps: [
      'Identify the task causing perfectionistic stress',
      'Ask: "What is the minimum acceptable outcome?"',
      'Define "good enough" in specific terms',
      'Set a time limit for the task',
      'Complete to "good enough" standard, then stop',
      'Notice: Did anything bad happen?',
      'Practice tolerating the discomfort of imperfection',
    ],
    duration: '10 minutes',
    icon: 'Target',
    benefits: ['Reduces perfectionism', 'Saves time and energy', 'Builds tolerance for imperfection'],
  },

  // Day 36 - Sleep preparation
  {
    id: 'ct-36',
    day: 36,
    name: 'Wind-Down Ritual',
    category: 'MINDFULNESS',
    description: 'Create a calming pre-sleep routine to signal your body it\'s time to rest.',
    steps: [
      '60 min before bed: Dim lights, no screens',
      'Take a warm shower or bath',
      'Do gentle stretching for 5 minutes',
      'Write tomorrow\'s to-do list to clear your mind',
      'Practice 4-7-8 breathing in bed',
      'Do a brief body scan, relaxing each part',
      'Repeat a calming phrase: "I release this day"',
    ],
    duration: '30-60 minutes',
    icon: 'Moon',
    benefits: ['Improves sleep quality', 'Reduces bedtime anxiety', 'Creates healthy routine'],
  },

  // Day 37 - Social anxiety
  {
    id: 'ct-37',
    day: 37,
    name: 'Spotlight Effect Check',
    category: 'CBT',
    description: 'Challenge the belief that everyone is watching and judging you.',
    steps: [
      'Notice the thought: "Everyone is looking at me"',
      'Reality check: How much do YOU notice others?',
      'Remember: Most people are focused on themselves',
      'The spotlight effect is a cognitive bias',
      'Even if noticed, people quickly forget',
      'Ask: "What would I think if roles were reversed?"',
      'Shift focus outward to others, not inward',
    ],
    duration: '5 minutes',
    icon: 'Users',
    benefits: ['Reduces social anxiety', 'Challenges cognitive distortions', 'Builds social confidence'],
  },

  // Day 38 - Boundary setting
  {
    id: 'ct-38',
    day: 38,
    name: 'Boundary Scripts',
    category: 'DBT',
    description: 'Prepare assertive responses for common boundary violations.',
    steps: [
      'Identify a boundary that gets crossed repeatedly',
      'Write a clear, calm statement of your limit',
      'Use "I" statements: "I need..." not "You always..."',
      'Include consequence if boundary is crossed',
      'Practice saying it out loud',
      'Rehearse staying calm during pushback',
      'Remember: "No" is a complete sentence',
    ],
    duration: '15 minutes',
    icon: 'Shield',
    benefits: ['Protects energy', 'Improves relationships', 'Builds assertiveness'],
  },

  // Day 39 - Procrastination
  {
    id: 'ct-39',
    day: 39,
    name: 'Two-Minute Start',
    category: 'CBT',
    description: 'Beat procrastination by committing to just two minutes of a dreaded task.',
    steps: [
      'Choose the task you\'ve been avoiding',
      'Commit to working on it for only 2 minutes',
      'Set a timer for 2 minutes',
      'Start immediately, no preparation needed',
      'When timer goes off, choose: stop or continue',
      'Often momentum carries you forward',
      'Celebrate starting, regardless of outcome',
    ],
    duration: '2+ minutes',
    icon: 'Clock',
    benefits: ['Overcomes inertia', 'Builds momentum', 'Reduces avoidance anxiety'],
  },

  // Day 40 - Emotional first aid
  {
    id: 'ct-40',
    day: 40,
    name: 'RAIN Technique',
    category: 'MINDFULNESS',
    description: 'A four-step process to work through difficult emotions with mindfulness.',
    steps: [
      'R - Recognize: Name what you\'re feeling',
      'A - Allow: Let the feeling exist without fighting',
      'I - Investigate: Where do you feel it in your body?',
      'N - Non-identification: "I am feeling sad" not "I am sad"',
      'Breathe gently through each step',
      'Approach yourself with curiosity, not judgment',
      'Repeat as needed until intensity decreases',
    ],
    duration: '5-10 minutes',
    icon: 'Droplet',
    benefits: ['Processes difficult emotions', 'Prevents emotional avoidance', 'Builds emotional intelligence'],
  },

  // Day 41 - Anger cooling
  {
    id: 'ct-41',
    day: 41,
    name: 'Anger Countdown',
    category: 'DBT',
    description: 'Delay angry reactions using a structured countdown technique.',
    steps: [
      'When anger rises, say "I need a moment"',
      'Count backward from 10 slowly',
      'At each number, take one deep breath',
      'Unclench your jaw and drop shoulders',
      'By 5, ask: "What do I really need here?"',
      'By 1, choose your response consciously',
      'Respond from intention, not reaction',
    ],
    duration: '1-2 minutes',
    icon: 'Thermometer',
    benefits: ['Prevents reactive outbursts', 'Creates response space', 'Maintains relationships'],
  },

  // Day 42 - Uncertainty tolerance
  {
    id: 'ct-42',
    day: 42,
    name: 'Uncertainty Exposure',
    category: 'CBT',
    description: 'Build tolerance for uncertainty through gradual exposure exercises.',
    steps: [
      'Identify something uncertain that bothers you',
      'Rate your distress about not knowing (1-10)',
      'Practice sitting with the uncertainty for 5 minutes',
      'Notice urges to seek reassurance or certainty',
      'Don\'t act on those urges',
      'Remind yourself: "I can handle not knowing"',
      'Rate distress again after practice',
    ],
    duration: '10 minutes',
    icon: 'HelpCircle',
    benefits: ['Reduces anxiety about unknown', 'Builds distress tolerance', 'Increases flexibility'],
  },

  // Day 43 - Motivation
  {
    id: 'ct-43',
    day: 43,
    name: 'Future Self Letter',
    category: 'CBT',
    description: 'Write a letter from your future self to boost motivation and perspective.',
    steps: [
      'Imagine yourself one year from now, thriving',
      'Write a letter from that future self to present you',
      'Describe what life looks like having done the work',
      'Include specific encouragement for current struggles',
      'Mention what you\'re grateful present-you did',
      'Read this letter when motivation is low',
      'Update quarterly as you grow',
    ],
    duration: '15-20 minutes',
    icon: 'Mail',
    benefits: ['Boosts motivation', 'Provides perspective', 'Connects actions to goals'],
  },

  // Day 44 - Shame resilience
  {
    id: 'ct-44',
    day: 44,
    name: 'Shame Shrinking',
    category: 'DBT',
    description: 'Reduce shame\'s power by speaking it aloud to a trusted person.',
    steps: [
      'Identify the shame you\'re carrying',
      'Notice the secrecy urge (shame needs hiding)',
      'Choose one trusted person to share with',
      'Use the phrase: "I\'m feeling shame about..."',
      'Let them respond with empathy',
      'Notice: Shame shrinks when spoken',
      'Practice self-compassion afterward',
    ],
    duration: '15-30 minutes',
    icon: 'MessageCircle',
    benefits: ['Reduces shame power', 'Builds connection', 'Breaks isolation'],
  },

  // Day 45 - Attention training
  {
    id: 'ct-45',
    day: 45,
    name: 'Single-Tasking Hour',
    category: 'MINDFULNESS',
    description: 'Practice deep focus by doing one thing at a time with full attention.',
    steps: [
      'Choose one task to focus on for 60 minutes',
      'Put phone in another room',
      'Close all unnecessary tabs/apps',
      'Set a timer for 60 minutes',
      'When distracted, gently return to task',
      'Note how many times you get distracted',
      'Celebrate completing the focused hour',
    ],
    duration: '60 minutes',
    icon: 'Target',
    benefits: ['Improves concentration', 'Increases productivity', 'Reduces mental fatigue'],
  },

  // Day 46 - Grief processing
  {
    id: 'ct-46',
    day: 46,
    name: 'Grief Ritual',
    category: 'MINDFULNESS',
    description: 'Create a meaningful ritual to honor and process grief.',
    steps: [
      'Set aside dedicated time for grief',
      'Create a simple ritual (light a candle, look at photos)',
      'Allow whatever emotions arise',
      'Speak aloud to who/what you\'ve lost',
      'Write a letter expressing what\'s unsaid',
      'Include gratitude for what was',
      'Close with a symbolic gesture (blow out candle)',
    ],
    duration: '20-30 minutes',
    icon: 'Flame',
    benefits: ['Honors loss', 'Provides closure', 'Prevents complicated grief'],
  },

  // Day 47 - Self-esteem
  {
    id: 'ct-47',
    day: 47,
    name: 'Evidence of Worth',
    category: 'CBT',
    description: 'Counter low self-esteem by collecting concrete evidence of your value.',
    steps: [
      'Write the negative belief: "I am worthless/unlovable"',
      'List 5 times someone appreciated you',
      'List 5 things you\'ve accomplished (any size)',
      'List 5 qualities others have complimented',
      'List 5 ways you\'ve helped others',
      'Review this evidence when self-critical',
      'Add to the list weekly',
    ],
    duration: '15 minutes',
    icon: 'Star',
    benefits: ['Builds self-worth', 'Counters negative self-talk', 'Creates reference tool'],
  },

  // Day 48 - Forgiveness
  {
    id: 'ct-48',
    day: 48,
    name: 'Forgiveness Meditation',
    category: 'MINDFULNESS',
    description: 'Release resentment through a structured forgiveness practice.',
    steps: [
      'Sit quietly and breathe deeply',
      'Bring to mind someone who hurt you',
      'Notice the pain without drowning in it',
      'Say: "Holding onto this hurts me"',
      'Say: "I choose to release this for my peace"',
      'This is not condoning; it\'s freeing yourself',
      'Repeat: "I forgive you, I release you, I am free"',
    ],
    duration: '10-15 minutes',
    icon: 'Unlock',
    benefits: ['Releases resentment', 'Reduces stress', 'Frees emotional energy'],
  },

  // Day 49 - Decision fatigue
  {
    id: 'ct-49',
    day: 49,
    name: 'Decision Simplifier',
    category: 'CBT',
    description: 'Reduce decision fatigue by creating systems and defaults.',
    steps: [
      'Identify decisions that drain you daily',
      'Create defaults for routine choices (meals, clothes)',
      'For bigger decisions, set a 2-minute rule',
      'If stuck, flip a coin - notice your gut reaction',
      'Good enough decisions beat perfect paralysis',
      'Trust that most decisions are reversible',
      'Save mental energy for what truly matters',
    ],
    duration: '10 minutes',
    icon: 'CheckSquare',
    benefits: ['Conserves mental energy', 'Reduces overwhelm', 'Speeds up daily life'],
  },

  // Day 50 - Nature connection
  {
    id: 'ct-50',
    day: 50,
    name: 'Sit Spot Practice',
    category: 'MINDFULNESS',
    description: 'Connect with nature by regularly visiting the same outdoor spot.',
    steps: [
      'Find a natural spot you can visit regularly',
      'Sit quietly for at least 10 minutes',
      'Notice what\'s different from last time',
      'Observe birds, insects, plants, sky',
      'Use all five senses',
      'Let thoughts pass like clouds',
      'Visit the same spot weekly to notice seasonal changes',
    ],
    duration: '10-20 minutes',
    icon: 'Leaf',
    benefits: ['Reduces stress hormones', 'Increases calm', 'Builds nature connection'],
  },

  // Day 51 - Assertiveness
  {
    id: 'ct-51',
    day: 51,
    name: 'Broken Record Technique',
    category: 'DBT',
    description: 'Maintain your position by calmly repeating your statement despite pressure.',
    steps: [
      'Decide your position clearly before the conversation',
      'State your position once, calmly and clearly',
      'When met with arguments, repeat same statement',
      'Do not justify, argue, defend, or explain (JADE)',
      'Keep tone calm and neutral',
      'Example: "I understand, and I\'m not available Saturday"',
      'Repeat as needed until message is received',
    ],
    duration: '5 minutes to prepare',
    icon: 'Repeat',
    benefits: ['Maintains boundaries', 'Avoids escalation', 'Builds assertiveness'],
  },

  // Day 52 - Overwhelm management
  {
    id: 'ct-52',
    day: 52,
    name: 'Brain Dump',
    category: 'CBT',
    description: 'Clear mental clutter by writing everything down without organizing.',
    steps: [
      'Set a timer for 10 minutes',
      'Write everything in your head - tasks, worries, ideas',
      'Don\'t organize, just dump',
      'Include half-thoughts and random concerns',
      'When timer ends, stop writing',
      'Circle the 3 most important items',
      'Schedule those 3 things, file or trash the rest',
    ],
    duration: '10-15 minutes',
    icon: 'FileText',
    benefits: ['Clears mental clutter', 'Reduces overwhelm', 'Identifies priorities'],
  },

  // Day 53 - Criticism handling
  {
    id: 'ct-53',
    day: 53,
    name: 'Criticism Filter',
    category: 'CBT',
    description: 'Evaluate criticism objectively to take what\'s useful and leave what\'s not.',
    steps: [
      'Receive the criticism without immediate reaction',
      'Ask: "Is there any truth in this feedback?"',
      'Separate the delivery from the content',
      'If valid: Thank them and consider the change',
      'If invalid: Let it go without defensiveness',
      'Remember: Criticism says more about the giver',
      'You get to choose what to internalize',
    ],
    duration: '5-10 minutes',
    icon: 'Filter',
    benefits: ['Reduces defensiveness', 'Enables growth', 'Protects self-esteem'],
  },

  // Day 54 - Energy management
  {
    id: 'ct-54',
    day: 54,
    name: 'Energy Audit',
    category: 'DBT',
    description: 'Identify what gives and drains your energy to make better choices.',
    steps: [
      'List 10 activities from your typical week',
      'Rate each: Energy Giver (+) or Drainer (-)',
      'Notice patterns in what depletes you',
      'Notice patterns in what recharges you',
      'Plan to increase energy givers this week',
      'Set limits on energy drainers',
      'Repeat monthly as needs change',
    ],
    duration: '15 minutes',
    icon: 'Battery',
    benefits: ['Prevents burnout', 'Optimizes energy', 'Improves life satisfaction'],
  },

  // Day 55 - Letting go
  {
    id: 'ct-55',
    day: 55,
    name: 'Leaves on a Stream',
    category: 'MINDFULNESS',
    description: 'Visualize thoughts floating away on leaves down a stream.',
    steps: [
      'Close your eyes and imagine a gentle stream',
      'Notice leaves floating on the water',
      'When a thought arises, place it on a leaf',
      'Watch the leaf carry it downstream',
      'Don\'t push or hold any thought',
      'If you get hooked, notice, and start again',
      'Practice for 5-10 minutes',
    ],
    duration: '5-10 minutes',
    icon: 'Leaf',
    benefits: ['Detaches from thoughts', 'Reduces rumination', 'Builds mindfulness muscle'],
  },

  // Day 56 - Building mastery
  {
    id: 'ct-56',
    day: 56,
    name: 'Daily Mastery Activity',
    category: 'DBT',
    description: 'Do one challenging thing daily to build confidence and resilience.',
    steps: [
      'Choose one challenging but achievable task',
      'It should be slightly outside your comfort zone',
      'Examples: Learn a skill, exercise, difficult conversation',
      'Complete the task fully',
      'Notice the sense of accomplishment',
      'Record what you did and how it felt',
      'Build difficulty gradually over time',
    ],
    duration: 'Varies',
    icon: 'Trophy',
    benefits: ['Builds confidence', 'Increases resilience', 'Creates positive momentum'],
  },

  // Day 57 - Present moment
  {
    id: 'ct-57',
    day: 57,
    name: 'One Mindful Breath',
    category: 'MINDFULNESS',
    description: 'Use a single conscious breath as a reset button throughout the day.',
    steps: [
      'Set reminders throughout your day',
      'When reminded, stop what you\'re doing',
      'Take one slow, deep breath',
      'Feel the air enter and leave your body',
      'Notice where you are right now',
      'Resume activity with fresh awareness',
      'Practice 10+ times throughout the day',
    ],
    duration: '10 seconds each',
    icon: 'Wind',
    benefits: ['Creates mindful pauses', 'Reduces autopilot living', 'Easy to implement'],
  },

  // Day 58 - Pros and cons
  {
    id: 'ct-58',
    day: 58,
    name: 'Four-Square Pros/Cons',
    category: 'DBT',
    description: 'Make difficult decisions by examining all angles of acting vs. not acting.',
    steps: [
      'Draw a 2x2 grid on paper',
      'Label columns: "Do It" and "Don\'t Do It"',
      'Label rows: "Pros" and "Cons"',
      'Fill in all four squares completely',
      'Consider short-term AND long-term in each',
      'Weight items by importance',
      'The fuller picture guides wiser decisions',
    ],
    duration: '15 minutes',
    icon: 'LayoutGrid',
    benefits: ['Improves decision-making', 'Considers all angles', 'Reduces impulsivity'],
  },

  // Day 59 - Compassion for others
  {
    id: 'ct-59',
    day: 59,
    name: 'Just Like Me',
    category: 'MINDFULNESS',
    description: 'Build compassion by recognizing shared humanity with difficult people.',
    steps: [
      'Think of someone you find difficult',
      'Silently say: "This person wants to be happy, just like me"',
      '"This person has struggles, just like me"',
      '"This person has made mistakes, just like me"',
      '"This person is doing their best, just like me"',
      'Notice any softening in your feelings',
      'Practice with strangers too',
    ],
    duration: '5 minutes',
    icon: 'Users',
    benefits: ['Builds empathy', 'Reduces judgment', 'Improves relationships'],
  },

  // Day 60 - Cope ahead planning
  {
    id: 'ct-60',
    day: 60,
    name: 'Cope Ahead Plan',
    category: 'DBT',
    description: 'Prepare for challenging situations by rehearsing your coping response.',
    steps: [
      'Identify an upcoming difficult situation',
      'Describe it in detail: who, what, when, where',
      'List emotions that might arise',
      'Decide which coping skills you\'ll use',
      'Visualize yourself using those skills successfully',
      'Rehearse in your mind several times',
      'When the situation arrives, execute your plan',
    ],
    duration: '15-20 minutes',
    icon: 'Map',
    benefits: ['Reduces anxiety about future', 'Increases coping success', 'Builds confidence'],
  },

  // Day 61 - Integration and review
  {
    id: 'ct-61',
    day: 61,
    name: 'Coping Toolkit Review',
    category: 'CBT',
    description: 'Review and organize your personal collection of effective coping strategies.',
    steps: [
      'List all coping techniques you\'ve tried',
      'Rate each: Very Helpful / Somewhat / Not Helpful',
      'Identify your top 5 go-to strategies',
      'Note which works best for which emotions',
      'Create a physical or digital "emergency card"',
      'Share your toolkit with a support person',
      'Update quarterly as you learn more',
    ],
    duration: '20-30 minutes',
    icon: 'Briefcase',
    benefits: ['Personalizes your toolkit', 'Prepares for crisis', 'Tracks growth'],
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get day of year (1-366)
 */
function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Get the coping technique for a specific day index
 * Uses modulo to cycle through all 61 techniques
 */
export function getTechniqueForDay(dayIndex: number): CopingTechnique {
  const index = ((dayIndex - 1) % COPING_TECHNIQUES.length + COPING_TECHNIQUES.length) % COPING_TECHNIQUES.length
  return COPING_TECHNIQUES[index]
}

/**
 * Get today's coping technique
 * Uses day-of-year to cycle through all 61 techniques (~2 month rotation)
 */
export function getTodaysTechnique(): CopingTechnique {
  const dayOfYear = getDayOfYear()
  return getTechniqueForDay(dayOfYear)
}

/**
 * Get techniques by category
 */
export function getTechniquesByCategory(category: CopingCategory): CopingTechnique[] {
  return COPING_TECHNIQUES.filter((t) => t.category === category)
}

/**
 * Get a random technique from a specific category
 */
export function getRandomTechnique(category?: CopingCategory): CopingTechnique {
  const techniques = category ? getTechniquesByCategory(category) : COPING_TECHNIQUES
  const randomIndex = Math.floor(Math.random() * techniques.length)
  return techniques[randomIndex]
}

export default COPING_TECHNIQUES
