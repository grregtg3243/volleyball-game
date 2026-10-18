# 女子バレー物語 ― 構成説明（外部SE向け）

## 1. ファイル一覧（全部で6つのコード + 補助）
- index.html …… 画面の「入れ物」だけ。ロジックは持たない。最後に3つのJSを順に読み込む。
- css/style.css …… 見た目のすべて。色は先頭の :root 変数で一括変更。
- js/data.js …… 【数値とデータ】部員・実績・称号・数値設定・BGMパス。
- js/novels.js …… 【ノベルの台本すべて】あらすじ、食事/相談/遊び/部屋、会話イベント、恋愛・卒業・ハーレムの各シーン、来訪者、アプローチ台詞。文章を増やすときはここだけ触る。
- js/engine.js …… 【共通部品】①セーブ(Cfg/Save) ②音とBGM(Snd/Bgm) ③立ち絵(art関数) ④ノベル再生(Novel)。ルールは持たない。
- js/game.js …… 【ゲーム本体】状態S・ルール・画面描画・ボタン操作。
- sw.js / manifest.webmanifest / icons/icon.svg …… アプリ化(PWA)用。ゲームロジックとは無関係。
- audio/ …… BGMファイル置き場（現在は空）。
- img/ …… 女子の立ち絵置き場。ID連動（0001.jpg など。後述）。

## 2. 読み込み順と依存関係（上が先、下は上を使う）
data.js → novels.js → engine.js → game.js
- engine.js は data.js の BGM を読む（Bgm）。ノベルは art() を使う（同じファイル内）。
- game.js は data.js（CFG, CAST, POOL, ACH, TITLES）、novels.js（INTRO, NOVEL, EXT, SCENES, HAREM, CONV, APPROACH）と engine.js（Cfg, Save, Snd, Bgm, art, Novel）を使う。
- data.js と engine.js は game.js を知らない（逆向きの依存なし）。

## 3. 1回の操作で何が起きるか（流れ）
ボタンをクリック → index.html の onclick が game.js の関数を呼ぶ（例 coach(), endWeek()）
→ 状態 S（部員M・卒業生A・年y・月w・行動力ap・実績ach・フラグfl）を書き換える
→ after() が ①恋愛イベント ②ハーレムイベント判定（SCENES→Novel.play） ③実績判定 ④Save.write で自動保存 → draw() で再描画。
- 画面の描画は draw() の1か所だけ。HTMLのidに文字を流し込む方式。
- 月送りは endWeek()：ランダムイベント→アプローチ(approach)→嫉妬(jealous)→大会(4か月ごと)→会話イベント(monthlyTalks)→年度末なら graduate()→卒業シーン→banner()（○年目○か月目）→after()。
- 効果音は Snd.play("名前")。全ボタンのクリック音は engine.js 内の1つのリスナーが担当。

## 4. 状態Sの中身（保存される単位。localStorageのキー joshiVolley.save.v1）
S = { y:年, w:月(1-12), ap:行動力, wins:大会勝利数, weeks:通算月数, cur:表示中の部員番号, M:[部員], A:[卒業生], ach:{実績ID:1}, fl:{イベント済みフラグ}, no:背番号の連番, B:{顧問ステータス app容姿 stm体力 lead指導力 kind包容力 pop人気, name顧問の名前} }
部員 = { id(4桁ID), lover(恋仲済み), n名前, g学年(1-3), pos, hair, eye, style, no, s:{srv,rcv,atk,stm}, mood, love(=愛情), poss(=独占欲), lust(=情欲), ev:[恋愛イベント済み], L:[台詞3つ], img:画像パス }
設定は別キー joshiVolley.cfg（音量・BGM・ミュート）。

