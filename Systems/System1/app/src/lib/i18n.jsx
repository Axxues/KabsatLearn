import { createContext, useContext, useState } from 'react'

const TRANSLATIONS = {
  fil: {
    // App Header & Navigation
    appTitle: 'KabsatLearn',
    regionTag: 'La Union',
    coursesTab: 'Aralin',
    coursesTabSub: 'Mga kurso sa telepono',
    quizTab: 'Quiz',
    quizTabSub: 'Paligsahan ng galing',
    tutorTab: 'Kabsat AI',
    tutorTabSub: 'Grounded na gabay',
    dashboardTab: 'LGU Hub',
    dashboardTabSub: 'Ulat sa San Fernando',
    headerCourses: 'Mga Kurso',
    headerDashboard: 'City Insights',
    headerQuiz: 'Quiz Arena',
    headerTutor: 'Kabsat AI',
    statusOnline: 'Online',
    statusOffline: 'Offline',

    // Course Hub
    greetingTitle: 'Naimbag nga aldaw, Kabsat!',
    greetingSubtitle:
      'Aralin sa sariling wika, kahit walang koneksyon sa internet. Maaari kang mag-aral, mag-quiz, at magbahagi sa kaklase.',
    locationTag: 'San Fernando, La Union',
    importTitle: 'Mag-import ng .kabsat file',
    importSubtitle: 'Ipasa mula sa kaklase gamit ang Bluetooth, Nearby, o USB',
    importButton: 'Piliin',
    onThisPhone: 'Nasa teleponong ito',
    readyTag: 'Handa',
    readyCountTag: '{n} handa na',
    availableHeading: 'Maaaring i-download kapag may Wi-Fi',
    availableCountTag: '{n} available',
    cardsMeta: '{n} aralin',
    questionsMeta: '{n} tanong',
    offlineMeta: '100% Offline',
    openCourse: 'Buksan ang Kurso',
    downloadCourse: 'I-download ({kb} KB)',
    downloading: 'Kinukuha…',
    downloadingMsg: 'Kinukuha ang aralin…',
    passCourse: 'Ipasa',
    passTooltip: 'Ipasa sa kaklase via Bluetooth o Nearby Share',
    passAria: 'Ipasa ang {title} sa kaklase',
    loadingCourses: 'Kinukuha ang iyong mga kurso…',
    shareSuccess: 'Naibahagi ang aralin via Nearby/Share.',
    saveSuccess: 'Na-save bilang .kabsat file.',
    shareCancel: 'Nakansela ang pagbahagi.',
    importSuccess: 'Tagumpay: Naidagdag ang aralin sa iyong telepono!',
    importRefused: 'Hindi tinanggap: {error}.',

    // Story Reader
    back: 'Bumalik',
    cardProgress: 'Aralin {current} ng {total}',
    coursePrefix: 'Kurso:',
    listenButton: 'Pakinggan ang Aralin',
    speakingState: 'Nagsasalita…',
    ttsLabel: 'Filipino Text-to-Speech',
    tipTitle: 'Mahalagang Paalala',
    previous: 'Nakaraan',
    nextLesson: 'Susunod na Aralin',
    finishCourse: 'Tapusin ang Kurso',

    // Red-Flag Drill
    drillBadge: 'Subukan ang Galing',
    drillSubtitle: 'Tukuyin ang mga kahina-hinalang bahagi',
    drillFoundAll: 'Mahusay! Nakita mo ang lahat ng kahina-hinalang detalye. {hint}',
    drillProgress: 'Nahanap: {current} / {total}',
    drillContinue: 'Magpatuloy sa Aralin',

    // Quiz Arena
    offlineQuizBadge: 'Offline Quiz',
    quizTitle: 'Quiz Arena',
    quizSubtitle:
      '{count} tanong. Mabilis at tamang sagot para sa mas mataas na score at streak multiplier!',
    stat15s: '15 Segundo',
    stat15sSub: 'Bawat tanong',
    statAdaptive: 'Adaptive',
    statAdaptiveSub: 'Umaayon sa galing mo',
    playSolo: 'Isahang Laro (Solo)',
    playSoloSub: 'Sanayin ang sariling talas',
    playPass: 'Pass and Play (2 Manlalaro)',
    playPassSub: 'Salitan sa iisang telepono',
    startQuizCta: 'Magsimula →',
    questionProgress: 'Tanong {current} / {total}',
    pts: 'pts',
    pointsLabel: 'puntos',
    turnIndicator: 'Turn ni Manlalaro {n}',
    streakIndicator: '{n}x Streak (+Puntos!)',
    speedPrompt: 'Sagot agad bago maubos ang oras',
    levelUp: 'LEVEL UP!',
    adaptiveShift: 'ADAPTIVE SHIFT',
    correctAnswer: 'Tama! +{points} points!',
    wrongAnswer: 'Mali. Ang tamang sagot ay ang naka-highlight.',
    roundCompleteSolo: 'Tapos na ang Pagsusulit!',
    roundCompleteDraw: 'Tabla ang Laban!',
    roundCompleteWinner: 'Panalo si Manlalaro {winner}!',
    roundEffort: 'Mahusay na pagsisikap sa araling {title}',
    yourScore: 'Ang Iyong Iskor',
    playerLabel: 'Manlalaro {n}',
    correctTally: '{correct} ng {total} tama',
    playAgain: 'Maglaro Muli',
    backToCourses: 'Bumalik sa Mga Kurso',
    noQuestions: 'Wala nang natitirang tanong sa kursong ito.',

    // Kabsat AI
    aiTitle: 'Kabsat AI',
    aiSubtitle: 'Offline · Grounded sa Aralin',
    aiWelcome:
      'Kumusta! Ako si Kabsat, ang iyong offline AI tutor para sa "{title}".\n\nLahat ng sagot ko ay 100% grounded sa na-download mong aralin — walang kailangang internet.',
    quickQuestionsHeader: 'Mabilis na Itanong',
    sourceCitation: 'Sanggunian:',
    outOfScopeAlert: 'Walang tugma sa na-download na aralin.',
    listenMessage: 'Pakinggan',
    askPlaceholder: 'Itanong kay Kabsat…',
    send: 'Send',
    quickChips: [
      'Paano kung hinihingi ang OTP ko?',
      'Peke ba ang link na ito?',
      'May nagtext na ayuda, totoo ba?',
      'Nabiktima ako, ano gagawin?',
    ],

    // Dashboard
    dashboardSubtitle:
      'Real-time offline telemetriya. Walang kinokolektang personal na impormasyon o pangalan ng kabataan.',
    queuedLogs: 'Naka-queue na Logs',
    events: 'events',
    avgMastery: 'Average Mastery',
    overall: 'overall',
    masteryHeading: 'Mastery ng Kakayahan (Competency)',
    masteryHigh: 'Matatag',
    masteryMid: 'Katamtaman',
    masteryLow: 'Gabayan',
    queueCardTitle: 'Offline Telemetry Queue',
    queueCardSub:
      'Naka-imbak sa device ang mga resulta ng quiz. Awtomatikong ipapadala sa City Hall kapag nakakonekta sa Wi-Fi.',
    syncPending: '{n} pending',
    syncWifiButton: 'Subukan ang Barangay Wi-Fi Sync',
    syncingButton: 'Nagsi-sync sa barangay network…',
    syncEmpty: 'Walang naka-queue na learning logs. Lahat ay naka-sync.',
    syncSuccess: 'Naipadala ang {n} telemetry logs sa City Education dashboard.',
    remediationHeading: 'Iminumungkahing Remediation (Approval Gate)',
    humanApprovalTag: 'Human Approval',
    noRemediations:
      'Wala pang follow-up na kailangang aprubahan. Matapos ang quiz, dito lilitaw ang mga kakayahang kailangan pang palakasin.',
    remediationNeeded: 'Kailangan',
    approveButton: 'Aprubahan ang Remediation',
    remediationApprovedSummary: 'Naaprubahan na ang {n} remediation action ng facilitator.',
    barangayHeading: 'Barangay Heatmap · Synthetic Sample',
    barangayDisclaimer:
      'Sample data para sa demo ng San Fernando City Government. Walang totoong citizen records ang ginamit alinsunod sa Data Privacy Act.',
  },

  en: {
    // App Header & Navigation
    appTitle: 'KabsatLearn',
    regionTag: 'La Union',
    coursesTab: 'Courses',
    coursesTabSub: 'On-device modules',
    quizTab: 'Quiz',
    quizTabSub: 'Skill arena',
    tutorTab: 'Kabsat AI',
    tutorTabSub: 'Grounded tutor',
    dashboardTab: 'LGU Hub',
    dashboardTabSub: 'San Fernando insights',
    headerCourses: 'Courses',
    headerDashboard: 'City Insights',
    headerQuiz: 'Quiz Arena',
    headerTutor: 'Kabsat AI',
    statusOnline: 'Online',
    statusOffline: 'Offline',

    // Course Hub
    greetingTitle: 'Welcome, Kabsat!',
    greetingSubtitle:
      'Micro-learning crafted for you, with zero internet needed. Take short lessons, play adaptive quizzes, and share offline with peers.',
    locationTag: 'San Fernando, La Union',
    importTitle: 'Import a .kabsat file',
    importSubtitle: 'Share with classmates via Bluetooth, Nearby Share, or USB',
    importButton: 'Select',
    onThisPhone: 'On this device',
    readyTag: 'Ready',
    readyCountTag: '{n} ready',
    availableHeading: 'Available to download when online',
    availableCountTag: '{n} available',
    cardsMeta: '{n} lessons',
    questionsMeta: '{n} questions',
    offlineMeta: '100% Offline',
    openCourse: 'Open Course',
    downloadCourse: 'Download ({kb} KB)',
    downloading: 'Downloading…',
    downloadingMsg: 'Downloading lesson capsule…',
    passCourse: 'Pass',
    passTooltip: 'Pass to classmate via Bluetooth or Nearby Share',
    passAria: 'Pass {title} to classmate',
    loadingCourses: 'Loading your courses…',
    shareSuccess: 'Course shared via Nearby / Share Sheet.',
    saveSuccess: 'Saved as a .kabsat file.',
    shareCancel: 'Share cancelled.',
    importSuccess: 'Success: Course capsule added to your phone!',
    importRefused: 'Import refused: {error}.',

    // Story Reader
    back: 'Back',
    cardProgress: 'Lesson {current} of {total}',
    coursePrefix: 'Course:',
    listenButton: 'Listen to Lesson',
    speakingState: 'Speaking…',
    ttsLabel: 'Filipino / English TTS',
    tipTitle: 'Important Tip',
    previous: 'Previous',
    nextLesson: 'Next Lesson',
    finishCourse: 'Finish Course',

    // Red-Flag Drill
    drillBadge: 'Test Your Skills',
    drillSubtitle: 'Identify the suspicious elements',
    drillFoundAll: 'Great job! You found all suspicious details. {hint}',
    drillProgress: 'Found: {current} / {total}',
    drillContinue: 'Continue Lesson',

    // Quiz Arena
    offlineQuizBadge: 'Offline Quiz',
    quizTitle: 'Quiz Arena',
    quizSubtitle:
      '{count} questions. Answer fast and accurately to build high score streaks and combo multipliers!',
    stat15s: '15 Seconds',
    stat15sSub: 'Per question',
    statAdaptive: 'Adaptive',
    statAdaptiveSub: 'Scales to your mastery',
    playSolo: 'Solo Practice',
    playSoloSub: 'Sharpen your memory & speed',
    playPass: 'Pass and Play (2 Players)',
    playPassSub: 'Take turns on one phone',
    startQuizCta: 'Start Game →',
    questionProgress: 'Question {current} / {total}',
    pts: 'pts',
    pointsLabel: 'points',
    turnIndicator: "Player {n}'s Turn",
    streakIndicator: '{n}x Streak (+Points!)',
    speedPrompt: 'Answer before the countdown runs out',
    levelUp: 'LEVEL UP!',
    adaptiveShift: 'ADAPTIVE SHIFT',
    correctAnswer: 'Correct! +{points} points!',
    wrongAnswer: 'Incorrect. The correct answer is highlighted.',
    roundCompleteSolo: 'Quiz Completed!',
    roundCompleteDraw: "It's a Draw!",
    roundCompleteWinner: 'Player {winner} Wins!',
    roundEffort: 'Great effort completing {title}',
    yourScore: 'Your Score',
    playerLabel: 'Player {n}',
    correctTally: '{correct} of {total} correct',
    playAgain: 'Play Again',
    backToCourses: 'Back to Courses',
    noQuestions: 'No questions left in this course.',

    // Kabsat AI
    aiTitle: 'Kabsat AI',
    aiSubtitle: 'Offline · Grounded on Lessons',
    aiWelcome:
      'Hello! I am Kabsat, your offline AI tutor for "{title}".\n\nAll my answers are 100% grounded on your downloaded lesson — zero internet needed.',
    quickQuestionsHeader: 'Quick Prompts',
    sourceCitation: 'Source:',
    outOfScopeAlert: 'No match found in downloaded course capsule.',
    listenMessage: 'Listen',
    askPlaceholder: 'Ask Kabsat a question…',
    send: 'Send',
    quickChips: [
      'What if someone asks for my OTP?',
      'Is this link fake or a scam?',
      'I got an ayuda text, is it real?',
      'I got scammed, what should I do?',
    ],

    // Dashboard
    dashboardSubtitle:
      'Real-time offline telemetry. Zero personal citizen records or youth names collected.',
    queuedLogs: 'Queued Logs',
    events: 'events',
    avgMastery: 'Average Mastery',
    overall: 'overall',
    masteryHeading: 'Mastery by Competency',
    masteryHigh: 'Strong',
    masteryMid: 'Moderate',
    masteryLow: 'Needs Help',
    queueCardTitle: 'Offline Telemetry Queue',
    queueCardSub:
      'Quiz results stored locally on device. Automatically syncs to City Hall whenever connected to Wi-Fi.',
    syncPending: '{n} pending',
    syncWifiButton: 'Simulate Barangay Wi-Fi Sync',
    syncingButton: 'Syncing to barangay network…',
    syncEmpty: 'No logs queued. All data is synchronized.',
    syncSuccess: 'Delivered {n} telemetry logs to the City Education dashboard.',
    remediationHeading: 'Proposed Remediation (Approval Gate)',
    humanApprovalTag: 'Human Approval',
    noRemediations:
      'No pending follow-ups requiring approval. After learners complete quizzes, weak competencies will appear here.',
    remediationNeeded: 'Required',
    approveButton: 'Approve Remediation',
    remediationApprovedSummary: '{n} remediation actions approved by facilitator.',
    barangayHeading: 'Barangay Heatmap · Synthetic Sample',
    barangayDisclaimer:
      'Sample demonstration data for the City Government of San Fernando. No actual citizen records are used pursuant to the Data Privacy Act.',
  },
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kabsat_lang')
      if (stored === 'en' || stored === 'fil') return stored
    }
    return 'fil'
  })

  const setLang = (nextLang) => {
    setLangState(nextLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kabsat_lang', nextLang)
    }
  }

  const t = (key, params = {}) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.fil
    let text = dict[key] ?? TRANSLATIONS.fil[key] ?? key
    if (typeof text === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return text
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, translations: TRANSLATIONS[lang] }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}
