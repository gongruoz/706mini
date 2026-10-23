// Editable vector masters. Raster exports keep the same appearance in native
// WeChat renderers; no dependency on platform emoji or remote icon services.
// Run with sharp available on NODE_PATH: node scripts/build-community-icons.cjs
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const out = path.join(__dirname, '../miniprogram/assets/community-icons');
const ink = '#232323', paper = '#FFFFFF';
// One family: 2-unit round strokes, open interiors and comparable optical size.
// Following is a soft heart, not the heavier solid people silhouette.
const drawings = {
  feed: '<path d="M16 28C12 25 3 19 3 12a7 7 0 0 1 13-3 7 7 0 0 1 13 3c0 7-9 13-13 16Z"/>',
  discover: '<circle cx="16" cy="16" r="12"/><path d="M11 12v.2m10-.2v.2M10 18c1 6 11 6 12 0"/>',
  messages: '<rect x="3" y="6" width="26" height="21" rx="5"/><path d="m5 10 9 8a3 3 0 0 0 4 0l9-8"/>',
  me: '<circle cx="16" cy="8.5" r="5"/><path d="M4 28v-1a12 10 0 0 1 24 0v1H4Z"/>',
  calendar: '<rect x="5" y="6" width="22" height="23" rx="4"/><path d="M5 12h22M11 3v6m10-6v6m-11 9h3m6 0h3m-12 6h3"/><path d="m19 23 2 2 4-5"/>',
  location: '<path d="M25 13c0 7-9 16-9 16S7 20 7 13a9 9 0 0 1 18 0Z"/><circle cx="16" cy="13" r="3.5"/>',
  group: '<circle cx="12" cy="10" r="5"/><path d="M3 28v-2c0-6 3-9 9-9s9 3 9 9v2m0-23a5 5 0 0 1 0 10m3 4c3 1 5 4 5 8"/>',
  search: '<circle cx="14" cy="14" r="8"/><path d="m20 20 8 8"/>',
  publish: '<path d="M16 6v20M6 16h20"/>',
  empty: '<path d="M5 25h22M10 25V13h12v12"/><path d="M9 12c-5-5-2-10 0-9 4 1 6 5 6 9m3 0c-1-6 4-10 7-8 1 4-2 8-7 8"/><path d="M16 12v13"/>',
  close: '<path d="m8 8 16 16M24 8 8 24"/>',
  check: '<path d="m7 16 6 6L26 9"/>',
  back: '<path d="m20 5-11 11 11 11"/>',
  success: '<circle cx="16" cy="16" r="12"/><path d="m10 16 4 4 8-9"/>',
  waiting: '<circle cx="16" cy="16" r="12"/><path d="M16 8v9l6 3"/>',
  draft: '<rect x="6" y="3" width="20" height="26" rx="4"/><path d="M11 10h10m-10 6h10m-10 6h6"/>',
  ticket: '<path d="M4 7h24v7a3 3 0 0 0 0 6v6H4v-6a3 3 0 0 0 0-6V7Z"/><path d="M20 10v2m0 5v2m0 4v1"/>',
  review: '<rect x="5" y="6" width="22" height="23" rx="4"/><rect x="11" y="3" width="10" height="6" rx="2"/><path d="m10 19 4 4 8-9"/>',
  home: '<path d="m3 15 13-12 13 12M7 12v16h18V12M13 28V18h6v10"/>',
  more: '<circle cx="7" cy="16" r="1"/><circle cx="16" cy="16" r="1"/><circle cx="25" cy="16" r="1"/>',
  city: '<path d="M3 29h26M6 29V11h9v18m0-24h11v24M9 16h2m-2 5h2m9-10h2m-2 5h2m-2 5h2"/>',
  language: '<circle cx="16" cy="16" r="13"/><ellipse cx="16" cy="16" rx="6" ry="13"/><path d="M3 16h26M6 8h20M6 24h20"/>',
  bell: '<path d="M6 22h20l-3-5v-5a7 7 0 0 0-14 0v5l-3 5ZM12 26c1 4 7 4 8 0M16 3V1"/>',
  shield: '<path d="m16 3 11 4v8c0 7-11 14-11 14S5 22 5 15V7l11-4Z"/><path d="m11 15 4 4 7-8"/>',
  info: '<circle cx="16" cy="16" r="13"/><path d="M16 14v10m0-16v1"/>',
  feedback: '<path d="M6 5h20a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H14l-7 5v-5H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"/><path d="M10 12h12m-12 6h7"/>',
  logout: '<path d="M15 4H6v24h9m5-19 7 7-7 7m-9-7h16"/>',
  edit: '<path d="m6 21 15-15 5 5-15 15-7 2 2-7Zm12-12 5 5"/>',
  remove: '<path d="M4 8h24M12 8V4h8v4M7 8l2 21h14l2-21M13 13v10m6-10v10"/>',
  share: '<path d="M16 21V3m-6 6 6-6 6 6M8 14H5v15h22V14h-3"/>',
  upload: '<rect x="3" y="4" width="26" height="24" rx="5"/><circle cx="11" cy="11" r="2"/><path d="m4 24 8-8 5 5 5-7 6 10"/>',
  link: '<path d="m13 10 4-4a7 7 0 0 1 10 10l-4 4M19 22l-4 4A7 7 0 0 1 5 16l4-4m2 9L21 11"/>'
};
async function build() {
  fs.mkdirSync(out, {recursive:true});
  for (const [name, drawing] of Object.entries(drawings)) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="none" stroke="'+ink+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+drawing+'</g></svg>';
    await sharp(Buffer.from(svg)).resize(96,96).png().toFile(path.join(out,name+'.png'));
    if (['feed','discover','messages','me'].includes(name)) {
      const inverse=svg.replaceAll(ink,'__INK__').replaceAll(paper,ink).replaceAll('__INK__',paper);
      await sharp(Buffer.from(inverse)).resize(96,96).png().toFile(path.join(out,name+'-inverse.png'));
    }
  }
  console.log('Exported '+Object.keys(drawings).length+' community illustration icons.');
}
build().catch(error => {console.error(error); process.exitCode=1;});
