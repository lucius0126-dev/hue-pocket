import {hsl,rgb,fromHsl,clamp} from './color.mjs';

// These are original digital styling palettes, not licensed paint/Pantone swatches.
export const trendStyles=[
 {id:'cloud-2026',name:'雲白・柔霧日常',season:'2026 年度色靈感',description:'以柔白、燕麥與霧藍營造輕盈感。穿搭可用淺色上衣搭灰藍；居家可用白色寢具搭木色。',colors:['#F1F0EA','#D8CBB8','#9EAFB4','#BFA8AC','#748474','#454C4B'],source:'Pantone · Cloud Dancer',url:'https://www.pantone.com/na/en-us/color-of-the-year/2026'},
 {id:'teal-2026',name:'深海青・自然都會',season:'2026／27 秋冬趨勢',description:'藍綠配砂色，再以暖棕收尾。可用在外套與長褲，也適合沙發、抱枕和木質家具。',colors:['#256C68','#E3DAC7','#A9B8AA','#AA7557','#30454D','#F3EFE6'],source:'WGSN · Transformative Teal',url:'https://www.wgsn.com/en/blog/key-colours-w-26-27'},
 {id:'espresso-2026',name:'濃咖啡・經典層次',season:'2026 年度色靈感',description:'深咖啡配奶油白、灰褐與低彩度粉。可從皮鞋、針織衫或窗簾開始，讓深色成為穩定的重心。',colors:['#4B413C','#EEE7D8','#AD9C87','#C9A5A0','#57625A','#897A70'],source:'Benjamin Moore · Silhouette',url:'https://www.benjaminmoore.com/en-us/press/benjamin-moore-announces-color-of-the-year-2026'},
 {id:'wax-2026',name:'奶油黃・冬日暖光',season:'2026／27 秋冬趨勢',description:'低彩度奶油黃與暖白打底，加入橄欖綠和焦糖。適合柔軟針織、淺木色空間與溫暖的寢具。',colors:['#E8DDB5','#F3EDE0','#A3A687','#AE8058','#726B5A','#CDBCB1'],source:'WGSN · Wax Paper',url:'https://www.wgsn.com/en/blog/key-colours-w-26-27'},
 {id:'blue-2027',name:'寶石藍・亮色焦點',season:'2027 趨勢預測',description:'鮮明藍色配米白與灰，少量加入橙粉。穿搭可先從包款或上衣試起，居家則用在單椅與小物。',colors:['#3347A0','#F0E9DA','#B9BDC8','#DD874F','#D6A4B4','#353B56'],source:'WGSN × Coloro · Luminous Blue',url:'https://www.wgsn.com/en/blog/colour-year-2027-luminous-blue'},
 {id:'celery-2027',name:'嫩草綠・舒心自然',season:'2027 年度色預告',description:'帶黃調的柔綠搭暖白、草木色與淡紫。適合襯衫、亞麻單品，也能延伸到寢具與自然風格空間。',colors:['#C5C69C','#F2EDE1','#858A69','#BBAFC5','#AF906E','#58494A'],source:'Sherwin-Williams · Celery',url:'https://www.hgtvhomebysherwinwilliams.com/en/newsroom/color-of-the-year-2027'}
];
export const curatedOn='2026-10-29';
export function normalizeStyle(value){
 if(!value||typeof value.name!=='string'||!Array.isArray(value.colors)||value.colors.length<2||value.colors.length>8||!value.colors.every(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)))return null;
 return {name:value.name.slice(0,60),description:typeof value.description==='string'?value.description.slice(0,240):'',colors:value.colors.map(c=>c.toUpperCase())};
}
export function stylePalette(style,sat=0,light=0,count=6){
 const seed=style.colors,all=[...seed];count=clamp(Math.round(count),2,8);
 while(all.length<count){const [h,s,l]=hsl(rgb(seed[all.length%seed.length]));all.push(fromHsl(h,s*.65,all.length%2?30:82))}
 return all.slice(0,count).map((c,i)=>{if(i===0||(!sat&&!light))return c;const [h,s,l]=hsl(rgb(c));return fromHsl(h,s+sat,clamp(l+light,5,95))});
}
export function skinOutfits(skin,undertone='unsure',contrast='balanced'){
 if(!/^#[0-9a-f]{6}$/i.test(skin))throw new Error('Invalid sampled color');
 const [,,light]=hsl(rgb(skin));
 const accent=undertone==='warm'?['#A56643','#7E895E','#D9C39E']:undertone==='cool'?['#687C9F','#92758E','#CFD4DF']:['#527D78','#9D7883','#D4C8B6'];
 const baseLight=contrast==='soft'?clamp(light+8,28,84):contrast==='bold'?(light>=52?22:88):(light>=55?32:78);
 const main=fromHsl(undertone==='warm'?36:undertone==='cool'?220:165,undertone==='unsure'?9:15,baseLight);
 const note='以取樣明暗與所選冷暖偏好延伸的穿搭示意；請以自然光下的實際試穿為準。';
 return [
  {name:'膚色穿搭・日常中性',description:'用中性色做大面積，再用一件配件帶出色彩。'+note,colors:[main,'#EEE7DA',accent[2],'#6F706D',accent[0],'#353A3C']},
  {name:'膚色穿搭・柔和層次',description:'以霧面、低彩度單品搭出柔和層次，適合針織與襯衫。'+note,colors:[accent[2],'#F1EAE0',accent[1],'#A8B7B0','#AAA39B',main]},
  {name:'膚色穿搭・亮點配件',description:'以藍綠或暖棕做亮點，其他單品保留簡單的深淺對比。'+note,colors:[accent[0],'#EDE7DA','#344451',accent[1],'#B6ADA2',main]}
 ];
}
const newsHosts=new Set(['www.dezeen.com','dezeen.com','design-milk.com','www.design-milk.com']);
export function safeNews(data){
 if(!data||!Array.isArray(data.items)||!Number.isFinite(Date.parse(data.checkedAt)))throw new Error('Invalid news data');
 const items=data.items.filter(item=>{try{return typeof item.title==='string'&&item.title.trim()&&typeof item.source==='string'&&Number.isFinite(Date.parse(item.publishedAt))&&new URL(item.url).protocol==='https:'&&newsHosts.has(new URL(item.url).hostname)}catch{return false}}).slice(0,8).map(x=>({title:x.title.slice(0,200),source:x.source.slice(0,40),publishedAt:x.publishedAt,url:x.url}));
 return {items,checkedAt:data.checkedAt,updatedAt:Number.isFinite(Date.parse(data.updatedAt))?data.updatedAt:null,partial:!!data.partial};
}
function dateLabel(value){return new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Taipei'}).format(new Date(value))}
function paletteCard(style,apply,season){
 const card=document.createElement('article');card.className='recommend-card';
 if(season){const badge=document.createElement('p');badge.className='recommend-season';badge.textContent=season;card.append(badge)}
 const title=document.createElement('h3');title.textContent=style.name;
 const chips=document.createElement('div');chips.className='recommend-colors';chips.setAttribute('aria-label',style.name+'：'+style.colors.join('、'));
 style.colors.forEach(c=>{const chip=document.createElement('span');chip.style.background=c;chip.title=c;chips.append(chip)});
 const desc=document.createElement('p');desc.textContent=style.description;
 const actions=document.createElement('div');actions.className='recommend-actions';const use=document.createElement('button');use.textContent='套用 6 色色盤';use.onclick=()=>apply(style);actions.append(use);
 if(style.url){const link=document.createElement('a');link.href=style.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='來源 ↗';link.setAttribute('aria-label','閱讀來源：'+style.source);actions.append(link)}
 card.append(title,chips,desc);if(style.source){const source=document.createElement('small');source.textContent=style.source;card.append(source)}card.append(actions);return card;
}
export function initRecommendations(apply,getBase){
 const $=id=>document.getElementById(id);
 trendStyles.forEach(style=>$('trend-cards').append(paletteCard(style,apply,style.season)));
 $('trend-curated').textContent=`色盤整理：${curatedOn} · 依公開趨勢延伸，非即時人氣排名。六色為搭配示意，並非品牌官方色號。`;
 let skin=null;
 function renderSkin(){if(!skin)return;$('skin-cards').replaceChildren(...skinOutfits(skin,$('skin-undertone').value,$('skin-contrast').value).map(style=>paletteCard(style,apply)));$('skin-result').hidden=false;}
 $('skin-sample').onclick=()=>{skin=getBase();$('skin-swatch').style.background=skin;$('skin-hex').textContent=skin;$('skin-message').textContent='已取用目前色彩。這不是臉部辨識；請確認剛才取樣的是膚色。';renderSkin()};
 $('skin-undertone').onchange=$('skin-contrast').onchange=renderSkin;
 const newsKey='hue-pocket-trend-news-v1';let news=null;
 function renderNews(data,offline=false){
  news=data;$('trend-news').replaceChildren();
  for(const item of data.items.slice(0,4)){const li=document.createElement('li'),link=document.createElement('a'),meta=document.createElement('small');link.textContent=item.title;link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';meta.textContent=`${item.source} · ${dateLabel(item.publishedAt)}`;li.append(link,meta);$('trend-news').append(li)}
  const stale=!data.updatedAt||Date.now()-Date.parse(data.updatedAt)>7*86400000;
  $('trend-news-status').textContent=`${offline?'離線／連線失敗，顯示已保存資料。':data.partial?'部分來源暫時無法更新。':''}${data.updatedAt?'文章抓取：'+dateLabel(data.updatedAt)+'。':'尚無成功抓取紀錄。'}${stale?'資料較舊，可開啟來源查看近況。':''}${!data.items.length?'目前沒有可顯示的色彩文章。':''}`;
 }
 try{const cached=localStorage.getItem(newsKey);if(cached)renderNews(safeNews(JSON.parse(cached)),true)}catch{}
 async function refreshNews(){
  const button=$('trend-refresh');button.disabled=true;button.textContent='更新中…';
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
  try{const response=await fetch('./trend-news.json',{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error('Network error');const data=safeNews(await response.json());renderNews(data);try{localStorage.setItem(newsKey,JSON.stringify(data))}catch{}}
  catch{if(news)renderNews(news,true);else $('trend-news-status').textContent='暫時無法取得線上文章。你仍可使用上方推薦色盤，或稍後再更新。'}
  finally{clearTimeout(timeout);button.disabled=false;button.textContent='更新文章'}
 }
 $('trend-refresh').onclick=refreshNews;refreshNews();
}
