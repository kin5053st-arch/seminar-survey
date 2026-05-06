// =====================================================
// セミナーアンケート GAS Web App (サプライチェーン版)
// =====================================================
// 送信先: https://docs.google.com/spreadsheets/d/1MWEoV-y-LuTD4rIT--XFsqQ1OlhXLsYflc8QzoeW8Zo/
// 対象シート: gid=1307953343
//
// デプロイ手順:
// 1. https://script.google.com/ で新規プロジェクト作成
// 2. このコード全体を貼り付けて保存
// 3. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
// 4. 実行ユーザー「自分」/ アクセスできるユーザー「全員」
// 5. デプロイ後に発行された URL を public/index.html の GAS_URL に貼り付け
// =====================================================

const SPREADSHEET_ID = '1MWEoV-y-LuTD4rIT--XFsqQ1OlhXLsYflc8QzoeW8Zo';
const TARGET_SHEET_GID = 1307953343;

// 列順（変更時は public/index.html の collectFormData() と必ず揃える）
const COLUMNS = [
  'タイムスタンプ',
  '会社名・団体名',
  'お名前',
  '業種・業界',
  '役職・お立場',
  '参加理由',
  '参加理由（その他）',
  '満足度（5段階）',
  '参考になったこと',
  'もっと詳しく知りたいこと',
  '関心のある戦略',
  '9項目診断_チェック済み項目',
  '9項目診断_スコア（/9）',
  'お困りの点・課題',
  'ご意見・ご要望'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // gid 一致シートを優先、なければ先頭シートにフォールバック
    let sheet = ss.getSheets().find(function (s) {
      return s.getSheetId() === TARGET_SHEET_GID;
    });
    if (!sheet) sheet = ss.getSheets()[0];

    // 1行目が空ならヘッダ行を自動投入
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
    }

    // 9項目診断スコア計算
    const checkedItems = data.diagnosis || '';
    const score = checkedItems
      ? checkedItems.split('、').filter(function (v) { return v.length > 0; }).length
      : 0;

    sheet.appendRow([
      new Date(),
      data.company || '',
      data.name || '',
      data.industry || '',
      data.position || '',
      data.reason || '',
      data.reason_other || '',
      data.satisfaction || '',
      data.helpful || '',
      data.want_to_know || '',
      data.strategy_interest || '',
      checkedItems,
      score,
      data.challenge_detail || '',
      data.feedback || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Seminar Survey GAS endpoint OK');
}

// テスト送信用 (Apps Script エディタから直接実行できる)
function testAppendRow() {
  const dummy = {
    postData: {
      contents: JSON.stringify({
        company: 'テスト株式会社',
        name: 'テスト 太郎',
        industry: '製造業',
        position: '部長・マネージャー',
        reason: 'サプライチェーン対策評価制度について知りたかった、業務の標準化・DX化を進めたい',
        reason_other: '',
        satisfaction: '5',
        helpful: 'テスト：業務フロー標準化の事例が参考になった',
        want_to_know: 'テスト：戦略Bのスモールスタートを詳しく',
        strategy_interest: '戦略B: 標準化と効率化（DXによる見える化）',
        diagnosis: '主要仕入れ先が一社に集中していない、代替サプライヤーを2〜3社リストアップしている',
        challenge_detail: 'テスト：BCP策定がこれから',
        feedback: 'テスト送信です'
      })
    }
  };
  const result = doPost(dummy);
  Logger.log(result.getContent());
}
