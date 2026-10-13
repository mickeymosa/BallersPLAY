import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const validPhone = (value) => /^\+[1-9]\d{7,14}$/.test(value);

export default function PlayerAccount() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState("signup");
  const [recovery, setRecovery] = useState(false);
  const [profileForm, setProfileForm] = useState({full_name:"",phone:""});
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({data}) => setUser(data.user || null));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((event, session) => { if (event === "PASSWORD_RECOVERY") setRecovery(true); setUser(session?.user || null); });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!user || !supabase) { setProfile(null); return; }
    supabase.from("player_profiles").select("full_name,phone").eq("id",user.id).maybeSingle()
      .then(({data,error}) => { if (!error) { setProfile(data); setProfileForm({full_name:data?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",phone:data?.phone || ""}); } });
  }, [user]);
  const update = (key, value) => setForm(prev => ({...prev,[key]:value}));
  async function submit(event) {
    event.preventDefault();
    if (!supabase) {setNotice("Account service is not configured.");return;}
    if (mode === "signup") {
      if (form.full_name.trim().length < 2) return setNotice("Enter your full name.");
      if (!validPhone(form.phone.trim())) return setNotice("Enter a phone number with country code, e.g. +48123456789.");
      if (form.password.length < 8) return setNotice("Use a password of at least 8 characters.");
      if (form.password !== form.confirm) return setNotice("Passwords do not match.");
    }
    setBusy(true); setNotice("");
    try {
      if (mode === "signup") {
        const {data,error} = await supabase.auth.signUp({
          email: form.email.trim().toLowerCase(), password: form.password,
          options: { data: {full_name: form.full_name.trim(),phone: form.phone.trim()}, emailRedirectTo: window.location.origin + "/account" }
        });
        if (error) throw error;
        setNotice(data.session ? "Account created. You are signed in." : "Check your email for a confirmation link, then sign in.");
      } else if (mode === "login") {
        const {error} = await supabase.auth.signInWithPassword({email:form.email.trim().toLowerCase(),password:form.password});
        if (error) throw error;
        setNotice("Signed in successfully.");
      } else {
        const {error} = await supabase.auth.resetPasswordForEmail(form.email.trim().toLowerCase(),{redirectTo:window.location.origin+"/account"});
        if (error) throw error;
        setNotice("If an account exists, a password reset email will be sent.");
      }
    } catch (error) {setNotice(error.message || "Something went wrong.");}
    finally {setBusy(false);}
  }
  async function googleLogin() {
    if (!supabase) return setNotice("Account service is not configured.");
    setNotice("");
    const {error} = await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+"/account"}});
    if (error) setNotice(error.message);
  }
  async function saveProfile(event) {
    event.preventDefault();
    if (!validPhone(profileForm.phone.trim()) || profileForm.full_name.trim().length < 2) {
      setNotice("Enter your name and a valid international phone number."); return;
    }
    setBusy(true); setNotice("");
    const {error} = await supabase.rpc("ballersplay_complete_player_profile",{
      p_full_name:profileForm.full_name.trim(),p_phone:profileForm.phone.trim()
    });
    if (error) setNotice(error.message);
    else {
      const {data} = await supabase.from("player_profiles").select("full_name,phone").eq("id",user.id).maybeSingle();
      setProfile(data);
      setNotice("Your account is ready to book.");
    }
    setBusy(false);
  }
  async function changePassword(event) {
    event.preventDefault();
    if (form.password.length < 8 || form.password !== form.confirm) return setNotice("Password must be at least 8 characters and both entries must match.");
    setBusy(true);
    const {error} = await supabase.auth.updateUser({password:form.password});
    setBusy(false);
    if (error) setNotice(error.message);
    else {setRecovery(false);setNotice("Password updated.");}
  }
  if (recovery) return <section className="bp-account-panel"><h1>Choose a new password</h1>
    <form className="bp-native-form" onSubmit={changePassword}>
      <label>New password<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={e=>update("password",e.target.value)}/></label>
      <label>Confirm password<input type="password" required minLength={8} autoComplete="new-password" value={form.confirm} onChange={e=>update("confirm",e.target.value)}/></label>
      <button disabled={busy}>Update password</button>{notice && <p role="status">{notice}</p>}
    </form></section>;
  if (user) return <section className="bp-account-panel">
    <h1>My BallersPlay account</h1><p>Signed in as {user.email}</p>
    {profile ? <p>{profile.full_name} · {profile.phone}</p> :
      <form className="bp-native-form" onSubmit={saveProfile}>
        <p>Complete your profile to book matches. A phone number is required, including for Google sign-in.</p>
        <label>Full name<input required minLength={2} maxLength={120} value={profileForm.full_name} onChange={e=>setProfileForm(p=>({...p,full_name:e.target.value}))}/></label>
        <label>Phone number<input type="tel" required placeholder="+48123456789" pattern="[+][1-9][0-9]{7,14}" value={profileForm.phone} onChange={e=>setProfileForm(p=>({...p,phone:e.target.value}))}/></label>
        <button disabled={busy}>Save profile</button>
      </form>}
    {notice && <p role="status">{notice}</p>}
    <div className="bp-account-actions"><a href="/matches" className="btn btn-primary">Find matches</a>
    <button onClick={() => supabase.auth.signOut()}>Sign out</button></div>
  </section>;
  return <section className="bp-account-panel">
    <h1>{mode==="signup"?"Create an account":mode==="login"?"Log in":"Reset password"}</h1>
    <p>Register to request a place in a football match.</p>
    <form className="bp-native-form" onSubmit={submit}>
      {mode==="signup" && <>
        <label>Full name<input required minLength={2} maxLength={120} autoComplete="name" value={form.full_name} onChange={e=>update("full_name",e.target.value)}/></label>
        <label>Phone number (required, with country code)<input required type="tel" autoComplete="tel" placeholder="+48123456789" value={form.phone} onChange={e=>update("phone",e.target.value)} pattern="[+][1-9][0-9]{7,14}" title="Use international format, e.g. +48123456789"/></label>
      </>}
      <label>Email<input required type="email" autoComplete="email" value={form.email} onChange={e=>update("email",e.target.value)}/></label>
      {mode!=="reset" && <label>Password<input required type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={mode==="signup"?8:undefined} value={form.password} onChange={e=>update("password",e.target.value)}/></label>}
      {mode==="signup" && <label>Confirm password<input required type="password" autoComplete="new-password" value={form.confirm} onChange={e=>update("confirm",e.target.value)}/></label>}
      <button disabled={busy}>{busy?"Please wait…":mode==="signup"?"Create account":mode==="login"?"Log in":"Send reset email"}</button>
      {notice && <p role="status">{notice}</p>}
    </form>
    <div className="bp-google-signin"><button type="button" onClick={googleLogin}>Continue with Google</button></div>
    <div className="bp-account-actions">
      {mode!=="signup" && <button type="button" onClick={()=>{setMode("signup");setNotice("");}}>Create account</button>}
      {mode!=="login" && <button type="button" onClick={()=>{setMode("login");setNotice("");}}>Log in</button>}
      {mode!=="reset" && <button type="button" onClick={()=>{setMode("reset");setNotice("");}}>Forgot password?</button>}
    </div>
  </section>;
}
