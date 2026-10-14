import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import FootballAvatar,{avatarPreset} from "./FootballAvatar";
import AvatarCustomizer from "./AvatarCustomizer";
import PlayerCard from "./PlayerCard";
import {chibiImage} from "./chibiCatalog";

const AVATARS = {striker:"⚽",keeper:"🧤",captain:"🏆",playmaker:"🎯",defender:"🛡️",speedster:"⚡"};
const validPhone = (value) => /^\+[1-9]\d{7,14}$/.test(value);

export default function PlayerAccount() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [cardStats,setCardStats]=useState(null);
  const [candidates,setCandidates]=useState([]);
  const [reviewTarget,setReviewTarget]=useState("");
  const [rating,setRating]=useState("5");
  const [reviewComment,setReviewComment]=useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [foundPlayer, setFoundPlayer] = useState(null);
  const [searchNotice, setSearchNotice] = useState("");
  const [mode, setMode] = useState("signup");
  const [recovery, setRecovery] = useState(false);
  const [profileForm, setProfileForm] = useState({full_name:"",phone:""});
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!supabase) {setAuthLoading(false);return;}
    let mounted = true;
    supabase.auth.getSession().then(({data,error}) => {
      if (!mounted) return;
      if (error) setNotice("Session restore failed: " + error.message);
      setUser(data.session?.user || null);
      setAuthLoading(false);
    }).catch(error => {if(mounted){setAuthLoading(false);setNotice(error.message || "Unable to restore session.");}});
    const {data:{subscription}} = supabase.auth.onAuthStateChange((event,session) => {
      if (!mounted) return;
      if(event==="PASSWORD_RECOVERY")setRecovery(true);
      setUser(session?.user || null);
      setAuthLoading(false);
    });
    return () => {mounted=false;subscription.unsubscribe();};
  }, []);
  useEffect(() => {
    if (!user || !supabase) { setProfile(null); setProfileLoading(false); return; }
    setProfileLoading(true);
    supabase.from("player_profiles").select("full_name,phone,username,avatar_key,avatar_path,avatar_config,is_verified").eq("id",user.id).maybeSingle()
      .then(({data,error}) => { setProfileLoading(false); if (error) setNotice("Could not load your profile: "+error.message); if (!error) { setProfile(data); setUsernameInput(data?.username || ""); setProfileForm({full_name:data?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",phone:data?.phone || ""}); } });
  }, [user]);
  useEffect(() => {
    if (!user || !profile) {setStats(null);return;}
    supabase.rpc("ballersplay_profile_stats",{p_player_id:user.id}).then(({data})=>setStats(data?.[0]||null));
    supabase.rpc("ballersplay_player_card",{p_player_id:user.id}).then(({data,error})=>{if(!error)setCardStats(data?.[0]||null);});
    supabase.rpc("ballersplay_review_candidates").then(({data})=>setCandidates(data||[]));
  }, [user,profile]);
  async function submitReview(event) {
    event.preventDefault();
    const target=candidates.find(c=>c.match_id+":"+c.player_id===reviewTarget);
    if(!target)return setNotice("Choose a teammate from a completed match.");
    setBusy(true);setNotice("");
    const {error}=await supabase.rpc("ballersplay_submit_review",{p_match_id:target.match_id,p_reviewed_id:target.player_id,p_rating:Number(rating),p_comment:reviewComment.trim()});
    if(error)setNotice(error.message);
    else {
      setCandidates(list=>list.filter(c=>c.match_id+":"+c.player_id!==reviewTarget));
      setReviewTarget("");setReviewComment("");setNotice("Review submitted. Thank you!");
    }
    setBusy(false);
  }
  async function saveCustomizedAvatar(key, config) {
    if (!profile || !user) return false;
    setAvatarBusy(true);setNotice("");
    const {error}=await supabase.from("player_profiles").update({
      avatar_key:key,avatar_config:config,avatar_path:null,updated_at:new Date().toISOString()
    }).eq("id",user.id);
    if(error){setNotice("Avatar could not be saved: "+error.message);setAvatarBusy(false);return false;}
    setProfile(p=>({...p,avatar_key:key,avatar_config:config,avatar_path:null}));
    setAvatarBusy(false);return true;
  }
  async function uploadAvatar(event) {
    const file=event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size>2*1024*1024) return setNotice("Choose a JPG, PNG or WebP image under 2 MB.");
    setAvatarBusy(true);setNotice("");
    const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[file.type];
    const path=user.id+"/avatar-"+crypto.randomUUID()+"."+ext;
    const {error}=await supabase.storage.from("player-avatars").upload(path,file,{contentType:file.type,upsert:false});
    if (error) {setNotice(error.message);setAvatarBusy(false);return;}
    const result=await supabase.from("player_profiles").update({avatar_path:path,updated_at:new Date().toISOString()}).eq("id",user.id);
    if(result.error) setNotice(result.error.message);
    else setProfile(p=>({...p,avatar_path:path}));
    setAvatarBusy(false);
  }
  const avatarUrl=profile?.avatar_path ? supabase?.storage.from("player-avatars").getPublicUrl(profile.avatar_path).data.publicUrl : null;
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
      const {data} = await supabase.from("player_profiles").select("full_name,phone,username,avatar_key,avatar_path,avatar_config,is_verified").eq("id",user.id).maybeSingle();
      setProfile(data);
      setNotice("Your account is ready to book.");
    }
    setBusy(false);
  }
  async function updateUsername(event) {
    event.preventDefault();
    const normalized = usernameInput.trim().toLowerCase();
    if (!/^[a-z][a-z0-9_]{2,19}$/.test(normalized)) return setNotice("Use 3–20 characters: start with a letter, then letters, numbers or underscores.");
    setBusy(true);setNotice("");
    const {error} = await supabase.rpc("ballersplay_set_username",{p_username:normalized});
    if (error) setNotice(error.code==="23505"?"That username is already taken.":error.message);
    else {setProfile(p=>({...p,username:normalized}));setUsernameInput(normalized);setNotice("Username saved.");}
    setBusy(false);
  }
  async function findPlayer(event) {
    event.preventDefault();
    setSearchNotice("");setFoundPlayer(null);
    const normalized=searchUsername.trim().replace(/^@/,"").toLowerCase();
    if (!/^[a-z][a-z0-9_]{2,19}$/.test(normalized)) return setSearchNotice("Enter a valid username.");
    const {data,error}=await supabase.rpc("ballersplay_find_player",{p_username:normalized});
    if(error) setSearchNotice("Unable to search players right now.");
    else if (!data?.length) setSearchNotice("No player found with that username.");
    else setFoundPlayer(data[0]);
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
  if (authLoading) return <section className="bp-account-panel"><h1>My BallersPlay account</h1><p role="status">Restoring your login…</p></section>;
  if (recovery) return <section className="bp-account-panel"><h1>Choose a new password</h1>
    <form className="bp-native-form" onSubmit={changePassword}>
      <label>New password<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={e=>update("password",e.target.value)}/></label>
      <label>Confirm password<input type="password" required minLength={8} autoComplete="new-password" value={form.confirm} onChange={e=>update("confirm",e.target.value)}/></label>
      <button disabled={busy}>Update password</button>{notice && <p role="status">{notice}</p>}
    </form></section>;
  if (user) return <section className="bp-account-panel">
    <h1>My BallersPlay account</h1><p>Signed in as {user.email}</p><p><a href="/account" className="btn btn-primary">My Profile</a></p>
    {profileLoading ? <p>Loading your profile…</p> : profile ? <p>{profile.full_name} · {profile.phone}</p> :
      <form className="bp-native-form" onSubmit={saveProfile}>
        <p>Complete your profile to book matches. A phone number is required, including for Google sign-in.</p>
        <label>Full name<input required minLength={2} maxLength={120} value={profileForm.full_name} onChange={e=>setProfileForm(p=>({...p,full_name:e.target.value}))}/></label>
        <label>Phone number<input type="tel" required placeholder="+48123456789" pattern="[+][1-9][0-9]{7,14}" value={profileForm.phone} onChange={e=>setProfileForm(p=>({...p,phone:e.target.value}))}/></label>
        <button disabled={busy}>Save profile</button>
      </form>}
    {profile && <div className="bp-profile-features">
      <div className="bp-profile-card-feature"><PlayerCard profile={profile} stats={{...stats,...cardStats}}/></div>
      <div className="bp-profile-hero">
        <div className="bp-avatar-preview">{avatarUrl?<img src={avatarUrl} alt="Your profile avatar"/>:chibiImage(profile.avatar_config?.chibiId)?<img src={chibiImage(profile.avatar_config.chibiId)} alt="Your chosen football character"/>:<FootballAvatar variant={profile.avatar_key} config={profile.avatar_config&&Object.keys(profile.avatar_config).length?profile.avatar_config:avatarPreset(profile.avatar_key)} size={86}/>}</div>
        <div><h2>{profile.full_name}</h2><p>{profile.username?"@"+profile.username:"Choose a username below"}</p>
        <p>{profile.is_verified?"✓ Verified by BallersPlay":"Account not yet verified"}</p></div>
      </div>
      <div className="bp-stat-grid">
        <div><strong>{stats?.games_played??"—"}</strong><span>Games played</span></div>
        <div><strong>{stats?.matches_organized??"—"}</strong><span>Matches organized</span></div>
        <div><strong>{stats?.average_rating??"—"}</strong><span>Player rating</span></div>
        <div><strong>{stats?.review_count??"—"}</strong><span>Reviews</span></div>
      </div>
      <p className="bp-fineprint">Counts reflect confirmed bookings in completed matches and completed matches linked to your organizer account. Reviews are only accepted between confirmed participants in a completed match.</p>
      <h2>Review a teammate</h2>
      {candidates.length ? <form className="bp-native-form" onSubmit={submitReview}>
        <label>Player and completed match<select required value={reviewTarget} onChange={e=>setReviewTarget(e.target.value)}>
          <option value="">Choose a teammate</option>
          {candidates.map(c=><option key={c.match_id+":"+c.player_id} value={c.match_id+":"+c.player_id}>{c.player_name} ({c.match_title})</option>)}
        </select></label>
        <label>Rating<select value={rating} onChange={e=>setRating(e.target.value)}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></label>
        <label>Comment (optional)<textarea maxLength={500} rows={3} value={reviewComment} onChange={e=>setReviewComment(e.target.value)}/></label>
        <button disabled={busy}>Submit review</button>
      </form> : <p>You can review teammates after a match is marked completed and both players have confirmed bookings.</p>}
      <AvatarCustomizer profile={profile} stats={{...stats,...cardStats}} onSave={saveCustomizedAvatar} busy={avatarBusy}/>
      <label className="bp-upload-label">Or upload your own profile photo (JPG, PNG or WebP, max 2 MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={avatarBusy} onChange={uploadAvatar}/></label>
      <h2>Player profile</h2>
      <p>Your username is your public identity. Other players can use it to find you later.</p>
      <form className="bp-native-form" onSubmit={updateUsername}>
        <label>Choose your username
          <input required minLength={3} maxLength={20} autoComplete="off" spellCheck={false}
            pattern="[a-zA-Z][a-zA-Z0-9_]{2,19}" placeholder="moussa10"
            value={usernameInput} onChange={e=>setUsernameInput(e.target.value)}/>
        </label>
        <button disabled={busy}>{profile.username?"Update username":"Save username"}</button>
      </form>
      {profile.username && <p className="bp-public-handle">Your handle: @{profile.username}</p>}
      <h2>Find a player</h2>
      <p>Search for a player by username. Friend requests and messaging will be added later.</p>
      <form className="bp-native-form" onSubmit={findPlayer}>
        <label>Player username<input value={searchUsername} onChange={e=>setSearchUsername(e.target.value)} placeholder="@playername"/></label>
        <button>Find player</button>
      </form>
      {foundPlayer && <p role="status">{foundPlayer.full_name} — @{foundPlayer.username}</p>}
      {searchNotice && <p role="status">{searchNotice}</p>}
    </div>}
    {notice && <p role="status">{notice}</p>}
    <div className="bp-account-actions"><a href="/matches" className="btn btn-primary">Find matches</a>
    <button onClick={() => supabase.auth.signOut()}>Sign out</button></div>
  </section>;
  return <section className="bp-account-login-layout">\n    <div className="bp-account-video" aria-hidden="true"><video autoPlay muted loop playsInline preload="metadata" poster="/LogoEnhanced2.png"><source src="/signin-bg.mp4" type="video/mp4"/></video><div className="bp-account-video-shade"/><div className="bp-account-video-caption"><span>BALLERSPLAY</span><strong>YOUR STORY STARTS HERE.</strong></div></div>\n    <div className="bp-account-panel bp-account-login-form">
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
}    </div>\n
