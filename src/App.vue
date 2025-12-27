<template>
  <div class="flex min-h-screen bg-[#f1f5f9] text-slate-800 font-sans selection:bg-indigo-100">
    
    <aside class="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto z-20">
      <div>
        <h1 class="text-2xl font-black text-indigo-600 tracking-tighter mb-1 italic">FOCUS HUB</h1>
        <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Personal Mission Control</p>
      </div>

      <div class="calendar-container">
        <div class="flex items-center justify-between mb-4 px-2">
          <h2 class="text-sm font-black text-slate-700 uppercase">{{ currentMonthName }} {{ currentYear }}</h2>
          <div class="flex gap-2">
            <button @click="prevMonth" class="p-1 hover:bg-slate-100 rounded-lg transition text-slate-400">←</button>
            <button @click="nextMonth" class="p-1 hover:bg-slate-100 rounded-lg transition text-slate-400">→</button>
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
            :class="isDateSelected(day) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'hover:bg-slate-50 text-slate-600'"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <div class="mt-auto">
        <div class="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
          <div class="relative z-10">
            <p class="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Quick Tip</p>
            <p class="text-xs text-indigo-50 leading-relaxed font-medium italic">
              "Focus is a muscle. The more you use it, the stronger it gets."
            </p>
          </div>
          <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        </div>
      </div>
    </aside>

    <main class="flex-1 p-12 overflow-y-auto">
      
      <section class="mb-12">
        <h2 class="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 px-2">Mission Control</h2>
        <draggable 
          v-model="focusList" 
          group="tasks" 
          item-key="id"
          class="min-h-[350px] rounded-[4rem] border-4 border-dashed border-slate-200 flex items-center justify-center p-12 transition-all duration-700 relative overflow-hidden"
          :class="{ 'bg-slate-900 border-none shadow-[0_0_60px_-15px_rgba(79,70,229,0.4)]': focusList.length > 0 }"
        >
          <template #item="{ element }">
            <div class="w-full max-w-3xl text-center space-y-10 z-10">
              <div class="timer-container relative inline-block">
                <div class="timer-display font-mono text-9xl font-black tracking-tighter text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]">
                  {{ elapsedTime }}
                </div>
                <div class="absolute -top-6 -right-12 bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-full text-white animate-pulse">LIVE SESSION</div>
              </div>
              
              <div class="space-y-4">
                <input 
                  v-model="element.text" 
                  class="bg-transparent border-none text-center text-5xl font-black w-full focus:ring-0 text-white placeholder-slate-700"
                  @change="saveTodos(todos)"
                />
                <textarea 
                  v-model="element.notes" 
                  placeholder="Notes for this objective..."
                  class="bg-white/5 border border-white/10 rounded-3xl p-6 w-full text-center text-indigo-100 text-lg focus:ring-2 focus:ring-indigo-500/50 outline-none h-28 resize-none transition-all"
                  @change="saveTodos(todos)"
                ></textarea>
              </div>
              
              <button 
                @click="finishFocus(element)"
                class="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-16 py-6 rounded-full transition-all shadow-2xl active:scale-95 text-xl tracking-wide uppercase group"
              >
                End Mission & Record Time
              </button>
            </div>
          </template>
          <template #header v-if="focusList.length === 0">
            <div class="text-center opacity-20 group cursor-default">
              <p class="text-slate-400 font-black text-4xl tracking-tighter group-hover:text-indigo-500 transition-colors">INITIATE DEEP FOCUS</p>
              <p class="text-slate-400 text-xs mt-3 font-bold uppercase tracking-[0.4em]">Drag a post-it here</p>
            </div>
          </template>
          <div v-if="focusList.length > 0" class="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-slate-900 to-slate-900 pointer-events-none"></div>
        </draggable>
      </section>

      <div class="flex gap-4 mb-20">
        <input 
          v-model="newTodo" 
          @keydown.enter="handleInputEnter"
          placeholder="What's the next move?" 
          class="flex-1 bg-white border border-slate-200 rounded-[2rem] px-10 py-8 shadow-sm text-2xl font-medium focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300"
        />
        <button @click="addTodo" class="bg-indigo-600 text-white font-black px-14 py-8 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-xl tracking-tight">
          LAUNCH
        </button>
      </div>

      <section>
        <div class="flex items-center justify-between mb-10 px-4">
          <h2 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Active Backlog: {{ selectedDate }}</h2>
          <span class="text-[10px] font-black bg-slate-200 px-3 py-1 rounded-full text-slate-500 uppercase">{{ backlogList.length }} Objectives</span>
        </div>

        <draggable 
          v-model="backlogList" 
          group="tasks" 
          item-key="id"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
        >
          <template #item="{ element }">
            <div 
              class="post-it group p-8 rounded-[1.8rem] shadow-md cursor-grab active:cursor-grabbing transition-all hover:shadow-2xl hover:-translate-y-4 flex flex-col min-h-[300px] relative border border-transparent"
              :class="element.completed ? 'bg-slate-200 opacity-60 grayscale' : 'bg-[#fef08a] hover:border-yellow-300'"
            >
              <div class="flex items-start justify-between mb-6">
                <input 
                  type="checkbox" 
                  :checked="element.completed" 
                  @change="toggleTodo(element)"
                  class="w-7 h-7 rounded-xl border-yellow-400 bg-yellow-50 text-indigo-600 focus:ring-0 cursor-pointer appearance-none border-2 checked:bg-indigo-600 checked:border-indigo-600 transition-all shadow-sm"
                />
                
                <button @click="deleteTodo(element.id)" class="opacity-0 group-hover:opacity-100 p-2 text-yellow-800/20 hover:text-red-500 transition-all">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div class="flex-1">
                <input 
                  v-model="element.text"
                  class="font-black text-2xl bg-transparent border-none p-0 focus:ring-0 mb-4 w-full text-slate-900"
                  :class="{ 'line-through text-slate-400': element.completed }"
                  @change="saveTodos(todos)"
                />
                <textarea 
                  v-model="element.notes"
                  placeholder="Notes..."
                  class="text-sm text-yellow-900/50 bg-yellow-50/40 border-none rounded-2xl p-4 w-full h-24 resize-none focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                  @change="saveTodos(todos)"
                ></textarea>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-black/5 pt-5">
                <div class="flex flex-col">
                  <span class="text-[9px] font-black text-yellow-800/30 uppercase tracking-tighter">Focus Log</span>
                  <span class="text-xs font-black text-indigo-600/70">{{ element.totalFocusMinutes || 0 }} min</span>
                </div>
                <div class="text-right">
                  <span class="text-[9px] font-black text-yellow-800/30 uppercase tracking-tighter">Added</span>
                  <span class="text-[10px] font-bold text-yellow-900/40 block">{{ formatTime(element.createdAt) }}</span>
                </div>
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
 * FOCUS HUB v3.2 - MISSION CONTROL EDITION
 * Features:
 * - Playful Dark-mode Focus Zone with Glow
 * - Accumulative Focus Timer (Records time to card)
 * - Improved Post-it layout (Fixed button overlapping)
 */

