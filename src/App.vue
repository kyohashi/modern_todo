<template>
  <div class="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-100">
    
    <aside class="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto">
      <div>
        <h1 class="text-2xl font-black text-indigo-600 tracking-tighter mb-1">FOCUS HUB</h1>
        <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Productivity Dashboard</p>
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
            :class="isDateSelected(day) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' : 'hover:bg-slate-50 text-slate-600'"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <div class="mt-auto space-y-4">
        <div class="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Daily Inspiration</p>
          <p class="text-sm text-slate-200 leading-relaxed italic">
            "Your time is limited, so don't waste it living someone else's life."
            <span class="block mt-2 text-indigo-400 font-bold">— Steve Jobs</span>
          </p>
        </div>
      </div>
    </aside>

    <main class="flex-1 p-12 overflow-y-auto">
      
      <section class="mb-12">
        <h2 class="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 px-2">Deep Focus Zone</h2>
        <draggable 
          v-model="focusList" 
          group="tasks" 
          item-key="id"
          class="min-h-[300px] rounded-[3.5rem] border-4 border-dashed border-slate-200 flex items-center justify-center p-12 transition-all duration-500"
          :class="{ 'bg-slate-900 border-none shadow-2xl': focusList.length > 0 }"
        >
          <template #item="{ element }">
            <div class="w-full max-w-3xl text-center text-white space-y-8">
              <div class="timer-display font-mono text-8xl font-black tracking-tighter text-indigo-400 drop-shadow-2xl">
                {{ elapsedTime }}
              </div>
              <div class="space-y-4">
                <input 
                  v-model="element.text" 
                  placeholder="Focus Title"
                  class="bg-transparent border-none text-center text-5xl font-black w-full focus:ring-0 placeholder-white/10"
                  @change="saveTodos(todos)"
                />
                <textarea 
                  v-model="element.notes" 
                  placeholder="Describe your current mission..."
                  class="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 w-full text-center text-indigo-100 text-lg focus:ring-2 focus:ring-white/20 outline-none h-32 resize-none transition-all"
                  @change="saveTodos(todos)"
                ></textarea>
              </div>
              <button 
                @click="finishFocus(element)"
                class="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-16 py-6 rounded-3xl transition-all shadow-xl active:scale-95 text-lg"
              >
                COMPLETE FOCUS SESSION
              </button>
            </div>
          </template>
          <template #header v-if="focusList.length === 0">
            <div class="text-center opacity-30 select-none">
              <p class="text-slate-400 font-black text-3xl uppercase tracking-widest">Drop a card here to focus</p>
            </div>
          </template>
        </draggable>
      </section>

      <div class="flex gap-4 mb-16">
        <input 
          v-model="newTodo" 
          @keydown.enter="handleInputEnter"
          placeholder="What needs to be done? (Press Enter)" 
          class="flex-1 bg-white border border-slate-200 rounded-3xl px-10 py-7 shadow-sm text-2xl focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all"
        />
        <button @click="addTodo" class="bg-indigo-600 text-white font-black px-14 py-7 rounded-3xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-xl">
          CREATE
        </button>
      </div>

      <section>
        <div class="flex items-center justify-between mb-8 px-2">
          <h2 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Backlog Grid: {{ selectedDate }}
          </h2>
          <span class="bg-slate-200 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
            {{ backlogList.length }} Post-its
          </span>
        </div>

        <draggable 
          v-model="backlogList" 
          group="tasks" 
          item-key="id"
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10"
        >
          <template #item="{ element }">
            <div 
              class="post-it group p-8 rounded-[1.5rem] shadow-md cursor-grab active:cursor-grabbing transition-all hover:shadow-2xl hover:-translate-y-3 flex flex-col min-h-[280px] relative"
              :class="element.completed ? 'bg-slate-100 opacity-60' : 'bg-[#fff9c4] border border-yellow-200/50'"
            >
              <button @click="deleteTodo(element.id)" class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-yellow-700/30 hover:text-red-500 transition-all p-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div class="mb-6 flex items-center justify-between">
                <span class="text-[10px] font-black text-yellow-700/40 uppercase tracking-widest">{{ formatTime(element.createdAt) }}</span>
                
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-bold text-yellow-800/40 uppercase">{{ element.completed ? 'Done' : 'Mark Done' }}</span>
                  <input 
                    type="checkbox" 
                    :checked="element.completed" 
                    @change="toggleTodo(element)"
                    class="w-6 h-6 rounded-lg border-yellow-300 bg-yellow-50 text-indigo-600 focus:ring-0 cursor-pointer shadow-inner appearance-none border-2 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <input 
                v-model="element.text"
                class="font-black text-2xl bg-transparent border-none p-0 focus:ring-0 mb-4 w-full text-slate-800 placeholder-yellow-900/20"
                :class="{ 'line-through text-slate-400 font-medium': element.completed }"
                @change="saveTodos(todos)"
              />
              
              <textarea 
                v-model="element.notes"
                placeholder="Add notes..."
                class="text-sm text-yellow-800/60 bg-yellow-50/50 border-none rounded-2xl p-4 w-full h-24 resize-none focus:ring-2 focus:ring-yellow-300/30 outline-none mt-auto transition-all"
                @change="saveTodos(todos)"
              ></textarea>
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
 * Focus Hub v3.1 - Post-it Edition
 * Features: Static Sidebar Calendar, Minute-based Timer, Drag & Drop Focus Zone, IME Support
 */

