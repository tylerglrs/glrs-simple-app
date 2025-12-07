# Phase 9: Voice Integration Setup Guide

## Overview

This guide explains how to set up the high-performance voice features for GLRS Lighthouse.

**Performance Targets:**
- STT (Speech-to-Text): <500ms (Deepgram Nova-3)
- TTS (Text-to-Speech): <500ms (ElevenLabs Flash)
- Total voice round-trip: <3 seconds (down from 13-60 seconds)

## API Keys Required

| Service | Key Name | Where to Get | Free Tier |
|---------|----------|--------------|-----------|
| Deepgram | DEEPGRAM_API_KEY | [deepgram.com](https://deepgram.com) | $200 credit |
| ElevenLabs | ELEVENLABS_API_KEY | [elevenlabs.io](https://elevenlabs.io) | 10K chars/month |

## Step 1: Create Accounts

### Deepgram
1. Go to https://deepgram.com
2. Click "Sign Up" / "Get Started Free"
3. Create account with email or Google
4. You'll receive $200 in free credits (plenty for testing)
5. Navigate to "Settings" → "API Keys"
6. Click "Create API Key"
7. Name it "GLRS Lighthouse"
8. Copy the key (you won't see it again!)

### ElevenLabs
1. Go to https://elevenlabs.io
2. Click "Sign Up"
3. Create account with email or Google
4. Free tier gives 10,000 characters/month
5. Navigate to "Settings" → "API Keys"
6. Click "Create API Key"
7. Copy the key

## Step 2: Add Keys to Firebase Functions Config

Run these commands in your terminal:

```bash
# Set Deepgram API key
firebase functions:config:set deepgram.key="YOUR_DEEPGRAM_API_KEY"

# Set ElevenLabs API key
firebase functions:config:set elevenlabs.key="YOUR_ELEVENLABS_API_KEY"

# Verify the config
firebase functions:config:get
```

You should see output like:
```json
{
  "deepgram": {
    "key": "YOUR_DEEPGRAM_API_KEY"
  },
  "elevenlabs": {
    "key": "YOUR_ELEVENLABS_API_KEY"
  },
  "openai": {
    "key": "YOUR_EXISTING_OPENAI_KEY"
  }
}
```

## Step 3: Deploy Functions

```bash
cd /Users/tylerroberts/glrs-simple-app

# Deploy the voice functions
firebase deploy --only functions:deepgramTranscribe,functions:deepgramHealthCheck,functions:elevenlabsTTS,functions:elevenlabsGetVoices,functions:elevenlabsHealthCheck
```

## Step 4: Test the Integration

### Health Checks

You can verify the integrations are working by calling the health check functions:

```javascript
// In browser console on the app
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Test Deepgram
const deepgramCheck = httpsCallable(functions, 'deepgramHealthCheck');
const deepgramResult = await deepgramCheck();
console.log('Deepgram:', deepgramResult.data);
// Expected: { status: 'ok', provider: 'deepgram' }

// Test ElevenLabs
const elevenlabsCheck = httpsCallable(functions, 'elevenlabsHealthCheck');
const elevenlabsResult = await elevenlabsCheck();
console.log('ElevenLabs:', elevenlabsResult.data);
// Expected: { status: 'ok', provider: 'elevenlabs', subscription: '...' }
```

## Voice Options (ElevenLabs)

The following voices are available:

| Voice ID | Name | Description | Best For |
|----------|------|-------------|----------|
| rachel | Rachel | Warm, supportive, professional | Default female voice |
| domi | Domi | Calm, reassuring, gentle | Anxious users |
| bella | Bella | Friendly, warm, encouraging | Encouragement |
| adam | Adam | Deep, calm, professional | Male preference |
| josh | Josh | Warm, supportive male | Male preference |

Users can select their preferred voice in the Voice Companion settings.

## Fallback Behavior

The system automatically falls back to OpenAI services if the primary providers fail:

```
Deepgram fails → Falls back to OpenAI Whisper
ElevenLabs fails → Falls back to OpenAI TTS
```

This ensures voice features always work, even if one provider has issues.

## Cost Estimation

### Deepgram Nova-3
- Cost: $0.0043/minute
- 1 hour of audio = $0.26
- 100 PIRs × 5 min/day = 500 min = $2.15/day

### ElevenLabs
- Cost: $0.30/1K characters
- Average response: 200 chars
- 100 PIRs × 5 responses/day = 100K chars = $30/day

### Free Tier Coverage
- Deepgram $200 credit = ~46,500 minutes = ~3,100 hours
- ElevenLabs 10K chars/month = ~50 responses/month

For testing and initial deployment, the free tiers should be sufficient.

## Troubleshooting

### "Deepgram API key not configured"
Run: `firebase functions:config:set deepgram.key="YOUR_KEY"`
Then: `firebase deploy --only functions`

### "ElevenLabs API key not configured"
Run: `firebase functions:config:set elevenlabs.key="YOUR_KEY"`
Then: `firebase deploy --only functions`

### Voice sounds robotic/unnatural
- Try a different voice (rachel → bella)
- Increase stability setting (more consistent)
- Check that you're using `eleven_turbo_v2_5` model

### Latency is higher than expected
- Check internet connection
- Verify you're using the turbo models
- First request may be slower (cold start)
- Subsequent requests should be faster

### Fallback to OpenAI happening too often
- Check Deepgram/ElevenLabs API key validity
- Check account has sufficient credits
- Check for rate limiting

## Files Created/Modified

### Cloud Functions (`/functions/voice/`)
- `deepgram.js` - Deepgram STT integration
- `elevenlabs.js` - ElevenLabs TTS integration
- `index.js` - Barrel export

### Client Hooks (`/Index/pir-portal/src/hooks/`)
- `useVoiceInputV2.ts` - Enhanced voice input with VAD
- `useVoiceOutputV2.ts` - Enhanced voice output with ElevenLabs

### Components (`/Index/pir-portal/src/features/tasks/ai-insights/anchor/`)
- `VoiceCompanionV2.tsx` - Enhanced voice companion

## Next Steps After Setup

1. Add API keys to Firebase config
2. Deploy functions
3. Test health checks
4. Replace `VoiceCompanion` with `VoiceCompanionV2` in AnchorTab (or keep both for A/B testing)
5. Monitor latency metrics in production

---

*Phase 9 Voice Integration - GLRS Lighthouse*
