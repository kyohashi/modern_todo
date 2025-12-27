<template>
  <div v-if="!isLoggedIn" class="min-h-screen bg-lime-50 flex items-center justify-center p-6 overflow-hidden relative">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(163,230,53,0.2),_transparent_70%)]"></div>
    
    <div class="max-w-md w-full z-10 space-y-8 p-10 rounded-[3rem] bg-white border border-lime-100 shadow-2xl shadow-lime-200/50">
      <div class="text-center">
        <h1 class="text-3xl font-black text-lime-600 tracking-tighter uppercase italic">Focus Hub</h1>
        <div class="flex justify-center gap-4 mt-6 p-1 bg-lime-50 rounded-2xl">
          <button 
            @click="isLoginMode = true" 
            class="flex-1 py-2 rounded-xl text-xs font-black transition-all"
            :class="isLoginMode ? 'bg-white text-lime-600 shadow-sm' : 'text-slate-400 hover:text-lime-500'"
          >LOGIN</button>
          <button 
            @click="isLoginMode = false" 
            class="flex-1 py-2 rounded-xl text-xs font-black transition-all"
            :class="!isLoginMode ? 'bg-white text-lime-600 shadow-sm' : 'text-slate-400 hover:text-lime-500'"
          >SIGN UP</button>
        </div>
      </div>

      <div class="space-y-4">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Pilot Name</label>
          <input v-model="authForm.username" type="text" class="auth-input" placeholder="Your name" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Security Key</label>
          <input v-model="authForm.password" type="password" @keyup.enter="handleAuthAction" class="auth-input" placeholder="••••••••" />
        </div>
      </div>

      <button 
        @click="handleAuthAction" 
        class="w-full bg-lime-500 hover:bg-lime-600 text-white font-black py-5 rounded-[2rem] transition-all shadow-lg shadow-lime-200 active:scale-95 uppercase tracking-widest text-sm"
      >
        {{ isLoginMode ? 'Access Hub' : 'Join the Hub' }}
      </button>
      
      <p v-if="authError" class="text-red-400 text-xs font-black text-center animate-bounce uppercase">{{ authError }}</p>
    </div>
  </div>

  <div v-else class="flex min-h-screen bg-[#fcfdfa] text-slate-700 font-sans selection:bg-lime-200">
    
    <aside class="w-80 bg-white border-r border-lime-100 p-8 flex flex-col gap-10 sticky top-0 h-screen overflow-y-auto z-20">
      <div>
        <h1 class="text-2xl font-black text-lime-500 tracking-tighter italic">FOCUS HUB</h1>
        <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{{ authForm.username }}'s Garden</p>
      </div>

      <div class="calendar-container">
        <div class="flex items-center justify-between mb-6 px-1">
          <h2 class="text-xs font-black text-slate-600 uppercase">{{ currentMonthName }} {{ currentYear }}</h2>
          <div class="flex gap-2">
            <button @click="prevMonth" class="p-1.5 hover:bg-lime-50 rounded-lg text-lime-400 transition">←</button>
            <button @click="nextMonth" class="p-1.5 hover:bg-lime-50 rounded-lg text-lime-400 transition">→</button>
          </div>
        </div>
        <div class="grid grid-cols-7 text-center text-[10px] font-black text-slate-300 mb-3">
          <div v-for="d in ['S','M','T','W','T','F','S']" :key="d">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="n in calendarPadding" :key="'pad-'+n"></div>
          <button 
            v-for="day in daysInMonth" 
            :key="day"
            @click="selectedDate = formatDate(currentYear, currentMonth, day)"
            class="h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all"
            :class="isDateSelected(day) ? 'bg-lime-500 text-white shadow-lg shadow-lime-200 scale-110' : 'hover:bg-lime-50 text-slate-500'"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <div class="mt-auto space-y-4">
        <div class="p-5 bg-lime-50 rounded-[2rem] text-lime-700 text-xs font-medium italic border border-lime-100">
          "Nature does not hurry, yet everything is accomplished."
        </div>
        <button 
          @click="logout" 
          class="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 hover:text-red-500 text-slate-400 font-black py-4 rounded-2xl transition-all uppercase text-[10px] tracking-widest shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out Pilot
        </button>
      </div>
    </aside>

    <main class="flex-1 p-12 overflow-y-auto">
      
      <section class="mb-12">
        <h2 class="text-[11px] font-black text-lime-500 uppercase tracking-[0.4em] mb-4 px-2">Focus Garden</h2>
        <draggable 
          v-model="focusList" group="tasks" item-key="id"
          class="min-h-[400px] rounded-[4rem] border-4 border-dashed border-lime-100 flex items-center justify-center p-12 transition-all duration-700 relative overflow-hidden"
          :class="{ 'bg-lime-500 border-none shadow-2xl shadow-lime-200': focusList.length > 0 }"
        >
          <template #item="{ element }">
            <div class="w-full max-w-3xl text-center space-y-12 z-20">
              
              <div class="absolute top-12 left-12 animate-float opacity-90 pointer-events-none">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22V10M12 10C12 10 12 6 16 6C20 6 20 10 16 10H12ZM12 10C12 10 12 6 8 6C4 6 4 10 8 10H12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="10" r="1.5" fill="white"/>
                </svg>
                <div class="text-[10px] font-black text-white/70 mt-2 tracking-widest uppercase">Growing...</div>
              </div>

              <div class="timer-display font-mono text-[10rem] font-black tracking-tighter text-white drop-shadow-xl leading-none">
                {{ elapsedTime }}
              </div>
              
              <div class="space-y-4">
                <input v-model="element.text" @change="saveTodos(todos)" class="bg-transparent border-none text-center text-5xl font-black w-full focus:ring-0 text-white placeholder-lime-300" />
                <textarea v-model="element.notes" @change="saveTodos(todos)" placeholder="Mission log..." class="bg-white/10 border border-white/20 rounded-3xl p-6 w-full text-center text-white text-lg focus:ring-2 focus:ring-white/40 outline-none h-28 resize-none transition-all"></textarea>
              </div>
              
              <button @click="finishFocus(element)" class="bg-white hover:bg-lime-50 text-lime-600 font-black px-16 py-7 rounded-full transition-all text-xl uppercase tracking-widest shadow-xl active:scale-95">
                Harvest Focus Time
              </button>
            </div>
          </template>

          <template #header v-if="focusList.length === 0">
            <div class="text-center opacity-40 select-none group cursor-default">
              <p class="text-lime-300 font-black text-4xl tracking-tighter group-hover:text-lime-500 transition-colors">PLANT YOUR FOCUS</p>
              <p class="text-lime-300 text-[10px] mt-4 font-bold uppercase tracking-[0.5em]">Drag a card to start growing</p>
            </div>
          </template>

          <div v-if="focusList.length > 0" class="absolute inset-0 z-0 bg-gradient-to-br from-lime-400 to-lime-600 opacity-90">
            <div class="nature-pulse"></div>
          </div>
        </draggable>
      </section>

      <div class="flex gap-4 mb-20">
        <input v-model="newTodo" @keydown.enter="handleInputEnter" placeholder="Next objective in the garden..." class="flex-1 bg-white border border-lime-100 rounded-[2.5rem] px-10 py-8 shadow-sm text-2xl font-medium focus:ring-8 focus:ring-lime-500/10 transition-all outline-none" />
        <button @click="addTodo" class="bg-lime-500 text-white font-black px-14 py-8 rounded-[2.5rem] hover:bg-lime-600 transition-all text-xl shadow-xl shadow-lime-100">PLANT</button>
      </div>

      <section>
        <h2 class="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-10 px-4">Backlog: {{ selectedDate }}</h2>
        <draggable v-model="backlogList" group="tasks" item-key="id" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          <template #item="{ element }">
            <div class="post-it group p-8 rounded-[2.5rem] shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-xl hover:-translate-y-3 flex flex-col min-h-[320px] relative border border-white" :class="element.completed ? 'bg-slate-100 opacity-60 grayscale' : 'bg-[#f7fee7] border-lime-100'">
              
              <div class="flex items-start justify-between mb-6">
                <input type="checkbox" :checked="element.completed" @change="toggleTodo(element)" class="w-7 h-7 rounded-xl border-lime-200 bg-white text-lime-500 focus:ring-0 appearance-none border-2 checked:bg-lime-500 checked:border-lime-500 transition-all cursor-pointer shadow-sm" />
                <button @click="deleteTodo(element.id)" class="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-400 transition-all"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div class="flex-1">
                <input v-model="element.text" @change="saveTodos(todos)" class="font-black text-2xl bg-transparent border-none p-0 focus:ring-0 mb-4 w-full text-slate-800" :class="{ 'line-through text-slate-400': element.completed }" />
                <textarea v-model="element.notes" @change="saveTodos(todos)" placeholder="Notes..." class="text-sm text-lime-900/40 bg-white/50 border border-lime-50 rounded-2xl p-4 w-full h-24 resize-none focus:ring-2 focus:ring-lime-500/10 outline-none transition-all"></textarea>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-lime-50 pt-5">
                <div class="flex flex-col"><span class="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Total Growth</span><span class="text-xs font-black text-lime-600/70">{{ element.totalFocusMinutes || 0 }} MINS</span></div>
                <div class="text-right"><span class="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Created</span><span class="text-[10px] font-bold text-slate-300 block">{{ formatTime(element.createdAt) }}</span></div>
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
 * FOCUS HUB v6.0 - LIME NATURE EDITION
 * Updated with clear Auth UI, Logout, and Soft Theme.
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
  if (confirm("Sign out of the Garden?")) {
    localStorage.removeItem('pilot_token');
    isLoggedIn.value = false;
    token.value = null;
    authForm.value = { username: '', password: '' };
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

// --- DATA LIST SYNC ---
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

// --- CLOUDFLARE KV CONNECT ---
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

const deleteTodo = (id) => { if (confirm("Remove this card?")) saveTodos(todos.value.filter(t => t.id !== id)) }

// --- TIMER (Minute logic) ---
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
.auth-input { @apply w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-700 text-lg focus:ring-2 focus:ring-lime-500 outline-none transition-all; }
.timer-display { font-variant-numeric: tabular-nums; }
.post-it { transform: rotate(-0.5deg); }
.post-it:nth-child(even) { transform: rotate(0.8deg); }
.post-it:hover { transform: rotate(0deg) translateY(-12px); }

@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
.animate-float { animation: float 5s ease-in-out infinite; }

.nature-pulse { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%); animation: pulse 8s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.2); } }
</style>