// --- STATE MANAGEMENT ---
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

// --- DRAGGABLE COMPUTED LISTS ---
const backlogList = computed({
  get: () => todos.value.filter(t => t.targetDate === selectedDate.value && !t.isWorking),
  set: (val) => syncDraggableChanges(val, false)
})
const focusList = computed({
  get: () => todos.value.filter(t => t.isWorking),
  set: (val) => syncDraggableChanges(val, true)
})

/**
 * Handle Drag & Drop status updates
 */
const syncDraggableChanges = (newItems, isWorking) => {
  const ids = new Set(newItems.map(i => i.id))
  const updated = todos.value.map(t => {
    if (ids.has(t.id)) {
      if (isWorking && !t.focusStartedAt) t.focusStartedAt = new Date().toISOString()
      return { ...t, isWorking, targetDate: isWorking ? t.targetDate : selectedDate.value }
    }
    // Remove working status if item was dragged out of Focus Zone
    if (isWorking && t.isWorking && !ids.has(t.id)) return { ...t, isWorking: false }
    return t
  })
  saveTodos(updated)
}

// --- MINUTE-BASED TIMER ---
const startTimer = () => {
  stopTimer()
  if (focusList.value.length > 0) {
    const task = focusList.value[0]
    if (!task.focusStartedAt) task.focusStartedAt = new Date().toISOString()
    
    // Refresh display every second, but show only minutes
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

// --- INPUT HANDLERS ---
const handleInputEnter = (e) => {
  if (e.isComposing) return // Prevent creation during Japanese IME conversion
  addTodo()
}

// --- DATABASE PERSISTENCE (Cloudflare KV) ---
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

// --- CRUD ACTIONS ---
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
    focusStartedAt: null
  }
  await saveTodos([item, ...todos.value])
  newTodo.value = ''
}

const toggleTodo = (todo) => {
  const updated = todos.value.map(t => 
    t.id === todo.id ? { ...t, completed: !t.completed, isWorking: false } : t
  )
  saveTodos(updated)
}

const finishFocus = (todo) => {
  const updated = todos.value.map(t => 
    t.id === todo.id ? { ...t, completed: true, isWorking: false } : t
  )
  saveTodos(updated)
}

const deleteTodo = (id) => {
  if (confirm("Move this post-it to trash?")) {
    saveTodos(todos.value.filter(t => t.id !== id))
  }
}

const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
onMounted(fetchTodos)
</script>

<style scoped>
.timer-display {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.05em;
}
.post-it {
  transform: rotate(-1.5deg);
  background-image: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.03) 100%);
}
.post-it:nth-child(even) {
  transform: rotate(1deg);
}
.post-it:hover {
  transform: rotate(0deg) translateY(-12px);
}
</style>
