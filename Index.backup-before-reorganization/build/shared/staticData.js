// ============================================================
// GLRS LIGHTHOUSE - STATIC DATA
// ============================================================
// Hardcoded arrays and configuration data
// Extracted from PIRapp.js for modularity
// ============================================================

// Coping techniques (31 daily techniques covering CBT/DBT/mindfulness)
const copingTechniques = [{
  day: 1,
  category: 'Breathing',
  title: 'Box Breathing',
  icon: 'wind',
  description: '1. Breathe in slowly for 4 counts\n2. Hold your breath for 4 counts\n3. Breathe out slowly for 4 counts\n4. Hold empty lungs for 4 counts\n5. Repeat for 5 minutes\n\nUsed by Navy SEALs to stay calm under pressure.'
}, {
  day: 2,
  category: 'Grounding',
  title: '5-4-3-2-1 Grounding',
  icon: 'eye',
  description: 'Notice and name aloud:\n\n5 things you can SEE\n4 things you can TOUCH\n3 things you can HEAR\n2 things you can SMELL\n1 thing you can TASTE\n\nBrings you back to the present moment when feeling overwhelmed.'
}, {
  day: 3,
  category: 'CBT',
  title: 'Thought Record',
  icon: 'file-text',
  description: '1. Write down the triggering situation\n2. Identify the automatic negative thought\n3. Note the emotions and intensity (1-10)\n4. Find evidence FOR the thought\n5. Find evidence AGAINST the thought\n6. Create a balanced alternative thought\n\nChallenges cognitive distortions.'
}, {
  day: 4,
  category: 'DBT',
  title: 'TIPP Skill',
  icon: 'thermometer',
  description: 'Temperature: Hold ice or splash cold water on face\nIntense exercise: Do 60 seconds of jumping jacks\nPaced breathing: Slow exhales longer than inhales\nProgressive muscle relaxation: Tense and release muscles\n\nQuickly reduces intense emotions in crisis.'
}, {
  day: 5,
  category: 'Mindfulness',
  title: 'Body Scan Meditation',
  icon: 'scan',
  description: '1. Lie down or sit comfortably\n2. Close your eyes\n3. Focus attention on your toes\n4. Slowly move awareness up through:\n   - Feet, ankles, calves, knees\n   - Thighs, hips, stomach\n   - Chest, shoulders, arms\n   - Neck, face, head\n5. Notice sensations without judgment\n\n10-minute practice.'
}, {
  day: 6,
  category: 'Anger Management',
  title: 'Timeout Technique',
  icon: 'pause-circle',
  description: '1. Notice anger rising (physical cues)\n2. Say "I need a timeout" out loud\n3. Leave the situation for 20 minutes\n4. Do calming activity (walk, breathe, music)\n5. Return when calm enough to discuss\n\nPrevents regrettable angry outbursts.'
}, {
  day: 7,
  category: 'Anxiety',
  title: 'Worry Time Schedule',
  icon: 'clock',
  description: '1. Schedule 15 minutes daily for worrying\n2. When worries arise during day, write them down\n3. Tell yourself "I\'ll think about this at 3pm"\n4. During worry time, review list and problem-solve\n5. After 15 minutes, close the list\n\nContains anxiety to specific time.'
}, {
  day: 8,
  category: 'Breathing',
  title: '4-7-8 Breathing',
  icon: 'wind',
  description: '1. Exhale completely through mouth\n2. Close mouth, inhale through nose for 4 counts\n3. Hold breath for 7 counts\n4. Exhale completely through mouth for 8 counts\n5. Repeat 4 cycles\n\nDr. Andrew Weil\'s natural tranquilizer.'
}, {
  day: 9,
  category: 'Grounding',
  title: 'Physical Grounding',
  icon: 'anchor',
  description: '1. Plant both feet firmly on ground\n2. Press feet down, feel the floor\n3. Notice the weight of your body\n4. Touch something nearby (wall, chair)\n5. Feel the texture and temperature\n6. Say "I am here, I am safe"\n\nAnchors you when dissociating.'
}, {
  day: 10,
  category: 'CBT',
  title: 'Cognitive Reframing',
  icon: 'refresh-cw',
  description: 'OLD THOUGHT: "I\'m a total failure"\nREFRAME: "I made a mistake, and I can learn from it"\n\nOLD: "Nobody likes me"\nREFRAME: "Some people like me, I can build connections"\n\nOLD: "I can\'t handle this"\nREFRAME: "This is hard, but I\'ve handled hard things before"\n\nReplace absolutes with balanced thoughts.'
}, {
  day: 11,
  category: 'DBT',
  title: 'STOP Skill',
  icon: 'octagon',
  description: 'S - STOP: Freeze, don\'t react\nT - TAKE A STEP BACK: Get space from situation\nO - OBSERVE: Notice thoughts, feelings, facts\nP - PROCEED MINDFULLY: What\'s effective here?\n\nPrevents impulsive reactions.'
}, {
  day: 12,
  category: 'Mindfulness',
  title: 'Mindful Walking',
  icon: 'footprints',
  description: '1. Walk slowly and deliberately\n2. Notice the sensation of each foot lifting\n3. Feel your foot moving through air\n4. Notice the foot touching ground\n5. Feel weight shifting to that foot\n6. Repeat with other foot\n\nWalk for 10 minutes focusing only on steps.'
}, {
  day: 13,
  category: 'Anger Management',
  title: 'Anger Ladder',
  icon: 'bar-chart-2',
  description: 'Rate your anger 1-10:\n\n1-3: Annoyed (deep breath, let it go)\n4-6: Frustrated (take a break, talk it out)\n7-8: Angry (use timeout, physical activity)\n9-10: Furious (immediate safety plan, call support)\n\nKnow your number, match your response.'
}, {
  day: 14,
  category: 'Anxiety',
  title: 'Progressive Muscle Relaxation',
  icon: 'activity',
  description: '1. Tense fists for 5 seconds, release\n2. Tense arms for 5 seconds, release\n3. Tense shoulders for 5 seconds, release\n4. Tense face for 5 seconds, release\n5. Tense stomach for 5 seconds, release\n6. Tense legs for 5 seconds, release\n7. Tense feet for 5 seconds, release\n\nReleases physical tension from anxiety.'
}, {
  day: 15,
  category: 'Breathing',
  title: 'Diaphragmatic Breathing',
  icon: 'wind',
  description: '1. Place one hand on chest, one on belly\n2. Breathe in through nose for 4 counts\n3. Belly should rise, chest stays still\n4. Exhale through mouth for 6 counts\n5. Belly should fall\n6. Repeat for 5 minutes\n\nActivates parasympathetic nervous system.'
}, {
  day: 16,
  category: 'Grounding',
  title: 'Categories Game',
  icon: 'list',
  description: 'Choose a category and name items:\n\n- 10 US states\n- 10 animals\n- 10 foods\n- 10 movies\n- 10 song titles\n\nSay them out loud. Engages logical brain, reduces emotional overwhelm.'
}, {
  day: 17,
  category: 'CBT',
  title: 'Decatastrophizing',
  icon: 'alert-triangle',
  description: 'WORST CASE: What\'s the absolute worst that could happen?\nBEST CASE: What\'s the best possible outcome?\nMOST LIKELY: What will probably actually happen?\n\nReality is usually in the middle. Reduces catastrophic thinking.'
}, {
  day: 18,
  category: 'DBT',
  title: 'DEAR MAN',
  icon: 'message-square',
  description: 'Describe the situation\nExpress your feelings\nAssert your needs\nReinforce (why they should help)\n\nstay Mindful (don\'t get distracted)\nAppear confident\nNegotiate (be willing to compromise)\n\nEffective interpersonal communication.'
}, {
  day: 19,
  category: 'Mindfulness',
  title: 'Mindful Eating',
  icon: 'coffee',
  description: '1. Choose one food (raisin, chocolate, fruit)\n2. Look at it closely for 30 seconds\n3. Smell it for 30 seconds\n4. Feel the texture for 30 seconds\n5. Place in mouth without chewing (30 sec)\n6. Chew slowly, noticing flavors\n7. Swallow mindfully\n\nPractices being fully present.'
}, {
  day: 20,
  category: 'Anger Management',
  title: 'Opposite Action',
  icon: 'repeat',
  description: 'When anger urges you to:\n\nYELL → Speak softly\nATTACK → Step away\nBLAME → Take responsibility\nBREAK THINGS → Hold something gently\n\nDoing the opposite reduces anger\'s intensity.'
}, {
  day: 21,
  category: 'Anxiety',
  title: 'Exposure Ladder',
  icon: 'trending-up',
  description: '1. List feared situation (1-10 difficulty)\n2. Start with easiest (difficulty 2-3)\n3. Face that situation repeatedly\n4. When anxiety drops 50%, move to next step\n5. Gradually work up the ladder\n\nGradual exposure builds confidence.'
}, {
  day: 22,
  category: 'Breathing',
  title: 'Alternate Nostril Breathing',
  icon: 'wind',
  description: '1. Close right nostril with thumb\n2. Inhale through left nostril (4 counts)\n3. Close left nostril with ring finger\n4. Exhale through right nostril (4 counts)\n5. Inhale through right nostril (4 counts)\n6. Switch, exhale through left\n7. Repeat 5 minutes\n\nBalances nervous system.'
}, {
  day: 23,
  category: 'Grounding',
  title: 'Safe Place Visualization',
  icon: 'home',
  description: '1. Close your eyes\n2. Picture a place where you feel completely safe\n3. Notice every detail: colors, sounds, smells\n4. Feel the safety in your body\n5. Create a cue word (e.g., "beach")\n6. Practice daily\n7. Use cue word in crisis\n\nMental safe space always available.'
}, {
  day: 24,
  category: 'CBT',
  title: 'Cost-Benefit Analysis',
  icon: 'scale',
  description: 'For any belief or behavior:\n\nCOSTS:\n- What are the disadvantages?\n- What does it cost me?\n\nBENEFITS:\n- What are the advantages?\n- What do I gain?\n\nMakes unconscious patterns conscious.'
}, {
  day: 25,
  category: 'DBT',
  title: 'Radical Acceptance',
  icon: 'check-circle',
  description: 'What it is:\n- Accepting reality as it is\n- Not approving or liking it\n- Stopping the fight with reality\n\n"I can\'t change what happened, AND I can choose how I respond now."\n\nReduces suffering from non-acceptance.'
}, {
  day: 26,
  category: 'Mindfulness',
  title: 'Loving-Kindness Meditation',
  icon: 'heart',
  description: 'Repeat silently:\n\n"May I be safe\nMay I be healthy\nMay I be happy\nMay I live with ease"\n\nThen wish same for:\n- Someone you love\n- Someone neutral\n- Someone difficult\n- All beings\n\nBuilds self-compassion.'
}, {
  day: 27,
  category: 'Anger Management',
  title: 'Anger Journal',
  icon: 'book',
  description: 'After anger episode, write:\n\n1. TRIGGER: What happened right before?\n2. THOUGHTS: What was I thinking?\n3. FEELINGS: What did I feel in my body?\n4. ACTIONS: What did I do?\n5. CONSEQUENCES: What happened as a result?\n6. ALTERNATIVE: What could I do differently?\n\nIdentifies patterns over time.'
}, {
  day: 28,
  category: 'Anxiety',
  title: 'Thought Stopping',
  icon: 'x-circle',
  description: '1. When anxious thought starts, yell "STOP!" (or picture a stop sign)\n2. Snap a rubber band on wrist (or clap)\n3. Replace with planned positive thought\n4. Engage in physical activity\n\nInterrupts rumination cycle.'
}, {
  day: 29,
  category: 'Breathing',
  title: 'Resonant Breathing',
  icon: 'wind',
  description: '1. Breathe at rate of 6 breaths per minute\n2. Inhale for 5 seconds\n3. Exhale for 5 seconds\n4. Keep rhythm steady\n5. Practice for 10-20 minutes\n\nOptimizes heart rate variability, reduces stress.'
}, {
  day: 30,
  category: 'Grounding',
  title: 'Cold Water Grounding',
  icon: 'droplet',
  description: '1. Hold ice cube in your hand\n2. Splash cold water on your face\n3. Take a cold shower\n4. Drink ice water slowly\n\nPhysical sensation brings immediate presence. Activates dive reflex, calms nervous system.'
}, {
  day: 31,
  category: 'CBT',
  title: 'Evidence Gathering',
  icon: 'search',
  description: 'BELIEF: "Everyone thinks I\'m incompetent"\n\nEVIDENCE FOR:\n- (list objective facts only)\n\nEVIDENCE AGAINST:\n- (list objective facts only)\n\nNEW BALANCED BELIEF:\n- Based on all evidence\n\nTests beliefs against reality.'
}];

