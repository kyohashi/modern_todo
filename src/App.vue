<template>
  <div class="min-h-screen bg-slate-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      
      <header class="bg-white rounded-3xl shadow-sm p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Focus Tracker</h1>
          <p class="text-slate-500 font-medium mt-1">Organize your goals by date.</p>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">View Schedule</label>
          <input 
            type="date" 
            v-model="selectedDate" 
            class="border-slate-200 border rounded-2xl px-4 py-2.5 text-indigo-600 font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
          />
        </div>
      </header>

      <section class="bg-white rounded-3xl shadow-sm p-2 mb-10 flex gap-2">
        <input 
          v-model="newTodo" 
          @keyup.enter="addTodo" 
          placeholder="What's your main objective for today?" 
          class="flex-1 border-none bg-transparent rounded-2xl px-6 py-4 focus:ring-0 outline-none text-slate-700"
        />
        <button 
          @click="addTodo" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          Add Task
        </button>
      </section>

      <transition name="fade">
        <div v-if="activeTask" class="mb-12">
          <h2 class="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 px-2">Current Focus</h2>
          <div class="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div class="relative z-10">
              <h3 class="text-2xl font-bold mb-2">{{ activeTask.text }}</h3>
              <div class="flex items-center gap-2 text-indigo-100 text-sm">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Started at: {{ formatTime(activeTask.createdAt) }}
              </div>
            </div>
            <button 
              @click="toggleWorking(activeTask)" 
              class="absolute top-8 right-8 bg-white/20 hover:bg-white/40 px-4 py-2 rounded-xl transition-all text-sm font-bold backdrop-blur-md"
            >
              Finish Focus
            </button>
            <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          </div>
        </div>
      </transition>

      <div class="grid gap-5">
        <div class="flex items-center justify-between px-2">
          <h2 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Tasks for {{ selectedDate }}
          </h2>
          <span class="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {{ filteredTodos.length }} Total
          </span>
        </div>
        
        <div v-if="filteredTodos.length === 0" class="text-center py-16 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-medium">
          No tasks recorded for this day.
        </div>

        <div 
          v-for="todo in filteredTodos" 
          :key="todo.id"
          class="bg-white rounded-[1.5rem] p-6 shadow-sm border border-transparent transition-all duration-300 flex items-center justify-between group hover:shadow-md hover:border-slate-100"
          :class="{ 'opacity-50 grayscale bg-slate-50': todo.completed, 'ring-2 ring-indigo-500 border-indigo-100': todo.isWorking }"
        >
          <div class="flex items-center gap-5 flex-1 min-w-0">
            <div class="relative flex items-center">
              <input 
                type="checkbox" 
                :checked="todo.completed" 
                @change="toggleTodo(todo)" 
                class="w-7 h-7 rounded-full border-slate-300 text-indigo-600 focus:ring-offset-0 focus:ring-indigo-500 cursor-pointer appearance-none border-2 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
              />
              <svg v-if="todo.completed" class="w-4 h-4 text-white absolute left-1.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-lg font-bold text-slate-800 transition-all" :class="{ 'line-through text-slate-400 font-medium': todo.completed }">
                {{ todo.text }}
              </p>
              <p class="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                Added: {{ formatTime(todo.createdAt) }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <button 
              v-if="!todo.completed"
              @click="toggleWorking(todo)"
              class="px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
              :class="todo.isWorking ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'"
            >
              {{ todo.isWorking ? 'In Progress' : 'Set Focus' }}
            </button>
            <button 
              @click="deleteTodo(todo.id)" 
              class="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const todos = ref([])
const newTodo = ref('')
const selectedDate = ref(new Date().toLocaleDateString('en-CA')) // YYYY-MM-DD

const filteredTodos = computed(() => {
  return todos.value.filter(t => t.targetDate === selectedDate.value)
})

const activeTask = computed(() => {
  return todos.value.find(t => t.isWorking && !t.completed)
})

const fetchTodos = async () => {
  try {
    const res = await fetch('/api/todos')
    if (res.ok) todos.value = await res.json() || []
  } catch (e) { console.error("Error fetching data:", e) }
}

const saveTodos = async (newTodos) => {
  todos.value = newTodos
  try {
    await fetch('/api/todos', { method: 'POST', body: JSON.stringify(newTodos) })
  } catch (e) { console.error("Error saving data:", e) }
}

const addTodo = async () => {
  if (!newTodo.value.trim()) return
  const item = { 
    id: Date.now(), 
    text: newTodo.value, 
    completed: false, 
    targetDate: selectedDate.value,
    createdAt: new Date().toISOString(),
    isWorking: false 
  }
  await saveTodos([item, ...todos.value])
  newTodo.value = ''
}

const toggleTodo = async (todo) => {
  const newTodos = todos.value.map(t => 
    t.id === todo.id ? { ...t, completed: !t.completed, isWorking: false } : t
  )
  await saveTodos(newTodos)
}

const toggleWorking = async (todo) => {
  const newTodos = todos.value.map(t => {
    if (t.id === todo.id) {
      return { ...t, isWorking: !t.isWorking }
    }
    return { ...t, isWorking: false }
  })
  await saveTodos(newTodos)
}

const deleteTodo = async (id) => {
  if (confirm("Are you sure you want to delete this task?")) {
    const newTodos = todos.value.filter(t => t.id !== id)
    await saveTodos(newTodos)
  }
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

onMounted(fetchTodos)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
