export async function onRequestGet(context) {
  try {
    // Cloudflare管理画面で設定した "TODO_KV" という変数でKVにアクセス
    const value = await context.env.TODO_KV.get("user_todos");
    const data = value ? value : "[]";
    
    return new Response(data, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const todos = await context.request.text();
    // KVにデータを保存
    await context.env.TODO_KV.put("user_todos", todos);
    return new Response("Saved", { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
