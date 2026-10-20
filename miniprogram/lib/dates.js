const DAY=86400000;
function localDate(date=new Date()){return new Date(+date+8*3600000).toISOString().slice(0,10);}
function range(mode,offset=0,selected=''){
 const today=new Date(localDate()+'T00:00:00+08:00');let start,end;
 if(mode==='month'){const parts=localDate(today).split('-').map(Number);start=new Date(Date.UTC(parts[0],parts[1]-1+offset,1)-8*3600000);end=new Date(Date.UTC(parts[0],parts[1]+offset,1)-8*3600000);}
 else {const weekday=new Date(+today+8*3600000).getUTCDay();start=new Date(+today-((weekday+6)%7)*DAY+offset*7*DAY);end=new Date(+start+7*DAY);}
 const days=[];for(let n=+start;n<+end;n+=DAY){const day=localDate(new Date(n));days.push({date:day,label:Number(day.slice(-2)),selected:day===selected});}
 return {from:start.toISOString(),to:end.toISOString(),days,label:localDate(start)+' — '+localDate(new Date(+end-DAY))};
}
function format(value,locale){if(!value)return '';const d=new Date(value);if(!Number.isFinite(+d))return value;const s=new Date(+d+8*3600000).toISOString();return s.slice(0,10)+' '+s.slice(11,16);}
// Tomorrow at the current Shanghai clock time, rounded to the nearest hour.
function eventWindow(now=new Date()){
 const shifted=new Date(+now+8*3600000+DAY);
 const fraction=shifted.getUTCMinutes()+shifted.getUTCSeconds()/60+shifted.getUTCMilliseconds()/60000;
 shifted.setUTCMinutes(0,0,0);
 if(fraction>=30)shifted.setUTCHours(shifted.getUTCHours()+1);
 const start=new Date(+shifted-8*3600000);
 return {starts_at:start.toISOString(),ends_at:new Date(+start+3600000).toISOString()};
}
module.exports={localDate,range,format,eventWindow};
