<template>
  <div v-if="!isLoggedIn" class="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 relative">
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none"></div>
    
    <div class="max-w-md w-full z-10 space-y-8 p-10 rounded-2xl bg-white border border-slate-300 shadow-2xl">
      <div class="text-center">
        <h1 class="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Focus Hub</h1>
        <div class="flex justify-center gap-4 mt-6 p-1 bg-slate-100 rounded-xl">
          <button 
            @click="isLoginMode = true" 
            class="flex-1 py-2 rounded-lg text-xs font-black transition-all"
            :class="isLoginMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'"
          >LOGIN</button>
          <button 
            @click="isLoginMode = false" 
            class="flex-1 py-2 rounded-lg text-xs font-black transition-all"
            :class="!isLoginMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'"
          >SIGN UP</button>
        </div>
      </div>

      <div class="space-y-4">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">User ID</label>
          <input v-model="authForm.username" type="text" class="auth-input" placeholder="Your name" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Passcode</label>
          <input v-model="authForm.password" type="password" @keyup.enter="handleAuthAction" class="auth-input" placeholder="••••••••" />
        </div>
      </div>

      <button 
        @click="handleAuthAction" 
        class="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-5 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
      >
        {{ isLoginMode ? 'Enter Hub' : 'Create Account' }}
      </button>
      
      <p v-if="authError" class="text-red-600 text-xs font-black text-center animate-pulse uppercase">{{ authError }}</p>
    </div>
  </div>

  <div v-else class="flex min-h-screen bg-[#ecebe4] text-slate-800 font-sans selection:bg-indigo-100">
    
    <aside class="w-80 bg-[#f9f8f3] border-r border-slate-300 p-8 flex flex-col gap-10 sticky top-0 h-screen overflow-y-auto z-20">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tighter italic">FOCUS HUB</h1>
        <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">{{ authForm.username }}'s Workspace</p>
      </div>

      <div class="calendar-container bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-xs font-black text-slate-700 uppercase">{{ currentMonthName }} {{ currentYear }}</h2>
          <div class="flex gap-2">
            <button @click="prevMonth" class="p-1 hover:bg-slate-100 rounded text-slate-400 transition">←</button>
            <button @click="nextMonth" class="p-1 hover:bg-slate-100 rounded text-slate-400 transition">→</button>
          </div>
        </div>
        <div class="grid grid-cols-7 text-center text-[10px] font-black text-slate-300 mb-2">
          <div v-for="d in ['S','M','T','W','T','F','S']" :key="d">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="n in calendarPadding" :key="'pad-'+n"></div>
          <button 
            v-for="day in daysInMonth" 
            :key="day"
            @click="selectedDate = formatDate(currentYear, currentMonth, day)"
            class="h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all"
            :class="isDateSelected(day) ? 'bg-indigo-600 text-white shadow-md scale-110' : 'hover:bg-slate-100 text-slate-600'"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <div class="mt-auto space-y-4">
        <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-600 text-xs leading-relaxed italic">
          "The best way to predict your future is to create it."
        </div>
        <button 
          @click="logout" 
          class="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 text-slate-400 font-black py-4 rounded-xl transition-all uppercase text-[10px] tracking-widest shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out Hub
        </button>
      </div>
    </aside>

    <main class="flex-1 p-12 overflow-y-auto">
      
      <section class="mb-12">
        <draggable 
          v-model="focusList" group="tasks" item-key="id"
          class="rounded-[3rem] border-4 border-dashed border-slate-300 flex items-center justify-center p-8 transition-all duration-700 relative overflow-hidden"
          :class="focusList.length > 0 ? 'min-h-[450px] bg-slate-900 border-none shadow-2xl' : 'min-h-[180px] bg-slate-200/50'"
        >
          <template #item="{ element }">
            <div class="w-full max-w-3xl text-center space-y-12 z-20">
              
              <div class="absolute top-12 left-12 animate-float opacity-80 pointer-events-none">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6M12 6C8.686 6 6 8.686 6 12V22H18V12C18 8.686 15.314 6 12 6Z" stroke="#818cf8" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="12" r="2" fill="#818cf8"/>
                </svg>
                <div class="text-[8px] font-black text-indigo-400 mt-2 tracking-widest uppercase">System Active</div>
              </div>

              <div class="timer-display font-mono text-[10rem] font-black tracking-tighter text-white drop-shadow-2xl leading-none">
                {{ elapsedTime }}
              </div>
              
              <div class="space-y-4">
                <input v-model="element.text" @change="saveTodos(todos)" class="bg-transparent border-none text-center text-5xl font-black w-full focus:ring-0 text-white" />
                <textarea v-model="element.notes" @change="saveTodos(todos)" placeholder="Mission details..." class="bg-white/5 border border-white/10 rounded-2xl p-6 w-full text-center text-slate-300 text-lg focus:ring-2 focus:ring-indigo-500/30 outline-none h-28 resize-none transition-all"></textarea>
              </div>
              
              <button @click="finishFocus(element)" class="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-16 py-7 rounded-2xl transition-all text-xl uppercase tracking-widest shadow-xl active:scale-95">
                Complete Mission
              </button>
            </div>
          </template>

          <template #header v-if="focusList.length === 0">
            <div class="text-center opacity-40 select-none cursor-default">
              <p class="text-slate-500 font-black text-xl tracking-tight uppercase">DRAG A TASK HERE TO FOCUS</p>
            </div>
          </template>

          <div v-if="focusList.length > 0" class="absolute inset-0 z-0 bg-gradient-to-tr from-slate-900 via-indigo-900/10 to-slate-900">
            <div class="focus-glow"></div>
          </div>
        </draggable>
      </section>

      <div class="flex gap-4 mb-20">
        <input v-model="newTodo" @keydown.enter="handleInputEnter" placeholder="What's next on the list?" class="flex-1 bg-white border border-slate-300 rounded-2xl px-10 py-7 shadow-sm text-2xl font-medium focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none" />
        <button @click="addTodo" class="bg-slate-800 text-white font-black px-14 py-7 rounded-2xl hover:bg-slate-900 transition-all text-xl shadow-lg">ADD TASK</button>
      </div>

      <section>
        <h2 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 px-4 italic">Backlog: {{ selectedDate }}</h2>
        <draggable v-model="backlogList" group="tasks" item-key="id" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <template #item="{ element }">
            <div class="post-it group p-8 rounded-lg shadow-md cursor-grab active:cursor-grabbing transition-all hover:shadow-xl hover:-translate-y-3 flex flex-col min-h-[320px] relative border-b-4 border-black/10" :class="element.completed ? 'bg-slate-200 opacity-60 grayscale' : 'bg-[#fff9c4]'">
              
              <div class="flex items-start justify-between mb-6">
                <input type="checkbox" :checked="element.completed" @change="toggleTodo(element)" class="w-7 h-7 rounded border-slate-400 bg-white text-indigo-600 focus:ring-0 appearance-none border-2 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer shadow-sm" />
                <button @click="deleteTodo(element.id)" class="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div class="flex-1">
                <input v-model="element.text" @change="saveTodos(todos)" class="font-black text-2xl bg-transparent border-none p-0 focus:ring-0 mb-4 w-full text-slate-900" :class="{ 'line-through text-slate-400': element.completed }" />
                <textarea v-model="element.notes" @change="saveTodos(todos)" placeholder="Notes..." class="text-sm text-yellow-900/60 bg-white/30 border-none rounded-xl p-4 w-full h-24 resize-none focus:ring-1 focus:ring-yellow-300 outline-none transition-all"></textarea>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-black/5 pt-5">
                <div class="flex flex-col"><span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">Focus Log</span><span class="text-xs font-black text-indigo-600">{{ element.totalFocusMinutes || 0 }} MINS</span></div>
                <div class="text-right"><span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">Added</span><span class="text-[10px] font-bold text-slate-400 block">{{ formatTime(element.createdAt) }}</span></div>
              </div>
            </div>
          </template>
        </draggable>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'

