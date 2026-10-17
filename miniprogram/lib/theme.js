// 706 Paper / current editorial system. Shared by pages, custom navigation and posters.
// Yellow: actions/selection. Lavender: relationship notes. Sage: availability/notices.
const tokens={
 accent:'#FFF5A3',accentText:'#282822',accentSoft:'#FFFBE3',
 ink:'#282822',muted:'#706F65',info:'#4F4B70',infoSoft:'#EAE6F5',
 sage:'#EDF2E4',sageInk:'#46533C',lavender:'#E5DFF6',
 control:'#F0EEE7',canvas:'#FAF9F5',surface:'#FFFDF8',
 chromeSoft:'rgba(250,249,245,0.88)',chromeClear:'rgba(250,249,245,0)',
 line:'#D8D5C9',outline:'#282822',danger:'#A34035',
 stroke:'1px',radius:'32rpx',radiusImage:'24rpx',pill:'999rpx',
 spaceUnit:'8rpx',pageGutter:'32rpx',sectionGap:'56rpx',headingGap:'32rpx',
 itemGap:'32rpx',panelInset:'32rpx',sectionInset:'40rpx',controlHeight:'88rpx',
 eventRadius:'44rpx',eventArtRadius:'36rpx',eventArtSize:'216rpx',eventInset:'28rpx',
 stickerWidth:'368rpx',stickerHeight:'160rpx',stickerAvatar:'112rpx',
 tabHeight:'132rpx',tabIconSize:'50rpx',tabBarSpace:'248rpx',
 typeTitle:'40rpx',typeSection:'30rpx',typeBody:'28rpx',typeMeta:'24rpx',typeLabel:'20rpx',
 calendarGrid:'#D8D5C9',calendarAxis:'#706F65',calendarEvent:'#EDF2E4',
 calendarEventInk:'#282822',calendarMonthInk:'#282822',calendarSelected:'#FFF5A3',
 calendarDot:'#49493F',calendarLegend:'#706F65',calendarLegendDot:'#49493F',
 posterMuted:'#706F65',posterBadge:'#FFF5A3',posterBadgeInk:'#282822',
 posterRule:'#D8D5C9',posterSpine:'#B6B2A2',posterDot:'#706F45',posterFooter:'#706F65'
};
function style(){return Object.entries(tokens).map(([k,v])=>'--'+k+':'+v).join(';');}
module.exports={tokens,style};