// --- STATE ---
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

// --- LIST COMPUTATION ---
const backlogList = computed({
  get: () => todos.value.filter(t => t.targetDate === selectedDate.value && !t.isWorking),
  set: (val) => syncChanges(val, false)
})
const focusList = computed({
  get: () => todos.value.filter(t => t.isWorking),
  set: (val) => syncChanges(val, true)
})

const syncChanges = (newItems, isWorking) => {
  const ids = new Set(newItems.map(i => i.id))
  const updated = todos.value.map(t => {
    if (ids.has(t.id)) {
      // Start session timestamp when entering Focus Zone
      if (isWorking && !t.isWorking) t.focusStartedAt = new Date().toISOString()
      return { ...t, isWorking, targetDate: isWorking ? t.targetDate : selectedDate.value }
    }
    // Task exited Focus Zone manually
    if (isWorking && t.isWorking && !ids.has(t.id)) return { ...t, isWorking: false }
    return t
  })
  saveTodos(updated)
}

// --- ACCUMULATIVE TIMER ---
const startTimer = () => {
  stopTimer()
  if (focusList.value.length > 0) {
    const task = focusList.value[0]
    timerInterval = setInterval(() => {
      const start = new Date(task.focusStartedAt)
      const now = new Date()
      const diffMinutes = Math.floor((now - start) / 60000)
      elapsedTime.value = `${diffMinutes} min`
    }, 1000)
  }
}
const stopTimer = () => { if (timerInterval) clearInterval(timerInterval); elapsedTime.value = '0 min' }
watch(focusList, (val) => val.length > 0 ? startTimer() : stopTimer(), { deep: true, immediate: true })

// --- ACTIONS ---
const handleInputEnter = (e) => { if (!e.isComposing) addTodo() }

const fetchTodos = async () => {
  try {
    const res = await fetch('/api/todos')
    if (res.ok) todos.value = await res.json() || []
  } catch (e) { console.error("Sync Error:", e) }
}

const saveTodos = async (newTodos) => {
  todos.value = newTodos
  try {
    await fetch('/api/todos', { method: 'POST', body: JSON.stringify(newTodos) })
  } catch (e) { console.error("Sync Error:", e) }
}

const addTodo = async () => {
  if (!newTodo.value.trim()) return
  const item = { 
    id: Date.now(), 
    text: newTodo.value, 
    notes: '', 
    completed: false, 
    targetDate: selectedDate.value,
    createdAt: new Date().toISOString(),
    isWorking: false,
    focusStartedAt: null,
    totalFocusMinutes: 0 // New stat tracking
  }
  await saveTodos([item, ...todos.value])
  newTodo.value = ''
}

const toggleTodo = (todo) => {
  saveTodos(todos.value.map(t => t.id === todo.id ? { ...t, completed: !t.completed, isWorking: false } : t))
}

const finishFocus = (todo) => {
  // Logic: Calculate session time and add to total before finishing
  const start = new Date(todo.focusStartedAt)
  const now = new Date()
  const sessionMinutes = Math.floor((now - start) / 60000)
  
  const updated = todos.value.map(t => 
    t.id === todo.id ? { 
      ...t, 
      completed: true, 
      isWorking: false, 
      totalFocusMinutes: (t.totalFocusMinutes || 0) + sessionMinutes 
    } : t
  )
  saveTodos(updated)
}

const deleteTodo = (id) => { if (confirm("Delete this mission card?")) saveTodos(todos.value.filter(t => t.id !== id)) }
const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
onMounted(fetchTodos)
</script>

<style scoped>
.timer-display { font-variant-numeric: tabular-nums; }
.post-it {
  transform: rotate(-1.5deg);
  background-image: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.04) 100%);
}
.post-it:nth-child(even) { transform: rotate(1.2deg); }
.post-it:hover { transform: rotate(0deg) translateY(-15px); }
</style>