## 5. 「これを変えたい」→「触る場所」
- 好感度の上がり方/初期値/イベント閾値/部員上限 → data.js の CFG
- 初期部員の追加・変更 → data.js の CAST（新入部員は game.js の fresh() が POOL から自動生成。好感度は35〜85）
- 立ち絵を画像にする → img/ に「ID.jpg」を置くだけ（例 0001.jpg）。IDは名前の隣に小さく表示。初期8人は 0001〜0008（CAST の並び順）、新入部員は 0009 から連番。画像が無いIDは仮SVGのまま。拡張子は engine.js の Art.ext。個別に別パスを使いたい時だけ部員の img に指定
- BGM追加 → audio/ にファイル置き、data.js の BGM に {main:"audio/xx.mp3", novel:"…"} 。曲の切替は Bgm.play("名前")
- 実績 → data.js の ACH（ok関数で条件を書く）
- 顧問(主人公)の項目・自分磨き → game.js の bossPanel() と TRAIN。人気の効果は bonus()(好感度の上がりやすさ)・apRate()(アプローチ発生率)・fresh()(新入部員の初期好感度)
- アプローチの台詞 → novels.js の APPROACH
- 顧問の名前 → 顧問画面で設定（S.B.name）。台詞中の「先生」は表示時に engine.js の nmz() が「名前+先生」へ置換する。呼び方を変えたい（例「○○さん」）なら nmz() を編集
- 恋仲（上部の「恋仲○人」）→ 愛情の最高段階イベント（CFG.TIER の3つ目＝95）が起きた時に game.js の after() が m.lover=true にする。累計は lovers()
- 毎月の会話イベント → 発生条件は game.js の talkRate()/lustRate()/monthlyTalks()、台本は novels.js の CONV、1か月の最大件数は CFG.TALKMAX
- 部員募集 → game.js の recruit()（成功率は recruitRate()＝顧問の人気）／部員を減らす → removeMember()
- 愛情・独占欲・情欲の増え方 → game.js の gain()（愛情が上がると、60以上で他2つも育つ）と jealous()
- ノベルの台本 → novels.js。書式と使える変数（{name}{sei}{mei}{pos}{boss}）は同ファイル冒頭に記載。
  ・初回あらすじ=INTRO ／ 食事・相談・遊び・部屋=NOVEL.meal/talk/date/room（各配列にシーンを足すとランダム候補が増える）
  ・来訪者=EXT ／ 恋愛イベント・卒業=SCENES ／ ハーレムイベント=HAREM と SCENES.harem
- 個別指導の項目・消費行動力・上昇値・解放条件（遊び=愛情70、部屋=情欲70）→ game.js の ACT と extraBtns()/act()
- 顧問の称号 → data.js の TITLES／来訪者の登場条件 → EXT の pop と game.js の ext()／恋仲が多いほど毎月人気が上がる処理 → game.js endWeek() 内
- 大会の強さ → game.js の endWeek() 内 const o=…
- 見た目 → css/style.css（色は :root）
- 画面構成を変える → index.html（id名は game.js が参照しているので変更時は両方）

