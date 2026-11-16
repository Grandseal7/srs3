const $=(f,n)=>f.querySelector('[name='+n+']'),num=(f,n)=>+$(f,n).value,out=(f,h)=>f.querySelector('.out').innerHTML=h;
const rnd=s=>()=>((s=s*16807%2147483647)-1)/2147483646,D={};
function line(g,P,col,w,dash){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash||[]);g.stroke();g.setLineDash([])}
function axes(g,xl,yl){g.strokeStyle='#9aa7b3';g.lineWidth=1;g.strokeRect(50,20,570,300);g.fillStyle='#5d6f7e';g.font='13px sans-serif';g.fillText(xl,300,348);g.save();g.rotate(-Math.PI/2);g.fillText(yl,-230,16);g.restore()}
const MU=(T,n,t,C)=>30*Math.exp(.075*C)*Math.exp(-.022*T)*Math.pow(n/800,-.25)*(.6+.4*Math.exp(-t/35));
D.heat=(c,f)=>{const g=c.getContext('2d');function r(){const m=num(f,'m'),P=num(f,'p')*1000,k=num(f,'k'),Cp=1800,Ta=20;let T=Ta,X=[],t40=null;
for(let i=0;i<=720;i++){X.push(T);if(T>=40&&t40===null)t40=i/6;T+=(P-k*(T-Ta))/(Cp*m)*10}
const py=v=>320-(v-0)*(300/100),mx=Math.max(...X);g.clearRect(0,0,640,360);axes(g,'время, мин','температура смеси, °C');
line(g,[[50,py(60)],[620,py(60)]],'#E4572E',1.5,[6,4]);line(g,[[50,py(20)],[620,py(20)]],'#9aa7b3',1,[3,3]);line(g,X.map((v,i)=>[50+i*570/720,py(Math.min(v,100))]),'#1F7A8C',3);
out(f,`Красный пунктир — верхний допустимый предел 60 °C. Установившаяся температура: <b>${(Ta+P/k).toFixed(1)} °C</b>, за 120 минут достигнуто <b>${mx.toFixed(1)} °C</b>. ${t40===null?'40 °C не достигнуты.':'40 °C достигнуты через <b>'+t40.toFixed(0)+' мин</b>.'}${mx>60?' <b>Перегрев: нужно усилить охлаждение.</b>':''}`)}
f.addEventListener('input',r);r()};
D.visc=(c,f)=>{const r=()=>out(f,`Вязкость μ = <b>${MU(num(f,'T'),num(f,'n'),num(f,'t'),num(f,'C')).toFixed(0)} мПа·с</b> (целевая в примере — 500 мПа·с)`);f.addEventListener('input',r);r()};
D.fc=(c,f)=>{const g=c.getContext('2d'),R={"metrics":{"Линейная регрессия":{"MAE":153.3,"RMSE":190.4,"R2":0.872,"MAPE":38.6},"Случайный лес":{"MAE":64.4,"RMSE":98.6,"R2":0.966,"MAPE":11.2}}};
{const R=window.RES;function r(){const m=$(f,'m').value,i=m=='l'?1:2,P=R.pts,mx=Math.max(...P.map(p=>Math.max(p[0],p[i])))*1.05,px=v=>50+v/mx*570,py=v=>320-v/mx*300;
g.clearRect(0,0,640,360);axes(g,'фактическая вязкость, мПа·с','прогноз, мПа·с');line(g,[[px(0),py(0)],[px(mx),py(mx)]],'#9aa7b3',1.5,[6,4]);
P.forEach(p=>{g.beginPath();g.arc(px(p[0]),py(p[i]),4,0,7);g.fillStyle=m=='l'?'#E4572E':'#1F7A8C';g.fill()});
out(f,`Чем ближе точки к пунктирной диагонали, тем точнее прогноз. Показаны первые 60 точек тестовой выборки.`)}
f.addEventListener('input',r);r()}};
D.ctrl=(c,f)=>{const g=c.getContext('2d'),TG=500;
function run(C,smart,R){let mu=MU(40,800,0,C),T=40,n=800,E=0,ok=null,H=[],Ts=0;const Cm=C*(1+(R?(R()-.5)*.04:0));
for(let t=1;t<=60;t++){if(smart){const e=TG-MU(T,n,t,Cm),k=e/TG;T=Math.min(60,Math.max(20,T-Math.max(-2,Math.min(2,k*25))));n=Math.min(1500,Math.max(300,n-k*600))}
mu+=(MU(T,n,t,C)-mu)/5;E+=Math.pow(n/1000,3)*.5;Ts+=Math.abs(T-40);H.push(mu);if(Math.abs(mu-TG)<=TG*.1&&ok===null)ok=t;if(Math.abs(mu-TG)>TG*.1)ok=null}
return{H,err:Math.abs(mu-TG),t:ok===null?60:ok,hit:Math.abs(mu-TG)<=TG*.1,E,dT:Ts/60}}
function r(){const C=num(f,'C'),a=run(C,0),b=run(C,1),px=i=>50+i*570/59,py=v=>320-v/1500*300;g.clearRect(0,0,640,360);axes(g,'время, мин','вязкость, мПа·с');
g.fillStyle='#1F7A8C22';g.fillRect(50,py(550),570,py(450)-py(550));line(g,[[50,py(500)],[620,py(500)]],'#1F7A8C',1,[5,4]);
line(g,a.H.map((v,i)=>[px(i),py(Math.min(v,1500))]),'#E4572E',3);line(g,b.H.map((v,i)=>[px(i),py(Math.min(v,1500))]),'#1F7A8C',3);
const R=rnd(11),S=[[],[]];for(let i=0;i<300;i++){const cc=50+R()*10;[0,1].forEach(s=>S[s].push(run(cc,s,R)))}
const av=(A,k)=>A.reduce((s,x)=>s+x[k],0)/A.length,pc=A=>A.filter(x=>x.hit).length/A.length*100,row=(l,k,u,d)=>`<tr><td>${l}</td><td>${av(S[0],k).toFixed(d)}${u}</td><td>${av(S[1],k).toFixed(d)}${u}</td></tr>`;
out(f,`<p>Красная линия — традиционное управление (T = 40 °C, n = 800 об/мин), бирюзовая — с прогнозной моделью. Полоса — допуск ±10% от 500 мПа·с. Для выбранной партии (C = ${C}%) итоговая вязкость: традиционное <b>${a.H[59].toFixed(0)}</b>, интеллектуальное <b>${b.H[59].toFixed(0)}</b> мПа·с.</p>
<div class="scroll"><table class="tbl"><tr><th>Критерий (среднее по 300 моделируемым партиям, C от 50 до 60%)</th><th>Традиционное</th><th>Интеллектуальное</th></tr>${row('Ошибка вязкости на выходе, мПа·с','err','',0)}<tr><td>Доля партий в допуске</td><td>${pc(S[0]).toFixed(0)}%</td><td>${pc(S[1]).toFixed(0)}%</td></tr>${row('Время достижения допуска, мин','t','',0)}${row('Энергопотребление мешалки, усл. ед.','E','',0)}${row('Среднее отклонение T от 40 °C, °C','dT','',1)}</table></div>`)}
f.addEventListener('input',r);r()};
document.querySelectorAll('[data-d]').forEach(e=>D[e.dataset.d](e.querySelector('canvas'),e));
