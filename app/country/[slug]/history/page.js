'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getCountry } from '../../../lib/mock'
import { Navbar } from '../../../components/layout/Navbar'
import { SignalBadge } from '../../../components/ui/SignalBadge'

const T = {
  bg:'#faf8f4', card:'#ffffff', text:'#1a1612', sub:'#6a6460', muted:'#9a948e',
  border:'#e8e2d8', accent:'#1a3a6a', gain:'#2a7a4a', loss:'#c8622a', neut:'#b08c3a',
}

const SIG = {
  g:{ color:'#2a7a4a', bg:'#dff0e8', border:'#a8dfc0', label:'Расширение' },
  l:{ color:'#c8622a', bg:'#f5e8df', border:'#e8c4a8', label:'Потеря / кризис' },
  n:{ color:'#b08c3a', bg:'#f5edda', border:'#e8d898', label:'Нейтрально' },
}

// ─── Mercator projection helper (pure JS, no D3) ──────────────────────────
// Maps [lon, lat] → [x, y] in a 660×430 viewport centered on SEA
function mercator(lon, lat, W, H) {
  const cx = 101.5, cy = 14, scale = W * 6.5
  const rad = Math.PI / 180
  const x0 = cx * rad, y0 = Math.log(Math.tan(Math.PI/4 + cy*rad/2))
  const x  = (lon * rad - x0) * scale + W/2
  const yM = Math.log(Math.tan(Math.PI/4 + lat*rad/2))
  const y  = -(yM - y0) * scale + H/2
  return [x, y]
}