// Gratitude themes (12 categories)
const gratitudeThemes = [{
  id: 'relationships',
  label: 'Relationships',
  icon: 'users',
  color: '#FF6B6B'
}, {
  id: 'health',
  label: 'Health & Wellness',
  icon: 'heart',
  color: '#4ECDC4'
}, {
  id: 'nature',
  label: 'Nature & Environment',
  icon: 'sun',
  color: '#95E1D3'
}, {
  id: 'personal',
  label: 'Personal Growth',
  icon: 'trending-up',
  color: '#F38181'
}, {
  id: 'moments',
  label: 'Small Moments',
  icon: 'smile',
  color: '#FFD93D'
}, {
  id: 'opportunities',
  label: 'Opportunities',
  icon: 'target',
  color: '#6BCB77'
}, {
  id: 'comfort',
  label: 'Comfort & Safety',
  icon: 'shield',
  color: '#4D96FF'
}, {
  id: 'accomplishments',
  label: 'Accomplishments',
  icon: 'award',
  color: '#9D84B7'
}, {
  id: 'support',
  label: 'Support & Help',
  icon: 'life-buoy',
  color: '#FFA500'
}, {
  id: 'creativity',
  label: 'Creativity & Expression',
  icon: 'palette',
  color: '#E74C3C'
}, {
  id: 'simple',
  label: 'Simple Pleasures',
  icon: 'coffee',
  color: '#795548'
}, {
  id: 'other',
  label: 'Other',
  icon: 'more-horizontal',
  color: '#999999'
}];

// ============================================================
// NAMESPACE EXPOSURE
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.staticData = {
  copingTechniques,
  gratitudeThemes
};
console.log('✅ staticData.js loaded - Coping techniques and gratitude themes available');