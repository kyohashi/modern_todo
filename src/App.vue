<template>
  <div v-if="!isLoggedIn" class="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
    <div class="starfield absolute inset-0 opacity-40"></div>
    
    <div class="max-w-md w-full z-10 space-y-8 p-12 rounded-[3.5rem] bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl">
      <div class="text-center">
        <h1 class="text-4xl font-black text-white tracking-tighter italic">MISSION CONTROL</h1>
        <p class="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-2">Identification Required</p>
      </div>

      <div class="space-y-4">
        <div class="space-y-1 text-left px-2">
          <label class="text-[10px] font-black text-slate-500 uppercase ml-1">Pilot Name</label>
          <input v-model="authForm.username" type="text" class="auth-input" placeholder="Enter username" />
        </div>
        <div class="space-y-1 text-left px-2">
          <label class="text-[10px] font-black text-slate-500 uppercase ml-1">Security Key</label>
          <input v-model="authForm.password" type="password" @keyup.enter="handleAuth" class="auth-input" placeholder="••••••••" />
        </div>
      </div>

      <div class="flex flex-col gap-3 pt-4">
        <button @click="handleAuth('login')" class="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm">
          Access Terminal
        </button>
        <button @click="handleAuth('signup')" class="text-slate-500 hover:text-indigo-400 font-bold py-2 text-xs transition-all uppercase tracking-widest">
          Register New Pilot
        </button>
      </div>
      <p v-if="authError" class="text-red-400 text-xs font-black animate-pulse">{{ authError }}</p>
    </div>
  </div>

  <div v-else class="flex min-h-screen bg-[#f1f5f9] text-slate-800 font-sans selection:bg-indigo-100">
    
    <aside class="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto z-20">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-black text-indigo-600 tracking-tighter italic">FOCUS HUB</h1>
          <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{{ authForm.username }}'s Orbit</p>
        </div>
        <button @click="logout" class="p-2 text-slate-300 hover:text-red-400 transition-all">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

      <div class="calendar-container">
        <div class="flex items-center justify-between mb-4 px-2">
          <h2 class="text-sm font-black text-slate-700 uppercase">{{ currentMonthName }} {{ currentYear }}</h2>
          <div class="flex gap-2">
            <button @click="prevMonth" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400">←</button>
            <button @click="nextMonth" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400">→</button>
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
            class="h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all"
            :class="isDateSelected(day) ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <div class="mt-auto p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl">
        <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Pilot Motto</p>
        <p class="text-xs text-slate-300 leading-relaxed font-medium">"Focus on the journey, not the destination."</p>
      </div>
    </aside>

    <main class="flex-1 p-12 overflow-y-auto">
      
      <section class="mb-12">
        <h2 class="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 px-2 font-mono">Mission Active</h2>
        <draggable 
          v-model="focusList" group="tasks" item-key="id"
          class="min-h-[400px] rounded-[4.5rem] border-4 border-dashed border-slate-200 flex items-center justify-center p-12 transition-all duration-1000 relative overflow-hidden"
          :class="{ 'bg-slate-950 border-none shadow-[0_0_80px_-20px_rgba(79,70,229,0.5)]': focusList.length > 0 }"
        >
          <template #item="{ element }">
            <div class="w-full max-w-3xl text-center space-y-12 z-20">
              
              <div class="absolute top-12 left-12 animate-float pointer-events-none opacity-80">
                <svg width="64" height="64" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="#4F46E5" fill-opacity="0.1" stroke="#818CF8" stroke-width="2"/>
                  <rect x="30" y="35" width="40" height="30" rx="10" fill="white"/>
                  <circle cx="43" cy="48" r="3" fill="#1E293B"/>
                  <circle cx="57" cy="48" r="3" fill="#1E293B"/>
                </svg>
                <div class="text-[8px] font-black text-indigo-400 mt-2 tracking-widest uppercase">System Online</div>
              </div>

              <div class="timer-container relative inline-block">
                <div class="timer-display font-mono text-[10rem] font-black tracking-tighter text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.6)] leading-none">
                  {{ elapsedTime }}
                </div>
              </div>
              
              <div class="space-y-4">
                <input v-model="element.text" @change="saveTodos(todos)" class="bg-transparent border-none text-center text-5xl font-black w-full focus:ring-0 text-white" />
                <textarea v-model="element.notes" @change="saveTodos(todos)" placeholder="Mission details..." class="bg-white/5 border border-white/10 rounded-3xl p-6 w-full text-center text-indigo-200 text-lg focus:ring-1 focus:ring-indigo-500 outline-none h-28 resize-none"></textarea>
              </div>
              
              <button @click="finishFocus(element)" class="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-16 py-7 rounded-full transition-all text-xl uppercase tracking-widest shadow-2xl">
                End & Log Session
              </button>
            </div>
          </template>
          <template #header v-if="focusList.length === 0">
            <div class="text-center opacity-30 select-none cursor-default group">
              <p class="text-slate-400 font-black text-4xl tracking-tighter group-hover:text-indigo-500 transition-colors">INITIATE MISSION</p>
              <p class="text-slate-400 text-xs mt-4 font-bold uppercase tracking-[0.5em]">Drag and drop a card</p>
            </div>
          </template>

          <div v-if="focusList.length > 0" class="absolute inset-0 z-0">
            <div class="starfield-anim"></div>
            <div class="nebula-anim"></div>
          </div>
        </draggable>
      </section>

      <div class="flex gap-4 mb-20">
        <input v-model="newTodo" @keydown.enter="handleInputEnter" placeholder="Next Objective..." class="flex-1 bg-white border-none rounded-[2.5rem] px-10 py-8 shadow-sm text-2xl font-medium focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none" />
        <button @click="addTodo" class="bg-indigo-600 text-white font-black px-14 py-8 rounded-[2.5rem] hover:bg-indigo-700 transition-all text-xl shadow-xl">LAUNCH</button>
      </div>

      <section>
        <h2 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 px-4">Active Backlog: {{ selectedDate }}</h2>
        <draggable v-model="backlogList" group="tasks" item-key="id" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          <template #item="{ element }">
            <div class="post-it group p-8 rounded-[2rem] shadow-md cursor-grab active:cursor-grabbing transition-all hover:shadow-2xl hover:-translate-y-4 flex flex-col min-h-[320px] relative" :class="element.completed ? 'bg-slate-200 opacity-60 grayscale' : 'bg-[#fef08a]'">
              <div class="flex items-start justify-between mb-6">
                <input type="checkbox" :checked="element.completed" @change="toggleTodo(element)" class="w-7 h-7 rounded-xl border-yellow-400 bg-yellow-50 text-indigo-600 focus:ring-0 appearance-none border-2 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer" />
                <button @click="deleteTodo(element.id)" class="opacity-0 group-hover:opacity-100 p-2 text-yellow-800/20 hover:text-red-500 transition-all"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div class="flex-1">
                <input v-model="element.text" @change="saveTodos(todos)" class="font-black text-2xl bg-transparent border-none p-0 focus:ring-0 mb-4 w-full text-slate-900" :class="{ 'line-through text-slate-400': element.completed }" />
                <textarea v-model="element.notes" @change="saveTodos(todos)" placeholder="Notes..." class="text-sm text-yellow-900/50 bg-yellow-50/40 border-none rounded-2xl p-4 w-full h-24 resize-none focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"></textarea>
              </div>
              <div class="mt-6 flex items-center justify-between border-t border-black/5 pt-5">
                <div class="flex flex-col"><span class="text-[9px] font-black text-yellow-800/30 uppercase tracking-tighter">Focus Log</span><span class="text-xs font-black text-indigo-600/70">{{ element.totalFocusMinutes || 0 }} MINS</span></div>
                <div class="text-right"><span class="text-[9px] font-black text-yellow-800/30 uppercase tracking-tighter">Added</span><span class="text-[10px] font-bold text-yellow-900/40 block">{{ formatTime(element.createdAt) }}</span></div>
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
 * FOCUS HUB v5.0 - Login System & Mission Control
 */

