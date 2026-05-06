// =====================================================
// セミナーアンケート GAS Web App (サプライチェーン版)
// =====================================================
// 送信先 Spreadsheet: https://docs.google.com/spreadsheets/d/1MWEoV-y-LuTD4rIT--XFsqQ1OlhXLsYflc8QzoeW8Zo/
// 対象シート: TARGET_SHEET_NAME (存在しなければ自動作成)
//
// デプロイ手順 (新規):
// 1. https://script.google.com/ で新規プロジェクト作成
// 2. このコード全体を貼り付けて保存
// 3. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
// 4. 実行ユーザー「自分」/ アクセスできるユーザー「全員」
// 5. 発行された URL を public/index.html の GAS_URL に貼り付け
//
// 既存デプロイの更新手順:
// 1. このコードを貼り直して保存
// 2. 「デプロイ」→「デプロイを管理」→ 既存の鉛筆アイコン
// 3. バージョン: 「新バージョン」→「デプロイ」 (URLは変わらない)
// =====================================================

const SPREADSHEET_ID = '1MWEoV-y-LuTD4rIT--XFsqQ1OlhXLsYflc8QzoeW8Zo';
const TARGET_SHEET_NAME = 'サプライチェーンアンケート回答';

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
  'お困りの点・課題',
  'ご意見・ご要望'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 専用シートを名前で取得。無ければ自動作成してヘッダ行を投入
    let sheet = ss.getSheetByName(TARGET_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(TARGET_SHEET_NAME);
      initSheetHeader(sheet);
    } else if (sheet.getLastRow() === 0) {
      initSheetHeader(sheet);
    }

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

function initSheetHeader(sheet) {
  sheet.appendRow(COLUMNS);
  const headerRange = sheet.getRange(1, 1, 1, COLUMNS.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#eaf2f8');
  sheet.setFrozenRows(1);
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
        challenge_detail: 'テスト：BCP策定がこれから',
        feedback: 'テスト送信です'
      })
    }
  };
  const result = doPost(dummy);
  Logger.log(result.getContent());
}
