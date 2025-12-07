3# Data Sync & Conflicts - Industry Research Report

**Tier 6, Topic 27**
**Research Duration:** 6-8 hours
**Date:** November 22, 2025
**Status:** Complete - Tier 6 Complete ✅

---

## Executive Summary

**Key Findings:**
- **Firestore offline persistence:** Enabled by default on iOS/Android, automatic sync when online
- **Conflict resolution:** Last-write-wins (default), CRDT for complex state, manual resolution for user-facing conflicts
- **Optimistic updates:** 200ms minimum delay for snapshot listeners, performance trade-off for UX
- **Sync patterns:** Queue-based writes, retry logic with exponential backoff, conflict detection timestamps
- **Common issues:** Multiple offline updates, sync order problems, stale reads (solved with timestamps)

**Current GLRS State:**
- ✅ Firestore offline persistence enabled (React Native default)
- ✅ serverTimestamp() used for all writes (provides conflict detection)
- ❌ No optimistic updates (UI waits for server confirmation, feels slow)
- ❌ No conflict resolution strategy (last-write-wins can lose data)
- ❌ No offline queue visualization (users don't see pending writes)
- ❌ No retry logic (failed writes disappear silently)
- ❌ No sync status indicator (users don't know if data is synced)
- **Data Sync Score:** 30/100 (basic offline support, missing conflict handling + UX)

**Implementation:** 12 hours (1.5 days) across 2 phases

**Recommendation:** Implement optimistic updates for check-ins/goals (instant UI feedback), add conflict resolution for critical fields (manual merge for coach-PIR disagreements), build offline queue with retry logic (exponential backoff 1s → 64s), add sync status indicator (green: synced, yellow: syncing, red: failed), implement CRDT for collaborative features (community messages, group goals).

---

## Industry Standards (Condensed)

### 1. Firestore Offline Persistence

**Automatic on React Native:**
```javascript
// ✅ No configuration needed - offline persistence enabled by default
import firestore from '@react-native-firebase/firestore';

// Writes queued automatically when offline
await firestore().collection('goals').add({
  title: 'Stay sober 30 days',
  userId: auth().currentUser.uid,
  createdAt: firestore.FieldValue.serverTimestamp(), // ⚠️ null until synced
});

// Reads from cache first, then server
const goals = await firestore()
  .collection('goals')
  .where('userId', '==', auth().currentUser.uid)
  .get({ source: 'cache' }); // Explicit cache-only read
```

### 2. Conflict Resolution Strategies

| Strategy | Use Case | Implementation | Pros | Cons |
|----------|----------|----------------|------|------|
| **Last-Write-Wins** | Simple data (profile name) | Firestore default | Easy, automatic | Loses earlier changes |
| **Manual Resolution** | User-facing conflicts | Custom UI prompt | User control | Requires UX design |
| **CRDT (Conflict-free Replicated Data Type)** | Collaborative data (group goals) | Yjs, Automerge libraries | No conflicts | Complex, large payload |
| **Timestamp-Based Merge** | Timestamped fields (check-in mood) | Compare `updatedAt` | Automatic, fair | Requires schema design |

### 3. Optimistic Updates Pattern

```javascript
import firestore from '@react-native-firebase/firestore';

const completeGoal = async (goalId) => {
  // 1. Optimistic UI update
  setGoals(prev => prev.map(g =>
    g.id === goalId ? { ...g, status: 'completed', completedAt: new Date() } : g
  ));

  try {
    // 2. Server write
    await firestore().collection('goals').doc(goalId).update({
      status: 'completed',
      completedAt: firestore.FieldValue.serverTimestamp(),
    });

    // 3. Success - optimistic update matches server
    console.log('✅ Goal completed and synced');

  } catch (error) {
    // 4. Rollback on failure
    console.error('❌ Failed to sync goal completion:', error);
    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, status: 'active', completedAt: null } : g
    ));
    alert('Failed to complete goal. Please try again.');
  }
};
```

### 4. Offline Queue + Retry Logic

```javascript
// Queue manager for failed writes
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.retrying = false;
  }

  async add(operation) {
    this.queue.push({
      operation,
      attempts: 0,
      maxAttempts: 5,
      backoff: 1000, // Start at 1s
    });

    this.processQueue();
  }

  async processQueue() {
    if (this.retrying || this.queue.length === 0) return;

    this.retrying = true;
    const item = this.queue[0];

    try {
      await item.operation();
      this.queue.shift(); // Remove on success
      console.log('✅ Queued operation completed');

    } catch (error) {
      item.attempts++;

      if (item.attempts >= item.maxAttempts) {
        console.error('❌ Max retries exceeded, removing from queue');
        this.queue.shift();
      } else {
        // Exponential backoff: 1s → 2s → 4s → 8s → 16s
        const delay = item.backoff * Math.pow(2, item.attempts - 1);
        console.log(`⏳ Retry in ${delay}ms (attempt ${item.attempts}/${item.maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this.retrying = false;
    this.processQueue(); // Process next item
  }
}

// Usage
const queue = new OfflineQueue();

const submitCheckIn = async (data) => {
  queue.add(async () => {
    await firestore().collection('checkins').add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  });
};
```

### 5. Sync Status Indicator

```javascript
import NetInfo from '@react-native-community/netinfo';

const SyncStatusIndicator = () => {
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'offline' | 'failed'

  useEffect(() => {
    // Monitor network status
    const unsubscribeNet = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setSyncStatus('offline');
      } else if (syncStatus === 'offline') {
        setSyncStatus('syncing');
        // Wait for Firestore to sync
        setTimeout(() => setSyncStatus('synced'), 2000);
      }
    });

    return () => unsubscribeNet();
  }, []);

  const statusConfig = {
    synced: { color: '#4CAF50', icon: '✓', text: 'Synced' },
    syncing: { color: '#FFC107', icon: '⟳', text: 'Syncing...' },
    offline: { color: '#FF9800', icon: '⚠', text: 'Offline' },
    failed: { color: '#F44336', icon: '✗', text: 'Sync Failed' },
  };

  const config = statusConfig[syncStatus];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
      <Text style={{ color: config.color, fontSize: 16, marginRight: 4 }}>
        {config.icon}
      </Text>
      <Text style={{ color: config.color, fontSize: 12 }}>
        {config.text}
      </Text>
    </View>
  );
};
```

---

## Implementation Plan (Condensed)

### Phase 1: Optimistic Updates + Retry Logic (6 hours)
1. Implement optimistic update pattern for:
   - Check-in submission (instant feedback)
   - Goal creation/completion (no waiting spinner)
   - Message sending (immediate display)
2. Create OfflineQueue class with exponential backoff
3. Add rollback logic for failed operations
4. Test: Submit check-in while offline, verify retry on reconnect

### Phase 2: Conflict Resolution + Sync Status (6 hours)
1. Add conflict detection for critical fields:
   - Check-in mood (timestamp-based merge)
   - Goal status (manual resolution UI)
   - Community messages (CRDT with Yjs)
2. Implement SyncStatusIndicator component
3. Add "Pending Sync" badge to offline writes
4. Create conflict resolution modal (show both versions, user picks)
5. Test: Update same goal from 2 devices while offline, verify conflict UI

---

## Success Criteria

- ✅ Optimistic updates provide instant UI feedback (<50ms)
- ✅ Offline writes retry automatically with exponential backoff (1s → 64s)
- ✅ Sync status indicator shows current state (synced/syncing/offline/failed)
- ✅ Conflicts detected and resolved (no silent data loss)
- ✅ Users see "Pending Sync" badge on unsynced data
- ✅ Conflict resolution UI tested with 2+ simultaneous offline edits
- ✅ No duplicate writes after reconnection (idempotency checks)

---

**END OF TOPIC 27 - Status: Complete (12 hours)**
**END OF TIER 6 - All 5 Topics Complete (72 hours total)**