// --- AUTH LOGIC ---
const isLoggedIn = ref(false)
const authError = ref('')
const authForm = ref({ username: '', password: '' })
const token = ref(localStorage.getItem('pilot_token'))

const handleAuth = async (action = 'login') => {
  if (!authForm.value.username || !authForm.value.password) {
    authError.value = "Credentials required.";
    return;
  }
  try {
    const res = await fetch(`/api/auth?action=${action}`, {
      method: 'POST',
      body: JSON.stringify(authForm.value)
    })
    if (res.ok) {
      if (action === 'signup') {
        alert("Registration successful! Now logging in...");
        await handleAuth('login');
      } else {
        const data = await res.json();
        token.value = data.token;
        localStorage.setItem('pilot_token', data.token);
        isLoggedIn.value = true;
        authError.value = '';
        fetchTodos();
      }
    } else {
      authError.value = action === 'signup' ? "User already exists." : "Invalid pilot name or key.";
    }
  } catch (e) { authError.value = "System Error." }
}

const logout = () => {
  localStorage.removeItem('pilot_token');
  isLoggedIn.value = false;
  token.value = null;
}

// --- CORE STATE ---
const todos = ref([])
const newTodo = ref('')
const selectedDate = ref(new Date().toLocaleDateString('en-CA'))
const elapsedTime = ref('0 min')
let timerInterval = null

// --- CALENDAR LOGIC ---
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

// --- DATA SYNC ---
const backlogList = computed({
  get: () => todos.value.filter(t => t.targetDate === selectedDate.value && !t.isWorking),
  set: (val) => syncWithKV(val, false)
})
const focusList = computed({
  get: () => todos.value.filter(t => t.isWorking),
  set: (val) => syncWithKV(val, true)
})

const syncWithKV = (newItems, isWorking) => {
  const ids = new Set(newItems.map(i => i.id))
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
      method: 'POST', 
      body: JSON.stringify(newTodos),
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
  const start = new Date(todo.focusStartedAt)
  const sessionMinutes = Math.floor((new Date() - start) / 60000)
  const updated = todos.value.map(t => 
    t.id === todo.id ? { 
      ...t, completed: true, isWorking: false, 
      totalFocusMinutes: (t.totalFocusMinutes || 0) + sessionMinutes 
    } : t
  )
  saveTodos(updated)
}

const deleteTodo = (id) => { if (confirm("Delete card?")) saveTodos(todos.value.filter(t => t.id !== id)) }

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
onMounted(async () => {
  if (token.value) {
    isLoggedIn.value = true;
    fetchTodos();
  }
})
</script>

<style scoped>
.auth-input { @apply w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all; }
.timer-display { font-variant-numeric: tabular-nums; }
.post-it { transform: rotate(-1.5deg); background-image: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.04) 100%); }
.post-it:nth-child(even) { transform: rotate(1.5deg); }
.post-it:hover { transform: rotate(0deg) translateY(-20px); }

@keyframes float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-15px) rotate(5deg); } }
.animate-float { animation: float 6s ease-in-out infinite; }

.starfield-anim { position: absolute; inset: 0; background-image: radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 100px 150px, #fff, rgba(0,0,0,0)); background-size: 300px 300px; animation: stars 100s linear infinite; opacity: 0.2; }
@keyframes stars { from { background-position: 0 0; } to { background-position: 0 1000px; } }
.nebula-anim { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.15), transparent 70%); animation: pulse 10s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } }
</style>
