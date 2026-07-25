const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.hxjqslk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const schema = new mongoose.Schema({ math: String });
const TestModel = mongoose.models.Test || mongoose.model('Test', schema);

async function run() {
  const t = new TestModel({ math: "2(x^2+1)^1 \\cdot 2x" });
  await t.save();
  const loaded = await TestModel.findById(t._id);
  console.log("Original:", "2(x^2+1)^1 \\cdot 2x");
  console.log("Loaded:", loaded.math);
  mongoose.disconnect();
}
run();