/**
 * FOCUS HUB v6.6 - UNIVERSITY DESK EDITION (Adjusted Layout)
 * Updated: Dynamic Focus Zone height for better visibility of backlog.
 */

// --- AUTH STATE & LOGIC ---
const isLoggedIn = ref(false)
const isLoginMode = ref(true)
const authError = ref('')
const authForm = ref({ username: '', password: '' })
const token = ref(localStorage.getItem('pilot_token'))

const handleAuthAction = () => handleAuth(isLoginMode.value ? 'login' : 'signup')

const handleAuth = async (action) => {
  if (!authForm.value.username || !authForm.value.password) {
    authError.value = "Username and key required.";
    return;
  }
  try {
    const res = await fetch(`/api/auth?action=${action}`, {
      method: 'POST',
      body: JSON.stringify(authForm.value)
    })
    if (res.ok) {
      if (action === 'signup') {
        alert("Pilot Registered! You can now login.");
        isLoginMode.value = true;
      } else {
        const data = await res.json();
        token.value = data.token;
        localStorage.setItem('pilot_token', data.token);
        isLoggedIn.value = true;
        authError.value = '';
        fetchTodos();
      }
    } else {
      authError.value = action === 'signup' ? "Pilot name already taken." : "Access Denied.";
    }
  } catch (e) { authError.value = "System Error." }
}

const logout = () => {
  if (confirm("Sign out and clear local session?")) {
    localStorage.removeItem('pilot_token');
    isLoggedIn.value = false;
    token.value = null;
    todos.value = []; // Reset local state
    authForm.value = { username: '', password: '' };
    window.location.reload(); // Hard reset to ensure auth gate shows
  }
}

