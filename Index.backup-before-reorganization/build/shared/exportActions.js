// ═══════════════════════════════════════════════════════════
// DATA EXPORT ACTIONS
// Business logic for exporting recovery data as JSON and PDF
// ═══════════════════════════════════════════════════════════

// ==========================================
// EXPORT DATA AS JSON
// ==========================================

const exportDataAsJSON = ({
  userData,
  checkIns,
  goals,
  assignments,
  sobrietyDays,
  checkInStreak,
  complianceRate
}) => {
  const exportData = {
    userData: userData,
    checkIns: checkIns,
    goals: goals,
    assignments: assignments,
    sobrietyDays: sobrietyDays,
    streak: checkInStreak,
    complianceRates: complianceRate,
    exportedAt: new Date().toISOString()
  };
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `recovery_data_${new Date().toISOString().split('T')[0]}.json`);
  linkElement.click();
};

// ==========================================
// EXPORT DATA AS PDF
// ==========================================

const exportDataAsPDF = ({
  userData,
  user,
  sobrietyDays,
  moneySaved,
  checkInStreak,
  complianceRate,
  checkIns,
  goals
}) => {
  const {
    jsPDF
  } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('Recovery Progress Report', 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${userData?.displayName || userData?.firstName || user.email}`, 20, 40);
  doc.text(`Days Clean: ${sobrietyDays}`, 20, 50);
  doc.text(`Money Saved: $${moneySaved.toLocaleString()}`, 20, 60);
  doc.text(`Check-in Streak: ${checkInStreak} days`, 20, 70);
  doc.text(`Check-in Compliance: ${complianceRate.checkIn}%`, 20, 80);
  doc.text(`Assignment Completion: ${complianceRate.assignment}%`, 20, 90);
  doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 100);

  // Add recent check-ins
  if (checkIns.length > 0) {
    doc.text('Recent Check-ins:', 20, 120);
    checkIns.slice(0, 5).forEach((checkIn, index) => {
      const date = checkIn.createdAt?.toDate ? checkIn.createdAt.toDate().toLocaleDateString() : 'Unknown';
      const mood = checkIn.morningData?.mood || 'N/A';
      const craving = checkIn.morningData?.craving || 'N/A';
      doc.text(`${date} - Mood: ${mood}/5, Craving: ${craving}/5`, 30, 130 + index * 10);
    });
  }

  // Add goals summary
  if (goals.length > 0) {
    doc.addPage();
    doc.text('Active Goals:', 20, 20);
    goals.forEach((goal, index) => {
      doc.text(`${goal.title} - ${goal.progress}% complete`, 30, 30 + index * 10);
    });
  }
  doc.save(`recovery_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Register globally
window.GLRSApp = window.GLRSApp || {
  shared: {}
};
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.exportActions = {
  exportDataAsJSON,
  exportDataAsPDF
};
console.log('✅ Export actions loaded');