const api=require('./api');
const key=()=> '706.preferences.'+api.mode()+'.'+(api.session()?.id||'anonymous');
const defaults={city:'shanghai',locale:'zh-CN'};
let synced='',syncing;
function get(){return {...defaults,...(wx.getStorageSync(key())||wx.getStorageSync('706.preferences.'+api.mode()+'.anonymous')||{})};}
function set(values){const next={...get(),...values};wx.setStorageSync(key(),next);return next;}
function fromProfile(profile){const values={};if(profile?.city)values.city=profile.city;if(['zh-CN','en'].includes(profile?.locale))values.locale=profile.locale;set(values);synced=key();}
async function sync(){if(api.isMock()||!api.session()||synced===key())return;if(syncing)return syncing;const identity=key();syncing=api.call('read',{op:'me',params:{light:true}}).then(r=>{if(key()===identity)fromProfile(r.profile);}).catch(error=>{if(error?.status!==401&&error?.code!=='LOGIN_REQUIRED')throw error;}).finally(()=>{syncing=null;});return syncing;}
module.exports={get,set,fromProfile,sync};
