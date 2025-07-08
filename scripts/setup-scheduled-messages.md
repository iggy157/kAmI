# スケジュールされた神様メッセージの設定

このシステムは、指定された時間に神様から信者へ自動的にメッセージを送信する機能です。

## 設定時間

以下の時間に自動メッセージが送信されます：
- 09:00 (朝の挨拶)
- 12:00 (昼の励まし)
- 15:00 (午後の応援)
- 18:00 (夕方の労い)
- 21:00 (夜の平安)

## 環境変数の設定

`.env.local` ファイルに以下を追加してください：

```
SCHEDULED_API_KEY=your-very-secure-secret-key-here
```

## Cron ジョブの設定例

### Linux/macOS の場合

```bash
# crontab を編集
crontab -e

# 以下の行を追加 (各スケジュール時間に実行)
0 9 * * * curl -X POST -H "Authorization: Bearer your-very-secure-secret-key-here" http://localhost:3000/api/scheduled-messages
0 12 * * * curl -X POST -H "Authorization: Bearer your-very-secure-secret-key-here" http://localhost:3000/api/scheduled-messages
0 15 * * * curl -X POST -H "Authorization: Bearer your-very-secure-secret-key-here" http://localhost:3000/api/scheduled-messages
0 18 * * * curl -X POST -H "Authorization: Bearer your-very-secure-secret-key-here" http://localhost:3000/api/scheduled-messages
0 21 * * * curl -X POST -H "Authorization: Bearer your-very-secure-secret-key-here" http://localhost:3000/api/scheduled-messages
```

### Vercel でのデプロイの場合

Vercel Cron Jobs を使用：

`vercel.json` ファイルを作成：

```json
{
  "crons": [
    {
      "path": "/api/scheduled-messages",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/scheduled-messages", 
      "schedule": "0 12 * * *"
    },
    {
      "path": "/api/scheduled-messages",
      "schedule": "0 15 * * *"
    },
    {
      "path": "/api/scheduled-messages",
      "schedule": "0 18 * * *"
    },
    {
      "path": "/api/scheduled-messages",
      "schedule": "0 21 * * *"
    }
  ]
}
```

### GitHub Actions の場合

`.github/workflows/scheduled-messages.yml` ファイルを作成：

```yaml
name: Scheduled God Messages

on:
  schedule:
    - cron: '0 0 * * *'  # 09:00 JST (00:00 UTC)
    - cron: '0 3 * * *'  # 12:00 JST (03:00 UTC)
    - cron: '0 6 * * *'  # 15:00 JST (06:00 UTC)
    - cron: '0 9 * * *'  # 18:00 JST (09:00 UTC)
    - cron: '0 12 * * *' # 21:00 JST (12:00 UTC)

jobs:
  send-scheduled-messages:
    runs-on: ubuntu-latest
    steps:
      - name: Send scheduled message
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SCHEDULED_API_KEY }}" \
            https://your-domain.com/api/scheduled-messages
```

## 動作確認

スケジュールされたメッセージが正常に動作しているかを確認するには：

```bash
# 手動でAPIを呼び出してテスト
curl -X POST \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/scheduled-messages
```

## 注意事項

1. **タイムゾーン**: システムは JST (日本標準時) を基準としています
2. **信者のみ**: メッセージは神様の信者にのみ送信されます
3. **API キー**: プロダクション環境では必ず安全なAPIキーを使用してください
4. **レート制限**: 大量のユーザーがいる場合は、適切なレート制限を実装してください

## データベースの確認

送信されたメッセージは `messages` テーブルに保存され、`message_type` が `'scheduled'` として記録されます。

```sql
-- スケジュールされたメッセージを確認
SELECT m.*, g.name as god_name, u.username 
FROM messages m
JOIN gods g ON m.god_id = g.id  
JOIN users u ON m.user_id = u.id
WHERE m.message_type = 'scheduled'
ORDER BY m.created_at DESC;
```