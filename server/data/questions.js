import { v4 as uuidv4 } from 'uuid';
import ActiveQuestion from '../models/ActiveQuestion.js';

function shuffleOptions(correctOption, wrongOptions) {
  const allOptions = [correctOption, ...wrongOptions];
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }
  return {
    options: allOptions,
    correctIndex: allOptions.indexOf(correctOption)
  };
}

function generateEasy() {
  const templates = [
    () => {
      const n = Math.floor(Math.random() * 8) + 2; 
      return {
        math: `f(x) = x^{${n}}, f'(x) = ?`,
        correct: `${n}x^{${n-1}}`,
        wrongs: [`${n}x^{${n}}`, `${n-1}x^{${n}}`, `${n}x`],
        explanation: `Power Rule: ตบกำลังลงมา แล้วลดกำลังลง 1 จะได้ ${n}x^{${n-1}}`
      };
    },
    () => {
      const c = Math.floor(Math.random() * 100);
      return {
        math: `f(x) = ${c}, f'(x) = ?`,
        correct: `0`,
        wrongs: [`1`, `${c}`, `c`],
        explanation: `อนุพันธ์ของตัวเลขค่าคงที่ (Constant) มีค่าเท่ากับ 0 เสมอ`
      };
    },
    () => {
      const c = Math.floor(Math.random() * 9) + 2;
      return {
        math: `f(x) = ${c}x^2, f'(x) = ?`,
        correct: `${c * 2}x`,
        wrongs: [`${c}x`, `${c * 2}x^2`, `2x`],
        explanation: `Power Rule: ตบ 2 ลงมาคูณกับสัมประสิทธิ์ ${c} จะได้ ${c * 2}x`
      };
    }
  ];
  return templates[Math.floor(Math.random() * templates.length)]();
}

function generateMedium() {
  const templates = [
    () => ({
      math: `f(x) = \\\\sin x, f'(x) = ?`,
      correct: `\\\\cos x`,
      wrongs: [`-\\\\cos x`, `-\\\\sin x`, `\\\\csc x`],
      explanation: `กฎตรีโกณมิติพื้นฐาน: d/dx(\\\\sin x) = \\\\cos x`
    }),
    () => ({
      math: `f(x) = \\\\cos x, f'(x) = ?`,
      correct: `-\\\\sin x`,
      wrongs: [`\\\\sin x`, `-\\\\cos x`, `\\\\sec x`],
      explanation: `กฎตรีโกณมิติพื้นฐาน: d/dx(\\\\cos x) = -\\\\sin x`
    }),
    () => {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      return {
        math: `f(x) = ${a}x^3 + ${b}x, f'(x) = ?`,
        correct: `${a * 3}x^2 + ${b}`,
        wrongs: [`${a * 3}x^2 + ${b}x`, `${a}x^2 + ${b}`, `${a * 3}x^3 + ${b}`],
        explanation: `กระจายดิฟทีละพจน์: พจน์หน้าได้ ${a*3}x^2 และพจน์หลังได้ ${b}`
      };
    },
    () => {
      const a = Math.floor(Math.random() * 5) + 2;
      return {
        math: `f(x) = ${a}e^x, f'(x) = ?`,
        correct: `${a}e^x`,
        wrongs: [`e^x`, `${a}xe^{x-1}`, `${a}e^{x+1}`],
        explanation: `กฎ Exponential: อนุพันธ์ของ e^x จะได้ค่าตัวมันเองเสมอ (${a}e^x)`
      };
    }
  ];
  return templates[Math.floor(Math.random() * templates.length)]();
}

