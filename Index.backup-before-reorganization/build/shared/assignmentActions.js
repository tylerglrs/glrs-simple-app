// ═══════════════════════════════════════════════════════════
// ASSIGNMENT & GOAL MANAGEMENT ACTIONS
// Business logic for completing assignments and updating goal progress
// ═══════════════════════════════════════════════════════════

// ==========================================
// COMPLETE ASSIGNMENT WITH REFLECTION
// ==========================================

const completeAssignment = async ({
  assignmentId,
  goalId,
  reflection,
  user,
  db,
  firebase,
  loadAssignments,
  loadGoals,
  loadComplianceRates,
  updateGoalProgress
}) => {
  try {
    await db.collection('assignments').doc(assignmentId).update({
      status: 'completed',
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      reflection: reflection || ''
    });

    // Create activity log
    await db.collection('activities').add({
      userId: user.uid,
      type: 'assignment_completion',
      description: 'Completed assignment',
      assignmentId: assignmentId,
      reflection: reflection,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Create notification
    await db.collection('notifications').add({
      userId: user.uid,
      type: 'assignment',
      title: 'Assignment Completed',
      message: 'Great job completing your assignment!',
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    if (goalId) {
      await updateGoalProgress({
        goalId,
        user,
        db,
        firebase
      });
    }
    await loadAssignments();
    await loadGoals();
    await loadComplianceRates();
  } catch (error) {
    console.error('Error completing assignment:', error);
    throw error;
  }
};

// ==========================================
// UPDATE GOAL PROGRESS
// ==========================================

const updateGoalProgress = async ({
  goalId,
  user,
  db,
  firebase
}) => {
  try {
    // Get ALL assignments for this goal (not filtered by status)
    const assignmentsSnap = await db.collection('assignments').where('goalId', '==', goalId).where('userId', '==', user.uid).get();
    let total = 0;
    let completed = 0;
    assignmentsSnap.forEach(doc => {
      total++;
      if (doc.data().status === 'completed') {
        completed++;
      }
    });
    const progress = total > 0 ? Math.round(completed / total * 100) : 0;

    // Update the goal document
    await db.collection('goals').doc(goalId).update({
      progress: progress,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Also check if goal should be marked complete (100% progress)
    if (progress === 100) {
      const goalDoc = await db.collection('goals').doc(goalId).get();
      if (goalDoc.exists && goalDoc.data().status !== 'completed') {
        await db.collection('goals').doc(goalId).update({
          status: 'completed',
          completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Send notification to PIR about goal completion
        await db.collection('notifications').add({
          userId: user.uid,
          type: 'goal_completed',
          title: 'Goal Completed!',
          message: `Congratulations! You've completed the goal: ${goalDoc.data().title}`,
          goalId: goalId,
          read: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error updating goal progress:', error);
    throw error;
  }
};

// Register globally
window.GLRSApp = window.GLRSApp || {
  shared: {}
};
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.assignmentActions = {
  completeAssignment,
  updateGoalProgress
};
console.log('✅ Assignment actions loaded');