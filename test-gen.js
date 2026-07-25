function generateBoss() {
  const templates = [
    // Standard Hard Boss (Product Rule + Chain Rule)
    () => {
      const a = 3;
      const b = 2;
      return {
        math: `f(x) = x^${a}(x + ${b})^2, f'(x) = ?`,
        correct: `x^{${a-1}}(x + ${b})((${a+2})x + ${a*b})`,
        wrongs: [
          `${a}x^{${a-1}}(x + ${b})^2`, 
          `x^${a} \\cdot 2(x + ${b})`, 
          `${a}x^{${a-1}} \\cdot 2(x + ${b})`
        ]
      };
    }
  ];
  return templates[0]();
}

console.log(generateBoss().wrongs[1]);
console.log(JSON.stringify(generateBoss().wrongs[1]));
