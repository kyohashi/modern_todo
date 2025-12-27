<template>
  <div class="min-h-screen flex items-center justify-center py-10 px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="bg-indigo-600 p-6 text-center">
        <h1 class="text-3xl font-bold text-white">ToDo List</h1>
        <p class="text-indigo-200 text-sm mt-1">Cloudflare KV Powered</p>
      </div>

      <div class="p-6 border-b border-gray-100">
        <div class="flex flex-col gap-3">
          <input 
            v-model="newTodo" 
            @keyup.enter="addTodo" 
            placeholder="新しいタスクを入力..." 
            class="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <div class="flex gap-2">
            <select v-model="priority" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="高">🔥 高</option>
              <option value="中">☘️ 中</option>
              <option value="低">💤 低</option>
            </select>
            <button 
              @click="addTodo" 
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              追加
            </button>
          </div>
        </div>
      </div>

      <ul class="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
        <li v-if="todos.length === 0" class="p-6 text-center text-gray-400">
          タスクはまだありません
        </li>
        <li 
          v-for="todo in todos" 
          :key="todo.id" 
          class="p-4 flex items-center justify-between hover:bg-gray-50 transition group"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <input 
              type="checkbox" 
              :checked="todo.completed" 
              @change="toggleTodo(todo)" 
              class="w-5 h-5 cursor-pointer accent-indigo-600 rounded" 
            />
            <div class="flex flex-col min-w-0">
              <span 
                class="text-sm font-medium truncate transition-all duration-200"
                :class="{ 'line-through text-gray-400': todo.completed }"
              >
                {{ todo.text }}
              </span>
              <span class="text-xs mt-0.5 inline-flex">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="{
                    'bg-red-100 text-red-600': todo.priority === '高',
                    'bg-green-100 text-green-600': todo.priority === '中',
                    'bg-blue-100 text-blue-600': todo.priority === '低'
                  }"
                >
                  {{ todo.priority }}
                </span>
              </span>
            </div>
          </div>
          <button 
            @click="deleteTodo(todo.id)" 
            class="text-gray-300 hover:text-red-500 transition px-2 py-1 opacity-0 group-hover:opacity-100"
          >
            削除
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const todos = ref([])
const newTodo = ref('')
const priority = ref('中')

// サーバー(KV)からデータを取得
const fetchTodos = async () => {
  try {
    const res = await fetch('/api/todos')
    if (res.ok) {
      todos.value = await res.json() || []
    }
  } catch (e) {
    console.error("Fetch error:", e)
  }
}

// サーバー(KV)へ保存
const saveTodos = async (newTodos) => {
  todos.value = newTodos // 画面を先に更新(楽観的UI)
  try {
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(newTodos)
    })
  } catch (e) {
    console.error("Save error:", e)
  }
}

const addTodo = async () => {
  if (!newTodo.value.trim()) return
  const item = { 
    id: Date.now(), 
    text: newTodo.value, 
    completed: false, 
    priority: priority.value 
  }
  const newTodos = [item, ...todos.value] // 新しいものを上に
  await saveTodos(newTodos)
  newTodo.value = ''
}

const toggleTodo = async (todo) => {
  const newTodos = todos.value.map(t => 
    t.id === todo.id ? { ...t, completed: !t.completed } : t
  )
  await saveTodos(newTodos)
}

const deleteTodo = async (id) => {
  const newTodos = todos.value.filter(t => t.id !== id)
  await saveTodos(newTodos)
}

onMounted(fetchTodos)
</script>
