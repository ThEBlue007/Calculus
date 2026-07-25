async function run() {
  let count = 0;
  while(count < 50) {
    const res = await fetch("https://calculus-exw2.onrender.com/api/question?difficulty=hard&count=20&mode=tartarus");
    const data = await res.json();
    if(data.math.includes('sqrt') || data.options.some(o => o.includes('sqrt'))) {
      console.log("MATH:");
      console.log(data.math);
      console.log("OPTIONS:");
      data.options.forEach(o => console.log(o));
      return;
    }
    count++;
  }
  console.log("Not found after 50 tries.");
}
run();
