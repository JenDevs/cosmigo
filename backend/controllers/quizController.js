const {
  getAllQuizzesForUser,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../services/quizService");

function validate(p){
  if(!p || typeof p.title !== "string" || !p.title.trim()) return "Title needed";
  if(!Array.isArray(p.questions) || p.questions.length === 0) return "Atleast 1 question needed";
  if(p.questions.some(q => !q.text || !q.text.trim())) return "Text is needed";
  return null;
}

async function listQuizzes(req,res){
  try{
    const userId = req.user?.id || req.user?.userId || 1;
    const rows = await getAllQuizzesForUser(userId);
    res.json(rows);
  }catch(e){ console.error(e); res.status(500).json({ error:"Could not get list" }); }
}

async function getOne(req,res){
  const userId = req.user?.id || req.user?.userId || 1;
  const data = await getQuizById(userId, req.params.id);
  if(!data) return res.status(404).json({ error:"Could not be found" });
  res.json(data);
}

async function createOne(req,res){
  const err = validate(req.body);
  if(err) return res.status(400).json({ error: err });
  try{
    const userId = req.user?.id || req.user?.userId || 1;
    const result = await createQuiz(userId, req.body);
    res.status(201).json(result);
  }catch(e){ console.error(e); res.status(500).json({ error:"Could not create" }); }
}

async function updateOne(req,res){
  const err = validate(req.body);
  if(err) return res.status(400).json({ error: err });
  try{
    const userId = req.user?.id || req.user?.userId || 1;
    const r = await updateQuiz(userId, req.params.id, req.body);
    if(r?.status === 403) return res.status(403).json({ error:"Not user" });
    res.json({ ok:true });
  }catch(e){ console.error(e); res.status(500).json({ error:"Could not update" }); }
}

async function removeOne(req,res){
  const userId = req.user?.id || req.user?.userId || 1;
  const ok = await deleteQuiz(userId, req.params.id);
  if(!ok) return res.status(404).json({ error:"Could not be found" });
  res.json({ ok:true });
}

module.exports = { listQuizzes, getOne, createOne, updateOne, removeOne };