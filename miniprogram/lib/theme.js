// One community system for pages, overlays, navigation and exported posters.
const tokens={
 canvas:'#F5F5F2',surface:'#FFFFFF',ink:'#232323',muted:'#6B6B66',
 accent:'#FFE568',accentText:'#232323',accentSoft:'#FFF7CC',
 line:'#DDDDD7',outline:'#232323',control:'#EFEFEB',danger:'#A34035',
 info:'#656560',infoSoft:'#F0F0EC',sage:'#F0F0EC',sageInk:'#454541',lavender:'#F0F0EC',
 invitation:'#FFFFFF',peopleSurface:'#FFFFFF',
 chromeClear:'rgba(245,245,242,0)',chromeSoft:'rgba(245,245,242,.94)',
 stroke:'1px',radius:'32rpx',radiusImage:'24rpx',radiusInput:'24rpx',radiusSheet:'48rpx',pill:'999rpx',
 spaceUnit:'8rpx',pageGutter:'32rpx',sectionGap:'56rpx',headingGap:'24rpx',
 itemGap:'32rpx',panelInset:'32rpx',sectionInset:'40rpx',controlHeight:'88rpx',
 eventRadius:'44rpx',eventArtRadius:'38rpx',eventRim:'6rpx',eventArtWidth:'264rpx',eventArtHeight:'352rpx',
 eventArtSize:'264rpx',eventInset:'6rpx',stickerWidth:'500rpx',stickerHeight:'200rpx',stickerAvatar:'84rpx',
 tabHeight:'112rpx',tabIconSize:'46rpx',tabBarSpace:'188rpx',navigationGutter:'20rpx',
 navigationSurface:'rgba(255,253,248,.84)',navigationAccent:'#FFE568',navigationInk:'#232323',
 typeTitle:'40rpx',typeEvent:'34rpx',typeSection:'32rpx',typeBody:'28rpx',typeFact:'24rpx',typeMeta:'22rpx',typeLabel:'20rpx',
 calendarGrid:'#DDDDD7',calendarAxis:'#6B6B66',calendarEvent:'#FFFFFF',calendarEventInk:'#232323',
 calendarMonthInk:'#232323',calendarSelected:'#FFE568',calendarDot:'#232323',calendarLegend:'#6B6B66',calendarLegendDot:'#232323',
 posterMuted:'#6B6B66',posterBadge:'#FFE568',posterBadgeInk:'#232323',posterRule:'#DDDDD7',
 posterSpine:'#DDDDD7',posterDot:'#232323',posterFooter:'#6B6B66'
};
// Old callers may still pass an edition name; it no longer changes the system.
function style(){return Object.entries(tokens).map(([k,v])=>'--'+k+':'+v).join(';');}
const taskRoutes=['publish','campaign-create','campaign-edit','edit-profile','edit-entity','create-space','onboarding','login','feedback','approval-detail','campaign-approval-detail'];
function isTask(route){return taskRoutes.includes(route);}
module.exports={tokens,community:tokens,style,taskRoutes,isTask};