## 6. 注意
- ファイルを直接開く(file://)場合、アプリ化(sw.js)は動かない。https か localhost で配信する。
- 画像・BGMを増やしたら sw.js の F 配列に追記するとオフラインでも使える。

## 7. ハーレム・卒業生・季節イベント（編集先）
- 全体指導（旧ミーティング）→ game.js の meet()。好感度70以上の女子が2人以上いると groupEvent() でハーレムイベントが起きる（人数が多いほど確率UP）。毎月の月送りでも30%で判定。
  ・台本 = novels.js の HGROUP（[2]=2人用 / [3]=3人用。話者 "@" "@2" "@3"、変数 {name2} {mei3} など）
  ・条件(70)・確率・上昇値 = game.js の highs() / groupEvent()
- 卒業生に会う → 卒業アルバム画面の各カードの「会う」ボタン（game.js の alumni(i)）。愛情60未満=友人 / 60以上=デート / 90以上=キス（恋仲になる）。台本 = novels.js の NOVEL.alu_low / alu_mid / alu_hi。
  毎月、愛情70以上の卒業生が会いに来ることがある（visit()、台本 NOVEL.alu_visit）。
- キス（現役部員）→ 愛情85以上で「遊びに誘う」を選ぶと60%でキス（恋仲になる）。台本 = NOVEL.kiss、処理 = game.js の act()。
- 季節イベント → 2月バレンタイン・8月夏合宿・12月クリスマス・1月初詣（1か月目=4月）。台本 = novels.js の SEASON（月をキーに追加可）、処理 = game.js の season()。
- 呼び出し順（月送り endWeek）→ 会話イベント → ハーレムイベント → 卒業生の来訪 → 季節イベント → 来訪者 → 卒業シーン → 月替わり演出。

## 8. 超ハーレム・選択肢・修羅場・目標（ゲーム性）
- 超ハーレム（好感度70以上が4人以上）→ groupEvent() が60%で全員に囲まれるイベントにする。台本 = novels.js の HMASS（人数は {num}、集団の話者は "部員たち"）。
- 選択肢つきノベル → 台本の行に ch を持たせる仕組み（engine.js の Novel.pick）。ハーレムイベント後の選択肢 = novels.js の HCHOICE。効果の書き方（fx: all/one/rest/pop、need、min、r）は game.js の applyFx() 付近のコメント参照。
- 修羅場 → 恋仲2人以上＋独占欲70以上の子が詰め寄る。毎月の月送りで判定（顧問の包容力が高いと起きにくい）。台本 = SHURA、選択肢 = SHURA_CHOICE、処理 = game.js の shura()。
- 今月の目標 → data.js の QUESTS（条件 ok と報酬 rew）。達成で人気UP。表示は左のステータス欄、処理 = game.js の questStep()。
- 大会との連動 → 恋仲の部員が出場するとチーム力+10%（game.js の power()）。

## 9. 大勢に恋される・ゲーム性の拡張
- 恋心 → 愛情60以上の女子を「恋心を寄せる女子」と数える（game.js の hearts()）。上部と立ち絵の右上に人数表示。多いほどアプローチが増える（4人ごとに+1回）。
- 告白ラッシュ → 愛情85以上が3人以上＋人気60以上で毎月35%。台本 = novels.js の RUSH、選択肢 = RUSHCHOICE（lover:"all"/"one" で恋仲化）。処理 = game.js の rush()。
- 学園祭ミスターコン → 11月に自動。人気で優勝/準優勝/参加賞。台本 = novels.js の CONTEST、処理 = game.js の contest()。
- 部の「和」 → S.team（初期60）。嫉妬・修羅場・特別扱いで下がり、全体指導・平等な接し方で上がる。チーム力に影響し、25未満だと毎月全員のやる気が下がる。選択肢の fx に team を指定。処理 = tm() / teamCheck()。
- ハートポイントと特技 → 恋愛イベント・キス・大会勝利・目標達成・ハーレムイベントなどで💗が貯まり、顧問画面で特技を習得。定義 = data.js の PERKS、効果の参照 = has("id")（smile/care/charm/stamina/king）。

## 10. 好意の伝達とエンディング
- 恋仲になった後も → 恋仲（愛情70以上）か愛情90以上の女子が、毎月のように「好き」と言ってくる（game.js の affection()）。1人ずつの台本 = novels.js の AFFECT。4人以上いると50%で「囲まれた。全員が一斉に「好き」と言ってきた」の大勢版 = AFFECT_MASS（人数は {num}）。
- エンディング → 顧問画面の「みんなと結ばれる」。条件は恋仲5人以上＆人気70以上（game.js の endingKey()）。個別エンドは作らず、まとめて結ばれる3種（all / harem 7人以上 / supreme 10人以上）= novels.js の ENDING。迎えた後も続きを遊べる。
- 個別の一言 → data.js の CAST の E（恋仲の子が卒業する時の一言、エンディングで恋仲の女子（最大6人）が順に話す一言を兼ねる）。新入部員など E が無い子は novels.js の E_DEFAULT からランダム。

## 11. 施設・ハーレム規模・夏合宿・ライバル
- 部室の施設 → ハートポイントで導入。定義 = data.js の FACILITIES、効果の参照 = game.js の fac("id")（lounge/gym/office/club/bus）。顧問画面に一覧。
- ハーレム規模ランク → 恋仲の累計人数で「恋人持ち→モテモテ→…→伝説の大ハーレム王」。定義 = data.js の HRANKS、表示 = 顧問画面の見出し、昇格時に通知。
- 夏合宿（8月）→ 3夜連続で「今夜は誰と過ごすか」を選ぶ大型イベント。台本 = novels.js の CAMP、処理 = game.js の camp()。選択肢に who を付けると「その子を1人目にして効果を適用」できる（choiceLine）。
- ライバル → 人気55以上で、愛情50〜84の恋仲でない女子に他校の教師が接近。台本 = RIVAL / RIVALCHOICE、処理 = rival()。放置すると愛情が下がる。

## 12. 二周目（引き継ぎ）と冬のイベント
- 二周目 → エンディング後、顧問画面の「二周目を始める」。顧問のステータス・名前・実績・殿堂入り記録は常に引き継ぎ、特典（特技/施設/人気60/ハートポイント+30）を1つ選ぶ。周回するほど女子の初期好感度（+3/周、最大+15）と人気の初期値が上がる。処理 = game.js の newCycle() / startNG()。特典の種類を増やすなら newCycle() の opts と startNG() を編集。
- バレンタイン（2月）→ 愛情60以上の女子全員から本命チョコ（{num}個）→選択肢。台本 = novels.js の VAL / VALCHOICE。
- ホワイトデー（3月）→ お返しの選択肢。台本 = WHITE / WHITECHOICE。
- クリスマスパーティー（12月）→ 全員参加のパーティー＋「聖夜を誰と過ごすか」。台本 = XMAS（party / night / extra）。誰と過ごすかの共通処理 = game.js の nights()。
- 季節イベント（SEASON）は2月・12月だけ大型イベントに置き換え。1月の初詣・8月の夏合宿は従来どおり。