// Convert array of [lon,lat] to SVG path string
function ringToPath(ring, W, H) {
  if (!ring || ring.length < 2) return ''
  const pts = ring.map(([lo, la]) => mercator(lo, la, W, H))
  return pts.map((p, i) => `${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'
}

// ─── Geo polygons [lon, lat] — Natural Earth simplified ───────────────────
const GEO = {
  myanmar:    [[92.2,27.8],[94,28],[96,28.3],[97.5,28.5],[98.7,27.5],[98.5,25.5],[97.8,24],[98.1,22.5],[99,21.8],[100.1,21.5],[101.2,21.8],[101.7,22.5],[101.1,23],[102,23.8],[103,22.3],[101.7,21],[101.2,20.2],[100.5,19.5],[99.5,18.2],[98.8,16.5],[97.8,15],[97.5,12.5],[98.6,11.5],[98.7,10.5],[99,10],[98.5,9.5],[98,7.8],[98.5,6.5],[99,6.4],[100.1,5.6],[100.3,5],[100,4.8],[99.5,5.2],[99.2,5.8],[98.7,7],[97.8,8],[97.5,9.5],[97,10.5],[96.5,12],[96,14],[95.5,16],[95,18.5],[94.5,20],[93.5,22],[92.8,24],[92.2,27.8]],
  laos:       [[102.1,22.4],[103.2,22.8],[104.1,22.4],[104.6,21.8],[104.9,20.5],[105.5,19.5],[106,18.8],[106.1,17.5],[105.8,16.5],[105.5,15.5],[105.6,14.5],[105.1,14],[104.8,13.5],[104.5,13],[103.9,12.5],[103.4,12.5],[103,12.8],[103,13.5],[103.4,14],[102.9,14.5],[102.3,15.5],[101.8,16.5],[101,17.5],[100.5,18],[100,19],[100.3,20.3],[100.7,19.5],[101.2,19.5],[101.8,19.5],[102.2,20.4],[102.9,21],[104,21.2],[104.6,21.8],[102.1,22.4]],
  vietnam:    [[103,22.8],[104.1,22.4],[104.7,23.2],[105.8,23.5],[106.8,22.8],[107.9,22.2],[108.5,21.5],[108.7,20.5],[108.2,19.5],[107.5,18],[107,17],[106.6,16],[106,14.5],[105.8,13],[106.5,11.5],[107,10.5],[108,10],[109,10.5],[109.5,12],[109,13.5],[108.5,15],[107.5,16],[106.8,17],[106.1,17.5],[105.5,19.5],[104.9,20.5],[104.6,21.8],[104.1,22.4],[103.2,22.8],[103,22.8]],
  cambodia:   [[102.3,15.5],[102.9,14.5],[103.4,14],[102.9,13.5],[103,12.8],[103.4,12.5],[103.9,12.5],[104.5,13],[104.8,13.5],[105.1,14],[105.6,14.5],[106,14],[106.5,13.5],[107,12.5],[107.5,11.5],[107,10.5],[106.5,11.5],[105,11],[103.5,10.5],[102.5,11],[102,12],[102.3,13],[102.1,14],[101.8,15],[102.3,15.5]],
  malaysia_w: [[103,1.5],[103.5,2.5],[104,3.5],[104,4.5],[103.5,5.5],[103,6],[102,6.5],[101.5,6.8],[100.5,6.3],[100,6],[99.5,6.4],[99,6.4],[100.1,5.6],[100.3,5],[100,4.8],[100.5,4],[101,3.5],[102,2.5],[103,1.5]],
  china_s:    [[105,23],[106,23.5],[107,23.5],[108,23],[109,22],[110,21.5],[108.5,21.5],[107.9,22.2],[106.8,22.8],[105.8,23.5],[104.7,23.2],[104.1,22.4],[103.2,22.8],[103,23],[104,23.5],[105,23]],
}

const MODERN     = [[99,5.7],[100.1,5.6],[101,6],[101.8,6.5],[102,7],[101.5,8],[101,9],[101.5,10],[102,11],[102.5,13],[103,14.5],[103.5,16],[103,18],[102.5,20],[102,21.5],[101,21],[100,20],[99,19],[98.5,17.5],[98.5,16],[97.5,15],[97.5,13.5],[98,11],[98,9],[98.5,7],[99,5.7]]
const LOST_LAOS  = [[103.5,14],[104,15],[104.5,16.5],[105,18],[105.5,20],[105.5,22],[104.5,22.5],[103.5,22],[102.5,21],[102,21.5],[102.5,20],[103,18],[103.5,16],[103.5,14]]
const LOST_CAMB  = [[103,12],[103.5,11.5],[104,11],[104.5,11.5],[105,12],[105,13],[104.5,14],[103.5,14],[103,13],[102.5,12.5],[103,12]]
const LOST_MALAY = [[99.5,6.4],[100.3,6],[101,6.2],[101.8,6.8],[102,7],[101.5,7.5],[100.8,7.2],[100,6.8],[99.5,6.4]]

// ─── Historical periods ───────────────────────────────────────────────────
const PERIODS = [
  { year:1700, label:'Аюттхая — пик', dynasty:'Аюттхая', period:'1700–1767',
    pct:100, km:'~800 000', chg:'', dir:'n',
    siam:[[98.5,7],[99.5,6],[100.5,5.5],[101.5,6],[102,7],[102.5,8.5],[102.5,10.5],[103,13],[103.5,15],[104,17],[104.5,19],[104,21],[103,21.5],[102,21],[101,20],[100,19.5],[99,19],[98.5,17.5],[98,16],[98,14],[98,12],[98,10],[98,8],[98.5,7]],
    lost:[], caps:[{lon:100.5,lat:14.35,main:true,lbl:'Аюттхая'}],
    evts:[{lon:98.98,lat:18.8,col:'#2a7a4a',lbl:'Чиангмай'},{lon:101.5,lat:6.5,col:'#2a7a4a',lbl:'Малайские вассалы'}],
    cause:'Аюттхая — крупнейшее государство ЮВА. Вассальные отношения охватывают Чиангмай, долину Меконга, части Лаоса и четыре малайских султаната. Транзит специй и шёлка — главный доход.',
    terr:'Территория ~800 000 км²: весь современный Таиланд, части Лаоса, западная Камбоджа, северные малайские земли.',
    fwd:'Сиам-1700 — модель торгового государства без природных ресурсов. Аналог сегодня: ОАЭ, Сингапур. Таиланд воспроизводит эту логику через туризм и логистику АСЕАН.',
    inv:'Модель государства-хаба — торговля без природных ресурсов. Аналог: ОАЭ, Сингапур. Таиланд воспроизводит ту же логику через туризм и логистику АСЕАН.',
    invT:'Паттерн: государство-хаб', invS:'n' },

  { year:1767, label:'Падение Аюттхаи', dynasty:'Кризис / Тхонбури', period:'1767–1782',
    pct:58, km:'~465 000', chg:'−42%', dir:'l',
    siam:[[99,7.5],[100,7],[101,7.5],[102,8.5],[102.5,10.5],[102.5,12.5],[103,14.5],[103,16.5],[103,18],[102.5,19.5],[101.5,20],[100.5,20],[99.5,19.5],[99,18],[98.5,16.5],[98.5,15],[98.5,13],[98.5,11],[98.5,9],[99,8],[99,7.5]],
    lost:[], caps:[{lon:100.5,lat:14.35,col:'#E24B4A',main:true,lbl:'Руины Аюттхаи'},{lon:100.5,lat:13.5,lbl:'Тхонбури (нов. столица)'}],
    evts:[],
    cause:'Апрель 1767: бирманские войска сожгли Аюттхаю. 400-летняя столица уничтожена за несколько дней. Торговые сети обнулились. Государство сжалось до долины Чао Прайя.',
    terr:'Вассальные территории отпали мгновенно: Лаос, Камбоджа, малайские султанаты. Генерал Таксин основал новую столицу Тхонбури напротив будущего Бангкока.',
    fwd:'Паттерн: политический коллапс → Chinese-Thai капитал заполняет вакуум. Тот же сценарий в 1997 и 2014. Chinese-Thai группы контролируют 60%+ SET сегодня.',
    inv:'После краха активы дешевеют, но Chinese-Thai сети подбирают их первыми. При следующем кризисе эти корпорации снова будут покупателями просевших активов.',
    invT:'Паттерн: после коллапса', invS:'l' },

  { year:1782, label:'Основание Бангкока', dynasty:'Чакри I (Рама I)', period:'1782–1826',
    pct:72, km:'~575 000', chg:'+восстановление', dir:'g',
    siam:[[99,6.5],[100,6],[101,6.5],[102,7.5],[102.5,9],[102.5,11],[103,13.5],[103.5,15.5],[104,17.5],[103.5,19.5],[103,21],[102,21.5],[101,21],[100,20],[99,19],[98.5,17.5],[98.5,16],[98.5,14],[98.5,12],[99,9.5],[99,7.5],[99,6.5]],
    lost:[], caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок (с 1782)'}],
    evts:[{lon:98.98,lat:18.8,col:'#2a7a4a',lbl:'Возврат Чиангмая'}],
    cause:'Рама I основал Бангкок: острова в Чао Прайя — естественная защита. Торговля с Китаем по системе «дань-привилегия» финансирует строительство нового государства.',
    terr:'Территория восстанавливается: возвращён Чиангмай, лаосские вассалы частично под контролем. Давление с двух сторон: Бирма на западе, Вьетнам на востоке.',
    fwd:'С 1782 Бангкок непрерывно аккумулирует капитал — 244 года. Единственный финансовый центр страны. Бангкокская недвижимость: исторически доказанная долгосрочная ставка.',
    inv:'244 года столичной концентрации. Бангкокская недвижимость восстанавливалась после каждого кризиса — наименьший политический риск в стране.',
    invT:'Паттерн: столичная концентрация', invS:'g' },

  { year:1826, label:'Договор Бёрни', dynasty:'Чакри III (Рама III)', period:'1826–1855',
    pct:76, km:'~610 000', chg:'первая уступка', dir:'l',
    siam:[[99,6],[100,5.5],[101,6],[102,7],[102.5,9],[103,11.5],[103.5,14],[104,16.5],[104.5,19],[104,21],[103,21.5],[102,21],[101,20],[100,19],[99,17.5],[98.5,16],[98.5,14],[98.5,12],[99,9],[99,7],[99,6]],
    lost:[{ring:[[99.5,6.4],[100.3,6],[101,6.2],[101.8,6.8],[102,7.2],[101.5,7.5],[100.8,7.2],[100,6.8],[99.5,6.4]],lbl:'Буфер Британии'}],
    caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок'}], evts:[{lon:100.3,lat:6.8,col:'#E24B4A',lbl:'Уступки Британии'}],
    cause:'Британия завоевала Бирму (1824–26) и вышла к сиамской границе. Рама III выбрал переговоры — первая формальная уступка части малайских земель.',
    terr:'Договор Бёрни: Сиам признаёт британское влияние над частью малайских территорий в обмен на гарантии суверенитета.',
    fwd:'"Дипломатия бамбука" — гнуться, не ломаясь. Сиам остался единственной независимой страной ЮВА. Таиланд-2026 балансирует США vs Китай тем же методом.',
    inv:'Страны-балансировщики между великими державами привлекают FDI от обоих лагерей. Таиланд 2026: и от США (EV-производство), и от Китая (туризм, инфраструктура).',
    invT:'Паттерн: нейтральный хаб', invS:'n' },

  { year:1855, label:'Договор Боуринга', dynasty:'Чакри IV (Рама IV)', period:'1855–1893',
    pct:80, km:'~640 000', chg:'торговый бум', dir:'g',
    siam:[[99,5.5],[100.3,5],[101.5,5.5],[102.5,6.5],[102.5,8.5],[103,11],[103.5,13.5],[104,16],[104.5,18.5],[104.5,20.5],[104,21.5],[103,21.5],[102,21],[101,20],[100,19],[99,18],[98.5,16.5],[98.5,15],[98.5,13],[99,10],[99,7],[99,5.5]],
    lost:[], caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок'}],
    evts:[{lon:103,lat:15.5,col:'#185FA5',lbl:'Договор Боуринга'},{lon:100.5,lat:16,col:'#2a7a4a',lbl:'Рисовый экспорт ×7'}],
    cause:'Рама IV подписал Договор Боуринга с Британией: свободная торговля, пошлины 3%. Прагматичный выбор — открыться, чтобы выжить.',
    terr:'Нет территориальных потерь, но потеряна экономическая суверенность. Рисовый экспорт за 40 лет вырастет в 7×. Монокультурная зависимость закрепляется.',
    fwd:'Монокультурная логика: рис→каучук→туризм→электроника. Каждый раз та же концентрация, та же уязвимость. Туризм = 20% ВВП сегодня.',
    inv:'Либерализация → commodity boom → земля и логистика растут. Аналог: EV-производство, цифровые хабы, новые SEZ. Следи за отраслями с долей >5% ВВП.',
    invT:'Паттерн: торговое открытие', invS:'g' },

  { year:1893, label:'Кризис Пакнама — утрата Лаоса', dynasty:'Чакри V (Рама V)', period:'1893',
    pct:62, km:'~495 000', chg:'−18%', dir:'l',
    siam:[[99,5.5],[100.3,5],[101.5,5.5],[102.5,6.5],[102.5,8.5],[103,11],[103.5,13.5],[103.5,15.5],[103,17],[102.5,19],[102,21],[101,20.5],[100,19.5],[99,18.5],[98.5,17],[98.5,15.5],[98.5,13.5],[99,11],[99,7.5],[99,5.5]],
    lost:[{ring:LOST_LAOS,lbl:'Лаос → Франции 1893'}],
    caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок'}],
    evts:[{lon:103.5,lat:18,col:'#E24B4A',lbl:'Лаос → Французский Индокитай'},{lon:100.5,lat:14.2,col:'#E24B4A',lbl:'Канонерки у Бангкока'}],
    cause:'Французские канонерки вошли в Чао Прайя и встали у дворца. Ультиматум: 48 часов — отдать все земли к востоку от Меконга. Британия отказалась помочь.',
    terr:'Весь левый берег Меконга — Лаос (~143 000 км²) — передан Французскому Индокитаю. Крупнейшая единовременная потеря территории в истории Сиама.',
    fwd:'Геополитическое принуждение малых стран не изменилось — сегодня вместо канонерок санкции. Буферный статус Таиланда спас независимость тогда и защищает сейчас.',
    inv:'Внешнее принуждение → краткосрочное обесценение. Сиам выжил и продолжил расти. Геополитические риски Таиланда 2026 управляемы — страна нужна обеим сторонам.',
    invT:'Паттерн: геополитический шок', invS:'l' },

  { year:1907, label:'Уступка Камбоджи', dynasty:'Чакри V → VI', period:'1907',
    pct:56, km:'~450 000', chg:'−6%', dir:'l',
    siam:[[99,5.5],[100.3,5],[101.5,5.5],[102.5,6.5],[102.5,8.5],[103,11],[103.5,13.5],[103.5,15.5],[103,17],[102.5,19],[102,21],[101,20.5],[100,19.5],[99,18.5],[98.5,17],[98.5,15.5],[98.5,13.5],[99,11],[99,7.5],[99,5.5]],
    lost:[{ring:LOST_LAOS,lbl:'Лаос (1893)'},{ring:LOST_CAMB,lbl:'Баттамбанг, Ангкор → Франции 1907'}],
    caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок'}],
    evts:[{lon:103.5,lat:12.5,col:'#E24B4A',lbl:'Баттамбанг, Ангкор → Франции'}],
    cause:'Франция потребовала провинции Баттамбанг, Сисофон и Сиемреап (Ангкор Ват). Сиам согласился — выбора не было.',
    terr:'~50 000 км² северо-западной Камбоджи передано Французскому Индокитаю. Ангкор Ват ушёл в состав французских колоний на 40 лет.',
    fwd:'Камбоджа сегодня — конкурент за туристов (Ангкор vs Пхукет). Граничные споры периодически возобновляются. Приграничные зоны — повышенный политический риск.',
    inv:'Приграничные районы с Камбоджей и Лаосом нестабильны. Для недвижимости — фокус на Бангкоке, Пхукете, Самуи. Восток страны — повышенный исторический риск.',
    invT:'Паттерн: пограничные риски', invS:'l' },

  { year:1909, label:'Уступка Малайи — совр. граница', dynasty:'Чакри V → VI', period:'1909',
    pct:53, km:'~513 000', chg:'−3%', dir:'l',
    siam:MODERN,
    lost:[{ring:LOST_LAOS,lbl:'Лаос'},{ring:LOST_CAMB,lbl:'Камбоджа'},{ring:LOST_MALAY,lbl:'4 султаната → Британии 1909'}],
    caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок'}],
    evts:[{lon:100.5,lat:6.8,col:'#E24B4A',lbl:'4 султаната → Британской Малайе'}],
    cause:'Договор Бэнгкока 1909: Сиам передал Британии четыре малайских султаната (Кедах, Келантан, Тренгану, Перлис) в обмен на кредит и признание суверенитета.',
    terr:'~50 000 км² малайских территорий перешли к Британской Малайе. Государство достигло современных границ. Буферный статус между двумя империями сохранил независимость.',
    fwd:'Южные провинции (Паттани, Яла, Наратхиват) — зона сепаратистского конфликта до 2026. 115-летняя проблема, коренящаяся в 1909 году.',
    inv:'Три южные провинции с 1909 — зона высокого риска. Пхукет и Краби — исключение: вне конфликтной зоны и безопасны для инвестиций.',
    invT:'Паттерн: юг Таиланда — исторический риск', invS:'l' },

  { year:1932, label:'Конституционный переворот', dynasty:'Чакри VII → народное прав.', period:'1932–1960',
    pct:54, km:'~513 000', chg:'граница зафиксирована', dir:'n',
    siam:MODERN,
    lost:[{ring:LOST_LAOS,lbl:'Лаос'},{ring:LOST_CAMB,lbl:'Камбоджа'},{ring:LOST_MALAY,lbl:'Малайя'}],
    caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок'}],
    evts:[{lon:101,lat:16.5,col:'#E24B4A',lbl:'Переворот 1932'}],
    cause:'1932: военные офицеры свергли абсолютную монархию. Конституция принята за один день. Начало 94-летнего цикла военно-гражданского маятника.',
    terr:'Границы зафиксированы в современном виде. В 1941 при японской поддержке Таиланд временно вернул части Лаоса и Камбоджи — отдал обратно в 1946. Современные границы окончательны.',
    fwd:'12 военных переворотов за 94 года. Каждый: просадка SET 15–30%, восстановление 9–18 мес. Покупать в первые 3 месяца после переворота — исторически выгодно.',
    inv:'Каждый переворот: просадка SET 15–30%, восстановление 9–18 мес. Следующий политический кризис = возможность.',
    invT:'Паттерн: военный цикл = инвест-возможность', invS:'n' },

  { year:1997, label:'Азиатский финансовый кризис', dynasty:'Чакри IX (Рама IX)', period:'1997–2000',
    pct:54, km:'~513 000', chg:'бат −60%', dir:'l',
    siam:MODERN,
    lost:[{ring:LOST_LAOS,lbl:'Лаос'},{ring:LOST_CAMB,lbl:'Камбоджа'},{ring:LOST_MALAY,lbl:'Малайя'}],
    caps:[{lon:100.5,lat:13.75,col:'#E24B4A',main:true,lbl:'Бангкок — эпицентр'}],
    evts:[{lon:98.4,lat:7.9,col:'#E24B4A',lbl:'Пхукет: недвижимость −50%'}],
    cause:'2 июля 1997: Банк Таиланда исчерпал резервы и отпустил курс бата. Трёхлетний пузырь в недвижимости лопнул. USD-долг при батовых доходах = идеальный шторм.',
    terr:'Бат −60% за месяц. ВВП −10.8%, безработица ×3, недвижимость −40–60%. МВФ кредит $17.2 млрд. Долг домохозяйств вырос с 52% до 88% ВВП к 2026.',
    fwd:'Долг домохозяйств 88% ВВП в 2026 — прямое структурное эхо реформ 1997. Триггер повтора: CDS-спреды >200 bp или долг >90% ВВП.',
    inv:'Недвижимость в USD (лизхолд) защищает от девальвации бата. Мониторинг: CDS-спреды >200 bp = время хеджировать THB-позиции.',
    invT:'Паттерн: защита от девальвации', invS:'l' },

  { year:2014, label:'Переворот — политический цикл', dynasty:'Чакри IX → X', period:'2006–2019',
    pct:54, km:'~513 000', chg:'2-й за 8 лет', dir:'n',
    siam:MODERN,
    lost:[{ring:LOST_LAOS,lbl:'Лаос'},{ring:LOST_CAMB,lbl:'Камбоджа'},{ring:LOST_MALAY,lbl:'Малайя'}],
    caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок'}],
    evts:[{lon:98.4,lat:7.9,col:'#2a7a4a',lbl:'Пхукет: туристов +200%'},{lon:101,lat:16,col:'#E24B4A',lbl:'Переворот 2014'}],
    cause:'Годы противостояния "красных" и "жёлтых рубашек". Май 2014: военное положение. Конституция 2017 закрепила роль армии.',
    terr:'Территориальных потерь нет. SET восстановился за 14 месяцев. Туристов с 15 млн (2006) до 40 млн (2019) — несмотря на переворот. Политическая нестабильность ≠ инвест-риск.',
    fwd:'Реформа прав собственности для иностранцев — главный инвест-триггер 2026–2027. Без неё FDI-бум невозможен.',
    inv:'Политическая нестабильность не останавливала экономику. После 2014 переворота: SET +40% за 18 месяцев. Просадки = возможность.',
    invT:'Паттерн: политический риск ≠ инвест-риск', invS:'n' },

  { year:2026, label:'Делеверидж — сейчас', dynasty:'Чакри X (Рама X)', period:'2026+',
    pct:54, km:'~513 000', chg:'CHI 56/100', dir:'n',
    siam:MODERN,
    lost:[{ring:LOST_LAOS,lbl:'Лаос'},{ring:LOST_CAMB,lbl:'Камбоджа'},{ring:LOST_MALAY,lbl:'Малайя'}],
    caps:[{lon:100.5,lat:13.75,main:true,lbl:'Бангкок (12 млн)'}],
    evts:[{lon:98.4,lat:7.9,col:'#2a7a4a',lbl:'Пхукет — инвест-хаб'},{lon:100.9,lat:12.9,col:'#2a7a4a',lbl:'Паттайя — EV'}],
    cause:'Таиланд 2026 несёт все паттерны 326 лет: нейтралитет, Chinese-Thai капитал (60%+ SET), монокультурная логика (туризм = новый рис), военный цикл.',
    terr:'Граница стабильна с 1946. Рост 1.6%, долг 88%, дефляция −0.2%. Структурно идентично 1985–87 — перед FDI-бумом или долговым кризисом.',
    fwd:'60% — FDI-бум при реформе прав собственности. 25% — долговой кризис как 1997. 15% — стагфляция. Окно решения: 2026–2028.',
    inv:'Базовый (60%): Пхукет/Паттайя + ожидание реформ прав собственности. Хедж (25%): активы в USD, мониторинг CDS. Риск (15%): хеджируй THB.',
    invT:'Инвест-вывод 2026 — исторический синтез', invS:'n' },
]

// ─── Pure React SVG Map — no D3, no external deps ─────────────────────────
function HistoricalMap({ period }) {
  const W = 660, H = 430

  const path = (ring) => ringToPath(ring, W, H)

  const labelPos = (lon, lat) => {
    const [x, y] = mercator(lon, lat, W, H)
    return { x, y }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width:'100%', display:'block', borderRadius:12, background:'#b8d4e8' }}
    >
      {/* Ocean */}
      <rect width={W} height={H} fill="#b8d4e8" />

      {/* Neighbour countries */}
      {Object.entries(GEO).map(([key, ring]) => (
        <path key={key} d={path(ring)} fill="#c8d8b0" stroke="#a0b888" strokeWidth={0.6} />
      ))}

      {/* Country labels */}
      {[
        [96.5,20,'Мьянма'],[103,19,'Лаос'],[107.5,16,'Вьетнам'],
        [104.5,12.2,'Камбоджа'],[101.5,4,'Малайзия'],[107,23,'Китай'],
      ].map(([lo,la,name]) => {
        const p = labelPos(lo,la)
        return <text key={name} x={p.x} y={p.y} textAnchor="middle" fontSize={10} fontFamily="Georgia,serif" fill="#4a5a3a" pointerEvents="none">{name}</text>
      })}

      {/* Water labels */}
      {[[97,10,'Андаманское море'],[103.5,9,'Сиамский залив']].map(([lo,la,name]) => {
        const p = labelPos(lo,la)
        return <text key={name} x={p.x} y={p.y} textAnchor="middle" fontSize={9} fontStyle="italic" fontFamily="Georgia,serif" fill="#5a7a98" pointerEvents="none">{name}</text>
      })}

      {/* Modern border reference (dashed purple) */}
      <path d={path(MODERN)} fill="none" stroke="#534AB7" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.5} />

      {/* Lost territories */}
      {(period.lost || []).map((lt, i) => (
        <path key={i} d={path(lt.ring)} fill="#E24B4A" fillOpacity={0.42} stroke="#E24B4A" strokeWidth={0.9} strokeDasharray="4 2" strokeOpacity={0.7} />
      ))}

      {/* Siam territory */}
      <path d={path(period.siam)} fill="#e8a060" fillOpacity={0.82} stroke="#b8702a" strokeWidth={2} strokeLinejoin="round" />

      {/* Capitals */}
      {(period.caps || []).map((ev, i) => {
        const p = labelPos(ev.lon, ev.lat)
        const col = ev.col || '#1a3a6a'
        const r = ev.main ? 6.5 : 4.5
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={r} fill={col} stroke="white" strokeWidth={1.5} />
            {ev.main && <text x={p.x} y={p.y+3.5} textAnchor="middle" fill="white" fontSize={8}>★</text>}
            <text x={p.x+r+4} y={p.y+4} fill="#1a1612" fontSize={9.5} fontFamily="-apple-system,sans-serif" stroke="white" strokeWidth={2.5} paintOrder="stroke">{ev.lbl}</text>
          </g>
        )
      })}

      {/* Events */}
      {(period.evts || []).map((ev, i) => {
        const p = labelPos(ev.lon, ev.lat)
        const col = ev.col || '#2a7a4a'
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4.5} fill={col} stroke="white" strokeWidth={1.5} />
            <text x={p.x+8} y={p.y+4} fill="#1a1612" fontSize={9.5} fontFamily="-apple-system,sans-serif" stroke="white" strokeWidth={2.5} paintOrder="stroke">{ev.lbl}</text>
          </g>
        )
      })}

      {/* Legend */}
      <rect x={W-155} y={8} width={147} height={68} rx={6} fill="white" fillOpacity={0.9} />
      <rect x={W-147} y={16} width={10} height={8} rx={1.5} fill="#e8a060" fillOpacity={0.8} stroke="#b8702a" strokeWidth={0.5} />
      <text x={W-133} y={24} fill="#333" fontSize={9.5} fontFamily="-apple-system,sans-serif">Территория Сиама</text>
      <line x1={W-147} y1={32} x2={W-137} y2={32} stroke="#534AB7" strokeWidth={1.2} strokeDasharray="3 2" />
      <text x={W-133} y={37} fill="#333" fontSize={9.5} fontFamily="-apple-system,sans-serif">Совр. граница</text>
      <rect x={W-147} y={42} width={10} height={8} rx={1.5} fill="#E24B4A" fillOpacity={0.42} stroke="#E24B4A" strokeWidth={0.5} />
      <text x={W-133} y={50} fill="#333" fontSize={9.5} fontFamily="-apple-system,sans-serif">Утраченные земли</text>
      <circle cx={W-142} cy={62} r={4} fill="#1a3a6a" stroke="white" strokeWidth={1} />
      <text x={W-133} y={66} fill="#333" fontSize={9.5} fontFamily="-apple-system,sans-serif">Столица</text>

      {/* Corner label */}
      <rect x={6} y={8} width={175} height={38} rx={6} fill="white" fillOpacity={0.9} />
      <text x={13} y={24} fill="#1a1612" fontSize={12} fontWeight={600} fontFamily="Georgia,serif">{period.year} — {period.label}</text>
      <text x={13} y={38} fill="#6a6460" fontSize={9.5} fontFamily="monospace">{period.km} км²</text>
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function CountryHistoryPage() {
  const params = useParams()
  const [idx, setIdx] = useState(0)

  const country = getCountry(params.slug)

  if (!country) {
    return (
      <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:'monospace', fontSize:14, color:T.muted }}>Страна не найдена</span>
      </div>
    )
  }

  const isThailand = params.slug === 'thailand'
  const p = PERIODS[idx]
  const sig = SIG[p.dir]
  const dc = p.dir==='l' ? T.loss : p.dir==='g' ? T.gain : T.neut
  const invSig = SIG[p.invS]

  return (
    <div style={{ minHeight:'100vh', background:T.bg }}>
      <Navbar />

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1024, margin:'0 auto', padding:'24px 24px 0' }}>

          {/* Breadcrumbs */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, fontFamily:'monospace', fontSize:10, color:'#9a948e' }}>
            <Link href="/" style={{ color:'#9a948e', textDecoration:'none' }}>MacroView</Link>
            <span>›</span>
            <Link href={`/country/${params.slug}`} style={{ color:'#9a948e', textDecoration:'none' }}>{country.name}</Link>
            <span>›</span>
            <span style={{ color:T.text, fontWeight:600 }}>История 1700–2026</span>
          </div>

          {/* Title row */}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
            <span style={{ fontSize:36 }}>{country.flag}</span>
            <div>
              <h1 style={{ fontFamily:'Georgia, serif', fontSize:24, fontWeight:900, color:T.text, margin:'0 0 4px' }}>
                {country.name} — История
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontFamily:'monospace', fontSize:12, color:T.muted }}>{country.region}</span>
                <SignalBadge signal={country.chi.signal} index={country.chi.index} size="sm" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${T.border}`, overflowX:'auto' }}>
            {[
              { href:`/country/${params.slug}`,              label:'📡 Индикатор', active:false },
              { href:`/country/${params.slug}#capital-flow`, label:'💰 Карта капитала', active:false },
              { href:`/country/${params.slug}#macro`,        label:'📊 Макроданные', active:false },
              { href:`/country/${params.slug}/history`,      label:'🗺 История 1700–2026', active:true },
              { href:`/country/${params.slug}/real-estate`,  label:'🏠 Недвижимость', active:false },
            ].map(tab => (
              <Link key={tab.href} href={tab.href} style={{
                fontFamily:'monospace', fontSize:11, padding:'10px 16px',
                borderBottom: tab.active ? `2px solid ${T.accent}` : '2px solid transparent',
                color: tab.active ? T.accent : T.muted,
                textDecoration:'none', whiteSpace:'nowrap',
                fontWeight: tab.active ? 700 : 400,
              }}>{tab.label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1024, margin:'0 auto', padding:'24px 24px 48px' }}>

        {!isThailand ? (
          <div style={{ textAlign:'center', padding:'60px 24px', color:T.muted, fontFamily:'monospace', fontSize:14 }}>
            Исторические данные для {country.name} в разработке
          </div>
        ) : (
          <>
            {/* Year pills */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
              {PERIODS.map((pp, i) => (
                <button key={pp.year} onClick={() => setIdx(i)} style={{
                  display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20,
                  border: i===idx ? `1.5px solid ${T.accent}` : `1px solid ${T.border}`,
                  background: i===idx ? T.accent : T.card,
                  color: i===idx ? '#fff' : T.sub,
                  fontFamily:'monospace', fontSize:11, cursor:'pointer', transition:'all .15s',
                }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', flexShrink:0, background: i===idx ? 'rgba(255,255,255,.7)' : SIG[pp.dir].color }} />
                  {pp.year}
                </button>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:20, alignItems:'start' }}>

              {/* Left: Map */}
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <HistoricalMap period={p} />

                {/* Area bar */}
                <div style={{ padding:'10px 14px', background:T.card, border:`1px solid ${T.border}`, borderRadius:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontFamily:'monospace', fontSize:10, color:T.muted }}>Территория от пика (~800 тыс. км²)</span>
                    <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:dc }}>{p.pct}%</span>
                  </div>
                  <div style={{ background:T.border, borderRadius:4, height:9, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${p.pct}%`, background:dc, borderRadius:4, transition:'width .5s,background .3s' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontFamily:'monospace', fontSize:10, color:T.sub }}>{p.km} км²</span>
                    {p.chg && <span style={{ fontFamily:'monospace', fontSize:10, fontWeight:700, color:dc }}>{p.chg}</span>}
                  </div>
                </div>

                {/* Slider */}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <button onClick={() => setIdx(i => Math.max(0,i-1))} disabled={idx===0}
                    style={{ width:32, height:32, borderRadius:8, border:`1px solid ${T.border}`, background:T.card, cursor:idx===0?'not-allowed':'pointer', color:idx===0?T.muted:T.text, fontSize:16 }}>←</button>
                  <input type="range" min={0} max={PERIODS.length-1} value={idx} step={1}
                    onChange={e => setIdx(+e.target.value)} style={{ flex:1 }} />
                  <button onClick={() => setIdx(i => Math.min(PERIODS.length-1,i+1))} disabled={idx===PERIODS.length-1}
                    style={{ width:32, height:32, borderRadius:8, border:`1px solid ${T.border}`, background:T.card, cursor:idx===PERIODS.length-1?'not-allowed':'pointer', color:idx===PERIODS.length-1?T.muted:T.text, fontSize:16 }}>→</button>
                </div>
                <p style={{ fontFamily:'monospace', fontSize:10, color:T.muted, textAlign:'center', margin:0 }}>{idx+1} / {PERIODS.length}</p>
              </div>

              {/* Right: Analysis */}
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                {/* Period header */}
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:'16px 20px', borderTop:`3px solid ${sig.color}` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                    <div>
                      <div style={{ fontFamily:'monospace', fontSize:10, color:T.muted, marginBottom:4 }}>{p.period} · {p.dynasty}</div>
                      <h2 style={{ fontFamily:'Georgia,serif', fontSize:20, fontWeight:900, color:T.text, margin:0 }}>{p.label}</h2>
                    </div>
                    <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:700, padding:'4px 12px', borderRadius:6, background:sig.bg, color:sig.color, flexShrink:0 }}>{sig.label}</span>
                  </div>
                </div>

                {/* KPIs */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {[
                    { l:'Период', v:p.period, s:p.dynasty },
                    { l:'Изменение', v:p.chg||'—', s:sig.label, c:sig.color },
                    { l:'Инвест-сигнал', v:invSig.label, s:p.invT, c:invSig.color },
                  ].map(k => (
                    <div key={k.l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 12px' }}>
                      <div style={{ fontFamily:'monospace', fontSize:10, color:T.muted, marginBottom:3 }}>{k.l}</div>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:14, fontWeight:700, color:k.c||T.text, lineHeight:1.2 }}>{k.v}</div>
                      <div style={{ fontFamily:'monospace', fontSize:10, color:T.sub, marginTop:2 }}>{k.s}</div>
                    </div>
                  ))}
                </div>

                {/* Causal chain */}
                <div style={{ border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden' }}>
                  {[
                    { tag:'причина',    bg:'#f5edda', col:'#b08c3a', txt:p.cause },
                    { tag:'территория', bg:'#f5e8df', col:'#c8622a', txt:p.terr },
                    { tag:'→ 2026',     bg:'#eeedfe', col:'#534AB7', txt:p.fwd, shade:true },
                  ].map((r, i, arr) => (
                    <div key={i} style={{ display:'flex', gap:10, padding:'9px 14px', borderBottom:i<arr.length-1?`1px solid ${T.border}`:'none', background:r.shade?T.bg:T.card }}>
                      <span style={{ fontSize:10, fontFamily:'monospace', fontWeight:600, padding:'2px 8px', borderRadius:10, whiteSpace:'nowrap', flexShrink:0, marginTop:1, background:r.bg, color:r.col }}>{r.tag}</span>
                      <p style={{ fontSize:13, color:T.sub, lineHeight:1.6, margin:0 }}>{r.txt}</p>
                    </div>
                  ))}
                </div>

                {/* Invest block */}
                <div style={{ padding:'12px 16px', borderRadius:10, background:invSig.bg, border:`1px solid ${invSig.border}` }}>
                  <p style={{ fontSize:12, fontWeight:700, color:invSig.color, marginBottom:4 }}>{p.invT}</p>
                  <p style={{ fontSize:13, color:T.sub, lineHeight:1.65, margin:0 }}>{p.inv}</p>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