// --- CALENDAR & TODOs STATE ---
const todos = ref([])
const newTodo = ref('')
const selectedDate = ref(new Date().toLocaleDateString('en-CA'))
const elapsedTime = ref('0 min')
let timerInterval = null

const calendarDate = ref(new Date())
const currentYear = computed(() => calendarDate.value.getFullYear())
const currentMonth = computed(() => calendarDate.value.getMonth())
const currentMonthName = computed(() => calendarDate.value.toLocaleString('en-US', { month: 'long' }))
const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
const calendarPadding = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())
const prevMonth = () => calendarDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
const nextMonth = () => calendarDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
const isDateSelected = (day) => selectedDate.value === formatDate(currentYear.value, currentMonth.value, day)
const formatDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

// --- LIST SYNC ---
const backlogList = computed({
  get: () => todos.value.filter(t => t.targetDate === selectedDate.value && !t.isWorking),
  set: (val) => syncChanges(val, false)
})
const focusList = computed({
  get: () => todos.value.filter(t => t.isWorking),
  set: (val) => syncChanges(val, true)
})

const syncChanges = (items, isWorking) => {
  const ids = new Set(items.map(i => i.id))
  const updated = todos.value.map(t => {
    if (ids.has(t.id)) {
      if (isWorking && !t.isWorking) t.focusStartedAt = new Date().toISOString()
      return { ...t, isWorking, targetDate: isWorking ? t.targetDate : selectedDate.value }
    }
    if (isWorking && t.isWorking && !ids.has(t.id)) return { ...t, isWorking: false }
    return t
  })
  saveTodos(updated)
}

// --- DATA CONNECT ---
const fetchTodos = async () => {
  if (!token.value) return;
  try {
    const res = await fetch('/api/todos', { headers: { "Authorization": `Bearer ${token.value}` } })
    if (res.status === 401) logout();
    else if (res.ok) todos.value = await res.json() || [];
  } catch (e) { console.error(e) }
}

const saveTodos = async (newTodos) => {
  todos.value = newTodos
  if (!token.value) return;
  try {
    await fetch('/api/todos', { 
      method: 'POST', body: JSON.stringify(newTodos),
      headers: { "Authorization": `Bearer ${token.value}` }
    })
  } catch (e) { console.error(e) }
}

// --- ACTIONS ---
const handleInputEnter = (e) => { if (!e.isComposing) addTodo() }
const addTodo = async () => {
  if (!newTodo.value.trim()) return
  const item = { 
    id: Date.now(), text: newTodo.value, notes: '', completed: false, 
    targetDate: selectedDate.value, createdAt: new Date().toISOString(),
    isWorking: false, focusStartedAt: null, totalFocusMinutes: 0
  }
  await saveTodos([item, ...todos.value])
  newTodo.value = ''
}

const toggleTodo = (todo) => {
  saveTodos(todos.value.map(t => t.id === todo.id ? { ...t, completed: !t.completed, isWorking: false } : t))
}

const finishFocus = (todo) => {
  const sessionMinutes = Math.floor((new Date() - new Date(todo.focusStartedAt)) / 60000)
  const updated = todos.value.map(t => 
    t.id === todo.id ? { 
      ...t, completed: true, isWorking: false, 
      totalFocusMinutes: (t.totalFocusMinutes || 0) + sessionMinutes 
    } : t
  )
  saveTodos(updated)
}

const deleteTodo = (id) => { if (confirm("Remove task?")) saveTodos(todos.value.filter(t => t.id !== id)) }

// --- TIMER ---
const startTimer = () => {
  stopTimer()
  if (focusList.value.length > 0) {
    const task = focusList.value[0]
    timerInterval = setInterval(() => {
      const minutes = Math.floor((new Date() - new Date(task.focusStartedAt)) / 60000)
      elapsedTime.value = `${minutes} min`
    }, 1000)
  }
}
const stopTimer = () => { if (timerInterval) clearInterval(timerInterval); elapsedTime.value = '0 min' }
watch(focusList, (val) => val.length > 0 ? startTimer() : stopTimer(), { deep: true, immediate: true })

const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''

onMounted(() => {
  if (token.value) {
    isLoggedIn.value = true;
    fetchTodos();
  }
})
</script>

<style scoped>
.auth-input { @apply w-full bg-slate-50 border border-slate-300 rounded-xl px-6 py-4 text-slate-800 text-lg focus:ring-2 focus:ring-slate-800 outline-none transition-all; }
.timer-display { font-variant-numeric: tabular-nums; }
.post-it { transform: rotate(-1.5deg); }
.post-it:nth-child(even) { transform: rotate(1.2deg); }
.post-it:hover { transform: rotate(0deg) translateY(-15px); }

@keyframes float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-10px) rotate(5deg); } }
.animate-float { animation: float 6s ease-in-out infinite; }

.focus-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.1), transparent 70%); animation: pulse 10s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
</style>
