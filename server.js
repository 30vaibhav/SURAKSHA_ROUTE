require('dotenv').config();
const express=require('express');
const cors=require('cors');
const fetch=require('node-fetch');

const app=express();
app.use(cors());
app.use(express.json());

app.post('/ask', async(req,res)=>{
  try{
    const key=process.env.GEMINI_API_KEY;
    const prompt=req.body.message||'';
    const url='https://generativelanguage.googleapis.com/v1beta2/models/text-bison:generate?key='+key;
    const payload={
      prompt:{text:prompt},
      temperature:0.2,
      maxOutputTokens:256
    };
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await r.json();
    let reply='';
    if(data.candidates&&data.candidates.length){
      reply=data.candidates[0].output||data.candidates[0].content||JSON.stringify(data.candidates[0]);
    } else reply=JSON.stringify(data);
    res.json({reply});
  }catch(e){
    res.status(500).json({error:e.toString()});
  }
});

app.listen(5000,()=>console.log("Chatbot server on 5000"));
