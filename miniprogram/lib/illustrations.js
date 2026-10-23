// Shared navigation; Following/Discover also use the matching fact icons.
// All assets are bundled locally. Inverse aliases remain for older templates.
const names=['feed','discover','messages','me','calendar','location','group','search','publish','empty','close','check','back','success','waiting','draft','ticket','review','home','more','city','language','bell','shield','info','feedback','logout','edit','remove','share','upload','link'];
const assets=Object.fromEntries([
 ...names.map(name=>[name,'/assets/community-icons/'+name+'.png']),
 ...['feed','discover','messages','me'].map(name=>[name+'Inverse','/assets/community-icons/'+name+'-inverse.png'])
]);
const aliases={person:'me',star:'feed',flag:'review',series:'calendar',org:'group',new:'me',activity:'feed',social:'language',projects:'draft',refresh:'discover',developer:'more'};
for(const [key,value] of Object.entries(aliases))assets[key]=assets[value];
assets.reasons=[assets.feed,assets.ticket,assets.home,assets.discover];
module.exports=assets;
