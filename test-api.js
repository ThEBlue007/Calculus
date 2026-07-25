async function run() {
  for (let i = 0; i < 20; i++) {
    const res = await fetch("https://calculus-exw2.onrender.com/api/question?difficulty=hard&count=20&mode=tartarus");
    const data = await res.json();
    console.log(data.math);
  }
}
run();
