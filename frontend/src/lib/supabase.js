import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const SESSION_KEY = "ballersplay-auth";
const REMEMBER_KEY = "ballersplay-remember";
const canStore=()=>{try{return typeof window!=="undefined"&&!!window.localStorage&&!!window.sessionStorage;}catch{return false;}};
export const getRememberLogin = () => {
  try { return !canStore() || window.localStorage.getItem(REMEMBER_KEY) !== "false"; }
  catch { return true; }
};
export const setRememberLogin = (remember) => {
  if (!canStore()) return;
  try{
    const source=remember?window.sessionStorage:window.localStorage;
    const destination=remember?window.localStorage:window.sessionStorage;
    const current=source.getItem(SESSION_KEY)||destination.getItem(SESSION_KEY);
    if(current)destination.setItem(SESSION_KEY,current);
    window.localStorage.setItem(REMEMBER_KEY,remember?"true":"false");
    source.removeItem(SESSION_KEY);
  }catch{/* Browser storage disabled: keep the current session in memory. */}
};
const sessionStorageAdapter = {
  getItem(key) {
    if (!canStore()) return null;
    try{return (getRememberLogin() ? window.localStorage : window.sessionStorage).getItem(key);}catch{return null;}
  },
  setItem(key,value) {
    if (!canStore()) return;
    try{
      const primary=getRememberLogin()?window.localStorage:window.sessionStorage;
      const secondary=getRememberLogin()?window.sessionStorage:window.localStorage;
      primary.setItem(key,value);
      secondary.removeItem(key);
    }catch{/* Storage may be disabled by browser privacy settings. */}
  },
  removeItem(key) {
    if (!canStore()) return;
    try{window.localStorage.removeItem(key);window.sessionStorage.removeItem(key);}catch{}
  }
};

// Browser sessions must persist across navigation, refresh and OAuth redirects.
// Never use service-role or secret keys in the browser.
export const supabase = url && key ? createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: SESSION_KEY,
    storage: sessionStorageAdapter,
    flowType: "pkce"
  }
}) : null;
