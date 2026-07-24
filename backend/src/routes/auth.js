'use strict';
const router=require('express').Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const pool=require('../db');
const {authenticate,secret}=require('../middleware/auth');
router.post('/login',async(req,res)=>{
  try{
    const {email,password,tenantId}=req.body||{};
    if(!email||!password)return res.status(400).json({error:'email and password are required'});
    const result=tenantId
      ?await pool.query('SELECT u.id,u.email,u.password_hash,u.name,m.tenant_id,m.role FROM social_users u JOIN social_memberships m ON m.user_id=u.id AND m.active=TRUE WHERE LOWER(u.email)=LOWER($1) AND m.tenant_id=$2 LIMIT 1',[email,tenantId])
      :await pool.query('SELECT u.id,u.email,u.password_hash,u.name,m.tenant_id,m.role FROM social_users u JOIN social_memberships m ON m.user_id=u.id AND m.active=TRUE WHERE LOWER(u.email)=LOWER($1) ORDER BY m.tenant_id LIMIT 2',[email]);
    if(!tenantId&&result.rows.length>1)return res.status(400).json({error:'tenantId is required for users with multiple active memberships'});
    const row=result.rows[0];
    if(!row||!await bcrypt.compare(password,row.password_hash))return res.status(401).json({error:'Invalid credentials'});
    const user={id:row.id,email:row.email,name:row.name,tenantId:row.tenant_id,role:row.role};
    const token=jwt.sign(user,secret(),{issuer:'governed-social-media',expiresIn:process.env.JWT_TTL||'1h'});
    res.json({token,user});
  }catch(_error){res.status(500).json({error:'Login failed'});}
});
router.get('/me',authenticate,async(req,res)=>{
  try{
    const result=await pool.query(
      'SELECT u.id,u.email,u.name,m.tenant_id,m.role FROM social_users u JOIN social_memberships m ON m.user_id=u.id AND m.active=TRUE WHERE u.id=$1 AND m.tenant_id=$2 LIMIT 1',
      [req.user.id,req.user.tenantId],
    );
    if(!result.rows[0])return res.status(401).json({error:'Session user no longer exists'});
    const row=result.rows[0];
    res.json({user:{id:row.id,email:row.email,name:row.name,tenantId:row.tenant_id,role:row.role}});
  }catch(_error){res.status(500).json({error:'Unable to verify persisted session'});}
});
module.exports=router;