function generateHard() {
  const templates = [
    () => {
      const a = Math.floor(Math.random() * 5) + 2;
      return {
        math: `f(x) = \\\\sin(${a}x), f'(x) = ?`,
        correct: `${a}\\\\cos(${a}x)`,
        wrongs: [`\\\\cos(${a}x)`, `-${a}\\\\cos(${a}x)`, `\\\\sin(${a}x)`],
        explanation: `Chain Rule: ดิฟนอกได้ \\\\cos(${a}x) แล้วคูณดิฟไส้ใน ${a}x ได้ ${a}`
      };
    },
    () => {
      const a = Math.floor(Math.random() * 3) + 2;
      return {
        math: `f(x) = (x^2 + 1)^{${a}}, f'(x) = ?`,
        correct: `${a}(x^2 + 1)^{${a-1}} \\\\cdot 2x`,
        wrongs: [`${a}(x^2 + 1)^{${a-1}}`, `${a}(2x)^{${a-1}}`, `(x^2 + 1)^{${a-1}} \\\\cdot 2x`],
        explanation: `Chain Rule: ตบกำลัง ${a} ลงมาลดกำลัง 1 แล้วคูณด้วยดิฟไส้ใน (2x)`
      };
    },
    () => ({
      math: `f(x) = x \\\\sin x, f'(x) = ?`,
      correct: `\\\\sin x + x \\\\cos x`,
      wrongs: [`\\\\cos x`, `x \\\\cos x`, `\\\\sin x - x \\\\cos x`],
      explanation: `Product Rule: หน้าดิฟหลัง (x\\\\cos x) + หลังดิฟหน้า (\\\\sin x \\\\cdot 1)`
    }),
    () => ({
      math: `f(x) = 1/x, f'(x) = ?`,
      correct: `-1/x^2`,
      wrongs: [`1/x^2`, `\\\\ln|x|`, `-1/x`],
      explanation: `แปลง 1/x เป็น x^{-1} แล้วใช้ Power Rule จะได้ -1x^{-2} หรือ -1/x^2`
    })
  ];
  return templates[Math.floor(Math.random() * templates.length)]();
}

function generateBoss() {
  const templates = [
    // Standard Hard Boss (Product Rule + Chain Rule)
    () => {
      const a = Math.floor(Math.random() * 4) + 2; // 2 to 5
      const b = Math.floor(Math.random() * 4) + 2;
      return {
        math: `f(x) = x^${a} \\\\sin(${b}x), f'(x) = ?`,
        correct: `x^{${a-1}}(${a}\\\\sin(${b}x) + ${b}x\\\\cos(${b}x))`,
        wrongs: [
          `${a}x^{${a-1}}\\\\cos(${b}x)`, 
          `${a}x^{${a-1}}\\\\sin(${b}x) - ${b}x^${a}\\\\cos(${b}x)`, 
          `x^{${a-1}}(${b}\\\\sin(${a}x) + ${a}x\\\\cos(${b}x))`
        ],
        explanation: `Product + Chain: หน้า(x^${a})ดิฟหลัง(${b}\\\\cos(${b}x)) + หลัง(\\\\sin(${b}x))ดิฟหน้า(${a}x^{${a-1}})`
      };
    },
    // Higher-Order Derivative Boss
    () => {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      return {
        math: `f(x) = ${a}x^4 - ${b}x^3, f''(x) = ?`,
        correct: `${12 * a}x^2 - ${6 * b}x`,
        wrongs: [
          `${4 * a}x^3 - ${3 * b}x^2`,
          `${12 * a}x^2 - ${3 * b}x`,
          `${24 * a}x - ${6 * b}`
        ],
        explanation: `Higher-Order: ดิฟครั้งที่ 1 ได้ ${4*a}x^3 - ${3*b}x^2 จากนั้นดิฟครั้งที่ 2 ต่อ`
      };
    },
    // Kinematics Boss (Velocity)
    () => {
      const a = Math.floor(Math.random() * 3) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      const t = Math.floor(Math.random() * 2) + 2; // t=2 or 3
      const ans = (3 * a * t * t) - (2 * b * t);
      return {
        math: `S(t) = ${a}t^3 - ${b}t^2, v(${t}) = ?`,
        correct: `${ans}`,
        wrongs: [
          `${ans + Math.floor(Math.random()*5 + 1)}`,
          `${ans - Math.floor(Math.random()*5 + 1)}`,
          `${a * Math.pow(t, 3) - b * Math.pow(t, 2)}`
        ],
        explanation: `Velocity (ความเร็ว) คือ S'(t) = ${3*a}t^2 - ${2*b}t แล้วแทนค่า t=${t}`
      };
    },
    // Kinematics Boss (Acceleration)
    () => {
      const a = Math.floor(Math.random() * 4) + 2;
      const b = Math.floor(Math.random() * 4) + 2;
      return {
        math: `S(t) = ${a}t^3 + ${b}t^2, a(t) = ?`,
        correct: `${6 * a}t + ${2 * b}`,
        wrongs: [
          `${3 * a}t^2 + ${2 * b}t`,
          `${6 * a}t^2 + ${2 * b}t`,
          `${6 * a}t + ${b}`
        ],
        explanation: `Acceleration (ความเร่ง) คือ S''(t) หรือดิฟสมการระยะทาง 2 ครั้ง`
      };
    }
  ];
  return templates[Math.floor(Math.random() * templates.length)]();
}

async function generateQuestion(difficulty, count = 1, mode = 'timeAttack') {
  let qData;
  let type = 'normal';
  
  const isTimeAttack = mode === 'timeAttack';

  if (count > 0 && count % 20 === 0) {
    qData = isTimeAttack ? generateHard() : generateBoss();
    type = 'twin_boss';
  } else if (count > 0 && count % 10 === 0) {
    qData = isTimeAttack ? generateHard() : generateBoss();
    type = 'boss';
  } else if (difficulty === 'hard' && !isTimeAttack) {
    qData = generateHard();
  } else if (difficulty === 'medium' || (difficulty === 'hard' && isTimeAttack)) {
    qData = generateMedium();
  } else {
    qData = generateEasy();
  }

  const { options, correctIndex } = shuffleOptions(qData.correct, qData.wrongs);
  const qId = uuidv4();
  
  const activeQ = new ActiveQuestion({
    questionId: qId,
    correctIndex: correctIndex,
    explanation: qData.explanation,
    math: qData.math,
    options: options,
    type: type
  });
  
  // We don't return correctIndex to the client anymore!
  const result = { id: qId, math: qData.math, options, type, isBoss: type !== 'normal' };
  
  if (type === 'twin_boss') {
    const qData2 = isTimeAttack ? generateHard() : generateBoss();
    const shuffled2 = shuffleOptions(qData2.correct, qData2.wrongs);
    const qId2 = uuidv4();
    
    activeQ.twinData = {
      id: qId2,
      math: qData2.math,
      options: shuffled2.options,
      correctIndex: shuffled2.correctIndex,
      explanation: qData2.explanation
    };
    
    result.twin = {
      id: qId2,
      math: qData2.math,
      options: shuffled2.options
    };
  }
  
  // Save to MongoDB only if connection is active, else skip (for tests)
  try {
    await activeQ.save();
  } catch (err) {
    console.error("Failed to save active question:", err.message);
  }
  
  return result;
}

async function validateAnswer(id, answerIndex, isTwin = false) {
  // If it's a twin question, we need to find the parent ActiveQuestion
  let q;
  if (isTwin) {
    q = await ActiveQuestion.findOne({ 'twinData.id': id });
    if (!q) return null;
    
    // We don't delete immediately if they just answered the twin. 
    // Actually, we delete the document after both are answered, or we just let TTL delete it.
    // For simplicity, we just delete it after validation.
    await ActiveQuestion.deleteOne({ _id: q._id });
    
    return {
      correct: q.twinData.correctIndex === answerIndex,
      correctAnswerIndex: q.twinData.correctIndex,
      explanation: q.twinData.explanation
    };
  } else {
    q = await ActiveQuestion.findOne({ questionId: id });
    if (!q) return null;
    
    if (q.type !== 'twin_boss') {
      await ActiveQuestion.deleteOne({ _id: q._id });
    }
    
    return {
      correct: q.correctIndex === answerIndex,
      correctAnswerIndex: q.correctIndex,
      explanation: q.explanation
    };
  }
}

async function useAthena(id, isTwin = false) {
  let q;
  if (isTwin) {
    q = await ActiveQuestion.findOne({ 'twinData.id': id });
  } else {
    q = await ActiveQuestion.findOne({ questionId: id });
  }
  
  if (!q) return null;
  
  const correctIdx = isTwin ? q.twinData.correctIndex : q.correctIndex;
  const wrongs = [0, 1, 2, 3].filter(i => i !== correctIdx);
  for (let i = wrongs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrongs[i], wrongs[j]] = [wrongs[j], wrongs[i]];
  }
  return wrongs.slice(0, 2);
}

// Special endpoint for L'Hôpital / Apollo since correctIndex is no longer in /question
async function getCorrectAnswer(id, isTwin = false) {
  let q;
  if (isTwin) {
    q = await ActiveQuestion.findOne({ 'twinData.id': id });
  } else {
    q = await ActiveQuestion.findOne({ questionId: id });
  }
  
  if (!q) return null;
  
  // We can delete it if L'Hopital is used
  if (!isTwin || q.type !== 'twin_boss') {
    await ActiveQuestion.deleteOne({ _id: q._id });
  }
  
  return isTwin ? q.twinData.correctIndex : q.correctIndex;
}

export { generateQuestion, validateAnswer, useAthena, getCorrectAnswer };
